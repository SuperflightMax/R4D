import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Motion} from '../../src/motion.js';
import {transforms,equality} from '../../src/rig.js';
const raw=fs.readFileSync(new URL('../../FROZEN_CONTRACT.json',import.meta.url));const c=JSON.parse(raw);
test('Frozen contract and six provenance bytes remain exact',()=>{
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a');
 for(const [name,hash] of Object.entries(c.source.sha256))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../../provenance/source/'+name,import.meta.url))).digest('hex'),hash,name);
});
test('Retarget preserves current pose identity and samples 0.38s smoothstep',()=>{
 const m=new Motion(c),identity=m.pose;m.request('extreme_flexion');m.advance(.19);assert.equal(m.pose.shin,46);
 const before={...m.pose};m.request('jump_phase');assert.deepEqual(m.pose,before);assert.strictEqual(m.pose,identity);
 m.advance(.19);assert.equal(m.pose.shin,63);assert.equal(m.pose.y,-75.5);m.advance(.19);assert.deepEqual(m.pose,m.targets.jump_phase);
 m.request('extreme_extension');m.advance(.38);assert.equal(m.pose.shin,-8);assert.strictEqual(m.pose,identity);
});
test('Ping pong uses shared clock; reset and exact step',()=>{
 const m=new Motion(c);m.request('extreme_flexion');m.playing=true;m.advance(.76);assert.deepEqual(m.pose,m.targets.bind);assert.equal(m.time,.76);
 m.advance(.19);assert.ok(Math.abs(m.pose.shin-46)<1e-10);m.reset();assert.equal(m.time,0);assert.equal(m.playing,false);m.advance(c.motion.step_seconds);assert.equal(m.time,1/60);
});
test('Neutral/source joint formula and fixed camera; no bone scale',()=>{
 const m=new Motion(c),n=transforms(c,m.pose),s=transforms(c,m.pose,false,true);
 assert.deepEqual(n.thigh,{x:186.48,y:185.42,angle:0,scale:.42,pivot:[98,35],layer:-10});
 assert.equal(n.shin.x,n.thigh.x+41*.42);assert.equal(n.shin.y,n.thigh.y+284*.42);
 assert.ok(Math.abs((s.shin.y-n.shin.y)-(-18.48))<1e-10);
 const z=transforms(c,m.pose,true);assert.equal(z.root.y,80);assert.equal(z.shin.scale,.84);
 m.request('jump_phase');m.advance(.38);const w=transforms(c,m.pose);assert.ok(Math.abs(Math.hypot(w.shin.x-w.thigh.x,w.shin.y-w.thigh.y)-Math.hypot(41,284)*.42)<1e-10);
});
test('Equality detects transform drift and independent pose object',()=>{
 const m=new Motion(c),t=transforms(c,m.pose);const a={id:'J0',loaded:true,source:false,pose:m.pose,transform:t};const b={...a,id:'J1'};
 assert.equal(equality([a,b]).exact,true);assert.equal(equality([a,{...b,pose:{...m.pose}}]).exact,false);
 assert.equal(equality([a,{...b,transform:{...t,shin:{...t.shin,x:99}}}]).exact,false);
 assert.equal(equality([a,{...b,source:true}]).exact,true);
});
test('Runtime inputs equal Artist outputs and preserve J relationships',()=>{
 const runtime=JSON.parse(fs.readFileSync(new URL('../../public/art/manifest.json',import.meta.url)));
 const artist=JSON.parse(fs.readFileSync(new URL('../../process/M2/art-output-manifest.json',import.meta.url)));
 assert.equal(runtime.stage,'candidate');assert.deepEqual(Object.keys(runtime.variants),['J0','J1','J2','M1','M2']);
 let count=0;for(const entry of Object.values(runtime.variants))for(const part of ['thigh','shin','overlay'])if(entry[part]){
  const mapping=entry[part],bytes=fs.readFileSync(new URL('../../public/'+mapping.file,import.meta.url));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),artist[mapping.source].sha256);assert.equal(bytes.length,mapping.bytes);
  assert.deepEqual(bytes,fs.readFileSync(new URL('../../'+mapping.source,import.meta.url)));count++;
 }assert.equal(count,11);
 for(const part of ['thigh','shin'])assert.equal(runtime.variants.J1[part].sha256,runtime.variants.M2[part].sha256),assert.equal(runtime.variants.J2[part].sha256,runtime.variants.J1[part].sha256);
});
