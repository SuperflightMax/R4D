import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type {
  BoneDefinition,
  BoneTransform,
  CharacterManifest,
  PartDefinition,
  Pose,
} from './types';

interface WorldTransform extends BoneTransform {}

interface RigPart {
  definition: PartDefinition;
  sprite: Sprite;
}

interface AssetPartDefinition {
  id: string;
  file: string;
  bone: string;
  parentBone: string;
  pivotPx: [number, number];
  layer: number;
}

interface AssetManifest {
  schemaVersion: number;
  displayName: string;
  assembledReference: { file: string };
  parts: AssetPartDefinition[];
}

const SKY_COURIER_BONES: BoneDefinition[] = [
  { id: 'root', parent: null, role: 'root', x: 0, y: -655 },
  { id: 'thighFar', parent: 'root', role: 'legFarUpper', x: 52, y: 1, length: 287 },
  { id: 'shinFar', parent: 'thighFar', role: 'legFarLower', x: 39, y: 240, length: 426 },
  { id: 'thighNear', parent: 'root', role: 'legNearUpper', x: -56, y: 1, length: 287 },
  { id: 'shinNear', parent: 'thighNear', role: 'legNearLower', x: 39, y: 240, length: 426 },
  { id: 'torso', parent: 'root', role: 'torso', x: 0, y: 0, length: 450 },
  { id: 'upperArmFar', parent: 'torso', role: 'armFarUpper', x: -74, y: -337, length: 238 },
  { id: 'forearmFar', parent: 'upperArmFar', role: 'armFarLower', x: -6, y: 238, length: 300 },
  { id: 'upperArmNear', parent: 'torso', role: 'armNearUpper', x: -67, y: -344, length: 236 },
  { id: 'forearmNear', parent: 'upperArmNear', role: 'armNearLower', x: -11, y: 236, length: 300 },
  { id: 'head', parent: 'torso', role: 'head', x: 43, y: -441, length: 110 },
  { id: 'scarf', parent: 'torso', role: 'scarf', x: 43, y: -441 },
  { id: 'satchelBody', parent: 'torso', role: 'satchelBody', x: -112, y: -190 },
  { id: 'satchelStrap', parent: 'torso', role: 'satchelStrap', x: -48, y: -355 },
  { id: 'collarCover', parent: 'torso', x: 0, y: 0 },
];

const PART_LAYER_OVERRIDES: Readonly<Record<string, number>> = {
  shin_far: -41,
  shin_near: -11,
};

function normalizeAssetManifest(raw: AssetManifest): CharacterManifest {
  if (raw.schemaVersion !== 2 || !raw.displayName || !raw.assembledReference?.file) {
    throw new Error('Неподдерживаемый формат assets/manifest.json');
  }
  return {
    name: raw.displayName,
    sourceImage: raw.assembledReference.file,
    stage: { characterScale: 0.42 },
    bones: SKY_COURIER_BONES,
    parts: raw.parts.map((part) => ({
      id: part.id,
      file: part.file,
      bone: part.bone,
      pivot: { x: part.pivotPx[0], y: part.pivotPx[1] },
      layer: PART_LAYER_OVERRIDES[part.id] ?? part.layer,
    })),
  };
}

function ensureFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} должно быть конечным числом`);
}

export function validateManifest(manifest: CharacterManifest): void {
  if (!manifest.name || !manifest.sourceImage) throw new Error('В manifest нужны name и sourceImage');
  if (!Array.isArray(manifest.bones) || !manifest.bones.length) throw new Error('В manifest нет bones');
  if (!Array.isArray(manifest.parts) || !manifest.parts.length) throw new Error('В manifest нет parts');

  const boneIds = new Set<string>();
  const roles = new Set<string>();
  for (const bone of manifest.bones) {
    if (!bone.id || boneIds.has(bone.id)) throw new Error(`Повторяющаяся или пустая кость: ${bone.id}`);
    boneIds.add(bone.id);
    if (bone.role) {
      if (roles.has(bone.role)) throw new Error(`Повторяющаяся роль кости: ${bone.role}`);
      roles.add(bone.role);
    }
    ensureFinite(bone.x, `bones.${bone.id}.x`);
    ensureFinite(bone.y, `bones.${bone.id}.y`);
  }
  const roots = manifest.bones.filter((bone) => bone.parent === null);
  if (roots.length !== 1) throw new Error(`Ожидалась одна корневая кость, получено ${roots.length}`);
  for (const bone of manifest.bones) {
    if (bone.parent !== null && !boneIds.has(bone.parent)) {
      throw new Error(`У кости ${bone.id} нет родителя ${bone.parent}`);
    }
  }
  const checked = new Set<string>();
  const checkParentChain = (id: string, chain = new Set<string>()): void => {
    if (checked.has(id)) return;
    if (chain.has(id)) throw new Error(`Цикл в иерархии костей у ${id}`);
    chain.add(id);
    const parent = manifest.bones.find((bone) => bone.id === id)?.parent;
    if (parent !== null && parent !== undefined) checkParentChain(parent, chain);
    chain.delete(id);
    checked.add(id);
  };
  for (const bone of manifest.bones) checkParentChain(bone.id);

  const requiredRoles = [
    'root', 'torso', 'head',
    'armFarUpper', 'armFarLower', 'armNearUpper', 'armNearLower',
    'legFarUpper', 'legFarLower', 'legNearUpper', 'legNearLower',
  ];
  const missingRoles = requiredRoles.filter((role) => !roles.has(role));
  if (missingRoles.length) throw new Error(`Не хватает ролей костей: ${missingRoles.join(', ')}`);

  const partIds = new Set<string>();
  for (const part of manifest.parts) {
    if (!part.id || partIds.has(part.id)) throw new Error(`Повторяющаяся или пустая часть: ${part.id}`);
    partIds.add(part.id);
    if (!boneIds.has(part.bone)) throw new Error(`Часть ${part.id} ссылается на неизвестную кость ${part.bone}`);
    if (!part.file.toLowerCase().endsWith('.png')) throw new Error(`Часть ${part.id} должна быть PNG`);
    ensureFinite(part.pivot.x, `parts.${part.id}.pivot.x`);
    ensureFinite(part.pivot.y, `parts.${part.id}.pivot.y`);
    ensureFinite(part.layer, `parts.${part.id}.layer`);
  }
}

export async function loadManifest(): Promise<CharacterManifest> {
  const response = await fetch('/assets/manifest.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Не удалось загрузить assets/manifest.json (${response.status})`);
  const raw = (await response.json()) as AssetManifest;
  const manifest = normalizeAssetManifest(raw);
  validateManifest(manifest);
  return manifest;
}

