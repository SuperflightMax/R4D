import type {
  AnimationSnapshot,
  AnimationState,
  BoneDefinition,
  BoneRole,
  BoneTransform,
  Pose,
} from './types';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

const TRANSITION_SECONDS: Record<AnimationState, number> = {
  idle: 0.38,
  move: 0.38,
  jumpPrepare: 0.22,
  jumpAir: 0.18,
  jumpLand: 0.2,
};

const JUMP_PREPARE_SECONDS = 0.34;
const JUMP_AIR_SECONDS = 0.74;
const JUMP_LAND_SECONDS = 0.34;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

interface LegAngles {
  upper: number;
  lower: number;
  foot: number;
}

function walkLegAngles(phase: number): LegAngles {
  const normalized = ((phase % 1) + 1) % 1;
  if (normalized < 0.58) {
    const stance = smoothstep(normalized / 0.58);
    const upper = lerp(-7, 6, stance) * DEG;
    const lower = -upper;
    return { upper, lower, foot: -(upper + lower) };
  }
  const swing = smoothstep((normalized - 0.58) / 0.42);
  const upper = lerp(6, -7, swing) * DEG;
  const lower = (10 + Math.sin(swing * Math.PI) * 36) * DEG;
  return { upper, lower, foot: -(upper + lower) - Math.sin(swing * Math.PI) * 7 * DEG };
}

function cloneTransform(transform: BoneTransform): BoneTransform {
  return { ...transform };
}

export function clonePose(pose: Pose): Pose {
  return Object.fromEntries(
    Object.entries(pose).map(([id, transform]) => [id, cloneTransform(transform)]),
  );
}

export function createBasePose(bones: BoneDefinition[]): Pose {
  return Object.fromEntries(
    bones.map((bone) => [
      bone.id,
      {
        x: bone.x,
        y: bone.y,
        rotation: bone.rotation ?? 0,
        scaleX: bone.scaleX ?? 1,
        scaleY: bone.scaleY ?? 1,
      },
    ]),
  );
}

export function interpolatePose(from: Pose, to: Pose, amount: number): Pose {
  const t = smoothstep(amount);
  return Object.fromEntries(
    Object.keys(to).map((id) => {
      const a = from[id] ?? to[id];
      const b = to[id];
      return [
        id,
        {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          rotation: a.rotation + (b.rotation - a.rotation) * t,
          scaleX: a.scaleX + (b.scaleX - a.scaleX) * t,
          scaleY: a.scaleY + (b.scaleY - a.scaleY) * t,
        },
      ];
    }),
  );
}

export class AnimationController {
  private readonly basePose: Pose;
  private readonly roleToBone = new Map<BoneRole, string>();
  private state: AnimationState = 'idle';
  private transitionFrom: AnimationState = 'idle';
  private stateTime = 0;
  private blendTime = TRANSITION_SECONDS.idle;
  private blendDuration = TRANSITION_SECONDS.idle;
  private blendSource: Pose;
  private currentPose: Pose;
  private movementRequested = false;
  private locomotionTime = 0;

  constructor(bones: BoneDefinition[]) {
    this.basePose = createBasePose(bones);
    for (const bone of bones) {
      if (bone.role) this.roleToBone.set(bone.role, bone.id);
    }
    this.currentPose = this.sampleTargetPose();
    this.blendSource = clonePose(this.currentPose);
  }

  setMovementRequested(requested: boolean): void {
    this.movementRequested = requested;
    if (this.isGrounded() && this.state !== 'jumpLand') {
      this.transitionTo(requested ? 'move' : 'idle');
    }
  }

  requestJump(): boolean {
    if (!this.isGrounded() || this.state === 'jumpLand') return false;
    this.transitionTo('jumpPrepare');
    return true;
  }

  reset(): void {
    this.state = 'idle';
    this.transitionFrom = 'idle';
    this.stateTime = 0;
    this.movementRequested = false;
    this.locomotionTime = 0;
    this.currentPose = this.sampleTargetPose();
    this.blendSource = clonePose(this.currentPose);
    this.blendTime = this.blendDuration;
  }

