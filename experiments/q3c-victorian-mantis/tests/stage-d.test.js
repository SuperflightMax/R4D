import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DT, SceneModel } from '../src/model.js';
import { DEFAULT_BOUNDS, MOTH_GEOMETRY, mothFlight, spawnMoth, sweptContact } from '../src/hunt.js';
import { IMPACT_PACK, impactParticle, impactPlan } from '../src/impact.js';
import { RIG_PARTS } from '../src/rig.js';

const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const drives = RIG_PARTS.filter(part => part.drive);

function checkDrives(pose) {
  for (const { id, drive } of drives) {
    const [min, max] = drive.pinDistanceAllowed;
    const span = pose.parts[id].pinDistance;
    assert.ok(span >= min - 1e-7 && span <= max + 1e-7, `${id} exceeded its actuator stroke at ${pose.time}`);
  }
}

test('capsule walks in both directions with planted diagonal support and settles before a queued transform', () => {
  const scene = new SceneModel(42);
  scene.seek(6);
  for (const direction of [-1, 1]) {
    const before = scene.snapshot();
    assert.ok(scene.walkBy(direction, 'keyboard'));
    let prior = scene.snapshot();
    let swung = false;
    while (prior.walk.step) {
      const frame = scene.advance(DT);
      assert.ok(frame.pose.legs.filter(leg => leg.planted).length >= 2);
      for (const [i, leg] of frame.pose.legs.entries()) {
        const previous = prior.pose.legs[i];
        if (leg.planted && previous.planted) near(distance(previous.world.foot, leg.world.foot), 0);
        if (!leg.planted) { assert.ok(leg.world.foot.y < 0); swung = true; }
        near(distance(leg.world.hip, leg.world.knee), leg.upper);
        near(distance(leg.world.knee, leg.world.ankle), leg.lower);
      }
      checkDrives(frame.pose);
      prior = frame;
    }
    assert.ok(swung);
    near(prior.walk.x - before.walk.x, 24 * direction);
    assert.equal(prior.pose.legs.filter(leg => leg.planted).length, 4);
  }
  scene.walkBy(1);
  scene.advance(.25);
  assert.ok(scene.requestTransform('button'));
  assert.equal(scene.snapshot().phase, 'capsule');
  assert.ok(scene.snapshot().walk.queuedTransform);
  const transform = scene.advance(.55);
  assert.equal(transform.phase, 'transforming');
  assert.equal(transform.pose.legs.filter(leg => leg.planted).length, 4);
  assert.equal(transform.events.filter(event => event.type === 'transform').length, 1);
});

test('spawn and flap replay by seed and round and the full wing envelope stays in the visible field', () => {
  const bounds = DEFAULT_BOUNDS;
  const first = spawnMoth(42, 1, 0, bounds, 0);
  assert.deepEqual(spawnMoth(42, 1, 0, bounds, 0), first);
  assert.notDeepEqual(spawnMoth(42, 2, 0, bounds, 0).position, first.position);
  const positions = new Set();
  const radius = MOTH_GEOMETRY.safeRadius;
  for (let seed = 0; seed < 120; seed++) {
    const moth = spawnMoth(seed, 1, 0, bounds, seed % 2 ? 66 : -38);
    positions.add(moth.position.x);
    for (let tick = 0; tick < 600; tick += 7) {
      const { position: { x, y }, wings } = mothFlight(moth, tick, 120);
      assert.ok(x - radius > bounds.left && x + radius < bounds.right);
      assert.ok(y - radius > bounds.top && y + radius < bounds.bottom);
      assert.ok(wings.far > 0 && wings.far <= 1 && wings.near > 0 && wings.near <= 1);
    }
  }
  assert.equal(positions.size, 120);
  const sample = mothFlight(first, 7, 120);
  assert.notDeepEqual(sample.wings, first.wings);
  assert.notEqual(sample.wings.far, sample.wings.near);
});

test('swept blade contact uses the physical thorax ellipse and reports its world surface', () => {
  const moth = { position: { x: 35, y: -100 }, bank: Math.PI / 2 };
  const start = { x: 35, y: -120 }, end = { x: 35, y: -80 };
  const hit = sweptContact(start, end, moth, moth);
  near(hit.contactWorldXY.y, moth.position.y + MOTH_GEOMETRY.capture.center[0] - MOTH_GEOMETRY.capture.radii[0]);
  assert.deepEqual(hit.strikeDirection, { x: 0, y: 1 });
  assert.equal(sweptContact({ ...start, x: 40 }, { ...end, x: 40 }, moth, moth), null);
});

