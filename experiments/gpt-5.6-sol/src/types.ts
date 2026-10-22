export type BoneRole =
  | 'root'
  | 'torso'
  | 'head'
  | 'armFarUpper'
  | 'armFarLower'
  | 'armNearUpper'
  | 'armNearLower'
  | 'legFarUpper'
  | 'legFarLower'
  | 'legFarFoot'
  | 'legNearUpper'
  | 'legNearLower'
  | 'legNearFoot'
  | 'scarf'
  | 'satchelBody'
  | 'satchelStrap';

export interface Vec2 {
  x: number;
  y: number;
}

export interface BoneDefinition extends Vec2 {
  id: string;
  parent: string | null;
  role?: BoneRole;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  length?: number;
}

export interface PartDefinition {
  id: string;
  file: string;
  bone: string;
  pivot: Vec2;
  offset?: Vec2;
  rotation?: number;
  scale?: number;
  layer: number;
}

export interface CharacterManifest {
  name: string;
  sourceImage: string;
  stage?: {
    characterScale?: number;
    groundOffset?: number;
  };
  bones: BoneDefinition[];
  parts: PartDefinition[];
}

export interface BoneTransform extends Vec2 {
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export type Pose = Record<string, BoneTransform>;

export type AnimationState = 'idle' | 'move' | 'jumpPrepare' | 'jumpAir' | 'jumpLand';

export interface AnimationSnapshot {
  state: AnimationState;
  targetState: AnimationState;
  phase: number;
  blend: number;
  pose: Pose;
  airborne: boolean;
  requestedMovement: boolean;
}
