import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = path.join(root, 'assets');
const manifestPath = path.join(assetsRoot, 'manifest.json');

function resolveAsset(relativePath) {
  const resolved = path.resolve(assetsRoot, relativePath);
  if (!resolved.startsWith(`${assetsRoot}${path.sep}`)) throw new Error(`Путь выходит из assets/: ${relativePath}`);
  return resolved;
}

async function readPng(relativePath, requireTransparency) {
  const filePath = resolveAsset(relativePath);
  const data = await readFile(filePath);
  const png = PNG.sync.read(data);
  if (png.width < 2 || png.height < 2) throw new Error(`${relativePath}: некорректный размер ${png.width}×${png.height}`);
  if (requireTransparency) {
    let transparent = false;
    let visible = false;
    for (let index = 3; index < png.data.length; index += 4) {
      const alpha = png.data[index];
      if (alpha < 255) transparent = true;
      if (alpha > 0) visible = true;
      if (transparent && visible) break;
    }
    if (!transparent) throw new Error(`${relativePath}: нет прозрачных пикселей`);
    if (!visible) throw new Error(`${relativePath}: изображение полностью прозрачно`);
  }
  return { width: png.width, height: png.height };
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || !manifest.displayName) throw new Error('manifest.json: нужен schemaVersion 2 и displayName');
if (!manifest.assembledReference?.file) throw new Error('manifest.json: нет assembledReference.file');
if (!Array.isArray(manifest.parts) || manifest.parts.length < 8) throw new Error('manifest.json: ожидается не меньше 8 отдельных parts');

const requiredParts = [
  'head', 'torso', 'upper_arm_far', 'forearm_far',
  'upper_arm_near', 'forearm_near',
  'thigh_far', 'shin_far', 'thigh_near', 'shin_near',
  'satchel_body', 'satchel_strap', 'scarf', 'collar_cover',
];
const ids = new Set(manifest.parts.map((part) => part.id));
const missingParts = requiredParts.filter((id) => !ids.has(id));
if (missingParts.length) throw new Error(`manifest.json: не хватает частей ${missingParts.join(', ')}`);
const partsById = new Map(manifest.parts.map((part) => [part.id, part]));
const boneIds = new Set(['root', ...manifest.parts.map((part) => part.bone)]);
for (const part of manifest.parts) {
  if (!boneIds.has(part.parentBone)) throw new Error(`Часть ${part.id}: неизвестный parentBone ${part.parentBone}`);
}

for (const id of ['thigh_far', 'thigh_near', 'upper_arm_far', 'upper_arm_near']) {
  const childJoint = partsById.get(id)?.childJointPx;
  if (!childJoint || Object.keys(childJoint).length !== 1) throw new Error(`Часть ${id}: нет единственного childJointPx`);
}

const layer = (id) => partsById.get(id).layer;
if (!(layer('thigh_far') < layer('torso') && layer('thigh_near') < layer('torso'))) {
  throw new Error('Слои бёдер должны быть позади torso');
}
if (!(layer('upper_arm_near') < layer('torso'))) throw new Error('Ближнее плечо должно быть позади torso');
if (!(layer('head') < layer('collar_cover'))) throw new Error('Голова должна быть ниже collar_cover');
if (!(layer('satchel_body') < layer('torso') && layer('satchel_strap') > layer('torso'))) {
  throw new Error('Неверный порядок корпуса и ремня сумки относительно torso');
}

await stat(resolveAsset(manifest.assembledReference.file));
const sourceSize = await readPng(manifest.assembledReference.file, true);
const files = new Set();
for (const part of manifest.parts) {
  if (!part.id || !part.file || !part.bone || !part.parentBone || !Array.isArray(part.pivotPx) || !Number.isFinite(part.layer)) {
    throw new Error(`Неполное описание части ${part.id ?? '<без id>'}`);
  }
  if (part.pivotPx.length !== 2 || !part.pivotPx.every(Number.isFinite)) throw new Error(`Часть ${part.id}: неверный pivotPx`);
  if (!Array.isArray(part.sizePx) || part.sizePx.length !== 2 || !part.sizePx.every(Number.isFinite)) {
    throw new Error(`Часть ${part.id}: неверный sizePx`);
  }
  files.add(part.file);
}

const sizes = [];
for (const file of files) {
  const size = await readPng(file, true);
  const declarations = manifest.parts.filter((part) => part.file === file);
  for (const part of declarations) {
    if (part.sizePx[0] !== size.width || part.sizePx[1] !== size.height) {
      throw new Error(`${file}: фактический размер ${size.width}×${size.height}, manifest ${part.sizePx[0]}×${part.sizePx[1]}`);
    }
    if (part.pivotPx[0] < 0 || part.pivotPx[0] > size.width || part.pivotPx[1] < 0 || part.pivotPx[1] > size.height) {
      throw new Error(`${file}: pivotPx находится вне изображения`);
    }
  }
  sizes.push(`${file} ${size.width}×${size.height}`);
}
console.log(`OK: ${manifest.displayName}; источник ${sourceSize.width}×${sourceSize.height}; ${manifest.parts.length} частей в ${files.size} PNG`);
for (const size of sizes) console.log(`  ${size}`);
