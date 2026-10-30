// Seal only the new owned w06 runtime after actual QA.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root='E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w06';
const source='experiments/p5-regenerated-objects/transfer-water-dark/water/qa/technical';
const hash=b=>createHash('sha256').update(b).digest('hex'),parse=p=>JSON.parse(readFileSync(p));
const pin=p=>{const b=readFileSync(p);return{path:p,bytes:b.length,sha256:hash(b)}};
const frozen=parse(root+'/frozen-verification.json'),comparison=parse(root+'/browser-comparison.json'),format=parse(root+'/capture-format.json');
for(const n of ['browser-session.json','browser-session-exit.json'])assert.equal(parse(root+'/'+n).consoleErrors.length,0);
assert.equal(comparison.snapshots,101);assert.equal(comparison.results.every(s=>s.stateConfigRngEventsExact&&s.loadedArtExact),true);assert.equal(format.count,96);
const indexPath=root+'/FILE_INDEX.qa.json';assert(!existsSync(indexPath),'Do not overwrite sealed evidence');
const entries=[];function collect(dir){for(const f of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=dir+'/'+f.name;if(f.isDirectory())collect(p);else entries.push({...pin(p),path:p.slice(root.length+1)});}}
collect(root);writeFileSync(indexPath,JSON.stringify({candidate:'w06',root,finalizedUTC:new Date().toISOString(),entries,totalBytes:entries.reduce((n,e)=>n+e.bytes,0)},null,2)+'\n');
for(const e of entries){const p=pin(root+'/'+e.path);assert.equal(p.bytes,e.bytes);assert.equal(p.sha256,e.sha256);}
const out={candidate:'w06',board:'water',qaParentCommit:'2f983b8823defaa7bd62fdbd89e76ffca4083692',qaBranch:'codex/r4d-p5-regenerated-technical-qa-01',
  report:'REPORT_W06.md',casePlanCommit:'2f983b8823defaa7bd62fdbd89e76ffca4083692',casePlanIndex:pin('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w06-plan-001/FILE_INDEX.qa.json'),
  frozen,actual:{snapshots:101,captures:96,comparison:pin(root+'/browser-comparison.json'),bindings:pin(root+'/binding-comparison.json'),format,fieldDomain:comparison.fieldDomain,fieldDeltaFromW05:comparison.fieldDelta,fieldFixedAcrossStates:true,consoleErrors:0,ownTabsClosed:true,producerPreserved:true},
  verdict:{status:'Scoped actual COMPLETE / visual PARTIAL',newEstablishedTechnicalDefect:false,receiver02SavedPopRegression:'preserved1273–1275+hold',gate07Regression:'preserved',foregroundActualRegions:6,foregroundTotalRegions:11,fullPass:false,
    limitations:['Frog03/06 contacts unavailable in cached seeds0–3','Frog04 rear contact and arch04 selected contact hidden by body/beam','Gates01/02/05/06 dynamic cases unavailable','Five foreground regions dynamic unavailable; rare bevel/foam/contours unverified','Lintel shadow strength/extent/combined support PARTIAL','W05 front-hide NOTE/UNVERIFIED retained']},
  runtimeIndex:{...pin(indexPath),entries:entries.length,totalBytes:entries.reduce((n,e)=>n+e.bytes,0)},newStandaloneOracleRuns:0,newSeeds:0,debuggerProbe:false,serverWrites:0,tokenGranted:false};
const dst=source+'/W06_EVIDENCE_PINS.json';assert(!existsSync(dst));writeFileSync(dst,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({runtimeIndex:out.runtimeIndex,actual:out.actual.snapshots,captures:out.actual.captures},null,2));
