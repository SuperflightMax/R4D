import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=process.cwd(), out=path.resolve('experiments/q2a-simple-character/qa/technical-p2-c2');
const snap='experiments/q2a-simple-character/snapshots/p2_candidate_c2';
const source='3c27b07d489f68b3d7d8b4c8beabd35c51402fd4';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32e6}).trim();
const hash=b=>crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const inventory=()=>Object.fromEntries(git('ls-files','-z','experiments').split('\0').filter(p=>p&&!/QA|qa\//i.test(p)).map(p=>[p,hash(fs.readFileSync(p))]));
if(process.argv[2]==='after'){
 const before=JSON.parse(fs.readFileSync(path.join(out,'preservation-before.json'))),after=inventory();
 const changes=Object.keys(before).filter(p=>before[p]!==after[p]);
 fs.writeFileSync(path.join(out,'preservation-after.json'),JSON.stringify({changes,files:Object.keys(before).length,status:git('status','--short')},null,2));
 console.log({changes,files:Object.keys(before).length});process.exit();
}
if(!fs.existsSync(path.join(out,'preservation-before.json')))fs.writeFileSync(path.join(out,'preservation-before.json'),JSON.stringify(inventory()));
const exact=[];
for(const row of git('ls-tree','-r',source,'--',snap).split('\n')){
 const [,sha,p]=row.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/); const local=fs.readFileSync(p);
 const res=await fetch('http://127.0.0.1:4333/'+p.slice(snap.length+1)); const remote=Buffer.from(await res.arrayBuffer());
 exact.push({path:p.slice(snap.length+1),sha,local:hash(local),http:res.status,served:hash(remote)});
}
const manifest=JSON.parse(fs.readFileSync(snap+'/runtime/art-binding.json'));
const {Motion}=await import(pathToFileURL(path.resolve(snap,'runtime/motion.js')));
const {bind,setMeasuredBind,mapPoint}=await import(pathToFileURL(path.resolve(snap,'runtime/pose.js')));
setMeasuredBind(manifest.rig);
const metrics={frames:0,maxLengthError:0,maxSupportDrift:0,maxSupportYError:0,maxCommandPoseDelta:0,maxFootAngle:0,maxAnkleRelative:0,maxFreeSolePenetration:0,minQ:1,maxQ:0,stages:{},supports:{},failed:[],low:[],landGoals:[],jumpRejects:0,restoreEquality:true};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const joints=p=>['near','far'].flatMap(s=>['hip','knee','ankle','shoulder','elbow','wrist'].flatMap(k=>p[s][k]));
let prev=null;
function sample(m,label){
 const s=m.s,p=m.pose(); metrics.frames++;metrics.minQ=Math.min(metrics.minQ,s.q);metrics.maxQ=Math.max(metrics.maxQ,s.q);
 metrics.stages[s.stage]=(metrics.stages[s.stage]||0)+1;
 for(const side of ['near','far']){
  for(const [a,b] of [['hip','knee'],['knee','ankle'],['shoulder','elbow'],['elbow','wrist']])metrics.maxLengthError=Math.max(metrics.maxLengthError,Math.abs(dist(p[side][a],p[side][b])-dist(bind[side][a],bind[side][b])));
  const f=s.feet[side],type=f.support;metrics.supports[type]=(metrics.supports[type]||0)+1;
  const dorsi=Math.atan2(p[side].knee[0]-p[side].ankle[0],p[side].ankle[1]-p[side].knee[1])*180/Math.PI-f.angle*180/Math.PI;
  const metric=s.contacts[side]?'maxContactDorsi':'maxFreeDorsi';
  if(dorsi>(metrics[metric]||0)){metrics[metric]=dorsi;metrics[metric+'Case']={label,side,stage:s.stage,time:s.time,q:s.q,support:type,state:m.save()};}
  metrics.maxFootAngle=Math.max(metrics.maxFootAngle,Math.abs(f.angle)*180/Math.PI);
  const b=bind[side],c=p[side],angle=(v,w)=>Math.atan2(v[1]-w[1],v[0]-w[0]);
  let rel=angle(c.knee,c.ankle)-angle(b.knee,b.ankle)-c.footAngle;rel=Math.atan2(Math.sin(rel),Math.cos(rel));
  const degrees=Math.abs(rel)*180/Math.PI;
  if(degrees>metrics.maxAnkleRelative){metrics.maxAnkleRelative=degrees;metrics.maxAnkleCase={label,side,time:s.time,stage:s.stage,goal:s.goal,q:s.q,support:type,state:m.save()};}
  metrics.maxAnkleByStage??={};metrics.maxAnkleByStage[s.stage]=Math.max(metrics.maxAnkleByStage[s.stage]||0,degrees);
  const points={toe:mapPoint('foot_'+side,b.toe,p),heel:mapPoint('foot_'+side,b.heel,p),flat:mapPoint('foot_'+side,b.ankle,p)};
  if(s.contacts[side]){
   const actual=points[type];if(!actual)metrics.failed.push({label,error:'contact without declared support',stage:s.stage});
   else {metrics.maxSupportYError=Math.max(metrics.maxSupportYError,Math.abs(actual[1]-b[type==='flat'?'ankle':type][1]));
    if(prev&&prev.s.contacts[side]&&prev.s.feet[side].support===type&&JSON.stringify(prev.s.feet[side].anchor)===JSON.stringify(f.anchor))metrics.maxSupportDrift=Math.max(metrics.maxSupportDrift,dist(actual,prev.points[side][type]));}
  }else metrics.maxFreeSolePenetration=Math.max(metrics.maxFreeSolePenetration,points.toe[1]-bind.ground,points.heel[1]-bind.ground);
 }
 const points=Object.fromEntries(['near','far'].map(side=>[side,Object.fromEntries(['toe','heel','ankle'].map(k=>[k==='ankle'?'flat':k,mapPoint('foot_'+side,bind[side][k],p)]))]));
 prev={s:m.save(),points};
}
function advance(m,seconds,label){for(let i=0;i<Math.round(seconds*120);i++){m.tick(1/120);sample(m,label)}}
function cmd(m,a,label){const before=joints(m.pose()),stage=m.s.stage,accepted=m.command(a),after=joints(m.pose());metrics.maxCommandPoseDelta=Math.max(metrics.maxCommandPoseDelta,...after.map((v,i)=>Math.abs(v-before[i])));if(a==='jump'&&stage!=='ground'){if(accepted)metrics.failed.push({label,error:'double jump accepted',stage});else metrics.jumpRejects++}return accepted}
function scenario(label,steps){const m=new Motion();prev=null;for(const [action,secs] of steps){cmd(m,action,label);advance(m,secs,label)}return m}
scenario('queue1',[['idle',1],['low',2],['walk',2.3],['idle',1.8],['jump',2.4],['idle',1]]);
scenario('queue2',[['walk',2.1],['low',1.6],['jump',.8],['walk',1.5],['jump',.85],['low',2.4]]);
for(const start of ['idle','low','walk'])for(const goal of ['idle','walk','low']){
 const m=scenario(start+'->flight->'+goal,[[start,2],['jump',.65]]);
 if(m.s.stage!=='flight')metrics.failed.push({start,goal,error:'flight not reached'});
 cmd(m,'jump','double in flight');cmd(m,goal,'flight goal');advance(m,2,'landing');
 metrics.landGoals.push({start,goal,actual:m.s.goal,stage:m.s.stage});
 if(m.s.goal!==goal||m.s.stage!=='ground')metrics.failed.push({start,goal,error:'landing goal failed'});
}
for(const delay of [1/120,.025,.075,.125,.26,.4,.7,1.2])for(const action of ['walk','jump']){
 const m=scenario('interrupt '+delay+' '+action,[['idle',.5],['low',delay],[action,2.5],['low',3]]);
 metrics.low.push({delay,action,q:m.s.q,pelvisY:m.pose().pelvis[1]});
}
// Vary command times and carry velocities/contacts through restores, without a fixture implementation.
let seed=81473; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
const m=new Motion();prev=null;
for(let n=0;n<180;n++){
 const a=['idle','low','walk','jump'][Math.floor(random()*4)];cmd(m,a,'random '+n);advance(m,.025+random()*1.4,'random '+n);
 if(n%13===0){const saved=m.save(),copy=new Motion();copy.restore(saved);m.tick(1/120);copy.tick(1/120);metrics.restoreEquality&&=JSON.stringify(m.save())===JSON.stringify(copy.save());sample(m,'restore');}
}
const p1='experiments/q2a-simple-character/snapshots/p1_candidate_c2_arms01';
const pngP1=Object.values(manifest.parts).map(p=>({url:p.url,equal:hash(fs.readFileSync(snap+p.url))===hash(fs.readFileSync(p1+p.url))}));
const result={source,tree:git('rev-parse',source+':'+snap),version:manifest.version,exact,metrics,pngP1};
fs.writeFileSync(path.join(out,'independent-results.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,exact:{files:exact.length,mismatches:exact.filter(x=>x.sha!==x.local||x.sha!==x.served||x.http!==200)}},null,2));
