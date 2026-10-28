import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, pins, verifyInputs, verifyCore, canonicalLF, sha256 } from './pins.mjs';
import { scanBrowserText, PINNED_PIXI_SHA256 } from './scan-browser-text.mjs';

const argument = name => { const i=process.argv.indexOf(name); if(i<0 || !process.argv[i+1]) throw new Error(`Required argument ${name}`); return process.argv[i+1]; };
const output=path.resolve(argument('--output'));
const coreRoot=path.resolve(argument('--core-root'));
const pixiRoot=path.resolve(argument('--pixi-root'));
const bundlerRoot=path.resolve(argument('--bundler-root'));
const sourcePath=path.resolve(argument('--source'));
const version=argument('--version');
if(!/^p2-jungle-static-[a-z0-9-]+$/.test(version)) throw new Error('Invalid candidate version');
if(!output.replaceAll('\\','/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/')) throw new Error('Build output must stay in P2 runtime on E');
if(existsSync(output)) throw new Error('Candidate output already exists; do not overwrite a frozen/failed attempt');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const sourceCommit=git('rev-parse','HEAD');
if(git('--no-optional-locks','status','--porcelain=v1')) throw new Error('Freeze requires a clean source commit');
verifyInputs();
const coreSrc=verifyCore(coreRoot);
const pixiPackage=JSON.parse(readFileSync(path.join(pixiRoot,'package.json'),'utf8'));
const bundlerPackage=JSON.parse(readFileSync(path.join(bundlerRoot,'package.json'),'utf8'));
if(pixiPackage.version!=='8.22.0' || bundlerPackage.version!=='1.2.15') throw new Error('Unexpected existing dependency version');
const sourceBytes=readFileSync(sourcePath);
if(sha256(sourceBytes)!==pins.sourceSha256) throw new Error('Wrong source JPG');
const packet=path.join(root,'source-packets/jungle-art-v2');
const art=JSON.parse(readFileSync(path.join(packet,'manifest.json'),'utf8'));
if(art.mode!=='art' || art.occluders.length!==4) throw new Error('Expected exact Jungle v2 four-object art packet');
for(const asset of [art.ball,art.shadow]) {
  const bytes=readFileSync(path.join(packet,asset.file));
  if(bytes.length!==asset.bytes || sha256(bytes)!==asset.sha256) throw new Error(`Wrong asset ${asset.file}`);
}
const route='review/r4d/p2-free-approach';
const browserRoot=path.join(output,'bundle',route);
mkdirSync(browserRoot,{recursive:true});
const put=(relative,bytes)=>{ const target=path.join(browserRoot,relative); mkdirSync(path.dirname(target),{recursive:true}); writeFileSync(target,bytes); };
const copy=(relative,from)=>put(relative,readFileSync(from));
const moduleEmissions=[];
function emit(source,output,references=[]){
  const sourceBytes=readFileSync(path.join(root,source));
  let text=sourceBytes.toString('utf8');
  for(const [before,after] of references){
    if(text.split(before).length!==2) throw new Error(`Expected one declared reference in ${source}: ${before}`);
    text=text.replace(before,after);
  }
  put(output,text);
  moduleEmissions.push({source,output,sourceGitBlob:git('rev-parse',`HEAD:experiments/p2-free-approach/builder/${source}`),sourceCanonicalLfSha256:sha256(canonicalLF(sourceBytes)),references});
}
emit('index.html','index.html',[
  ['"pixi.js":"./vendor/pixi.mjs"','"pixi.js":"./vendor/pixi.js"'],
  ['src="./src/main.mjs"','src="./src/main.js"'],
]);
emit('src/main.mjs','src/main.js',[
  ["from '../runtime/sim-core.mjs'","from '../runtime/sim-core.js'"],
  ["from './controller.mjs'","from './controller.js'"],
  ["from './playback-clock.mjs'","from './playback-clock.js'"],
  ["from '../inputs/view-math.mjs'","from '../inputs/view-math.js'"],
]);
emit('src/controller.mjs','src/controller.js');
emit('src/playback-clock.mjs','src/playback-clock.js');
emit('inputs/view-math.mjs','inputs/view-math.js');
for(const file of ['style.css','inputs/config.json']) copy(file,path.join(root,file));
const accepted=JSON.parse(readFileSync(path.join(root,'inputs/manifest.json'),'utf8'));
// Keep every accepted projection/domain number. Replace only the local JPG path.
accepted.source={sha256:pins.sourceSha256,width:accepted.source.width,height:accepted.source.height,readOnly:true,url:'source/01-jungle.jpg'};
put('inputs/manifest.json',JSON.stringify(accepted,null,2)+'\n');
put('source/01-jungle.jpg',sourceBytes);
const mainBlob=git('rev-parse','HEAD:experiments/p2-free-approach/builder/src/main.mjs');
art.status='STATIC_CANDIDATE_VISUAL_UNVERIFIED';
art.provenance.sourcePacketSha256=sha256(readFileSync(path.join(packet,'manifest.json')));
art.provenance.sourcePacketConsumerGitBlob=art.provenance.consumerGitBlob;
art.provenance.consumerGitBlob=mainBlob;
art.provenance.candidate=version;
delete art.provenance.runtimeExecuted;
put('assets/manifest.json',JSON.stringify(art,null,2)+'\n');
for(const asset of [art.ball,art.shadow]) copy(`assets/files/${asset.file}`,path.join(packet,asset.file));
const pixi=readFileSync(path.join(pixiRoot,'dist/pixi.min.mjs'),'utf8').replace(/^\/\/[#@]\s*sourceMappingURL=.*$/gm,'');
put('vendor/pixi.js',pixi);
copy('vendor/PIXI-LICENSE.txt',path.join(pixiRoot,'LICENSE'));
const wrapper=path.join(output,'core-entry.mjs');
writeFileSync(wrapper,`export { createSimRunSession, stepSimRunSession, timeoutSimRunSession, runHeadlessOnce } from ${JSON.stringify(path.join(coreSrc,'index.ts').replaceAll('\\','/'))};\n`);
const {build}=await import(pathToFileURL(path.join(bundlerRoot,'dist/index.mjs')).href);
await build({
  input:wrapper,platform:'browser',logLevel:'silent',
  plugins:[{name:'pinned-core-js-to-ts',resolveId(specifier,importer){
    if(importer && importer.replaceAll('\\','/').startsWith(coreSrc.replaceAll('\\','/')) && /^\.\.?\/.+\.js$/.test(specifier)) {
      const target=path.resolve(path.dirname(importer),specifier.replace(/\.js$/,'.ts'));
      if(existsSync(target)) return target;
    }
  }}],
  output:{file:path.join(browserRoot,'runtime/sim-core.js'),format:'esm',sourcemap:false,minify:true,comments:false},
});
unlinkSync(wrapper);
const compiledCore=readFileSync(path.join(browserRoot,'runtime/sim-core.js'));
const metadata={schema:'r4d.p2.static-metadata.v1',candidate:version,sourceCommit,coreCommit:pins.coreCommit,compiledCoreSha256:sha256(compiledCore),p1Commit:pins.p1Commit,configSha256:pins.configSha256,projectionSha256:pins.projectionSha256,sourceSha256:pins.sourceSha256,pixiVersion:pixiPackage.version,pixiSha256:sha256(Buffer.from(pixi)),assetPacket:'jungle-art-v2',limitations:'Only four occluders; scene/art quality awaits independent visual review'};
put('metadata.json',JSON.stringify(metadata,null,2)+'\n');
const collect=(dir,prefix='')=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?collect(path.join(dir,entry.name),prefix+entry.name+'/'):[prefix+entry.name]);
const privacyScan=[];
const files=collect(browserRoot).sort().map(relative=>{
  if(/\.(?:ts|tsx|map|py|ps1|sh)$/.test(relative)) throw new Error('Unexpected source/map/script in browser tree');
  const bytes=readFileSync(path.join(browserRoot,relative));
  if(/\.(?:js|mjs|json|html|css|txt)$/.test(relative)) {
    const audit=scanBrowserText(relative,bytes);
    if(audit.violations.length) throw new Error(`Private/local source reference in ${relative}: ${JSON.stringify(audit.violations)}`);
    privacyScan.push({path:relative,...audit});
  }
  return {path:relative,bytes:bytes.length,sha256:sha256(bytes),kind:relative==='runtime/sim-core.js'?'authorized-private-compiled-runtime':'public-scene-or-asset'};
});
const treeSha256=sha256(Buffer.from(JSON.stringify(files)+'\n'));
const manifest={schema:'r4d.p2.static-build.v1',status:'FROZEN_PENDING_INDEPENDENT_QA',candidate:version,sourceCommit,route:'/'+route+'/',sourceInputs:{...pins,leadBase:'ec090addd2f261b4f4f2b5abd8c742df4672d115',artSourceCommit:'e217cd139fbda153261a69977fe590867cbf57ed'},moduleEmissions,privacyScan:{pinnedPixiSha256:PINNED_PIXI_SHA256,files:privacyScan},mime:{extension:'.js',expected:'application/javascript',basis:'Existing mapping observed read-only; no server changes; actual HTTP unverified'},dependencies:{pixi:pixiPackage.version,bundler:bundlerPackage.version,node:process.version},core:{commit:pins.coreCommit,sourceTree:execFileSync('git',['rev-parse',`${pins.coreCommit}:packages/sim-core`],{cwd:coreRoot,encoding:'utf8'}).trim(),compiledSha256:sha256(compiledCore),emittedPath:'runtime/sim-core.js',sourceOrMapsIncluded:false},treeDigestRule:'SHA256(JSON.stringify(sorted per-file records)+LF)',treeSha256,fileCount:files.length,totalBytes:files.reduce((sum,f)=>sum+f.bytes,0),files,limitations:['Only four source-aligned occluders; other 21 obstacles/railings/basket rims uncovered','No browser view or artistic PASS is implied by compilation','New source/build bytes require fresh independent TQA/VQA; old results are baseline only','Release requires an exact Lead gate; no external write performed']};
writeFileSync(path.join(output,'BUILD_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({candidate:version,sourceCommit,browserRoot,manifest:path.join(output,'BUILD_MANIFEST.json'),treeSha256,fileCount:manifest.fileCount,totalBytes:manifest.totalBytes,manifestSha256:sha256(readFileSync(path.join(output,'BUILD_MANIFEST.json')))}));
