import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const pkg=path.resolve('experiments/q2a-simple-character/release-package');
const out=path.resolve('experiments/q2a-simple-character/qa/release-package-technical');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const list=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(d,e.name)):[path.join(d,e.name)]);
const raw=fs.readFileSync(path.join(pkg,'provenance.json')),manifest=JSON.parse(raw);
const routeRoot=path.join(pkg,'route-tree'),prefix='review/r4d/q2a-simple-character/';
const actual=list(routeRoot).map(p=>p.slice(routeRoot.length+1).replaceAll('\\','/')).sort();
const inventory=Object.fromEntries(actual.map(p=>[p,{sha256:sha(fs.readFileSync(path.join(routeRoot,p))),bytes:fs.statSync(path.join(routeRoot,p)).size}]));
const current={manifestSha256:sha(raw),files:inventory,totalFiles:actual.length,totalBytes:Object.values(inventory).reduce((a,f)=>a+f.bytes,0)};
if(process.argv[2]==='after'){
 const before=JSON.parse(fs.readFileSync(path.join(out,'before.json')));
 const unchanged=JSON.stringify(before)===JSON.stringify(current);
 fs.writeFileSync(path.join(out,'after.json'),JSON.stringify({...current,unchanged},null,2));console.log({unchanged,...current,files:actual.length});process.exit(unchanged?0:1);
}
if(fs.existsSync(path.join(out,'before.json'))){if(JSON.stringify(JSON.parse(fs.readFileSync(path.join(out,'before.json'))))!==JSON.stringify(current))throw Error('Package changed since initial evidence');}
else fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(current,null,2));
const source='3c27b07d489f68b3d7d8b4c8beabd35c51402fd4',snap='experiments/q2a-simple-character/snapshots/p2_candidate_c2';
const git=(args)=>execFileSync('git',args,{maxBuffer:16e6});
const sourceFile=p=>git(['show',source+':'+snap+'/'+p]);
const result={...current,files:[],errors:[],whitelist:[],binding:{},mainCore:{}};
const assert=(ok,why)=>{if(!ok)result.errors.push(why)};
assert(manifest.sourceCommit===source,'sourceCommit');
assert(manifest.sourceSnapshot===snap,'sourceSnapshot');
assert(manifest.sourceTree===git(['rev-parse',source+':'+snap]).toString().trim(),'sourceTree');
assert(manifest.acceptance.sha256===sha(fs.readFileSync('experiments/q2a-simple-character/CTO_ACCEPTANCE_P2_C2.md')),'acceptance sha');
assert(JSON.stringify(actual)===JSON.stringify(manifest.files.map(f=>f.path).sort()),'manifest inventory');
const whitelist=['index.html','runtime/art-binding.json','runtime/main.js','runtime/motion.js','runtime/pose.js','runtime/style.css','runtime/vendor/pixi.min.js','runtime/vendor/PIXI-LICENSE.txt',...['arm_far','arm_near','body','foot_far','foot_near','hand_far','hand_near','head','leg_far','leg_near'].map(p=>'art/parts/c1_arms01/'+p+'.png')].map(p=>prefix+p).sort();
assert(JSON.stringify(actual)===JSON.stringify(whitelist),'public whitelist differs');result.whitelist=whitelist;
assert(current.totalFiles===manifest.totalFiles&&current.totalBytes===manifest.totalBytes,'totals');
for(const f of manifest.files){
 const p=path.join(routeRoot,f.path),bytes=fs.readFileSync(p),src=git(['show',source+':'+f.source.path]);
 const blob=crypto.createHash('sha1').update(Buffer.from(`blob ${src.length}\0`)).update(src).digest('hex');
 assert(f.source.commit===source&&f.source.path.startsWith(snap+'/'),'source reference '+f.path);
 assert(blob===f.source.blob&&sha(src)===f.source.sha256&&src.length===f.source.bytes,'source bytes '+f.path);
 assert(bytes.length===f.bytes&&sha(bytes)===f.sha256,'package bytes '+f.path);
 if(f.mode==='exact_git_blob')assert(bytes.equals(src),'exact mismatch '+f.path);
 else assert(['index.html','runtime/art-binding.json','runtime/main.js','runtime/vendor/pixi.min.js'].includes(f.path.slice(prefix.length)),'unexpected transformed file');
 const http=await fetch('http://127.0.0.1:4340/'+f.path);const delivered=Buffer.from(await http.arrayBuffer());
 assert(http.status===200&&delivered.equals(bytes),'HTTP bytes '+f.path);
 result.files.push({path:f.path,bytes:bytes.length,sha256:sha(bytes),sourceBlob:blob,mode:f.mode,http:http.status,httpEqual:delivered.equals(bytes)});
}
const pub=p=>fs.readFileSync(path.join(routeRoot,prefix,p),'utf8');
const oldBinding=JSON.parse(sourceFile('runtime/art-binding.json')),newBinding=JSON.parse(pub('runtime/art-binding.json'));
for(const key of ['version','scale','translation','rig']){result.binding[key]=JSON.stringify(oldBinding[key])===JSON.stringify(newBinding[key]);assert(result.binding[key],'binding '+key)}
assert(JSON.stringify(Object.keys(oldBinding.parts).sort())===JSON.stringify(Object.keys(newBinding.parts).sort()),'part IDs');
for(const id of Object.keys(oldBinding.parts)){
 const old={...oldBinding.parts[id]},next={...newBinding.parts[id]};
 assert(next.url==='./'+old.url.slice(1),'PNG route '+id);delete old.url;delete next.url;
 assert(JSON.stringify(old)===JSON.stringify(next),'part geometry '+id);
}
result.binding.removedKeys=Object.keys(oldBinding).filter(k=>!(k in newBinding));
assert(Object.keys(newBinding).every(k=>k in oldBinding),'new binding fields');
const oldMain=sourceFile('runtime/main.js').toString(),newMain=pub('runtime/main.js');
const sections=[['mesh construction','  for(const id of order){','  realArt=true;'],['commands/history','function command(action)','function render(){'],['ticker','app.ticker.add(ticker=>{','// Read-only observations']];
for(const [name,start,end] of sections){const a=oldMain.slice(oldMain.indexOf(start),oldMain.indexOf(end));let stop=newMain.indexOf(end);if(stop<0)stop=newMain.length;const b=newMain.slice(newMain.indexOf(start),stop);result.mainCore[name]=a.trim()===b.trim();assert(result.mainCore[name],'main '+name)}
let normalized=oldMain.replace("fetch('/runtime/art-binding.json')","fetch(new URL('./art-binding.json',import.meta.url))")
 .replace('Диагностическая растровая сборка · ${manifest.version} · отклонения от контракта сохранены; художественная оценка ожидается','Q2A · ${manifest.version} · PoC принят с ограничениями')
 .replace(/^.*document\.querySelector\('#guides'\)\.checked=.*\n/gm,'')
 .replace(/const mode=document\.querySelector\('#surface'\)\.value;mesh\.visible=.*?;const data=/,'mesh.visible=true;const data=');
