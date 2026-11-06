import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Motion} from '../src/motion.js';
import {Rig} from '../src/rig.js';

const manifest=JSON.parse(readFileSync(new URL('../public/art/manifest.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
function setup(){
 const m=new Motion();m.coreBottom=19;
 m.setGeometry(m.legs.map(l=>({id:l.id,sole:manifest.geometry.footSoleOffset,a:manifest.geometry.upperLength,b:manifest.geometry.lowerLength,hip:manifest.parts.find(p=>p.id==='upper'+l.id).joint})));
 return {m,rig:new Rig(manifest.parts,m)};
}
test('packed knees remain inside the chassis envelope instead of extending as whiskers',()=>{
 const {rig}=setup(),s=rig.solve();
 for(const side of ['Left','Right','Rear'])assert.ok(Math.abs(s.world['lower'+side].x)<100);
});
test('actual measured support geometry remains reachable during acceleration, reversal, low and stopping',()=>{
 const {m,rig}=setup();
 m.dispatch({type:'move',value:1});
 let maxReach=0,minGap=0;
 for(let i=0;i<2400;i++){
  if(i===1100)m.dispatch({type:'move',value:-1});
  if(i===1700)m.dispatch({type:'low'});
  if(i===2200)m.dispatch({type:'stop'});
  m.update(1/120);const s=rig.solve();
  if(s.pose.deploy===1&&m.jump==='ground'){
   maxReach=Math.max(maxReach,...Object.values(s.solutions).map(l=>l.requested));
   minGap=Math.min(minGap,...Object.values(s.gaps));
  }
 }
 assert.ok(maxReach<195,`unreachable foot target ${maxReach}`);
 assert.ok(minGap>-.001,`sole penetrated plane ${minGap}`);
});
test('full reverse limits adjacent attachment travel instead of collapsing a narrow elbow phase',()=>{
 const {m,rig}=setup();m.dispatch({type:'form',value:'work'});m.update(7);
 m.dispatch({type:'form',value:'module'});let last=rig.solve(),largest=0;
 for(let i=0;i<840;i++){m.update(1/120);const s=rig.solve();for(const part of manifest.parts)largest=Math.max(largest,Math.hypot(s.world[part.id].x-last.world[part.id].x,s.world[part.id].y-last.world[part.id].y));last=s;}
 assert.ok(largest<15,`over-fast fold ${largest} px / 120Hz`);
});
test('a jump during locomotion releases the actual planted feet without a horizontal teleport',()=>{
 const {m,rig}=setup();m.dispatch({type:'move',value:1});m.update(6);m.dispatch({type:'jump'});
 let launched=false;
 for(let i=0;i<1000;i++){
  const state=m.jump,before=rig.solve();m.update(1/240);const after=rig.solve();
  if(state==='prepare'&&m.jump==='flight'){
   for(const side of ['Left','Right','Rear'])assert.ok(Math.abs(before.world['foot'+side].x-after.world['foot'+side].x)<.01,`takeoff shifted planted ${side} horizontally`);
   launched=true;break;
  }
 }
 assert.ok(launched);
});
