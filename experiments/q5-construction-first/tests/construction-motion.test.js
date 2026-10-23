import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Motion,ROUTES} from '../src/motion.js';
const rig=JSON.parse(fs.readFileSync(new URL('../construction/v1/rig.json',import.meta.url)));
const dims={...rig.motion,soleNear:[[-25,30],[65,30]],soleFar:[[-25,30],[65,30]]};
test('construction frozen input hashes still match all pre-generation files',()=>{
 const files=JSON.parse(fs.readFileSync(new URL('../construction/v1/SHA256.json',import.meta.url)));
 for(const [file,expected]of Object.entries(files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../construction/v1/'+file,import.meta.url))).digest('hex'),expected,file);
});
test('new 120+120 rig bends into low while maintaining the physical ankle endpoint',()=>{
 const m=new Motion(dims);m.requestGround('low');
 for(let i=0;i<120;i++){m.update(1/120);for(const side of ['Near','Far']){const p=m.pose;assert.ok(Math.abs(p.rootY+120*Math.cos(p['thigh'+side])+120*Math.cos(p['thigh'+side]+p['shin'+side])-p['footY'+side])<1e-6);}}
 assert.ok(Math.abs(m.pose.rootY-76.8)<2);assert.ok(m.pose.shinNear>1.5);
});
test('all nine jump origins/latest airborne targets complete on the same mechanism',()=>{
 for(const origin of ['idle','low','move'])for(const target of ['idle','low','move']){
  const m=new Motion(dims);m.requestGround(origin);m.update(.8);m.jump();m.update(.3);assert.equal(m.state,'flight');m.requestGround(target);m.update(2);
  assert.equal(m.state,target,origin+' -> '+target);assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);
 }
});
test('mid-transition retarget preserves pose/velocity and all routes stay finite',()=>{
 for(const next of ['move','jump']){const m=new Motion(dims);m.requestGround('low');m.update(.06);const p={...m.pose},v={...m.velocity};next==='jump'?m.jump():m.requestGround(next);assert.deepEqual(m.pose,p);assert.deepEqual(m.velocity,v);m.update(1/120);assert.ok(Math.abs(m.pose.rootY-p.rootY)<7);}
 for(const route of Object.values(ROUTES)){const m=new Motion(dims);let cursor=0;for(let i=0;i<960;i++){while(cursor<route.length&&route[cursor].at<=m.time+1e-8){const e=route[cursor++];if(e.ground)m.requestGround(e.ground);if(e.jump)m.jump();}m.update(1/120);for(const value of Object.values(m.pose))assert.ok(Number.isFinite(value));}assert.equal(m.jumpCount,m.landCount);}
});
