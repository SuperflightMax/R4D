import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('.',import.meta.url));
const revision='3c27b07d489f68b3d7d8b4c8beabd35c51402fd4';
const expectedTree='0c60f912f11cae1ce5e5cf99a6a8ce8fafc70bc4';
const sourceRoot='experiments/q2a-simple-character/snapshots/p2_candidate_c2';
const route='review/r4d/q2a-simple-character';
const destination=path.join(root,'route-tree',route);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:8*1024*1024});
if(git('rev-parse',`${revision}:${sourceRoot}`).toString().trim()!==expectedTree)throw Error('Unexpected accepted source tree');
if(!fs.existsSync(path.join(root,'..','CTO_ACCEPTANCE_P2_C2.md')))throw Error('Acceptance document must exist before packaging');
if(fs.existsSync(destination))throw Error('Route tree already exists; do not overwrite a reviewable package');
const files=[];
function source(relative){const gitPath=sourceRoot+'/'+relative;return {gitPath,blob:git('rev-parse',`${revision}:${gitPath}`).toString().trim(),bytes:git('show',`${revision}:${gitPath}`)}}
function write(relative,original,bytes=original.bytes,transformation=null){
 bytes=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8');
 const target=path.join(destination,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
 files.push({path:route+'/'+relative,bytes:bytes.length,sha256:hash(bytes),mode:transformation?'transformation':'exact_git_blob',source:{commit:revision,path:original.gitPath,blob:original.blob,bytes:original.bytes.length,sha256:hash(original.bytes)},...(transformation?{transformation}: {})});
}
function replaceOnce(text,from,to){if(text.split(from).length!==2)throw Error('Expected one source match: '+from.slice(0,75));return text.replace(from,to)}

const index=source('runtime/index.html');
let html=index.bytes.toString('utf8');
html=replaceOnce(html,'href="/runtime/style.css"','href="./runtime/style.css"');
html=replaceOnce(html,'src="/runtime/vendor/pixi.min.js"','src="./runtime/vendor/pixi.min.js"');
html=replaceOnce(html,'src="/runtime/main.js"','src="./runtime/main.js"');
html=replaceOnce(html,'    <label><input id="guides" type="checkbox"> Ориентиры</label>\n','');
const surfaceLine=html.split('\n').find(line=>line.includes('<summary>Диагностика поверхностей</summary>'));
if(!surfaceLine)throw Error('Missing diagnostic selector');
html=replaceOnce(html,surfaceLine+'\n','');
const about=`  <details class="note"><summary>Об опыте и ограничениях</summary>
    <p>Q2A принят CTO как завершённый PoC с ограничениями. Два независимых QA получили PASS в проверенном объёме. Это не художественное совершенство и не доказательство универсальности метода.</p>
    <p>Остаются резкий сгиб колена, линия шорт, жёсткость плеча и ограниченная видимость дальней стороны. В воспроизведённых переходах отмечены сильные сгибы стопы: 49,20° при носочной опоре и 61,26° у свободной стопы; условия контакта различаются. Есть субпиксельное пересечение свободной стопы с землёй.</p>
    <p>Проверки выполнены агентами в браузере; реальный телефон/touch, каждый момент команды и все кадры не проверены.</p>
    <p>Принятый source: <code>${revision}</code><br>Frozen tree: <code>${expectedTree}</code></p>
  </details>
`;
html=replaceOnce(html,'</main>',about+'</main>');
html=replaceOnce(html,'</title>','</title>\n<style>details code{overflow-wrap:anywhere}details p{max-width:80ch}</style>');
write('index.html',index,html,{reason:'Public route entry/wrapper: route-relative asset URLs, no debug selector or skeleton checkbox; accepted PoC description/source/tree/limitations after canonical viewer. Canonical control IDs and labels retained.'});

const main=source('runtime/main.js');let js=main.bytes.toString('utf8');
js=replaceOnce(js,"fetch('/runtime/art-binding.json')","fetch(new URL('./art-binding.json',import.meta.url))");
js=replaceOnce(js,"  document.querySelector('#guides').checked=false;\n",'');
js=replaceOnce(js,"document.querySelector('#guides').checked=true;\n",'');
const mode="const mode=document.querySelector('#surface').value;mesh.visible=mode==='all'||id===mode||(mode==='pelvis'&&(id==='body'||id==='leg_near'))||(mode==='pelvis_far'&&(id==='body'||id==='leg_far'));";
js=replaceOnce(js,mode,'mesh.visible=true;');
const debugStart=js.indexOf("  if(document.querySelector('#guides').checked){\n");
const debugEnd=js.indexOf('  scrub.max=',debugStart);
if(debugStart<0||debugEnd<0)throw Error('Diagnostic guide block not found');
js=js.slice(0,debugStart)+js.slice(debugEnd);
const observerStart=js.indexOf('// Read-only observations for reproducible self-checks; commands use the UI.');
if(observerStart<0)throw Error('Read-only debug observer not found');js=js.slice(0,observerStart);
js=replaceOnce(js,'Диагностическая растровая сборка · ${manifest.version} · отклонения от контракта сохранены; художественная оценка ожидается','Q2A · ${manifest.version} · PoC принят с ограничениями');
write('runtime/main.js',main,js,{reason:'Only module-relative binding fetch, accepted status copy and removal of debug-only surface visibility/skeleton overlay/window.q2a observer. All surfaces remain visible, matching accepted default. Geometry generation, camera, ticker, history, commands and rendering formulas retained.',removedDiagnosticSourceBytes:debugEnd-debugStart});
for(const name of ['motion.js','pose.js','style.css'])write('runtime/'+name,source('runtime/'+name));
const vendor=source('runtime/vendor/pixi.min.js');
const vendorText=vendor.bytes.toString('utf8');
const cleanedVendor=vendorText.replace(/\n?\/\/# sourceMappingURL=[^\r\n]*(?:\r?\n)?$/,'');
write('runtime/vendor/pixi.min.js',vendor,cleanedVendor===vendorText?vendor.bytes:cleanedVendor,cleanedVendor===vendorText?null:{reason:'Remove trailing source-map directive; library executable code unchanged, source map excluded.'});
write('runtime/vendor/PIXI-LICENSE.txt',source('runtime/vendor/PIXI-LICENSE.txt'));

const binding=source('runtime/art-binding.json');const original=JSON.parse(binding.bytes);
const publicBinding={version:original.version,scale:original.scale,translation:original.translation,rig:original.rig,parts:{}};
for(const [id,part]of Object.entries(original.parts)){
 if(!/^\/art\/parts\/c1_arms01\/[a-z_]+\.png$/.test(part.url))throw Error('Unexpected asset URL');
 publicBinding.parts[id]={...part,url:'.'+part.url};
 write(part.url.slice(1),source(part.url.slice(1)));
}
write('runtime/art-binding.json',binding,JSON.stringify(publicBinding,null,2)+'\n',{reason:'Retain all numerical rig/scale/translation/part crop/offset/layer data and accepted version; change only PNG URLs to route-relative addresses, omit unused private provenance/diagnostic fields. No anatomical or motion values changed.'});
files.sort((a,b)=>a.path.localeCompare(b.path));
const manifest={format:'r4d-q2a-route-provenance-v1',sourceCommit:revision,sourceSnapshot:sourceRoot,sourceTree:expectedTree,route:'/'+route+'/',acceptance:{path:'experiments/q2a-simple-character/CTO_ACCEPTANCE_P2_C2.md',sha256:hash(fs.readFileSync(path.join(root,'..','CTO_ACCEPTANCE_P2_C2.md')))},totalFiles:files.length,totalBytes:files.reduce((sum,f)=>sum+f.bytes,0),files};
const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(root,'provenance.json'),manifestBytes);
console.log(JSON.stringify({routeTree:'release-package/route-tree/'+route,totalFiles:manifest.totalFiles,totalBytes:manifest.totalBytes,manifestSha256:hash(manifestBytes)},null,2));
