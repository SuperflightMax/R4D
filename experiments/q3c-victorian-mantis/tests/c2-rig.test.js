import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DT, INTRO_DURATION, SceneModel, TRANSFORM_DURATION, samplePose, toWorld } from '../src/model.js';
import { KEY_BEATS, TRACKS, rad, sampleTrack } from '../src/motion.js';
import { FULL_RIG, RELEASE, RIG_PARTS } from '../src/rig.js';
import partsIndex from '../assets/production-v1/PARTS_INDEX.json' with { type: 'json' };

const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const start = 7;
const poseAt = (elapsed, seed = 42) => samplePose(start + elapsed, { transformAt: start, seed });

test('every drawn surface resolves to its production-v1 texture and trim pivot', () => {
  const ids = RIG_PARTS.map(node => node.id);
  assert.equal(new Set(ids).size, 98);
  assert.equal(Object.keys(TRACKS).length, 28);
  assert.deepEqual([...FULL_RIG.drawOrder].sort(), [...ids].sort());
  const textures = new Set(RIG_PARTS.flatMap(node => node.draw ? [node.draw.asset, node.draw.backAsset].filter(Boolean) : []));
  assert.equal(textures.size, 64);
  assert.deepEqual([...textures].sort(), Object.keys(partsIndex).sort());
  assert.deepEqual([...textures].sort(), Object.keys(FULL_RIG.assets).sort());
  for (const name of textures) {
    const { sha256, ...asset } = FULL_RIG.assets[name];
    assert.deepEqual(asset, partsIndex[name]);
    const bytes = readFileSync(new URL(`../assets/${asset.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, name);
    const [x, y, w, h] = asset.viewBox;
    near(asset.spriteAnchor[0], -x / w);
    near(asset.spriteAnchor[1], -y / h);
  }
});

test('the direct command starts only from the live capsule and preserves its evaluated pose', () => {
  const scene = new SceneModel(42);
  assert.equal(scene.requestTransform('keyboard'), false);
  scene.activate('touch');
  scene.advance(INTRO_DURATION - DT);
  assert.equal(scene.requestTransform('button'), false);
  scene.advance(1.1);
  const capsule = scene.snapshot();
  assert.equal(capsule.phase, 'capsule');
  assert.equal(scene.requestTransform('button'), true);
  assert.deepEqual(scene.snapshot().pose.parts, capsule.pose.parts);
  assert.equal(scene.requestTransform('button'), false);
  assert.equal(scene.advance(TRANSFORM_DURATION + DT).phase, 'mantis');
  assert.equal(scene.requestTransform('keyboard'), false);
  assert.equal(scene.events.filter(event => event.type === 'transform').length, 1);
  assert.equal(scene.reset().phase, 'waiting');
  assert.equal(scene.transformAt, null);
});

test('K0–K5 move the same part graph continuously and keep all pivots connected', () => {
  const inventory = Object.fromEntries(RIG_PARTS.map(part => [part.id, part.parent]));
  assert.equal(Object.keys(inventory).length, FULL_RIG.drawOrder.length);
  const packed = samplePose(0, { active: false });
  assert.deepEqual(Object.keys(packed.parts), Object.keys(inventory));
  let before = poseAt(0);
  for (let i = 0; i <= Math.ceil((TRANSFORM_DURATION + .8) / DT); i++) {
    const pose = poseAt(i * DT);
    assert.deepEqual(Object.keys(pose.parts), Object.keys(inventory));
    for (const node of Object.values(pose.parts)) {
      assert.equal(node.parent, inventory[node.id]);
      assert.ok(distance(node.world, before.parts[node.id].world) < 6, `${node.id} jumped at ${i * DT}s`);
      if (node.parent) {
        near(distance(node.world, toWorld(node.local, pose.parts[node.parent].world)), 0);
      }
    }
    near(distance(pose.parts['thorax.lower'].world, pose.parts['thorax.upper'].world), 98);
    near(distance(pose.parts['thorax.upper'].world, pose.parts['head.carriage.sleeve'].world), 98);
    for (const arm of pose.arms) {
      near(distance(arm.shoulder, arm.elbow), 86);
      near(distance(arm.elbow, arm.tip), 88);
      near(distance(arm.shoulder, pose.parts['thorax.upper'].world), 0);
    }
    for (const name of ['head.carriage.section1', 'head.carriage.section2']) {
      assert.ok(pose.parts[name].local.x >= 0 && pose.parts[name].local.x <= 12);
    }
    before = pose;
  }
  for (const beat of KEY_BEATS) assert.equal(poseAt(beat.time).beat, beat.id);
  assert.ok(-poseAt(TRANSFORM_DURATION).eye.y > -poseAt(0).eye.y * 2);
});

test('the two shoulder gates and roof release first, then the limbs open above the shell', () => {
  for (let i = 0; i <= Math.ceil(TRANSFORM_DURATION / DT); i++) {
    const t = i * DT;
    const pose = poseAt(t);
    const lower = pose.parts['thorax.lower'].local.rotation;
    const shoulderHeight = -pose.shoulderInBody.y;
    if (lower > -rad(170) + 1e-5 && shoulderHeight < RELEASE.shoulderLocalYForFemur) {
      for (const id of ['shell.rear', 'shell.front', 'bay.rapt.far.door', 'bay.rapt.near.door']) {
        assert.ok(Math.abs(pose.parts[id].local.roll) >= rad(104) - 1e-7, `${id} obstructs exit at ${t}`);
      }
    }
    for (const side of ['far', 'near']) {
      const femur = pose.parts[`rapt.${side}.femur`];
      const blade = pose.parts[`rapt.${side}.tibia`];
      if (Math.abs(femur.world.rotation - pose.body.rotation) > 1e-5) {
        assert.ok(shoulderHeight >= RELEASE.shoulderLocalYForFemur - .01);
      }
      if (Math.abs(blade.local.rotation + rad(170)) > 1e-5) {
        assert.ok(shoulderHeight >= RELEASE.shoulderLocalYForBlade - .01);
      }
    }
  }
});

test('K4 and K5 separate the projected hinges and full blade span above a bent chest', () => {
  const { xPerZ, yPerZ } = FULL_RIG.coordinates.projection;
  const blades = FULL_RIG.stageDInterfaces.capture;
  const firstTick = Math.ceil(KEY_BEATS.find(beat => beat.id === 'K4').time / DT);
  for (let tick = firstTick; tick <= Math.ceil((TRANSFORM_DURATION + 12) / DT); tick++) {
    const pose = poseAt(tick * DT);
    for (const [fraction, gap] of [[0, 48], [.5, 58], [1, 70]]) {
      const [near, far] = blades.map(({ blade, tip }) => {
        const world = pose.parts[blade].world;
        const { x, y } = toWorld({ x: tip[0] * fraction, y: tip[1] * fraction }, world);
        return toWorld({ x: xPerZ * world.z, y: yPerZ * world.z }, { x, y, rotation: pose.body.rotation });
      });
      assert.ok(distance(near, far) > gap, `blade overlap at ${tick * DT}s, ${fraction} of blade`);
    }
    assert.ok(Math.abs(pose.parts['thorax.upper'].local.rotation) >= rad(24), 'Chest links collapsed into a column');
  }
});

test('four fixed foot seats support each key beat and the moving links preserve contact', () => {
  const initial = poseAt(0).legs.map(leg => leg.footX);
  for (let i = 0; i <= Math.ceil((TRANSFORM_DURATION + 2) / DT); i++) {
    const pose = poseAt(i * DT);
    assert.deepEqual(pose.legs.map(leg => leg.footX), initial);
    for (const leg of pose.legs) {
      assert.ok(leg.planted);
      near(distance(leg.world.hip, leg.world.knee), leg.upper);
      near(distance(leg.world.knee, leg.world.ankle), leg.lower);
      near(distance(leg.world.foot, leg.anchor), 0);
      for (const end of [-6, 6]) {
        assert.ok(toWorld({ x: end, y: 2 }, leg.world.ankle).y <= 1e-7, `${leg.id} sole below floor`);
      }
    }
  }
});

test('piston rods retain their insertion and actual pin contact through delivery and transformation', () => {
  const cylinders = RIG_PARTS.filter(node => node.drive);
  for (let tick = 0; tick <= Math.ceil((start + TRANSFORM_DURATION + 1.2) / DT); tick++) {
    const pose = samplePose(tick * DT, { transformAt: start, seed: 42 });
    for (const { id, drive } of cylinders) {
      const barrel = pose.parts[id];
      const [min, max] = drive.pinDistanceAllowed;
      assert.ok(barrel.pinDistance >= min - 1e-7 && barrel.pinDistance <= max + 1e-7, id);
      let previous = drive.barrelLength;
      for (let i = 0; i < drive.sectionIds.length; i++) {
        const section = pose.parts[drive.sectionIds[i]];
        assert.ok(section.local.x - previous <= drive.sectionLengths[i] - drive.minimumInsertion + 1e-7, section.id);
        previous = section.local.x;
      }
      const [x, y] = drive.pinB.local;
      const target = toWorld({ x, y }, pose.parts[drive.pinB.part].world);
      near(distance(pose.parts[drive.sectionIds.at(-1)].world, target), 0);
    }
  }
});

test('actuators have distinct measured onsets, acceleration and overshoot', () => {
  const channels = ['shell.rear.open', 'thorax.lower.abs', 'thorax.upper.abs', 'rapt.near.femur.abs',
    'rapt.far.femur.abs', 'rapt.near.tibia.relative', 'rapt.far.tibia.relative'];
  const onsets = channels.map(id => {
    const track = TRACKS[id];
    for (let i = 0; i <= Math.ceil(TRANSFORM_DURATION / DT); i++) {
      if (Math.abs(sampleTrack(track, i * DT) - track.initial) > .1) return i;
    }
    return -1;
  });
  assert.ok(onsets.every(tick => tick > 0));
  assert.equal(new Set(onsets).size, channels.length);
  const midpoint = id => {
    const track = TRACKS[id];
    const segment = track.segments[0];
    return (sampleTrack(track, (segment.start + segment.end) / 2) - segment.from) / (segment.to - segment.from);
  };
  assert.ok(Math.abs(midpoint('thorax.lower.abs') - midpoint('thorax.upper.abs')) > .025);
  const lower = TRACKS['thorax.lower.abs'];
  assert.ok(sampleTrack(lower, 3.55) < sampleTrack(lower, TRANSFORM_DURATION));
  const nearBlade = TRACKS['rapt.near.tibia.relative'];
  assert.ok(sampleTrack(nearBlade, 3.43) > sampleTrack(nearBlade, TRANSFORM_DURATION));
});

test('seed and timed commands replay exactly and both idles move local channels independently', () => {
  const a = new SceneModel(1729), b = new SceneModel(1729);
  for (const scene of [a, b]) {
    scene.seek(start);
    scene.requestTransform('keyboard');
    scene.setPointer(-140, -180);
  }
  a.advance(5.4);
  for (let i = 0; i < 324; i++) b.advance(1 / 60);
  assert.deepEqual(a.snapshot(), b.snapshot());
  assert.deepEqual(a.seek(13, { transformAt: start }), a.seek(13, { transformAt: start }));
  const capsule = [8, 9.15, 10.7, 12.4].map(t => samplePose(t, { seed: 42 }));
  assert.ok(new Set(capsule.map(pose => pose.parts['eye.brow'].local.rotation)).size > 2);
  assert.ok(new Set(capsule.map(pose => pose.parts['head.carriage.section2'].local.x)).size > 2);
  const mantis = [5.4, 6.15, 7.3, 8.9].map(t => poseAt(t));
  const near = mantis.map(pose => pose.parts['rapt.near.tibia'].local.rotation);
  const far = mantis.map(pose => pose.parts['rapt.far.tibia'].local.rotation);
  assert.ok(near.some((value, index) => index && Math.sign(value - near[index - 1]) !== Math.sign(far[index] - far[index - 1])));
  assert.notDeepEqual(poseAt(7, 42).parts, poseAt(7, 43).parts);
});
