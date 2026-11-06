import {readFileSync,writeFileSync} from 'node:fs';
import {Motion} from '../../src/motion.js';
import {Rig} from '../../src/rig.js';
const manifest=JSON.parse(readFileSync(new URL('../../public/art/manifest.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const m=new Motion();m.coreBottom=19;m.setGeometry(m.legs.map(l=>({id:l.id,sole:manifest.geometry.footSoleOffset,hip:manifest.parts.find(p=>p.id==='upper'+l.id).joint})));
const rig=new Rig(manifest.parts,m);m.dispatch({type:'move',value:1});m.update(6);m.dispatch({type:'jump'});
for(let i=0;i<1000;i++){
 const before={snapshot:m.snapshot(),render:rig.solve()},state=m.jump;
 m.update(1/240);const after={snapshot:m.snapshot(),render:rig.solve()};
 if(state==='prepare'&&m.jump==='flight'){
  const deltas=Object.fromEntries(['Left','Right','Rear'].map(id=>[id,{x:after.render.world['foot'+id].x-before.render.world['foot'+id].x,y:after.render.world['foot'+id].y-before.render.world['foot'+id].y}]));
  const result={dt:1/240,deltas,rootDeltaX:after.snapshot.x-before.snapshot.x,before,after};
  writeFileSync(new URL('./takeoff-moving-after.json',import.meta.url),JSON.stringify(result,null,2));
  console.log(JSON.stringify({dt:result.dt,deltas,rootDeltaX:result.rootDeltaX}));break;
 }
}

