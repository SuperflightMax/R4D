import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [sha, runPath, tag] = process.argv.slice(2);
const read = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const need = (ok, message) => { if (!ok) throw new Error(message); };
const sections = ['capsuleIdle', 'transform', 'mantisIdle'];

try {
  need(/^[0-9a-f]{40}$/.test(sha ?? '') && runPath && /^[a-z0-9-]+$/.test(tag ?? ''), 'Usage: node normalize-c2.mjs <CTO candidate SHA> <run directory> <capture tag>');
  const local = resolve(dirname(fileURLToPath(import.meta.url)), '.local') + sep;
  const run = resolve(runPath);
  need(run.toLowerCase().startsWith(local.toLowerCase()), 'Use the pinned Stage C run directory');
  const pin = read(join(run, 'pin.json'));
  need(pin.candidateSha === sha, 'Run pin does not match the supplied candidate');
  const raw = Object.fromEntries(sections.map(name => [name, JSON.parse(gunzipSync(readFileSync(join(run, 'evidence', 'raw-' + tag + '-' + name + '.json.gz'))).toString('utf8'))]));
  const transform = raw.transform;
  const buildHash = createHash('sha256').update(readFileSync(join(run, 'build-manifest.json'))).digest('hex');
  need(transform.buildSha256 === buildHash, 'Capture does not match the pinned build manifest');
  const meta = b => JSON.stringify([b.sha, b.buildSha256, b.seed, b.hz, b.viewport, b.tag]);
  need(sections.every(name => raw[name].sha === sha && raw[name].tag === tag && raw[name].section === name &&
    meta(raw[name]) === meta(transform) && Array.isArray(raw[name].frames) && raw[name].frames.length > 1), 'Trace blocks do not share one build, seed and viewport');
  need(transform.preAction && transform.inputs?.length >= 2, 'Missing before-action pose or public input transcript');
  // The QA adapter is bound to the documented export of this candidate.
  const adapter = await import(pathToFileURL(join(run, 'c2-adapter.mjs')).href);
  need(adapter.rig && typeof adapter.frame === 'function' && typeof adapter.keyTicks === 'function', 'Adapter must export rig, frame and keyTicks');
  const viewport = [transform.viewport.width, transform.viewport.height];
  const output = {
    sha, buildSha256: transform.buildSha256, captureId: tag, seed: transform.seed, hz: transform.hz,
    viewport, inputs: transform.inputs, actionTick: transform.preAction.tick,
    rig: adapter.rig, keyTicks: adapter.keyTicks(transform.frames, transform.preAction),
    preAction: adapter.frame(transform.preAction, 'preAction'),
    sections: Object.fromEntries(sections.map(name => [name, raw[name].frames.map(f => adapter.frame(f, name))]))
  };
  if (typeof adapter.audit === 'function') output.audit = adapter.audit();
  console.log(JSON.stringify(output));
} catch (error) {
  console.error('INVALID_OR_UNBOUND_CAPTURE: ' + error.message);
  process.exitCode = 2;
}
