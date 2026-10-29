import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { project, bounds } from '../src/p1-projection.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const board = basename(dirname(root));
const config = JSON.parse(readFileSync(resolve(root, 'public/data/config.json')));
const manifest = JSON.parse(readFileSync(resolve(root, 'public/data/p1-manifest.json')));
const verification = JSON.parse(readFileSync(resolve(root, 'public/data/input-verification.json')));
const matrix = manifest.projection.nativeToSource;
const sha = b => createHash('sha256').update(b).digest('hex');
const circle = object => Array.from({ length: 128 }, (_, i) => project(matrix,
  [object.x + Math.cos(i * Math.PI / 64) * object.r, object.y + Math.sin(i * Math.PI / 64) * object.r]));
const source = (nativeAnchor, polygon, loops = [polygon]) => {
  const b = bounds(polygon);
  return { anchor: project(matrix, nativeAnchor), footprintBounds: b, footprintWidth: b.maxX - b.minX,
    footprintDepth: b.maxY - b.minY, groundPolygon: polygon, groundLoops: loops };
};
const describeCircle = (kind, o) => ({ id: o.id, kind, family: o.id.replace(/-\d+$/, ''),
  coverageGroupId: o.id, native: { anchor: [o.x, o.y], radius: o.r, depthRadius: o.r, geometryRefs: [o.id] },
  sourcePx: source([o.x, o.y], circle(o)) });
const objects = config.board.pins.map(o => describeCircle('pin', o));
for (const mapping of manifest.idMapping.filter(row => row.nativeKind === 'segments')) {
  const edges = mapping.nativeIds.map(id => config.board.segments.find(s => s.id === id));
  if (edges.some(s => !s)) throw new Error('Missing accepted native segment');
  const vertices = edges.map(s => [s.x1, s.y1]);
  for (let i = 0; i < edges.length; i++) {
    const next = edges[(i + 1) % edges.length];
    if (edges[i].x2 !== next.x1 || edges[i].y2 !== next.y1) throw new Error('Segment loop is not closed: ' + mapping.researchId);
  }
  const area2 = vertices.reduce((sum, a, i) => { const b = vertices[(i + 1) % vertices.length]; return sum + a[0] * b[1] - b[0] * a[1]; }, 0);
  const anchor = [0, 1].map(axis => vertices.reduce((sum, a, i) => { const b = vertices[(i + 1) % vertices.length]; return sum + (a[axis] + b[axis]) * (a[0] * b[1] - b[0] * a[1]); }, 0) / (3 * area2));
  const nativeBounds = bounds(vertices), polygon = vertices.map(v => project(matrix, v));
  objects.push({ id: mapping.researchId, kind: 'segment-loop', family: mapping.researchId.replace(/-\d+.*$/, ''),
    coverageGroupId: mapping.objectId ?? mapping.researchId,
    native: { anchor, depthRadius: (nativeBounds.maxY - nativeBounds.minY) / 2, geometryRefs: mapping.nativeIds,
      groundVertices: vertices, anchorRule: 'Area centroid of unchanged accepted native segment loop; binding only, no collider added' },
    sourcePx: source(anchor, polygon) });
}
// An arch assembly is an art registration target over two existing feet. Its
// disconnected loops stay disconnected; the aggregate bbox is never a collider.
for (const id of [...new Set(objects.filter(o => o.coverageGroupId !== o.id).map(o => o.coverageGroupId))]) {
  const members = objects.filter(o => o.coverageGroupId === id);
  const vertices = members.flatMap(o => o.native.groundVertices), nativeBounds = bounds(vertices);
  const anchor = [(nativeBounds.minX + nativeBounds.maxX) / 2, (nativeBounds.minY + nativeBounds.maxY) / 2];
  const loops = members.map(o => o.sourcePx.groundPolygon), polygon = loops.flat();
  objects.push({ id, kind: 'art-assembly-no-collider', family: id.replace(/-\d+$/, ''), coverageGroupId: id,
    members: members.map(o => o.id),
    native: { anchor, depthRadius: (nativeBounds.maxY - nativeBounds.minY) / 2,
      geometryRefs: members.flatMap(o => o.native.geometryRefs),
      anchorRule: 'Center of aggregate accepted foot bounds for art assembly registration; no lintel/height collider' },
    sourcePx: source(anchor, polygon, loops) });
}
objects.push(...config.board.buckets.map(o => describeCircle('bucket', o)));
const drop = config.board.drops[0];
const targets = { schema: 'r4d.p5.targets/2', board, boardId: verification.boardId, activeTrial: verification.activeTrial,
  p1Commit: verification.p1Commit,
  configSha256: sha(readFileSync(resolve(root, 'public/data/config.json'))),
  manifestSha256: sha(readFileSync(resolve(root, 'public/data/p1-manifest.json'))), source: verification.source,
  units: { native: 'Actual Millionko coordinates with per-board accepted P1 translation already applied', source: '1536x1536 source pixels', texture: 'Untrimmed texture-local pixels', viewport: 'CSS pixels; DPR changes backing resolution only' },
  translation: manifest.translation, projection: manifest.projection, objects,
  coverage: { obstacleIds: [...new Set(objects.filter(o => o.kind !== 'bucket').map(o => o.coverageGroupId))],
    physicalObjectTargets: objects.filter(o => ['pin', 'segment-loop'].includes(o.kind)).length,
    receiverIds: config.board.buckets.map(o => o.id),
    note: 'A coverage group may contain several required parts. Any-part counts do not prove complete assembly or occlusion.' },
  ball: { nativeRadius: config.board.ball.r, binding: 'live native state.ball.pos',
    referenceAtDrop: describeCircle('ball', { ...drop, r: config.board.ball.r }),
    scaleRule: 'Uniform XY: current projected r16 horizontal diameter / authored footprint width; no native state offset' },
  environment: { segments: config.board.segments.filter(s => !s.id.includes(':edge-')), planeCollapse: manifest.planeCollapse ?? null,
    generatedShorelineHeightOrLintelColliders: manifest.generatedShorelineHeightOrLintelColliders ?? null,
    noNewCollider: true, requiredVisualReview: board === 'water' ? 'Arch feet, lintel, opening, shore/rail, basins and front rim in available native approaches' : 'Front/side faces, corners, walls, receiver approaches and front rim' } };
const bytes = Buffer.from(JSON.stringify(targets, null, 2) + '\n');
writeFileSync(resolve(root, 'public/data/targets.json'), bytes);
console.log(JSON.stringify({ board, bytes: bytes.length, sha256: sha(bytes), obstacleGroups: targets.coverage.obstacleIds.length,
  physicalObjectTargets: targets.coverage.physicalObjectTargets, artAssemblies: objects.filter(o => o.kind === 'art-assembly-no-collider').length, receivers: config.board.buckets.length }));
