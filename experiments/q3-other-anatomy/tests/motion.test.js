import test from 'node:test';
import assert from 'node:assert/strict';
import {Motion,solveChain} from '../src/motion.js';
const legs=[{id:'Left',homeX:-170,homeY:160},{id:'Right',homeX:170,homeY:160},{id:'Rear',homeX:35,homeY:140}];
const create=()=>new Motion({legs,lowDepth:70,stride:72});
test('all nine jump origin/landing combinations retain the latest airborne request',()=>{
 for(const start of ['idle','low','move'])for(const end of ['idle','low','move']){
  const m=create();m.requestGround(start);m.update(1);m.jump();m.update(.5);assert.equal(m.state,'flight');
  const before={...m.pose};m.requestGround(end);assert.deepEqual(m.pose,before);m.jump();
  m.update(1.5);assert.equal(m.state,end);assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);assert.equal(m.height,0);
 }
});
test('ground and jump requests do not reset a partly lowered pose',()=>{
 for(const next of ['move','jump']){
  const m=create();m.requestGround('low');m.update(.08);assert.ok(m.pose.bodyY>5&&m.pose.bodyY<65);
  const before={...m.pose};if(next==='jump')m.jump();else m.requestGround(next);assert.deepEqual(m.pose,before);
  m.update(1/120);assert.ok(Math.abs(m.pose.bodyY-before.bodyY)<7);
 }
});
test('steady radial gait has two planted supports while one is transferred',()=>{
 const m=create();m.requestGround('move');m.update(2);
 for(let i=0;i<480;i++){m.update(1/120);assert.ok(legs.filter(l=>m.foot(l).gap<1e-7).length>=2);}
 m.requestGround('low');m.update(2);assert.ok(m.pose.bodyY>65);assert.ok(m.pose.LeftX<-190);assert.ok(m.pose.RightX>190);
});
test('two-link IK preserves geometry for left and right outward knees',()=>{
 for(const bend of [-1,1])for(const [x,y] of [[100,140],[-100,140],[140,70],[-140,70],[0,185]]){
  const s=solveChain(x,y,100,120,bend),ex=100*Math.cos(s.first)+120*Math.cos(s.first+s.second),ey=100*Math.sin(s.first)+120*Math.sin(s.first+s.second);
  assert.ok(Math.hypot(ex-x,ey-y)<1e-7);
 }
});
