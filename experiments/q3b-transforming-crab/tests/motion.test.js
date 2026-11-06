import test from 'node:test';
import assert from 'node:assert/strict';
import {Motion} from '../src/motion.js';
test('form reverse and third target preserve current coordinate, velocity and connected pose at dispatch',()=>{
 const m=new Motion();m.dispatch({type:'form',value:'work'});m.update(.8);assert.ok(m.u>0&&m.u<2);
 for(const value of ['module','crab','work']){const before=m.snapshot();m.dispatch({type:'form',value});assert.equal(m.u,before.u);assert.equal(m.uv,before.uv);assert.deepEqual(m.sample(),before.pose);m.update(.2);}
});
test('manual commands stop the shared auto dispatcher; stop cancels a queued jump',()=>{
 const m=new Motion();m.startShow();m.update(.1);m.dispatch({type:'jump'});assert.equal(m.auto,null);assert.equal(m.pendingJump,true);m.dispatch({type:'stop'});m.update(5);assert.equal(m.jumpCount,0);assert.equal(m.pendingJump,false);
});
test('jump unfolds from every form, preserves an airborne form target and lands once',()=>{
 for(const form of ['module','crab','work']){const m=new Motion();m.dispatch({type:'form',value:form});m.update(4);m.dispatch({type:'jump'});let guard=0;while(m.jump!=='flight'&&guard++<1000)m.update(1/120);assert.equal(m.jump,'flight');m.dispatch({type:'form',value:'work'});m.update(6);assert.equal(m.jumpCount,1);assert.equal(m.landCount,1);assert.equal(m.form,'work');assert.ok(Math.abs(m.u-2)<.01);}
});
