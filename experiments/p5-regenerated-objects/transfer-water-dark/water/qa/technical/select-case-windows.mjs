// Reads saved traces only: zero new simulation runs, seeds or product writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [board, name] = process.argv.slice(2);
assert(['water', 'dark'].includes(board)); assert.match(name ?? '', /^case-windows-\d{3}$/);
const base = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${board}`;
const input = path.join(base, 'input-oracle-001'), root = path.join(base, name);
assert(!existsSync(root), 'Preserve earlier analyses.'); mkdirSync(root);
const hash = b => createHash('sha256').update(b).digest('hex');
const read = p => JSON.parse(readFileSync(path.join(input, p)));
const cfg = read('common/config.json'), manifest = read('common/manifest.json'), summary = read('summary.json');
const source = p => { const m = manifest.projection.nativeToSource, d = m[2][0] * p.x + m[2][1] * p.y + m[2][2]; return [(m[0][0] * p.x + m[0][1] * p.y + m[0][2]) / d, (m[1][0] * p.x + m[1][1] * p.y + m[1][2]) / d]; };
const pointSegment = (p, s) => {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
  const tRaw = ((p.x - s.x1) * dx + (p.y - s.y1) * dy) / (dx * dx + dy * dy), t = Math.max(0, Math.min(1, tRaw));
  return { tRaw, t, distance: Math.hypot(p.x - s.x1 - t * dx, p.y - s.y1 - t * dy) };
};
const feet = new Map();
for (const m of manifest.idMapping.filter(m => m.objectId?.startsWith('arch-'))) {
  if (!feet.has(m.objectId)) feet.set(m.objectId, {});
  feet.get(m.objectId)[m.researchId.includes('left-foot') ? 'left' : 'right'] = m.nativeIds.map(id => cfg.board.segments.find(s => s.id === id));
}
function boundsAtY(segments, y) {
  const xs = [];
  for (const s of segments) {
    if (y < Math.min(s.y1, s.y2) - 1e-7 || y > Math.max(s.y1, s.y2) + 1e-7) continue;
    if (Math.abs(s.y2 - s.y1) < 1e-9) xs.push(s.x1, s.x2);
    else xs.push(s.x1 + (s.x2 - s.x1) * (y - s.y1) / (s.y2 - s.y1));
  }
  return [Math.min(...xs), Math.max(...xs)];
}
const archGaps = [...feet].map(([id, f]) => {
  const low = Math.max(...Object.values(f).map(ss => Math.min(...ss.flatMap(s => [s.y1, s.y2]))));
  const high = Math.min(...Object.values(f).map(ss => Math.max(...ss.flatMap(s => [s.y1, s.y2]))));
  const samples = [low, (low + high) / 2, high].map(y => { const left = boundsAtY(f.left, y)[1], right = boundsAtY(f.right, y)[0]; return { y, leftInnerX: left, rightInnerX: right, gapWidth: right - left, centerWidthAfterR16: right - left - 32 }; });
  return { id, low, high, samples };
});
const seeds = [];
const selected = [];
for (const run of summary.seeds) {
  const traceBytes = readFileSync(path.join(input, `private/seed-${run.seed}/states.ndjson`)); assert.equal(hash(traceBytes), run.traceSha256);
  const states = traceBytes.toString().trimEnd().split('\n').map(JSON.parse), events = read(`private/seed-${run.seed}/events.json`);
  function window(id, tick, details, ticks = [Math.max(0, tick - 1), tick, Math.min(tick + 1, states.length - 1)]) {
    const exactTicks = [...new Set(ticks)], w = { id, seed: run.seed, ...details, exactTicks, states: exactTicks.map(t => states[t]), projectedCenters: exactTicks.map(t => ({ tick: t, source: source(states[t].ball.pos) })), motionRange: [Math.max(0, Math.min(...exactTicks) - 10), Math.min(states.length - 1, Math.max(...exactTicks) + 10)], visualStatus: 'UNVERIFIED: generated candidate, silhouette alpha and actual movement not supplied' };
    selected.push(w); return id;
  }
  const segmentContacts = events.filter(e => e.type === 'object_hit' && e.objectKind === 'segment').map(e => {
    const s = cfg.board.segments.find(s => s.id === e.objectId), hit = pointSegment(e, s);
    const edge = /:edge-(\d+)/.exec(e.objectId)?.[1];
    const feature = hit.t === 0 || hit.t === 1 ? 'endpoint-corner' : edge === '02' || edge === '04' ? 'side-face' : edge === '03' ? 'front-face' : edge === '01' ? 'back-face' : 'boundary';
    return { event: e, feature, closestSegment: hit, sourceHitCenter: source(e) };
  });
  // All significant support/rectangular contacts, no success-based selection.
  for (const c of segmentContacts.filter(c => c.event.objectId.includes(':edge-'))) {
    const t = c.event.tick;
    window(`contact-s${run.seed}-t${t}-${c.event.objectId}`, t + 1, { kind: 'native-contact', ...c }, [t, t + 1, Math.min(t + 2, states.length - 1)]);
  }
  const passages = [];
  for (const a of archGaps) {
    const f = feet.get(a.id), groups = []; let current;
    for (const s of states) {
      const p = s.ball.pos;
      if (p.y < a.low || p.y > a.high) { current = undefined; continue; }
      const left = boundsAtY(f.left, p.y)[1], right = boundsAtY(f.right, p.y)[0];
      const clearance = Math.min(...[...f.left, ...f.right].map(seg => pointSegment(p, seg).distance)) - cfg.board.ball.r;
      const clear = p.x > left && p.x < right && clearance >= -1e-6;
      if (!clear) { current = undefined; continue; }
      if (!current) { current = { from: s.tick, to: s.tick, minClearance: clearance }; groups.push(current); }
      else { current.to = s.tick; current.minClearance = Math.min(current.minClearance, clearance); }
    }
    for (const g of groups) {
      const prev = states[Math.max(0, g.from - 1)].ball.pos.y, next = states[Math.min(states.length - 1, g.to + 1)].ball.pos.y;
      const fullSlabCrossing = (prev < a.low && next > a.high) || (prev > a.high && next < a.low);
      const ticks = [...new Set([Math.max(0, g.from - 1), g.from, Math.floor((g.from + g.to) / 2), g.to, Math.min(states.length - 1, g.to + 1)])];
      const id = window(`opening-s${run.seed}-${a.id}-t${g.from}-${g.to}`, g.from, { kind: '2d-clear-opening', arch: a.id, ...g, fullSlabCrossing, limitation: 'Only the ground disk and accepted feet; no height, lintel collision or generated-art silhouette claim' }, ticks);
      passages.push({ id, arch: a.id, ...g, fullSlabCrossing });
    }
  }
  // Nearest samples for every receiver retained, including distant/unreached ones.
  const receivers = run.receiverApproaches.map(r => {
    const ticks = r.triggerReached ? [Math.max(0, r.stateTick - 2), r.stateTick - 1, r.stateTick] : r.stateTicks;
    const id = window(`receiver-s${run.seed}-${r.id}-t${r.stateTick}`, r.stateTick, { kind: r.triggerReached ? 'native-receiver-trigger' : 'nearest-receiver-approach-only', receiver: r, terminalAfterStateUnavailable: r.triggerReached }, ticks);
    return { id, ...r };
  });
  seeds.push({ seed: run.seed, result: run.result, segmentContacts, passages, receivers });
}
const report = { schema: 'r4d.p5.transfer.technical-case-windows.v1', board, sourceSummarySha256: hash(readFileSync(path.join(input, 'summary.json'))), noNewRuns: true, noNewSeeds: true, archGaps, seeds, selected, scope: 'QA targets from genuine cached states; feature labels derived from accepted segment ordering and exact contact centers. No visual PASS. Receiver front rims require generated silhouette inspection; terminal state has no invented later physics.' };
const bytes = JSON.stringify(report, null, 2) + '\n'; writeFileSync(path.join(root, 'windows.json'), bytes);
writeFileSync(path.join(root, 'evidence-index.json'), JSON.stringify([{ path: 'windows.json', bytes: Buffer.byteLength(bytes), sha256: hash(bytes) }], null, 2) + '\n');
console.log(JSON.stringify({ root, windowsSha256: hash(bytes), selected: selected.length, archGaps, seeds: seeds.map(s => ({ seed: s.seed, passages: s.passages, significantContacts: s.segmentContacts.filter(c => c.event.objectId.includes(':edge-')).map(c => ({ id: c.event.objectId, t: c.event.tick, feature: c.feature, tAlong: c.closestSegment.t })) })) }, null, 2));