test('hunt closes on the actual blade contact, repeats without reload and resets the whole seed history', () => {
  for (const seed of [3, 42, 77]) {
    const scene = new SceneModel(seed);
    const ready = scene.seek(12, { transformAt: 6 });
    assert.equal(ready.hunt.phase, 'observe');
    assert.ok(ready.moth);
    assert.equal(scene.repeatMoth(), false);
    for (let round = 1; round <= 2; round++) {
      assert.equal(scene.snapshot().moth.id, `moth-${round}`);
      assert.ok(scene.requestHunt('touch'));
      assert.equal(scene.requestHunt('touch'), false);
      let before = scene.snapshot(), hit;
      for (let tick = 0; tick < 360 && !hit; tick++) {
        const frame = scene.advance(DT);
        checkDrives(frame.pose);
        if (frame.impact) {
          const side = before.hunt.side;
          const from = before.pose.arms.find(arm => arm.side === side).contact;
          const to = frame.pose.arms.find(arm => arm.side === side).contact;
          const point = frame.impact.contactWorldXY;
          near(distance(from, point) + distance(point, to), distance(from, to));
          const victim = frame.impact.victimWorldXY;
          const ellipse = MOTH_GEOMETRY.capture;
          near(((point.x - victim.x - ellipse.center[0]) / ellipse.radii[0]) ** 2 +
            ((point.y - victim.y - ellipse.center[1]) / ellipse.radii[1]) ** 2, 1);
          hit = frame.impact;
        }
        before = frame;
      }
      assert.ok(hit, `no actual contact for seed ${seed}, round ${round}`);
      assert.equal(hit.victimId, `moth-${round}`);
      assert.equal(scene.snapshot().moth, null);
      assert.equal(scene.repeatMoth(), false);
      const idle = scene.advance(1);
      assert.equal(idle.hunt.phase, 'idle');
      assert.deepEqual(idle.events.filter(event => event.type === 'hunt').slice(-6).map(event => event.name),
        ['observe', 'intent', 'lunge', 'impact', 'reaction', 'idle']);
      if (round === 1) assert.ok(scene.repeatMoth('keyboard'));
    }
    const reset = scene.reset();
    assert.equal(reset.phase, 'waiting');
    assert.equal(reset.moth, null);
    assert.equal(reset.impact, null);
    assert.deepEqual(scene.seek(12, { transformAt: 6 }), ready);
  }
});

test('every impact group begins at the recorded contact and stays within the manifest radius', () => {
  const event = { seed: 3489, contactWorldXY: { x: 51, y: -201 }, strikeDirection: { x: .8, y: -.6 } };
  const plans = impactPlan(event);
  assert.deepEqual(plans, impactPlan(event));
  assert.deepEqual([...new Set(plans.map(plan => plan.kind))], IMPACT_PACK.drawOrder);
  for (const plan of plans) {
    near(distance(impactParticle(plan, plan.delay), event.contactWorldXY), 0);
    const [x, y, w, h] = IMPACT_PACK.sprites[plan.texture].viewBox;
    const bounds = Math.hypot(Math.max(-x, x + w), Math.max(-y, y + h));
    for (let i = 0; i < 40; i++) {
      const state = impactParticle(plan, plan.delay + plan.life * i / 40);
      assert.ok(distance(state, event.contactWorldXY) + bounds * state.scale <= IMPACT_PACK.maxTraceRadiusWorld + 1e-7);
    }
  }
});

test('the same seed and inputs replay walking, flight and the impact across frame cadences', () => {
  const a = new SceneModel(42), b = new SceneModel(42);
  const advance = seconds => {
    a.advance(seconds);
    for (let i = 0; i < Math.round(seconds * 120); i++) b.advance(DT);
    assert.deepEqual(a.snapshot(), b.snapshot());
  };
  for (const scene of [a, b]) { scene.seek(6); scene.walkBy(1, 'keyboard'); }
  advance(.8);
  for (const scene of [a, b]) scene.requestTransform('keyboard');
  advance(5);
  advance(.5);
  for (const scene of [a, b]) assert.ok(scene.requestHunt('keyboard'));
  advance(.5);
  advance(2.5);
  assert.ok(a.snapshot().impact);
});
