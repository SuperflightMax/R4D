// Registration arithmetic only; no simulation or Pixi instrumentation.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const root='E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w06';
const parse=p=>JSON.parse(readFileSync(p)),f=parse(root+'/frozen-verification.json');
const art=parse(f.producer+'/public/assets/manifest.json'), targets=parse(f.producer+'/public/data/targets.json'), bindings=parse(root+'/BINDINGS.json');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} vs ${b}`);
const rows=bindings.map(b=>{
  const target=targets.objects.find(t=>t.id===b.targetId),tex=art.textures.find(t=>t.id===b.textureId);assert(target&&tex);
  b.sourceAnchor.forEach((v,i)=>near(v,target.sourcePx.anchor[i]));
  near(b.targetSourceFootprint[0],target.sourcePx.footprintWidth); near(b.targetSourceFootprint[1],target.sourcePx.footprintDepth);
  near(b.uniformScale,target.sourcePx.footprintWidth/tex.footprintPx.width);
  const depth=b.uniformScale*tex.footprintPx.depth,residual=depth-target.sourcePx.footprintDepth;
  if(b.renderedDepthSourcePx!==undefined)near(depth,b.renderedDepthSourcePx);
  near(residual,b.depthResidualSourcePx);
  return{id:b.targetId,textureId:b.textureId,sourceAnchor:target.sourcePx.anchor,uniformScale:b.uniformScale,renderedDepth:depth,depthResidualSourcePx:residual,sourceTargetAndRegistrationExact:true,footprintInferredNotRecovered3D:true};
});
assert.equal(rows.length,13);
writeFileSync(root+'/binding-comparison.json',JSON.stringify({method:'Arithmetic against exact frozen target and texture records; not measured Pixi zIndex or 3D recovery',rows},null,2)+'\n');
console.log(JSON.stringify({bindingRowsExact:rows.length}));
