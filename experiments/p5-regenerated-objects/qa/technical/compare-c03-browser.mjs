// C03 targeted regression: saved traces/results only. No native module import or simulation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
const base='E:/R4D/perspective/p5-runtime/technical-qa';const root=base+'/c03';
const digest=b=>createHash('sha256').update(b).digest('hex');assert(!existsSync(root+'/browser-comparison.json'));
const config=JSON.parse(readFileSync(base+'/source-oracle-001/common/simulation/boards/01/trial-01/config.json'));
const traces=new Map([
 [0,[base+'/source-oracle-001/private/seed-0/states.ndjson',base+'/source-oracle-001/private/seed-0/events.json','971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572']],
 [1696420279,[base+'/c01/native-seed-1696420279.states.ndjson',base+'/c01/native-seed-1696420279.events.json','04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14']],
 [4210403976,[base+'/c02/clip-followup/native-seed4210403976.states.ndjson',base+'/c02/clip-followup/native-seed4210403976.events.json','555e6fe1566f24c5a37b4e41359c2dcd548035bab51f8cc7d93f711a244f3890']],
].map(([seed,[tracePath,eventPath,hash]])=>{const b=readFileSync(tracePath);assert.equal(digest(b),hash);return[seed,{states:b.toString().trimEnd().split('\n').map(JSON.parse),events:JSON.parse(readFileSync(eventPath)).map(({callbackStateTick,...e})=>e),sha256:hash}]}));
const captures=readdirSync(root+'/browser').filter(f=>f.endsWith('.json')).map(file=>({file,...JSON.parse(readFileSync(root+'/browser/'+file))}));
const saved333=JSON.parse(readFileSync(root+'/saved333-terminal-baseline.json'));
const oldField=JSON.parse(readFileSync(base+'/c02/browser-native-comparison.json')).fieldDomain.domainSourcePx;
const checks=[];let currentFraming;
for(const c of captures){
 const cfg=structuredClone(config);cfg.rng.seed=c.record.seed;assert.deepEqual(c.config,cfg,c.file+' config');assert.deepEqual(c.record.state,c.state);
 assert.equal(c.meta.pins.artistManifest.sourceSha256,'a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0');
 assert.equal(c.meta.pins.core.tree,'008d16a80a26bb77d562a45218b01da09b0d9ff0');assert.equal(c.meta.pins.configSha256,'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
 assert.deepEqual(c.meta.fieldFraming.domainSourcePx,oldField,c.file+' Field domain regression');
 if(!currentFraming)currentFraming=c.meta.fieldFraming;else assert.deepEqual(c.meta.fieldFraming,currentFraming,c.file+' Field controls/tick');
 const cached=traces.get(c.record.seed);let comparison;
 if(cached){assert.deepEqual(c.state,cached.states[c.state.tick],c.file+' state/RNG');assert.deepEqual(c.record.events,cached.events.filter(e=>e.type==='object_hit'?e.tick<c.state.tick:e.tick<=c.state.tick).map(e=>({...e,stateTick:e.type==='object_hit'?e.tick+1:e.tick})),c.file+' events');comparison='saved independent native trace state/RNG/config/events';}
 else{assert.equal(c.record.seed,3339315606);if(c.state.tick===1709)assert.deepEqual(c.state,saved333.state);comparison=c.state.tick===1709?'saved VQA actual native terminal state/RNG/config':'config/pins and local view/replay invariance; no independent per-tick trace';}
 checks.push({file:c.file,seed:c.record.seed,tick:c.state.tick,comparison});
}
const get=name=>captures.find(c=>c.file===name+'.json');
for(const name of ['fix676-artoff','fix676-whole-noart'])assert.deepEqual(get(name).state,get('fix676-geometry').state);
assert.deepEqual(get('lefthead333-1610-geometry').state,get('lefthead333-1610-artoff').state);assert.deepEqual(get('lefthead333-1610-geometry').state,get('lefthead333-replay1610').state);
assert.equal(get('fix-step677').state.tick,677);assert.equal(get('fix-step687').state.tick,687);
const domain=currentFraming.domainSourcePx;assert.equal(currentFraming.importantPartsSourcePx.length,11);
for(const p of currentFraming.importantPartsSourcePx)assert(p.minX>=domain.minX-1e-9&&p.maxX<=domain.maxX+1e-9&&p.minY>=domain.minY-1e-9&&p.maxY<=domain.maxY+1e-9);
const result={createdUtc:new Date().toISOString(),scope:'Targeted C03 clip regression; exact saved-trace and local-invariance scopes separated',captures:checks,totalCaptures:checks.length,
 independentTraceComparisons:checks.filter(c=>traces.has(c.seed)).length,leftHead333Snapshots:checks.filter(c=>c.seed===3339315606).length,tracePins:[...traces].map(([seed,v])=>({seed,sha256:v.sha256,reused:true})),
 old333TerminalSource:saved333,fieldDomain:domain,all11ImportantPartsWithinDomain:true,viewMaskRngInvariant:true,step1And10:true,nativeRunsPerformed:0,pngRemeasurementPerformed:false,coreExportOrMatrixRerun:false,
 caveat:'Intermediate333 states tested for local config/view/replay invariance, not against an independently saved per-tick trace. Moving read and screenshot are not atomic.'};
const b=Buffer.from(JSON.stringify(result,null,2)+'\n');writeFileSync(root+'/browser-comparison.json',b,{flag:'wx'});console.log(JSON.stringify({bytes:b.length,sha256:digest(b),totalCaptures:result.totalCaptures,independentTraceComparisons:result.independentTraceComparisons,leftHead333Snapshots:result.leftHead333Snapshots,fieldDomain:domain,nativeRunsPerformed:0},null,2));
