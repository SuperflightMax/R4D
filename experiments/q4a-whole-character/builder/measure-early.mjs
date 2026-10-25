import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Motion } from '../app/motion.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataPath = path.join(root, 'art/parts.json');
const bytes = await readFile(dataPath);
const data = JSON.parse(bytes);
const point = p => Array.isArray(p) ? { x: p[0], y: p[1] } : p;
const joints = Object.fromEntries(Object.entries(data.jointPoints).map(([k,v]) => [k, point(v)]));
const contacts = Object.fromEntries(Object.entries(data.contacts).map(([k,c]) => [k, { heel: point(c.heel), toe: point(c.toe) }]));
const m = new Motion(joints, data.figureBounds[3], { contacts, groundY: data.groundY, early: true });
const before = m.measurements(joints);
const neutral = { pose: structuredClone(m.pose), measures: m.measurements() };
m.command('low'); m.advance(2);
const low = { pose: structuredClone(m.pose), measures: m.measurements() };
const invariants = { maximumLengthError: 0, maximumGroundError: 0 };
for (const row of [neutral, low]) for (const side of Object.values(row.measures.sides)) {
  for (const link of Object.values(side.lengths)) invariants.maximumLengthError = Math.max(invariants.maximumLengthError, Math.abs(link.error));
  for (const contact of Object.values(side.contacts)) invariants.maximumGroundError = Math.max(invariants.maximumGroundError, Math.abs(contact.groundError));
}
const report = { source: data.source, version: data.version, partsJSONSha256: createHash('sha256').update(bytes).digest('hex'),
  conditions: 'Source-pixel coordinates; fixed measured lengths; shared root; rigid foot rotation; early neutral/low only', before, neutral, low, invariants };
const destination = path.join(root, 'builder/early-v02-01');
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'measurements.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ destination, invariants, neutralRootY: m.neutralRootY, groundY: m.groundY,
  lowRootDelta: low.measures.rootDelta, lowKneeFlex: Object.fromEntries(Object.entries(low.measures.sides).map(([s,v]) => [s,v.kneeFlexDegrees])) }, null, 2));
