import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Motion,ROUTES} from '../src/motion.js';
const geometry=JSON.parse(readFileSync(new URL('../output/builder/measured-motion.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../public/art/manifest.json',import.meta.url)));
const parts=Object.fromEntries(manifest.parts.map(p=>[p.id,p]));
test('configuration uses the actual extracted chain, bind axes and source stance',()=>{
 for(const side of ['Near','Far']){
  const shin=parts['shin'+side],foot=parts['foot'+side];
  assert.equal(geometry[side==='Near'?'thigh':'farThigh'],Math.hypot(...shin.joint));
  assert.equal(geometry[side==='Near'?'shin':'farShin'],Math.hypot(...foot.joint));
  assert.equal(geometry['homeX'+side],foot.sourcePivot[0]-parts['thigh'+side].sourcePivot[0]);
  assert.equal(geometry[side==='Near'?'nearAxisA':'farAxisA'],Math.atan2(-shin.joint[0],shin.joint[1]));
  assert.ok(geometry['sole'+side].length>100);
 }
});
test('all nine jump/landing choices complete with the measured sole geometry',()=>{
 for(const origin of ['idle','low','move'])for(const landing of ['idle','low','move']){
  const m=new Motion(geometry);m.requestGround(origin);m.update(.8);m.jump();m.update(.3);
  assert.equal(m.state,'flight');m.requestGround(landing);m.update(2);
  assert.equal(m.state,landing);assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);
  assert.ok(m.contactEvent);assert.ok(Math.min(...Object.values(m.contactEvent.gap))<.1);
 }
});
test('distinct low keeps the actual soles planted and can be retargeted without reset',()=>{
 for(const next of ['move','jump']){
  const m=new Motion(geometry),initial=m.pose.shinNear;m.requestGround('low');
  for(let i=0;i<8;i++){m.update(1/120);for(const side of ['Near','Far'])assert.ok(Math.abs(m.soleGap(side))<1e-6);}
  const pose={...m.pose},velocity={...m.velocity};assert.ok(pose.rootY>0&&pose.rootY<80*m.unit);
  next==='jump'?m.jump():m.requestGround(next);assert.deepEqual(m.pose,pose);assert.deepEqual(m.velocity,velocity);
  m.update(1/120);assert.ok(Math.abs(m.pose.rootY-pose.rootY)<10*m.unit);m.update(2);
  assert.equal(m.state,next==='jump'?'low':'move');
  if(next==='jump'){assert.ok(m.pose.rootY>75*m.unit);assert.ok(m.pose.shinNear-initial>.5);}
 }
});
test('both demo routes and mid-transition commands use the common mechanism',()=>{
 for(const [name,route]of Object.entries(ROUTES)){
  const m=new Motion(geometry);let cursor=0;
  for(let i=0;i<960;i++){
   while(cursor<route.length&&route[cursor].at<=m.time+1e-8){const e=route[cursor++];if(e.ground)m.requestGround(e.ground);if(e.jump)m.jump();}
   m.update(1/120);for(const value of Object.values(m.pose))assert.ok(Number.isFinite(value));
  }
  assert.equal(m.state,['two','midJump'].includes(name)?'low':name==='midMove'?'move':'idle');
  assert.equal(m.jumpCount,m.landCount);assert.equal(m.jumpCount,name==='two'?2:name==='midMove'?0:1);
 }
});
test('source stance plus full stride stays within both measured chains',()=>{
 const m=new Motion(geometry);m.requestGround('move');
 for(let i=0;i<480;i++){
  m.update(1/120);
  for(const side of ['Near','Far']){
   const {a,b}=m.dimensions(side),p=m.pose;
   assert.ok(Math.hypot(p['footX'+side]-p.bodyX,p['footY'+side]-p.rootY)<=a+b+.001);
   assert.ok(m.soleGap(side)>-.001);
  }
 }
});