export class CharacterRig {
  readonly container = new Container();
  private readonly partLayer = new Container();
  private readonly overlay = new Graphics();
  private readonly bonesById = new Map<string, BoneDefinition>();
  private readonly parts: RigPart[] = [];
  private world = new Map<string, WorldTransform>();

  private constructor(private readonly manifest: CharacterManifest) {
    this.container.addChild(this.partLayer, this.overlay);
    this.partLayer.sortableChildren = true;
    for (const bone of manifest.bones) this.bonesById.set(bone.id, bone);
  }

  static async create(manifest: CharacterManifest): Promise<CharacterRig> {
    const rig = new CharacterRig(manifest);
    const textures = new Map<string, Texture>();
    await Promise.all(
      [...new Set(manifest.parts.map((part) => part.file))].map(async (file) => {
        textures.set(file, await Assets.load<Texture>(`/assets/${file}`));
      }),
    );

    for (const definition of manifest.parts) {
      const texture = textures.get(definition.file);
      if (!texture) throw new Error(`Текстура не загружена: ${definition.file}`);
      const sprite = new Sprite(texture);
      sprite.label = definition.id;
      sprite.anchor.set(
        definition.pivot.x / texture.width,
        definition.pivot.y / texture.height,
      );
      sprite.zIndex = definition.layer;
      rig.partLayer.addChild(sprite);
      rig.parts.push({ definition, sprite });
    }
    return rig;
  }

  applyPose(pose: Pose, showBones: boolean): void {
    this.world = this.calculateWorld(pose);
    for (const { definition, sprite } of this.parts) {
      const bone = this.world.get(definition.bone);
      if (!bone) continue;
      const offset = definition.offset ?? { x: 0, y: 0 };
      const cos = Math.cos(bone.rotation);
      const sin = Math.sin(bone.rotation);
      sprite.position.set(
        bone.x + offset.x * cos * bone.scaleX - offset.y * sin * bone.scaleY,
        bone.y + offset.x * sin * bone.scaleX + offset.y * cos * bone.scaleY,
      );
      sprite.rotation = bone.rotation + (definition.rotation ?? 0);
      const partScale = definition.scale ?? 1;
      sprite.scale.set(bone.scaleX * partScale, bone.scaleY * partScale);
    }
    this.drawBones(showBones);
  }

  private calculateWorld(pose: Pose): Map<string, WorldTransform> {
    const result = new Map<string, WorldTransform>();
    const visiting = new Set<string>();
    const resolve = (id: string): WorldTransform => {
      const existing = result.get(id);
      if (existing) return existing;
      if (visiting.has(id)) throw new Error(`Цикл в иерархии костей у ${id}`);
      visiting.add(id);
      const definition = this.bonesById.get(id);
      const local = pose[id];
      if (!definition || !local) throw new Error(`Нет позы для кости ${id}`);
      let world: WorldTransform;
      if (definition.parent === null) {
        world = { ...local };
      } else {
        const parent = resolve(definition.parent);
        const cos = Math.cos(parent.rotation);
        const sin = Math.sin(parent.rotation);
        world = {
          x: parent.x + local.x * cos * parent.scaleX - local.y * sin * parent.scaleY,
          y: parent.y + local.x * sin * parent.scaleX + local.y * cos * parent.scaleY,
          rotation: parent.rotation + local.rotation,
          scaleX: parent.scaleX * local.scaleX,
          scaleY: parent.scaleY * local.scaleY,
        };
      }
      visiting.delete(id);
      result.set(id, world);
      return world;
    };
    for (const bone of this.manifest.bones) resolve(bone.id);
    return result;
  }

  private drawBones(visible: boolean): void {
    this.overlay.clear();
    if (!visible) return;
    for (const definition of this.manifest.bones) {
      if (!definition.role || ['scarf', 'satchelBody', 'satchelStrap'].includes(definition.role)) continue;
      const bone = this.world.get(definition.id);
      if (!bone) continue;
      if (definition.parent !== null) {
        const parent = this.world.get(definition.parent);
        if (parent) {
          this.overlay.moveTo(parent.x, parent.y).lineTo(bone.x, bone.y).stroke({ width: 2, color: 0x66e4ff, alpha: 0.9 });
        }
      }
      if (definition.length) {
        const axisLength = Math.min(definition.length, 28);
        this.overlay
          .moveTo(bone.x, bone.y)
          .lineTo(
            bone.x + Math.cos(bone.rotation + Math.PI / 2) * axisLength,
            bone.y + Math.sin(bone.rotation + Math.PI / 2) * axisLength,
          )
          .stroke({ width: 1, color: 0xffd166, alpha: 0.65 });
      }
      this.overlay.circle(bone.x, bone.y, 3).fill({ color: 0xff4d8d, alpha: 0.95 });
    }
  }
}