  update(deltaSeconds: number): AnimationSnapshot {
    const delta = Math.max(0, Math.min(deltaSeconds, 0.1));
    this.stateTime += delta;
    this.blendTime += delta;
    if (this.state === 'move') this.locomotionTime += delta;

    if (this.state === 'jumpPrepare' && this.stateTime >= JUMP_PREPARE_SECONDS) {
      this.transitionTo('jumpAir');
    } else if (this.state === 'jumpAir' && this.stateTime >= JUMP_AIR_SECONDS) {
      this.transitionTo('jumpLand');
    } else if (this.state === 'jumpLand' && this.stateTime >= JUMP_LAND_SECONDS) {
      this.transitionTo(this.movementRequested ? 'move' : 'idle');
    }

    const targetPose = this.sampleTargetPose();
    const blend = clamp01(this.blendTime / this.blendDuration);
    this.currentPose = interpolatePose(this.blendSource, targetPose, blend);

    return this.snapshot(blend);
  }

  getSnapshot(): AnimationSnapshot {
    return this.snapshot(clamp01(this.blendTime / this.blendDuration));
  }

  private isGrounded(): boolean {
    return this.state === 'idle' || this.state === 'move';
  }

  private transitionTo(next: AnimationState): void {
    if (next === this.state) return;
    this.blendSource = clonePose(this.currentPose);
    this.transitionFrom = this.state;
    this.state = next;
    this.stateTime = 0;
    this.blendTime = 0;
    this.blendDuration = TRANSITION_SECONDS[next];
  }

  private snapshot(blend: number): AnimationSnapshot {
    return {
      state: blend < 1 ? this.transitionFrom : this.state,
      targetState: this.state,
      phase: this.phaseForState(),
      blend,
      pose: clonePose(this.currentPose),
      airborne: this.state === 'jumpAir',
      requestedMovement: this.movementRequested,
    };
  }

  private phaseForState(): number {
    if (this.state === 'move') return (this.locomotionTime * 1.55) % 1;
    if (this.state === 'idle') return (this.stateTime * 0.32) % 1;
    if (this.state === 'jumpPrepare') return clamp01(this.stateTime / JUMP_PREPARE_SECONDS);
    if (this.state === 'jumpAir') return clamp01(this.stateTime / JUMP_AIR_SECONDS);
    return clamp01(this.stateTime / JUMP_LAND_SECONDS);
  }

