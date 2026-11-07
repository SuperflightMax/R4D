import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, INTRO_DURATION, SceneModel, samplePose, stageAt } from '../src/model.js';
import { BODY_ORIGIN, FULL_RIG } from '../src/rig.js';

const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

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
    const { legs, hatches } = samplePose(tick * DT);
    for (const [index, leg] of legs.entries()) {
      const x = leg.hip.x + leg.side * leg.upper * Math.cos(leg.upperAngle);
      const y = leg.hip.y - BODY_ORIGIN + leg.upper * Math.sin(leg.upperAngle);
      const [minX, maxX] = bodyOpeningsXYUp[leg.id.split('.')[0]][0];
      if (!firstExit.has(leg.id) && y >= 0) {
        assert.ok(x >= minX && x <= maxX, `${leg.id} missed its lower bay`);
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
