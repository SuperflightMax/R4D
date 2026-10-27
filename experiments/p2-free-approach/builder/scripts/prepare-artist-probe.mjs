import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { root, pins, defaults, sha256, verifyInputs } from './pins.mjs';

const artistCommit = 'fc892908d54cd06a44eb785edea4a9c5b32e3c97';
const artistPath = 'experiments/p2-free-approach/asset-artist';
const readArtist = file => execFileSync('git', ['show', `${artistCommit}:${artistPath}/${file}`], { cwd:root, maxBuffer:2*1024*1024 });
verifyInputs();
const contract = JSON.parse(readArtist('asset-contract-v1.json'));
const shapes = JSON.parse(readArtist('occluders-v1.json'));
const cfg = JSON.parse(readFileSync(path.join(root, 'inputs/config.json'), 'utf8'));
assert.equal(shapes.sourceSha256, pins.sourceSha256);
assert.equal(shapes.acceptedP1Commit, pins.p1Commit);
assert.equal(shapes.occluders.length, 4);
assert.equal(contract.ball.assetPath, null, 'This adapter is the exact diagnostic first probe');
const shadow = readArtist(contract.shadow.assetPath);
assert.equal(sha256(shadow), contract.shadow.sha256);
const occluders = shapes.occluders.map(item => {
  const pin = cfg.board.pins.find(pin => pin.id === item.id);
  assert.ok(pin, `Unknown accepted pin: ${item.id}`);
  assert.equal(item.depthNativeY, pin.y, 'First probe must preserve the Artist native depth');
  return { ...item, fileRole:'source' };
});
const manifest = {
  schema:'r4d.p2.assets.v1', sourceSize:shapes.sourceSizePx, mode:'diagnostic',
  provenance:{ artistCommit, sourceSha256:pins.sourceSha256, p1Commit:pins.p1Commit, motionReviewed:false },
  ball:null,
  shadow:{
    file:contract.shadow.assetPath, centerPx:contract.shadow.anchorPx,
    footprintPx:[2*contract.shadow.textureRadiusPx,2*contract.shadow.textureRadiusPx],
    nativeRadii:[contract.shadow.nativeRadius/cfg.board.ball.r,contract.shadow.nativeRadius/cfg.board.ball.r],
    offsetNative:contract.shadow.nativeOffset, opacity:1,
  },
  occluders,
};
const output = path.join(defaults.output, 'artist-probe-v1');
mkdirSync(output, { recursive:true });
writeFileSync(path.join(output, contract.shadow.assetPath), shadow);
writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({ manifest:path.join(output,'manifest.json'), artistCommit, occluders:occluders.map(p=>p.id), generatedBall:false, motionReviewed:false }));
