import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(process.argv[2]??'');if(!process.argv[2])throw Error('Usage: node make-cases.mjs <own-board-runtime>');
const json=p=>JSON.parse(readFileSync(p));
const prep=json(join(root,'NATIVE_PREP.json')),manifest=json(join(root,'inputs/manifest.json'));
const {transform}=await import(pathToFileURL(join(root,'inputs/view-math.mjs')).href);
const definitions=prep.board==='water'?[
 {id:'arch07-full-foot-band-crossing',seed:1,ticks:[1008,1009,1013,1019,1020,1021],target:'arch-07',scope:'Observed native support-gap traversal only; painted lintel/height/occlusion not tested'},
 {id:'arch07-left-corner',seed:1,ticks:[1005,1006,1007,1008],target:'arch-07-left-foot:edge-01',eventTick:1006},
 {id:'arch07-right-inner-face',seed:1,ticks:[1011,1012,1013,1014],target:'arch-07-right-foot:edge-04',eventTick:1012},
 {id:'arch07-left-inner-face',seed:1,ticks:[1017,1018,1019,1020],target:'arch-07-left-foot:edge-02',eventTick:1018},
 {id:'arch04-support-face',seed:0,ticks:[696,697,698,699],target:'arch-04-right-foot:edge-01',eventTick:697},
 {id:'right-boundary',seed:0,ticks:[1037,1038,1039,1040],target:'right-4',eventTick:1038},
 {id:'receiver02-capture',seed:2,ticks:[1273,1274,1275],target:'receiver-02',eventTick:1275,scope:'Native IN_BUCKET only; front-rim silhouettes unverified'},
 {id:'receiver03-closest-uncaptured',seed:1,ticks:[1113,1114,1115,1116,1117],target:'receiver-03',scope:'Closest ordinary approach; not a capture or front-rim PASS'},
]:[
 {id:'pillar02-corner',seed:2,ticks:[366,367,368,369],target:'pillar-02:edge-01',eventTick:367},
 {id:'pillar02-front-face',seed:2,ticks:[971,972,973,974],target:'pillar-02:edge-03',eventTick:972},
 {id:'pillar04-side-face',seed:0,ticks:[839,840,841,842],target:'pillar-04:edge-04',eventTick:840},
 {id:'left-boundary',seed:0,ticks:[459,460,461,462],target:'left-3',eventTick:460},
 {id:'receiver01-capture',seed:0,ticks:[886,887,888],target:'receiver-01',eventTick:888,scope:'Native IN_BUCKET only; front-rim silhouettes unverified'},
 {id:'ordinary-lost',seed:2,ticks:[1810,1811,1812],target:'bottom-open'},
];
const traces=new Map();for(const seed of prep.seeds)traces.set(seed,readFileSync(join(root,'runs',`seed-${seed}.jsonl`),'utf8').trim().split('\n').map(s=>JSON.parse(s)));
const cases=definitions.map(d=>({...d,frames:d.ticks.map(t=>{const f=traces.get(d.seed)[t];return {...f,sourceCenterPx:transform(manifest.projection.nativeToSource,f.state.ball.pos),eventsThroughTick:traces.get(d.seed).slice(0,t+1).flatMap(s=>s.events)};})}));
const report={schema:'r4d.p4.transfer.qa.critical-cases.v1',board:prep.board,activeTrial:prep.activeTrial,configSha256:prep.binding.objects.find(f=>f.file==='config.json').sha256,manifestSha256:prep.binding.objects.find(f=>f.file==='manifest.json').sha256,coreCommit:prep.binding.native.commit,sourceP1:prep.binding.acceptedP1Revision,cases};
const bytes=JSON.stringify(report,null,2)+'\n';writeFileSync(join(root,'CRITICAL_CASES.json'),bytes);console.log(JSON.stringify({board:prep.board,cases:cases.length,path:join(root,'CRITICAL_CASES.json'),sha256:createHash('sha256').update(bytes).digest('hex')}));
