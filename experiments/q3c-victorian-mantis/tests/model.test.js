import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, INTRO_DURATION, SceneModel, samplePose, stageAt } from '../src/model.js';
import { FULL_RIG, LANDING_Y } from '../src/rig.js';

const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.depth ?? 0) - (b.depth ?? 0));

test('one first input starts one ordered delivery; repeated activation does not reset it', () => {
  const scene = new SceneModel(27);
  scene.advance(20);
  assert.equal(scene.snapshot().phase, 'waiting');
  assert.equal(scene.activate('touch'), true);
  scene.advance(1);
  assert.equal(scene.activate('keyboard'), false);
  scene.advance(10);
  assert.deepEqual(scene.events.map(e => e.name || e.type), ['activate', 'falling', 'impact', 'legs', 'eye', 'capsule']);
  assert.equal(scene.snapshot().phase, 'capsule');
});

test('same seed, input and elapsed time produce the same joints across frame cadences', () => {
  const a = new SceneModel(123), b = new SceneModel(123);
  a.activate(); b.activate();
  a.setPointer(-140, -250); b.setPointer(-140, -250);
  for (let i = 0; i < 600; i++) a.advance(1 / 60);
  for (let i = 0; i < 240; i++) b.advance(1 / 24);
  assert.deepEqual(a.snapshot(), b.snapshot());
  const first = a.seek(8);
  assert.deepEqual(a.seek(8), first);
});

test('fall accelerates; first contact is directly on the beacon, rigid body never sinks below it', () => {
  const y = t => samplePose(.4 + t).body.y;
  assert.ok(y(.8) - y(.6) > 2 * (y(.3) - y(.1)));
  const contact = samplePose(1.45);
  near(contact.body.x, contact.beacon.x);
  near(contact.body.y + 82, contact.beacon.y);
  for (let t = 1.45; t < 2.35; t += DT) assert.ok(samplePose(t).body.y + 82 <= 1e-7);
});

test('links retain length throughout deployment; knees and feet remain above the floor', () => {
  let previous = samplePose(0);
  for (let t = 0; t <= 10; t += DT) {
    const pose = samplePose(t);
    for (const leg of pose.legs) {
      near(distance(leg.world.hip, leg.world.knee), leg.upper);
      near(distance(leg.world.knee, leg.world.ankle), leg.lower);
      assert.ok(leg.world.knee.y <= .02, `${leg.id} knee penetrates floor at ${t}: ${leg.world.knee.y}`);
      assert.ok(leg.world.foot.y <= .02, `${leg.id} penetrates floor at ${t}: ${leg.world.foot.y}`);
      if (leg.planted) near(leg.world.foot.y, 0);
      if (pose.phase.name === 'legs') {
        const priorAnkle = previous.legs.find(prior => prior.id === leg.id).world.ankle;
        assert.ok(distance(priorAnkle, leg.world.ankle) < 9, `${leg.id} ankle jumped at ${t}`);
      }
    }
    previous = pose;
  }
});

test('hatches open before feet exit and eye lid opens before the eye emerges', () => {
  const early = samplePose(2.35 + .2);
  assert.ok(Math.abs(early.hatches[0].angle) > .1);
  assert.ok(early.legs.every(leg => leg.kneeProgress === 0));
  const opening = samplePose(4.5 + .30);
  assert.ok(Math.abs(opening.lid.angle) > 1.2);
  assert.equal(opening.eye.extension, 0);
});

test('the knees exit the four open lower bays in order before swinging out to the seats', () => {
  const { bodyOpeningsXYUp, sideRollMagnitude } = FULL_RIG.apertures.walk;
  const firstExit = new Map();
  for (let tick = Math.ceil(2.35 / DT); tick < Math.ceil(4.5 / DT); tick++) {
    const { body, parts, legs, hatches } = samplePose(tick * DT);
    for (const [index, leg] of legs.entries()) {
      const knee = leg.world.knee;
      const root = parts.cradle.world;
      const dx = knee.x - root.x, dy = knee.y - root.y;
      const x = Math.cos(body.rotation) * dx + Math.sin(body.rotation) * dy;
      const y = Math.cos(body.rotation) * dy - Math.sin(body.rotation) * dx;
      const [minX, maxX] = bodyOpeningsXYUp[leg.id.split('.')[0]][0];
      if (!firstExit.has(leg.id) && (knee.depth ?? 0) * leg.outward >= 8) {
        assert.ok(x >= minX && x <= maxX, `${leg.id} missed its lower bay`);
        const [bottom, top] = bodyOpeningsXYUp[leg.id.split('.')[0]][1];
        assert.ok(y >= -top && y <= -bottom, `${leg.id} exited outside the lower aperture`);
        near(Math.abs(hatches[index].angle), sideRollMagnitude * Math.PI / 180);
        firstExit.set(leg.id, tick);
      }
      if (!firstExit.has(leg.id)) assert.ok(x >= minX && x <= maxX, `${leg.id} appeared above its bay`);
    }
  }
  assert.deepEqual([...firstExit.keys()], ['rear.far', 'front.far', 'rear.near', 'front.near']);
  const ticks = [...firstExit.values()];
  assert.ok(ticks.slice(1).every((tick, index) => tick - ticks[index] >= 12));
});