  private sampleTargetPose(): Pose {
    const pose = clonePose(this.basePose);
    const phase = this.phaseForState();

    if (this.state === 'idle') {
      const breath = Math.sin(phase * TAU);
      this.add(pose, 'root', 0, breath * 1.5, breath * 0.5 * DEG);
      this.add(pose, 'torso', 0, 0, breath * 1.2 * DEG);
      this.add(pose, 'head', 0, breath * -0.4, breath * -1.4 * DEG);
      this.add(pose, 'armNearUpper', 0, 0, (6 + breath * 1.5) * DEG);
      this.add(pose, 'armNearLower', 0, 0, -9 * DEG);
      this.add(pose, 'armFarUpper', 0, 0, (-7 + breath * -1.2) * DEG);
      this.add(pose, 'armFarLower', 0, 0, -18 * DEG);
      this.add(pose, 'legNearUpper', 0, 0, -2.5 * DEG);
      this.add(pose, 'legFarUpper', 0, 0, 3 * DEG);
      this.add(pose, 'scarf', 0, 0, breath * -1.5 * DEG);
      this.add(pose, 'satchelBody', 0, 0, breath * 0.8 * DEG);
    } else if (this.state === 'move') {
      const near = walkLegAngles(phase);
      const far = walkLegAngles(phase + 0.5);
      const stride = Math.sin(phase * TAU);
      const doubleStep = Math.cos(phase * TAU * 2);
      this.add(pose, 'root', 0, -2.5 + doubleStep * 2.5, -4 * DEG);
      this.add(pose, 'torso', 0, 0, stride * 2.2 * DEG);
      this.add(pose, 'head', 0, doubleStep * 0.8, stride * -1.6 * DEG);
      this.add(pose, 'legNearUpper', 0, 0, near.upper);
      this.add(pose, 'legFarUpper', 0, 0, far.upper);
      this.add(pose, 'legNearLower', 0, 0, near.lower);
      this.add(pose, 'legFarLower', 0, 0, far.lower);
      this.add(pose, 'legNearFoot', 0, 0, near.foot);
      this.add(pose, 'legFarFoot', 0, 0, far.foot);
      this.add(pose, 'armNearUpper', 0, 0, (-stride * 19 + 4) * DEG);
      this.add(pose, 'armFarUpper', 0, 0, (stride * 19 - 8) * DEG);
      this.add(pose, 'armNearLower', 0, 0, (-18 - Math.max(0, stride) * 12) * DEG);
      this.add(pose, 'armFarLower', 0, 0, (-24 - Math.max(0, -stride) * 10) * DEG);
      this.add(pose, 'scarf', 0, 0, (-5 + stride * -2) * DEG);
      this.add(pose, 'satchelBody', 0, 0, stride * -3.5 * DEG);
    } else if (this.state === 'jumpPrepare') {
      const ease = smoothstep(phase);
      this.add(pose, 'root', 0, 48 * ease, -7 * DEG * ease);
      this.add(pose, 'torso', 0, 0, 13 * DEG * ease);
      this.add(pose, 'head', 0, 0, -8 * DEG * ease);
      this.add(pose, 'legNearUpper', 0, 0, -32 * DEG * ease);
      this.add(pose, 'legFarUpper', 0, 0, -25 * DEG * ease);
      this.add(pose, 'legNearLower', 0, 0, 32 * DEG * ease);
      this.add(pose, 'legFarLower', 0, 0, 25 * DEG * ease);
      this.add(pose, 'armNearUpper', 0, 0, 28 * DEG * ease);
      this.add(pose, 'armFarUpper', 0, 0, 20 * DEG * ease);
      this.add(pose, 'armNearLower', 0, 0, -18 * DEG * ease);
      this.add(pose, 'armFarLower', 0, 0, -14 * DEG * ease);
      this.add(pose, 'scarf', 0, 0, -4 * DEG * ease);
      this.add(pose, 'satchelBody', 0, 0, 4 * DEG * ease);
    } else if (this.state === 'jumpAir') {
      const height = 4 * phase * (1 - phase);
      const tuck = Math.sin(phase * Math.PI);
      this.add(pose, 'root', 0, 38 * (1 - phase) - 170 * height, -4 * DEG + 8 * DEG * phase);
      this.add(pose, 'torso', 0, 0, -5 * DEG + 10 * DEG * phase);
      this.add(pose, 'head', 0, 0, 3 * DEG - 6 * DEG * phase);
      this.add(pose, 'legNearUpper', 0, 0, (-18 - tuck * 25) * DEG);
      this.add(pose, 'legFarUpper', 0, 0, (-8 - tuck * 19) * DEG);
      this.add(pose, 'legNearLower', 0, 0, (38 + tuck * 42) * DEG);
      this.add(pose, 'legFarLower', 0, 0, (28 + tuck * 35) * DEG);
      this.add(pose, 'legNearFoot', 0, 0, (-20 - tuck * 17) * DEG);
      this.add(pose, 'legFarFoot', 0, 0, (-20 - tuck * 10) * DEG);
      this.add(pose, 'armNearUpper', 0, 0, (-50 + phase * 14) * DEG);
      this.add(pose, 'armFarUpper', 0, 0, (-38 + phase * 10) * DEG);
      this.add(pose, 'armNearLower', 0, 0, 18 * DEG);
      this.add(pose, 'armFarLower', 0, 0, 14 * DEG);
      this.add(pose, 'scarf', 0, 0, (-10 - height * 8) * DEG);
      this.add(pose, 'satchelBody', 0, 0, (8 - phase * 12) * DEG);
    } else {
      const impact = Math.sin(phase * Math.PI);
      this.add(pose, 'root', 0, 43 * impact, 7 * DEG * impact);
      this.add(pose, 'torso', 0, 0, 12 * DEG * impact);
      this.add(pose, 'head', 0, 0, -8 * DEG * impact);
      this.add(pose, 'legNearUpper', 0, 0, -28 * DEG * impact);
      this.add(pose, 'legFarUpper', 0, 0, -21 * DEG * impact);
      this.add(pose, 'legNearLower', 0, 0, 28 * DEG * impact);
      this.add(pose, 'legFarLower', 0, 0, 21 * DEG * impact);
      this.add(pose, 'armNearUpper', 0, 0, 17 * DEG * impact);
      this.add(pose, 'armFarUpper', 0, 0, 9 * DEG * impact);
      this.add(pose, 'scarf', 0, 0, -7 * DEG * impact);
      this.add(pose, 'satchelBody', 0, 0, 8 * DEG * impact);
    }

    return pose;
  }

  private add(pose: Pose, role: BoneRole, x: number, y: number, rotation: number): void {
    const id = this.roleToBone.get(role);
    if (!id || !pose[id]) return;
    pose[id].x += x;
    pose[id].y += y;
    pose[id].rotation += rotation;
  }
}
