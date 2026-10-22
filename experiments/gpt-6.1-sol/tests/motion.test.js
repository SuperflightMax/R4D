import test from 'node:test';
import assert from 'node:assert/strict';
import {Motion,legIK,spring,SCENARIO} from '../src/motion.js';
test('jump from idle and movement passes preparation, flight, landing and resumes current input',()=>{
  for(const moving of [0,1]) { const m=new Motion(); m.setMove(moving);m.update(.4);m.jump();m.update(.01);assert.equal(m.state,'prepare');m.update(.2);assert.equal(m.state,'flight');m.setMove(1-moving);m.update(1.4);assert.equal(m.state,moving?'idle':'move');assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);assert.equal(m.height,0); }
});
test('arbitrary retargeting keeps current pose continuous and finite',()=>{
  const m=new Motion();let maxDelta=0;
  for(let i=0;i<1200;i++){if(i%37===0)m.setMove(i%74===0?1:0);if(i%157===0)m.jump();const prev={...m.pose};m.update(1/120);for(const [key,value] of Object.entries(m.pose)){assert.ok(Number.isFinite(value));if(key!=='rootY')maxDelta=Math.max(maxDelta,Math.abs(value-prev[key]));}}
  assert.ok(maxDelta<.15,`angular step ${maxDelta}`);
});
test('same spring preserves velocity on retarget and converges without overshoot from rest',()=>{
  let x=0,v=0;for(let i=0;i<120;i++){[x,v]=spring(x,v,1,1/120);assert.ok(x<=1+1e-10)}assert.ok(x>.9999);
  const [next]=spring(x,v,-1,1e-6);assert.ok(Math.abs(next-x)<.00001);
});
test('IK reaches foot targets and keeps foot horizontal',()=>{
  for(const x of [-50,0,50]) {const y=220;const [hip,knee,foot]=legIK(x,y,125,125);assert.ok(Math.abs(-Math.sin(hip)*125-Math.sin(hip+knee)*125-x)<1e-6);assert.ok(Math.abs(Math.cos(hip)*125+Math.cos(hip+knee)*125-y)<1e-6);assert.ok(Math.abs(hip+knee+foot)<1e-9);}
});
test('scripted scenario finishes at idle after two complete jumps',()=>{
 const m=new Motion();let cursor=0;for(let i=0;i<720;i++){while(cursor<SCENARIO.length&&SCENARIO[cursor].at<=m.time+1e-8){const e=SCENARIO[cursor++];if('move'in e)m.setMove(e.move);if(e.jump)m.jump();}m.update(1/120);}assert.equal(m.jumpCount,2);assert.equal(m.landCount,2);assert.equal(m.state,'idle');
});
