import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Motion, STEP } from '../../app/motion.mjs';
import { Motion as BeforeMotion } from '../../build/early-v02-01/source/app/motion.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const bytes = await readFile(path.join(root, 'art/parts.json'));
const data = JSON.parse(bytes);
if (!data.parts.every(p => p.file.startsWith('early-v02-02/'))) throw new Error('Correction 02 parts are not ready');
const alpha = JSON.parse(await readFile(new URL('./sole-contours.json', import.meta.url)));
const hash = createHash('sha256').update(bytes).digest('hex');
if (alpha.contractSha256 !== hash) throw new Error('Alpha data and parts contract differ; reread the current feet');
const point = p => Array.isArray(p) ? { x:p[0], y:p[1] } : p;
const optionsFor = (d, extra = {}) => ({ early: true, groundY: d.groundY,
  contacts: Object.fromEntries(Object.entries(d.contacts).map(([s,c]) => [s,{heel:point(c.heel),toe:point(c.toe)}])), ...extra });
const jointsFor = d => Object.fromEntries(Object.entries(d.jointPoints).map(([k,p])=>[k,point(p)]));
const motion = new Motion(jointsFor(data), data.figureBounds[3], optionsFor(data,
  {soleContours:Object.fromEntries(Object.entries(alpha.feet).map(([s,f])=>[s,f.points]))}));
function sample(m) {
  const rows = [{label:'neutral', state:m.snapshot(), measures:m.measurements()}];
  for (const [target, prefix] of [['low','down'],['idle','up']]) {
    m.command(target);
    for (let i=1;i<=120;i++) {
      m.advance(STEP);
      if ([3,6,9,15,30,60,120].includes(i)) rows.push({label:`${prefix}-${i}`, state:m.snapshot(), measures:m.measurements()});
    }
  }
  return rows;
}
const after = sample(motion);
const old = JSON.parse(await readFile(path.join(root,'build/early-v02-01/art/parts.json')));
const before = sample(new BeforeMotion(jointsFor(old),old.figureBounds[3],optionsFor(old)));
let maxLengthError=0, maxSupportError=0;
for(const row of after) for(const side of Object.values(row.measures.sides)) {
  for(const l of Object.values(side.lengths)) maxLengthError=Math.max(maxLengthError,Math.abs(l.error));
  maxSupportError=Math.max(maxSupportError,Math.abs(side.actualAlphaSupport.groundError));
}
const low=after.find(r=>r.label==='down-120');
const report={contractSha256:hash,version:data.version,source:data.source,alphaThreshold:alpha.alphaThreshold,
  invariants:{maxLengthError,maxSupportError,additionalPelvisDrop:low.state.pose.pelvis.y-after[0].state.pose.pelvis.y,
    lowKnees:Object.fromEntries(Object.entries(low.measures.sides).map(([s,v])=>[s,v.kneeFlexDegrees]))},before,after};
await writeFile(new URL('./measurements.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.invariants,null,2));
if(maxLengthError>1e-6||maxSupportError>1e-6||report.invariants.additionalPelvisDrop<243.61-1e-6) process.exitCode=1;
