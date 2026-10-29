import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { project } from '../inputs/projection.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configBytes = fs.readFileSync(path.join(root, 'inputs/config.json'));
const config = JSON.parse(configBytes);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'inputs/manifest.json')));
const matrix = manifest.projection.nativeToSource;
const inverse = manifest.projection.sourceToNative;
const map = p => project(matrix, p);
const circle = (p, n = 128) => Array.from({ length: n }, (_, i) =>
  map([p.x + p.r * Math.cos(i * Math.PI * 2 / n), p.y + p.r * Math.sin(i * Math.PI * 2 / n)]));
const objects = config.board.pins.map((pin, index) => {
  const family = pin.id.split('-')[0];
  const nativeHeight = family === 'wood' ? 76 : family === 'leaf' ? 43 : family === 'frog' ? 48 : 38;
  const w = matrix[2][0] * pin.x + matrix[2][1] * pin.y + matrix[2][2];
  const heightPx = nativeHeight / w;
  return { id: pin.id, index, family, native: pin, center: map([pin.x, pin.y]),
    base: circle(pin), top: circle(pin).map(([x, y]) => [x, y - heightPx]), heightPx,
    heightPolicy: 'decorative screen extrusion, nativeHeight / homography denominator; not a recovered 3D camera' };
});
const segments = config.board.segments.map(s => ({ ...s, points: [map([s.x1,s.y1]), map([s.x2,s.y2])] }));
const buckets = config.board.buckets.map(b => ({ id: b.id, native:b, center:map([b.x,b.y]), rim:circle(b) }));
const starts = config.board.drops.map(d => ({ ...d, center:map([d.x,d.y]), ballFootprint:circle({ ...d, r:config.board.ball.r }) }));
const floor = manifest.projection.playableFloorNativePolygon.map(map);
const checkPoints = [...config.board.pins.flatMap(p => [[p.x,p.y],[p.x+p.r,p.y]]), ...config.board.drops.map(p=>[p.x,p.y]), ...config.board.buckets.map(p=>[p.x,p.y])];
const maxRoundTripNative = Math.max(...checkPoints.map(p=>Math.hypot(...project(inverse,map(p)).map((v,i)=>v-p[i]))));
if (maxRoundTripNative > 1e-6) throw new Error(`Projection roundtrip error ${maxRoundTripNative}`);
const draft = {
  schema:'r4d.p6.geometry-draft.v1', dimensions:[1536,1536],
  configSource:'../inputs/config.json', manifestSource:'../inputs/manifest.json',
  acceptedP1:'4b47db04c7140ebf88f69b91faa0b790d46f22ec',
  nativeToSource:matrix, sourceToNative:inverse, floor, objects, segments, buckets, starts,
  checks:{pins:objects.length,segments:segments.length,buckets:buckets.length,drops:starts.length,maxRoundTripNative},
  layerOrder:['environment','floor','floor-shadows','decorative-boundary-volumes','object-volumes far-to-near','bucket-volumes','diagnostic-registration optional'],
  limitations:[
    'Only footprint circles, boundary segments, drops and bucket capture circles are accepted geometry. Volumes are explicit illustrative extrusions.',
    'No true vertical camera model or object silhouettes were provided by P1. Cap height and palette guide art only.',
    'Bucket circles are native center capture regions, not reconstructed basket silhouettes.',
    'The single drop is centered; decorative portals must not imply additional physical starts.',
    'Do not move config or homography to match generated artwork.'
  ]
};
fs.mkdirSync(path.join(root,'draft-v01'),{recursive:true});
fs.writeFileSync(path.join(root,'draft-v01/geometry.json'),JSON.stringify(draft,null,2)+'\n');
console.log(JSON.stringify({file:'draft-v01/geometry.json',...draft.checks},null,2));
