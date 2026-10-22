import { describe, expect, it } from 'vitest';
import { AnimationController, createBasePose, interpolatePose } from './animation';
import type { BoneDefinition } from './types';

const bones: BoneDefinition[] = [
  { id: 'root', parent: null, role: 'root', x: 0, y: 0 },
  { id: 'body', parent: 'root', role: 'torso', x: 0, y: -50 },
  { id: 'head', parent: 'body', role: 'head', x: 0, y: -30 },
  { id: 'nearUpperArm', parent: 'body', role: 'armNearUpper', x: 0, y: -20 },
  { id: 'nearLowerArm', parent: 'nearUpperArm', role: 'armNearLower', x: 30, y: 0 },
  { id: 'farUpperArm', parent: 'body', role: 'armFarUpper', x: 0, y: -20 },
  { id: 'farLowerArm', parent: 'farUpperArm', role: 'armFarLower', x: 30, y: 0 },
  { id: 'nearUpperLeg', parent: 'root', role: 'legNearUpper', x: 0, y: -10 },
  { id: 'nearLowerLeg', parent: 'nearUpperLeg', role: 'legNearLower', x: 0, y: 40 },
  { id: 'nearFoot', parent: 'nearLowerLeg', role: 'legNearFoot', x: 0, y: 40 },
  { id: 'farUpperLeg', parent: 'root', role: 'legFarUpper', x: 0, y: -10 },
  { id: 'farLowerLeg', parent: 'farUpperLeg', role: 'legFarLower', x: 0, y: 40 },
  { id: 'farFoot', parent: 'farLowerLeg', role: 'legFarFoot', x: 0, y: 40 },
];

function step(controller: AnimationController, seconds: number): void {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) controller.update(1 / 60);
}

describe('общий механизм смешивания', () => {
  it('начинает переход с текущей позы без скачка', () => {
    const controller = new AnimationController(bones);
    step(controller, 0.37);
    const before = controller.getSnapshot().pose;
    controller.setMovementRequested(true);
    const after = controller.update(0).pose;
    expect(after).toEqual(before);
  });

  it('не превращает переход в почти мгновенный скачок', () => {
    const controller = new AnimationController(bones);
    controller.setMovementRequested(true);
    const early = controller.update(0.055);
    expect(early.state).toBe('idle');
    expect(early.targetState).toBe('move');
    expect(early.blend).toBeLessThan(0.15);
  });

  it('интерполирует все числовые компоненты позы', () => {
    const from = createBasePose(bones);
    const to = createBasePose(bones);
    to.root.y = 20;
    to.root.rotation = 1;
    const middle = interpolatePose(from, to, 0.5);
    expect(middle.root.y).toBeCloseTo(10);
    expect(middle.root.rotation).toBeCloseTo(0.5);
  });
});

describe('машина состояний прыжка', () => {
  it('проходит подготовку, полёт, посадку и возвращается к актуальному движению', () => {
    const controller = new AnimationController(bones);
    controller.setMovementRequested(true);
    step(controller, 0.25);
    expect(controller.getSnapshot().targetState).toBe('move');
    expect(controller.requestJump()).toBe(true);
    expect(controller.getSnapshot().targetState).toBe('jumpPrepare');
    step(controller, 0.36);
    expect(controller.getSnapshot().targetState).toBe('jumpAir');
    controller.setMovementRequested(false);
    step(controller, 0.76);
    expect(controller.getSnapshot().targetState).toBe('jumpLand');
    controller.setMovementRequested(true);
    step(controller, 0.36);
    expect(controller.getSnapshot().targetState).toBe('move');
  });

  it('не запускает второй прыжок в воздухе', () => {
    const controller = new AnimationController(bones);
    expect(controller.requestJump()).toBe(true);
    step(controller, 0.36);
    expect(controller.getSnapshot().targetState).toBe('jumpAir');
    expect(controller.requestJump()).toBe(false);
  });

  it('даёт отдельную подготовку, вершину и амортизацию с коленными ролями', () => {
    const controller = new AnimationController(bones);
    expect(controller.requestJump()).toBe(true);
    step(controller, 0.3);
    const preparation = controller.getSnapshot();
    expect(preparation.targetState).toBe('jumpPrepare');
    expect(preparation.pose.root.y).toBeGreaterThan(20);
    expect(preparation.pose.nearLowerLeg.rotation).toBeGreaterThan(0.4);

    step(controller, 0.4);
    const flight = controller.getSnapshot();
    expect(flight.targetState).toBe('jumpAir');
    expect(flight.pose.root.y).toBeLessThan(-70);
    expect(flight.pose.nearLowerLeg.rotation).toBeGreaterThan(0.7);

    step(controller, 0.5);
    const landing = controller.getSnapshot();
    expect(landing.targetState).toBe('jumpLand');
    expect(landing.pose.nearLowerLeg.rotation).toBeGreaterThan(0.1);

    step(controller, 0.4);
    expect(controller.getSnapshot().targetState).toBe('idle');
  });
});
