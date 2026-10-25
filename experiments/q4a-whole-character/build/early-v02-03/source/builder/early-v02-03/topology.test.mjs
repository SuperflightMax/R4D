import test from 'node:test';
import assert from 'node:assert/strict';
import {boundaryPanel,boundaryPose,boundaryAudit} from '../../app/boundary-cloth.mjs';

const panel={side:'near',waist:[[0,0],[5,-1],[10,0]],left:[[0,0],[-1,10],[0,20]],
  hem:[[0,20],[5,22],[10,20]],right:[[10,0],[11,10],[10,20]]};
const rest={pelvis:{x:0,y:0},neck:{x:0,y:-10},nearHip:{x:0,y:5},nearKnee:{x:0,y:15}};
test('traced curved boundaries triangulate with positive source winding and preserve identity',()=>{
  const geometry=boundaryPanel(panel,[-2,-2,16,26]);
  const posed=boundaryPose(geometry,rest,rest);
  for(let i=0;i<posed.length;i++)assert.ok(Math.hypot(posed[i].x-geometry.source[i].x,posed[i].y-geometry.source[i].y)<1e-9);
  assert.ok(boundaryAudit(geometry,posed).every(t=>t.sourceArea2>0&&t.area2>0));
});
test('global rigid translation preserves every triangle determinant without a fitted weight field',()=>{
  const geometry=boundaryPanel(panel,[-2,-2,16,26]);
  const pose=Object.fromEntries(Object.entries(rest).map(([k,p])=>[k,{x:p.x+17,y:p.y-9}]));
  for(const row of boundaryAudit(geometry,boundaryPose(geometry,rest,pose)))assert.ok(Math.abs(row.jacobian-1)<1e-9);
});
test('inconsistent corners and inverted target triangles are reported rather than repaired silently',()=>{
  assert.throws(()=>boundaryPanel({...panel,hem:[[1,20],[10,20]]},[-2,-2,16,26]),/corners disagree/);
  const geometry=boundaryPanel(panel,[-2,-2,16,26]);
  const reflected=geometry.source.map(p=>({x:-p.x,y:p.y}));
  assert.ok(boundaryAudit(geometry,reflected).every(t=>t.inverted));
});
