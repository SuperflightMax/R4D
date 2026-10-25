import test from 'node:test';
import assert from 'node:assert/strict';
import { Motion, STEP } from '../app/motion.mjs';

// Synthetic measured landmarks test control/kinematic invariants, not Miron's art.
const rest = { pelvis: { x: 0, y: 0 }, chest: { x: 0, y: -110 }, neck: { x: 0, y: -170 }, head: { x: 0, y: -210 } };
for (const [side, dx] of [['near', 12], ['far', -12]]) {
  for (const [name, x, y] of [['Hip', 0, 0], ['Knee', 12, 110], ['Ankle', 0, 220], ['Toe', 36, 240],
    ['Shoulder', 0, -145], ['Elbow', 8, -60], ['Wrist', 22, 18]]) rest[side + name] = { x: x + dx, y };
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const frame = m => m.advance(STEP);
test('retargeting changes intent without changing the current pose', () => {
  const m = new Motion(rest, 460);
  m.command('low'); m.advance(0.14);
  const before = structuredClone(m.pose), time = m.time;
  m.command('walk'); assert.deepEqual(m.pose, before); assert.equal(m.time, time);
  frame(m); assert.ok(distance(before.pelvis, m.pose.pelvis) < 6);
  m.command('jump'); assert.deepEqual(m.pose, m.snapshot().pose);
});
test('air commands preserve flight and the final ground intent wins', () => {
  for (const start of ['idle', 'low', 'walk']) {
    const m = new Motion(rest, 460); m.command(start); m.advance(1);
    m.command('jump'); m.advance(0.5); assert.equal(m.jump.phase, 'air');
    const count = m.jumpCount;
    assert.equal(m.command('jump'), false); assert.equal(m.jumpCount, count);
    m.command('walk'); m.command('idle'); m.command('low');
    assert.equal(m.jump.phase, 'air'); m.advance(2);
    assert.equal(m.jump, null); assert.equal(m.target, 'low'); assert.ok(m.values.low > 0.99);
  }
});
test('arbitrary commands preserve limb lengths, finite coordinates and a substantial low', () => {
  const m = new Motion(rest, 460);
  for (let i = 0; i < 1800; i++) {
    if (i % 29 === 0) m.command(['low', 'walk', 'jump', 'idle'][(i / 29 | 0) % 4]);
    frame(m);
    for (const p of Object.values(m.pose)) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    for (const side of ['near', 'far']) {
      for (const [a, b] of [['Hip', 'Knee'], ['Knee', 'Ankle'], ['Shoulder', 'Elbow'], ['Elbow', 'Wrist']]) {
        assert.ok(Math.abs(distance(m.pose[side+a], m.pose[side+b]) - distance(rest[side+a], rest[side+b])) < 0.001);
      }
    }
  }
  m.advance(2); m.command('low'); m.advance(2);
  assert.ok(m.pose.pelvis.y - rest.pelvis.y > 65);
});
test('one explicit step advances exactly 1/60 s, without a catch-up frame', () => {
  const m = new Motion(rest, 460); m.command('walk');
  frame(m); assert.ok(Math.abs(m.time - STEP) < 1e-12);
  const a = m.snapshot(); m.advance(0); assert.deepEqual(m.snapshot(), a);
});
test('early gate aligns measured soles through shared pelvis translation and foot rotation, without scaling', () => {
  const contacts = {
    near: { heel: { x: 4, y: 242 }, toe: { x: 42, y: 240 } },
    far: { heel: { x: -20, y: 208 }, toe: { x: 18, y: 206 } },
  };
  const m = new Motion(rest, 460, { early: true, contacts });
  assert.equal(m.command('walk'), false); assert.equal(m.command('jump'), false);
  for (const target of ['idle', 'low']) {
    m.command(target); m.advance(2);
    const report = m.measurements();
    for (const side of Object.values(report.sides)) {
      for (const link of Object.values(side.lengths)) assert.ok(Math.abs(link.error) < 0.001);
      for (const contact of Object.values(side.contacts)) assert.ok(Math.abs(contact.groundError) < 0.001);
    }
  }
});