test('intro projection and physical turns stay within the per-tick budget with margin', () => {
  const { xPerZ, yPerZ } = FULL_RIG.coordinates.projection;
  const projected = ({ world }, body) => {
    const c = Math.cos(body.rotation), s = Math.sin(body.rotation);
    const depth = world.z + (world.depth ?? 0);
    return { x: world.x + (c * xPerZ - s * yPerZ) * depth, y: world.y + (s * xPerZ + c * yPerZ) * depth };
  };
  let previous = samplePose(282 * DT);
  for (let tick = 283; tick <= Math.round(INTRO_DURATION / DT); tick++) {
    const pose = samplePose(tick * DT);
    for (const [id, part] of Object.entries(pose.parts)) {
      const before = previous.parts[id];
      const step = distance(projected(part, pose.body), projected(before, previous.body));
      const rotation = part.world.rotation - before.world.rotation;
      const tilt = (part.world.tilt ?? 0) - (before.world.tilt ?? 0);
      const turn = 2 * Math.acos(Math.min(1, Math.abs(Math.cos(rotation / 2) * Math.cos(tilt / 2))));
      assert.ok(step < 5.6 && distance(part.world, before.world) < 6, `${id} moved too far at tick ${tick}`);
      assert.ok(turn < .23, `${id} turned too far at tick ${tick}`);
    }
    previous = pose;
  }
});

test('each sole reaches its seat before ground contact and remains pinned while the frame takes load', () => {
  const contactTolerance = .01;
  const driftTolerance = .01;
  const firstContacts = new Map();
  const previousSoles = new Map();
  const { yPerZ } = FULL_RIG.coordinates.projection;
  let supportTick;
  let liftTick;
  for (let tick = Math.ceil(2.35 / DT); tick <= Math.ceil(5 / DT); tick++) {
    const pose = samplePose(tick * DT);
    for (const leg of pose.legs) {
      const { foot } = leg.world;
      const previous = previousSoles.get(leg.id);
      if (previous && Math.abs(foot.x - previous.x) > driftTolerance) {
        const projectedClearance = -foot.y - yPerZ * (foot.depth ?? 0);
        assert.ok(projectedClearance >= 5, `${leg.id} spread too close to the floor at tick ${tick}`);
      }
      previousSoles.set(leg.id, foot);
      if (Math.abs(foot.y) <= contactTolerance && !firstContacts.has(leg.id)) {
        assert.ok(Math.abs(foot.x - leg.anchor.x) <= driftTolerance);
        firstContacts.set(leg.id, { tick, x: foot.x });
      }
      const contact = firstContacts.get(leg.id);
      if (contact) {
        assert.ok(Math.abs(foot.x - contact.x) <= driftTolerance, `${leg.id} slid after tick ${contact.tick}`);
        assert.ok(Math.abs(foot.y) <= contactTolerance, `${leg.id} left the floor after tick ${contact.tick}`);
      }
    }
    if (supportTick === undefined && pose.legs.every(leg => leg.planted)) supportTick = tick;
    if (liftTick === undefined && LANDING_Y - pose.body.y > .02) liftTick = tick;
    if (supportTick === undefined) assert.ok(LANDING_Y - pose.body.y <= .02, `chassis lifted before support at tick ${tick}`);
  }
  assert.equal(firstContacts.size, 4);
  assert.equal(supportTick, 493);
  assert.equal(liftTick, 500);
});

test('idle moves chassis and eye while ground contacts remain planted; pointer affects the gaze', () => {
  const a = samplePose(7), b = samplePose(9);
  assert.notEqual(a.body.y, b.body.y);
  assert.notEqual(a.eye.y, b.eye.y);
  for (const pose of [a, b]) {
    for (const leg of pose.legs) near(distance(leg.world.foot, leg.anchor), 0);
  }
  const scene = new SceneModel(41);
  scene.seek(8);
  scene.setPointer(-200, -200);
  scene.advance(1);
  assert.ok(scene.snapshot().pose.eye.gazeX < 0);
});

test('stage boundaries and integer clock do not introduce jumps or dropped commands', () => {
  assert.equal(stageAt(INTRO_DURATION).name, 'capsule');
  for (const boundary of [.4, 1.45, 2.35, 4.5, INTRO_DURATION]) {
    const before = samplePose(boundary - 1e-6), after = samplePose(boundary + 1e-6);
    assert.ok(distance(before.body, after.body) < .1);
    for (let i = 0; i < before.legs.length; i++) assert.ok(distance(before.legs[i].world.foot, after.legs[i].world.foot) < .1);
  }
  const scene = new SceneModel(1);
  assert.throws(() => scene.advance(-1), RangeError);
  assert.throws(() => scene.advance(Infinity), RangeError);
});

test('entry stays above a tall viewport and begins falling continuously; resize cannot teleport it', () => {
  const scene = new SceneModel(42);
  scene.prepareEntry(-1100);
  const waiting = scene.snapshot();
  assert.equal(waiting.phase, 'waiting');
  assert.ok(waiting.pose.body.y + 160 <= -1100);
  scene.activate('touch');
  near(scene.snapshot().pose.body.y, waiting.pose.body.y);
  scene.advance(.4);
  near(scene.snapshot().pose.body.y, waiting.pose.body.y);
  scene.prepareEntry(-2000);
  near(scene.snapshot().entryY, waiting.entryY);
  scene.advance(DT);
  const firstStep = scene.snapshot().pose.body.y - waiting.pose.body.y;
  assert.ok(firstStep > 0 && firstStep < 1);
  scene.advance(1.05 - DT);
  near(scene.snapshot().pose.body.y, -82);
  scene.reset();
  scene.prepareEntry(-900);
  assert.equal(scene.snapshot().phase, 'waiting');
  assert.equal(scene.snapshot().tick, 0);
  assert.ok(scene.snapshot().pose.body.y + 160 <= -900);
  assert.deepEqual(scene.snapshot().events, []);
});
