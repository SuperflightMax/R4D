// Freeze only this QA batch's new runtime and pin results in owned report paths.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const task = process.argv[2], board = task === 'w05' ? 'water' : task === 'd02' ? 'dark' : null; assert(board);
const root = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${board}/${task}`;
const source = `experiments/p5-regenerated-objects/transfer-water-dark/${board}/qa/technical`;
const hash = b => createHash('sha256').update(b).digest('hex');
const pin = path => { const b = readFileSync(path); return { path, bytes: b.length, sha256: hash(b) }; };
const frozen = JSON.parse(readFileSync(`${root}/frozen-verification.json`));
const comparison = JSON.parse(readFileSync(`${root}/browser-comparison.json`));
const session = JSON.parse(readFileSync(`${root}/browser-session.json`)); assert.equal(session.consoleErrors.length, 0);
if (task === 'w05') assert.equal(JSON.parse(readFileSync(`${root}/browser-session-front-check.json`)).consoleErrors.length, 0);
assert.equal(comparison.results.every(x => x.stateConfigRngEventsExact && x.loadedArtExact), true);
const indexPath = `${root}/FILE_INDEX.qa.json`; assert(!existsSync(indexPath), 'New QA runtime index must not overwrite existing frozen evidence');
const entries = [];
function visit(dir) { for (const item of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
  const path = `${dir}/${item.name}`; if (item.isDirectory()) visit(path); else entries.push({ ...pin(path), path: path.slice(root.length + 1) });
} }
visit(root);
writeFileSync(indexPath, JSON.stringify({ candidate: task, board, finalizedUTC: new Date().toISOString(), root, entries, totalBytes: entries.reduce((s,e) => s + e.bytes, 0) }, null, 2) + '\n');
// Read back every listed byte once; no producer or previous QA artifacts are written.
for (const e of entries) { const actual = pin(`${root}/${e.path}`); assert.equal(actual.bytes, e.bytes); assert.equal(actual.sha256, e.sha256); }
const pins = {
  candidate: task, board, qaParentCommit: 'f40bd7fd0349fdf1a0cd7790e0ee2340e6554bd3', qaBranch: 'codex/r4d-p5-regenerated-technical-qa-01',
  report: `REPORT_${task.toUpperCase()}.md`, frozen, nativeOracle: { commit: '761e6087c902fe5ea941b90b5ce4d72383a0d755', newNativeRuns: 0, newSeeds: 0 },
  actual: { snapshots: comparison.snapshots, screenshots: readdirSync(`${root}/screenshots`).length, comparison: pin(`${root}/browser-comparison.json`),
    fieldDomain: comparison.fieldDomain, previousFieldDomain: comparison.previousFieldDomain, fieldDelta: comparison.fieldDelta, fieldFixedAcrossStates: true,
    consoleErrors: 0, ownTabsClosed: true, producerServerPreserved: true, noViewportOverrideOrCameraOffset: true },
  verdict: task === 'w05' ? { closedOwnRepro: 'W04-TQA-V01 on w05', frontObservation: 'W05-TQA-L01 NOTE / front-hide UNVERIFIED; same seed1 receiver03 actual1118–1120, no observed jerk, no established new visual defect', fullPass: false }
    : { knownLowerFloorDrift: 'corrected within identifiable bevel band including sourceY1121', stillOpen: 'D01-TQA-V01', receiverEntryAuditRepeated: false, fullPass: false },
  runtimeIndex: { ...pin(indexPath), entries: entries.length, totalBytes: entries.reduce((s,e) => s + e.bytes, 0) }, serverWrites: 0, tokenGranted: false
};
const pinsPath = `${source}/${task.toUpperCase()}_EVIDENCE_PINS.json`; assert(!existsSync(pinsPath));
writeFileSync(pinsPath, JSON.stringify(pins, null, 2) + '\n');
console.log(JSON.stringify({ candidate: task, ...pins.runtimeIndex, actual: pins.actual.snapshots, screenshots: pins.actual.screenshots }, null, 2));
