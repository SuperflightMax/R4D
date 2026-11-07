import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const sha = 'be62b16b0253208493e5d546e0f9d158342a9250';
const run = resolve(process.argv[2] ?? '');
const json = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const need = (ok, message) => { if (!ok) throw new Error(message); };
const evidence = name => join(run, 'evidence', name);
const manifest = json(join(run, 'tree', 'experiments', 'q3c-victorian-mantis', 'assets', 'rig', 'FULL_RIG_V1.json'));
const measured = json(evidence('measurements.json'));
const build = createHash('sha256').update(readFileSync(join(run, 'build-manifest.json'))).digest('hex');
need(json(join(run, 'pin.json')).candidateSha === sha && measured.sha === sha && measured.buildSha256 === build, 'Wrong pinned run');

const allNodes = new Map(manifest.nodes.map(n => [n.id, n]));
let maxCornerSum = 0;
for (const node of manifest.nodes) for (const id of [node.draw?.asset, node.draw?.backAsset].filter(Boolean)) {
  const art = manifest.assets[id];
  const [dx, dy] = node.draw.offset;
  const [px, py] = art.pivotLocal;
  const [x, y, w, h] = art.viewBox;
  for (const u of [x, x + w]) for (const v of [y, y + h]) {
    maxCornerSum = Math.max(maxCornerSum, Math.abs(u - px + dx) + Math.abs(v - py + dy));
  }
}
// Bound screen displacement using the recorded maximum coefficient residual,
// the full trim rectangle, and the runtime maximum camera scale of 1.52.
const maxResidual = Math.max(...Object.values(measured.rendererAudit).map(a => a.worst.projectionError));
const boundCssPixels = Math.SQRT2 * maxResidual * (maxCornerSum + 1) * 1.52;
const projection = { maxResidual, maxCornerSum, cameraScaleLimit: 1.52, boundCssPixels, cssPixelBudget: 0.01, withinBudget: boundCssPixels <= .01 };

const aperture = manifest.apertures.raptorial;
const gateIds = ['bay.rapt.near.door', 'bay.rapt.far.door', 'shell.front', 'shell.rear'];
const reviewed = [];
for (const tag of ['seed42-a', 'seed42-b']) {
  const bytes = readFileSync(evidence('raw-' + tag + '-transform.json.gz'));
  const trace = JSON.parse(gunzipSync(bytes).toString('utf8'));
  need(trace.sha === sha && trace.buildSha256 === build && trace.tag === tag, 'Wrong raw transition');
  const pre = trace.preAction.pose;
  const initialLower = pre.parts['thorax.lower'].local.rotation;
  const initialShoulder = pre.shoulderInBody;
  let minOpeningDeg = Infinity, testedTicks = 0, firstTick = null, lastTick = null;
  const violations = [];
  const marks = [];
  for (const frame of trace.frames) {
    const pose = frame.pose;
    const height = -pose.shoulderInBody.y;
    const delta = Math.hypot(pose.shoulderInBody.x - initialShoulder.x, pose.shoulderInBody.y - initialShoulder.y);
    const movingCarrier = delta > 1e-5 || Math.abs(pose.parts['thorax.lower'].local.rotation - initialLower) > 1e-5;
    // K0's folded carrier already lies inside the nominal y-band.
    // Test released doors when that carrier actually starts leaving its seat.
    if (movingCarrier && height < aperture.shoulderLocalYForFemur) {
      firstTick ??= frame.tick;
      lastTick = frame.tick;
      testedTicks++;
      for (const id of gateIds) {
        need(allNodes.has(id), 'Missing aperture node ' + id);
        const degrees = Math.abs(pose.parts[id].local.roll) * 180 / Math.PI;
        const min = id.startsWith('shell.') ? aperture.minimumRoofOpenDeg : aperture.minimumSideGateOpenDeg;
        minOpeningDeg = Math.min(minOpeningDeg, degrees);
        if (degrees + 1e-6 < min) violations.push({ id, tick: frame.tick, degrees, min, height });
      }
    }
    for (const [key, tick] of Object.entries(frame.keyTicks ?? {})) if (tick === frame.tick) {
      marks.push({ key, tick, beat: pose.beat, shoulderHeight: height, eyeY: pose.eye.y, supports: frame.planted.length });
    }
  }
  need(testedTicks > 0 && marks.length === 6, 'Incomplete aperture/key coverage');
  reviewed.push({ tag, rawSha256: createHash('sha256').update(bytes).digest('hex'), initialShoulderHeight: -initialShoulder.y, firstTick, lastTick, testedTicks, minOpeningDeg, violations, marks });
}
const unresolved = measured.findings.filter(f => !['RELEASE_GATE_CLEARANCE', 'ACTUAL_PIXI_PROJECTION'].includes(f.code));
if (!projection.withinBudget) unresolved.push({ code: 'PROJECTED_PIXEL_BUDGET', boundCssPixels });
for (const r of reviewed) for (const v of r.violations) unresolved.push({ code: 'RELEASE_GATE_CLEARANCE', tag: r.tag, ...v });
console.log(JSON.stringify({ sha, buildSha256: build, projection, aperture: reviewed, initialDiagnosticCount: measured.findings.length, unresolved }, null, 2));
if (unresolved.length) process.exitCode = 3;
