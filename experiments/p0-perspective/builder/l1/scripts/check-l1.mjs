import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const output = path.join(root, 'output');
const temp = await mkdtemp(path.join(os.tmpdir(), 'r4d-p0-l1-check-'));
const files = ['composite-l1.png','manifest-l1.json','numeric-report-l1.json','review-l1.html','hashes-l1.json'];

try {
  const build = spawnSync(process.execPath, [path.join(here, 'build-l1.mjs'), '--out', temp], { encoding:'utf8' });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout || 'L1 rebuild failed');
  for (const name of files) {
    const [expected, actual] = await Promise.all([readFile(path.join(output,name)), readFile(path.join(temp,name))]);
    const equal = name.endsWith('.png') ? expected.equals(actual) : canonicalText(expected).equals(canonicalText(actual));
    assert(equal, `${name} is not reproducible; run npm run build:l1`);
  }

  const manifest = JSON.parse(await readFile(path.join(temp,'manifest-l1.json'),'utf8'));
  const report = JSON.parse(await readFile(path.join(temp,'numeric-report-l1.json'),'utf8'));
  assert(manifest.frame.widthPx === 1536 && manifest.frame.heightPx === 1536, 'Composite dimensions changed');
  assert(JSON.stringify(manifest.componentDimensions) === JSON.stringify({environment:{width:1536,height:1536},master:{width:1074,height:1137},shadow:{width:1074,height:1137}}), 'Component dimensions changed');
  assert(manifest.instances.length === 4, 'Exactly four instances required');
  assert(new Set(manifest.instances.map((i) => i.master.sha256)).size === 1, 'Instances do not share one master');
  assert(JSON.stringify(manifest.instances.map((i) => i.q)) === JSON.stringify([0.338,0.453,0.567,0.681]), 'Anchor q values changed');
  assert(JSON.stringify(manifest.instances.map((i) => i.baseCenterPx.y)) === JSON.stringify([519.168,695.808,870.912,1046.016]), 'Anchor pixels changed');
  assert(JSON.stringify(manifest.instances.map((i) => i.uniformScale)) === JSON.stringify([0.939,0.978,1.018,1.058]), 'Uniform scales changed');
  assert(manifest.instances.every((i) => i.shadow.destinationRectEqualsMaster), 'Shadow/master destination differs');
  assert(report.uniqueMasterHashes.length === 1 && report.uniqueShadowHashes.length === 1, 'Source identity check failed');
  assert(report.shadowMasterDestinationIdentity === true, 'Shadow anchor/scale identity failed');
  assert(report.anchorsInsidePlayableQuad.every((item) => item.inside), 'An anchor left the playable quad');
  assert(report.controlMarkersAllowed === false && manifest.cleanOutput.overlaysInComposite.length === 0, 'Control overlays are forbidden');
  assert(manifest.gates.newImages === 'closed' && manifest.gates.finalSeries === 'closed', 'A closed gate was opened');
  console.log('PASS: exact PNG reproduction; 1536²; one master/shadow; 4 IDs/anchors/scales; stable order; no overlays; gates closed');
} finally {
  await rm(temp,{recursive:true,force:true});
}

function canonicalText(buffer){return Buffer.from(buffer.toString('utf8').replace(/\r\n/g,'\n'),'utf8');}
function assert(condition,message){if(!condition)throw new Error(message);}
