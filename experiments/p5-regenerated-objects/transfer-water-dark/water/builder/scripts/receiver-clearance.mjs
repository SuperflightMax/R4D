import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { root, board } from './runtime.mjs';
import { project, bounds } from '../src/p1-projection.mjs';

// Calculate the inherited optical/logical policy from NEW measured art and this
// board's exact projection. This reads metadata; it never moves native targets,
// rewrites a manifest, invents aliases or edits pixels.
const input = process.argv[2];
if (!input) throw new Error('Usage: receiver-clearance.mjs <new-artist-manifest.json> [--output own-report.json]');
const bytes = readFileSync(resolve(input));
const manifest = JSON.parse(bytes);
const targets = JSON.parse(readFileSync(resolve(root, 'public/data/targets.json')));
const config = JSON.parse(readFileSync(resolve(root, 'public/data/config.json')));
const matrix = targets.projection.nativeToSource;
if (manifest.sourceSha256 !== targets.source.sha256 || manifest.p1Commit !== targets.p1Commit) throw new Error('Wrong board/P1 art');
const ballInstance = manifest.instances.find(i => i.role === 'ball' && i.targetId === '$ball');
const ball = manifest.textures.find(t => t.id === ballInstance?.textureId);
if (!ball?.sphereVisualCenterPx?.every(Number.isFinite)) throw new Error('New ball texture needs measured sphereVisualCenterPx');
const L = ball.groundAnchorPx[1] - ball.sphereVisualCenterPx[1];
if (!(L > 0)) throw new Error('Measured sphere center must be above its ground contact');
const diameter = bucket => {
  const polygon = Array.from({ length: 128 }, (_, i) => project(matrix,
    [bucket.x + Math.cos(i * Math.PI / 64) * config.board.ball.r, bucket.y + Math.sin(i * Math.PI / 64) * config.board.ball.r]));
  const b = bounds(polygon); return b.maxX - b.minX;
};
const results = [];
for (const instance of manifest.instances.filter(i => ['receiver-back', 'receiver-front'].includes(i.role))) {
  const texture = manifest.textures.find(t => t.id === instance.textureId);
  const target = targets.objects.find(o => o.id === instance.targetId && o.kind === 'bucket');
  const bucket = config.board.buckets.find(o => o.id === instance.targetId);
  const optical = texture?.opticalOpeningPointPx;
  if (!target || !bucket || !optical?.every(Number.isFinite)) throw new Error('Receiver requires exact target and measured opticalOpeningPointPx: ' + instance.id);
  const sB = diameter(bucket) / ball.footprintPx.width;
  const sR = target.sourcePx.footprintWidth / texture.footprintPx.width;
  const hR = L * sB / sR;
  const logical = [optical[0], optical[1] + hR];
  results.push({ instanceId: instance.id, targetId: target.id, textureId: texture.id,
    sphereLiftTexturePx: L, ballScaleAtBucket: sB, receiverScale: sR, hRTexturePx: hR,
    opticalOpeningPointPx: optical, expectedLogicalAnchorPx: logical, actualGroundAnchorPx: texture.groundAnchorPx,
    groundAnchorErrorPx: texture.groundAnchorPx.map((n, i) => n - logical[i]),
    commonPolicyVisualShiftSourceY: -hR * sR,
    rule: 'A=[O.x,O.y+L*sB/sR]; exact new art/projection; no Jungle offset constant, no native offset or sinking' });
}
const report = { schema: 'r4d.p5.transfer.receiver-clearance/1', board,
  artistManifestSha256: createHash('sha256').update(bytes).digest('hex'),
  configSha256: targets.configSha256, ballTextureId: ball.id, ballSha256: ball.sha256,
  sphereVisualCenterPx: ball.sphereVisualCenterPx, sphereGroundAnchorPx: ball.groundAnchorPx,
  results, scope: 'Measured metadata calculation only; actual receiver approach/front-rim motion still required',
  nativeTargetsChanged: false, seedTickCondition: false };
const output = JSON.stringify(report, null, 2) + '\n';
const flag = process.argv.indexOf('--output');
if (flag >= 0) writeFileSync(resolve(process.argv[flag + 1]), output, { flag: 'wx' });
else process.stdout.write(output);
