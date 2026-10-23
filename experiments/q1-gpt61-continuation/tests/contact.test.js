import test from 'node:test';
import assert from 'node:assert/strict';
import {Motion} from '../src/motion.js';
// An asymmetric boot exercises rotation-aware physical contact, not just its ankle.
const rig={thigh:110,shin:107,farThigh:112,farShin:113,nearReach:205,farReach:202,soleNear:[[-30,65],[20,80],[80,76]],soleFar:[[-29,68],[20,85],[84,80]]};
function landing(origin,returnTo,mid=false){
 const m=new Motion(rig);m.requestGround(origin);m.update(mid?.06:.8);m.jump();m.update(.25);m.requestGround(returnTo);
 let prior=m.snapshot(),contact=null,maxStep=0;
 for(let i=0;i<240;i++){
  m.update(1/120);const s=m.snapshot();
  if(prior.state==='flight'&&!prior.landCount)assert.ok(Math.min(...Object.values(prior.soleGap))>-.000001,'no counted contact before visible ground');
  if(s.landCount&&!prior.landCount){
   contact=s;assert.equal(s.state,'land');assert.ok(Math.min(...Object.values(s.soleGap))>=-1e-6);assert.ok(Math.min(...Object.values(s.soleGap))<=.05,'counter starts with visible sole on floor');
   for(const side of ['Near','Far'])maxStep=Math.max(maxStep,Math.abs(s.pose['footY'+side]-prior.pose['footY'+side]));
  }
  if(s.state==='land')for(const side of ['Near','Far'])if(s.contacts[side]){
   assert.ok(Math.abs(s.soleGap[side])<1e-6,'no hovering or sinking of planted foot');
   assert.equal(s.pose['footX'+side],s.contacts[side].x,'no lateral slip during impact');
  }
  prior=s;
 }
 assert.ok(contact);assert.ok(maxStep<6,`contact step ${maxStep}, no large snap`);assert.equal(m.state,returnTo);assert.equal(m.landCount,1);return contact;
}
test('F1 visible sole contact and counter agree for all nine start/return combinations',()=>{for(const start of ['idle','low','move'])for(const end of ['idle','low','move'])landing(start,end);});
test('F1 jump from unfinished low transition keeps coherent visible contact',()=>{for(const end of ['idle','low','move'])landing('low',end,true);});
