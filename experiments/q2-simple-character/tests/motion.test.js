import test from 'node:test';
import assert from 'node:assert/strict';
import {Motion,ROUTES,spring} from '../src/motion.js';
test('jump from all three ground states returns to latest airborne selection',()=>{
 for(const origin of ['idle','low','move'])for(const landing of ['idle','low','move']){
  const m=new Motion();m.requestGround(origin);m.update(.8);m.jump();m.update(.01);assert.equal(m.state,'prepare');m.update(.25);assert.equal(m.state,'flight');m.requestGround(landing);m.update(1.5);assert.equal(m.state,landing);assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);
 }
});
test('low pose changes joint geometry with planted feet during entire transition',()=>{
 const m=new Motion(),before=m.pose.shinNear,foot=m.pose.footYNear;m.requestGround('low');
 for(let i=0;i<120;i++){m.update(1/120);const p=m.pose;assert.ok(Math.abs(p.rootY+125*Math.cos(p.thighNear)+125*Math.cos(p.thighNear+p.shinNear)-foot)<1e-6);}
 assert.ok(m.pose.rootY>75);assert.ok(m.pose.shinNear-before>.7);assert.ok(m.pose.bodyX<-25);
});
test('retarget midway idle-low keeps pose and velocity, movement and jump remain available',()=>{
 for(const next of ['move','jump']){const m=new Motion();m.requestGround('low');m.update(.06);const p={...m.pose},v={...m.velocity};assert.ok(p.rootY>0&&p.rootY<70);next==='jump'?m.jump():m.requestGround(next);assert.deepEqual(m.pose,p);assert.deepEqual(m.velocity,v);m.update(1/120);assert.ok(Math.abs(m.pose.rootY-p.rootY)<7);m.update(2);assert.equal(m.state,next==='jump'?'low':'move');}
});
test('both required routes and interrupted transition routes run through the common command interface',()=>{
 for(const [name,route]of Object.entries(ROUTES)){const m=new Motion();let index=0;for(let i=0;i<960;i++){while(index<route.length&&route[index].at<=m.time+1e-8){const e=route[index++];if(e.ground)m.requestGround(e.ground);if(e.jump)m.jump();}m.update(1/120);for(const value of Object.values(m.pose))assert.ok(Number.isFinite(value));}
 assert.equal(m.state,['two','midJump'].includes(name)?'low':name==='midMove'?'move':'idle');assert.equal(m.jumpCount,name==='two'?2:name==='midMove'?0:1);assert.equal(m.jumpCount,m.landCount);}
});
test('spring preserves shortest angular path and does not numerically jump at pi',()=>{
 const [x]=spring(Math.PI-.01,0,-Math.PI+.01,1/120,23,true);assert.ok(Math.abs(x-(Math.PI-.01))<.01);
});
test('different crop/bind axes use the same physical endpoint',()=>{
 const m=new Motion({thigh:110,shin:107,nearAxisA:.12,nearAxisB:-.08});m.requestGround('low');m.update(1);const p=m.pose;const hip=p.thighNear+.12,shin=p.thighNear+p.shinNear-.08;
 assert.ok(Math.abs(p.rootY+110*Math.cos(hip)+107*Math.cos(shin)-p.footYNear)<1e-6);
});
test('new character sizes retain proportional low pose and complete jumps',()=>{
 for(const scale of [.4,1.8]){
  const m=new Motion({thigh:125*scale,shin:125*scale});
  m.requestGround('low');m.update(1);
  assert.ok(Math.abs(m.pose.rootY/scale-80)<2);
  assert.ok(m.pose.shinNear>1.5);
  m.jump();m.update(.4);m.requestGround('move');m.update(2);
  assert.equal(m.state,'move');assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);
  assert.ok(m.speed>100*scale);
 }
});
