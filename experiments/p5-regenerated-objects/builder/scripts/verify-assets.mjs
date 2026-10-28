import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const example = process.argv.includes('--example');
const path = resolve(process.argv.find((v, i) => i > 1 && !v.startsWith('--')) ?? resolve(root, example ? 'contracts/asset-manifest.example.json' : 'public/assets/manifest.json'));
const manifest = JSON.parse(readFileSync(path));
const targets = JSON.parse(readFileSync(resolve(root, 'public/data/targets.json')));
const assert = (value, message) => { if (!value) throw new Error(message); };
assert(manifest.schema === 'r4d.p5.assets/1', 'Wrong schema');
assert(manifest.p1Commit === targets.p1Commit && manifest.sourceSha256 === targets.source.sha256, 'Input pins differ');
assert(example || ['partial', 'candidate'].includes(manifest.status), 'Example is not a renderable candidate');
assert(manifest.lighting?.description && manifest.lighting.shadowDirectionSourcePx?.length === 2, 'Lighting is required');
const textures = new Map();
const measurements = [];
for (const texture of manifest.textures) {
  assert(texture.id && !textures.has(texture.id), `Duplicate texture: ${texture.id}`);
  textures.set(texture.id, texture);
  assert(texture.family && texture.file && /^[a-f0-9]{64}$/.test(texture.sha256), `Texture metadata: ${texture.id}`);
  assert(Number.isInteger(texture.bytes) && texture.bytes > 0, `Texture bytes: ${texture.id}`);
  assert(texture.sizePx?.length === 2 && texture.sizePx.every(n => Number.isInteger(n) && n > 0), `Dimensions: ${texture.id}`);
  assert(texture.groundAnchorPx?.length === 2 && texture.groundAnchorPx.every(Number.isFinite), `Anchor: ${texture.id}`);
  assert(texture.footprintPx?.width > 0 && texture.footprintPx.depth > 0 && texture.footprintPx.center?.length === 2, `Footprint: ${texture.id}`);
  assert(JSON.stringify(texture.footprintPx.center) === JSON.stringify(texture.groundAnchorPx), `Footprint center differs from ground anchor: ${texture.id}`);
  assert(texture.groundAnchorPx.every((n, i) => n >= 0 && n <= texture.sizePx[i]), `Anchor outside canvas: ${texture.id}`);
  assert(texture.alpha && ['straight-rgba', 'opaque'].includes(texture.alpha.policy), `Alpha policy: ${texture.id}`);
  for (const key of ['bounds', 'visibleBounds']) {
    const b = texture.alpha[key];
    assert(b?.length === 4 && b.every(n => Number.isInteger(n) && n >= 0) && b[0] + b[2] <= texture.sizePx[0] && b[1] + b[3] <= texture.sizePx[1], `Alpha bbox: ${texture.id}/${key}`);
  }
  const p = texture.provenance;
  assert(p?.method === 'generated' && p.promptPath && p.toolOutputId && /^[a-f0-9]{64}$/.test(p.rawSha256) && Array.isArray(p.corrections), `Provenance: ${texture.id}`);
  if (!example) {
    const assetPath = resolve(dirname(path), texture.file);
    const bytes = readFileSync(assetPath);
    assert(bytes.length === texture.bytes && createHash('sha256').update(bytes).digest('hex') === texture.sha256, `File pin: ${texture.id}`);
    const measured = JSON.parse(execFileSync('python', [resolve(root, 'scripts/image-metrics.py'), assetPath], { encoding: 'utf8' }));
    assert(measured.format === 'PNG', `Expected PNG: ${texture.id}`);
    for (const [actual, expected] of [[measured.sizePx, texture.sizePx], [measured.alphaBounds, texture.alpha.bounds], [measured.visibleBounds, texture.alpha.visibleBounds]]) {
      assert(JSON.stringify(actual) === JSON.stringify(expected), `Measured pixel bounds differ: ${texture.id}`);
    }
    assert(texture.alpha.policy !== 'opaque' || measured.alphaExtrema[0] === 255, `Opaque policy: ${texture.id}`);
    measurements.push({ id: texture.id, sha256: texture.sha256, bytes: bytes.length, ...measured });
  }
}
const ids = new Set();
const footprintFits = [];
const clippedForegroundParts = [];
const instancesById = new Map(manifest.instances.map(instance => [instance.id, instance]));
const roles = ['floor', 'shadow', 'body', 'receiver-back', 'receiver-front', 'ball', 'foreground'];
for (const instance of manifest.instances) {
  assert(instance.id && !ids.has(instance.id), `Duplicate instance: ${instance.id}`);
  ids.add(instance.id);
  assert(textures.has(instance.textureId), `Missing texture: ${instance.id}`);
  assert(['$source', '$ball', ...targets.objects.map(o => o.id)].includes(instance.targetId), `Unknown target: ${instance.id}`);
  assert(instance.parentId && roles.includes(instance.role) && Number.isFinite(instance.depthOffsetRadii) && Math.abs(instance.depthOffsetRadii) <= 1 && instance.depthReason, `Part metadata: ${instance.id}`);
  assert(instance.targetId !== '$source' || ['floor', 'foreground'].includes(instance.role), `Source-bound layer: ${instance.id}`);
  const texture = textures.get(instance.textureId);
  if (instance.sourceClipPx) {
    const clip = instance.sourceClipPx;
    const parent = instancesById.get(instance.parentId);
    const provenance = clip.provenance;
    assert(instance.role === 'foreground' && instance.targetId === '$source' && instance.depthOffsetRadii === 0 && clip.coordinateSpace === 'source1536', `Source clip must be an explicit source-bound foreground: ${instance.id}`);
    assert(parent?.role === 'floor' && parent.textureId === instance.textureId, `Clipped foreground must name its existing generated floor instance as parent: ${instance.id}`);
    assert(texture.provenance?.method === 'generated' && provenance?.method === 'scene-region-from-generated-floor' && provenance.sourceTextureId === instance.textureId && provenance.sourceSha256 === texture.sha256 && typeof provenance.note === 'string' && provenance.note.trim(), `Clip source/provenance mismatch: ${instance.id}`);
    assert(Array.isArray(clip.limitations) && clip.limitations.every(v => typeof v === 'string'), `Clip limitations must be declared: ${instance.id}`);
    const polygon = clip.polygon;
    assert(Array.isArray(polygon) && polygon.length >= 3 && polygon.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isFinite(v) && v >= 0 && v <= 1536)), `Clip polygon must contain source1536 points: ${instance.id}`);
    const area = Math.abs(polygon.reduce((sum, p, i) => { const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    assert(area > 0 && area < 1536 * 1536, `Clip must be a non-empty declared part, not the whole frame: ${instance.id}`);
    clippedForegroundParts.push({ instanceId: instance.id, parentId: instance.parentId, sourceTextureId: instance.textureId, sourceSha256: texture.sha256, polygon, sourceAreaPx2: area, limitations: clip.limitations });
  }
  if (instance.targetId === '$source') {
    assert(texture.sizePx[0] === texture.sizePx[1] && texture.groundAnchorPx.every(n => n === 0) && texture.footprintPx.width === texture.sizePx[0] && texture.footprintPx.depth === texture.sizePx[1], `Full source-frame texture contract: ${instance.id}`);
  } else {
    const target = instance.targetId === '$ball' ? targets.ball.referenceAtDrop : targets.objects.find(o => o.id === instance.targetId);
    const scale = target.sourcePx.footprintWidth / texture.footprintPx.width;
    const renderedDepth = texture.footprintPx.depth * scale;
    footprintFits.push({ instanceId: instance.id, targetId: instance.targetId, uniformScale: scale, targetWidth: target.sourcePx.footprintWidth,
      targetDepth: target.sourcePx.footprintDepth, authoredDepthAfterUniformScale: renderedDepth,
      depthDeltaSourcePx: renderedDepth - target.sourcePx.footprintDepth,
      depthRatio: renderedDepth / target.sourcePx.footprintDepth, note: instance.targetId === '$ball' ? 'Reference at drop only; dynamic projected width, sphere silhouette is not its footprint' : 'No axis warp or target change applied' });
  }
}
console.log(JSON.stringify({ status: example ? 'example-shape-checked-no-assets' : 'verified', textures: textures.size, instances: ids.size, measurements, footprintFits, clippedForegroundParts }));