const overlayStart=normalized.indexOf("  if(document.querySelector('#guides').checked){"),overlayEnd=normalized.indexOf('  scrub.max=',overlayStart);
assert(overlayStart>=0&&overlayEnd>overlayStart,'overlay anchors');normalized=normalized.slice(0,overlayStart)+normalized.slice(overlayEnd);
normalized=normalized.slice(0,normalized.indexOf('// Read-only observations'));
result.mainCore.fullAllowedTransform=normalized.trim()===newMain.trim();assert(result.mainCore.fullAllowedTransform,'main unexpected change');
assert(sourceFile('runtime/vendor/pixi.min.js').toString().replace(/\n?\/\/# sourceMappingURL=.*(?:\r?\n)?$/,'').trimEnd()===pub('runtime/vendor/pixi.min.js').trimEnd(),'pixi executable bytes');
const textFiles=actual.filter(p=>!p.endsWith('.png'));
for(const p of textFiles){const text=fs.readFileSync(path.join(routeRoot,p),'utf8');assert(!/sourceMappingURL\s*=|[A-Z]:[\\/](?:Users|dev)\b|127\.0\.0\.1|localhost|sk-[A-Za-z0-9]{20}/i.test(text),'private/debug string '+p)}
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({...result,files:result.files.length,whitelist:result.whitelist.length},null,2));
process.exitCode=result.errors.length?1:0;
