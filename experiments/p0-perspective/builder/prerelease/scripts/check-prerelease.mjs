import { createHash } from 'node:crypto';
import { cp, mkdtemp, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const site=path.join(root,'site');
const manifestPath=path.join(root,'manifest.json');
const temp=await mkdtemp(path.join(os.tmpdir(),'r4d-p0-prerelease-check-'));
try{
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  await validate(site,manifest,true);
  const rebuiltSite=path.join(temp,'rebuilt-site');const rebuiltManifest=path.join(temp,'rebuilt-manifest.json');
  const build=spawnSync(process.execPath,[path.join(here,'build-prerelease.mjs'),'--out',rebuiltSite,'--manifest',rebuiltManifest],{encoding:'utf8',maxBuffer:8*1024*1024});
  if(build.status!==0)throw new Error(build.stderr||build.stdout||'Prerelease rebuild failed');
  const rebuilt=JSON.parse(await readFile(rebuiltManifest,'utf8'));await validate(rebuiltSite,rebuilt,true);
  assert(canonical(await readFile(manifestPath)).equals(canonical(await readFile(rebuiltManifest))),'Manifest is not reproducible');
  for(const route of manifest.browserAllowlist){assert((await readFile(path.join(site,...route.split('/')))).equals(await readFile(path.join(rebuiltSite,...route.split('/')))),`${route} is not byte-reproducible`);}
  const probe=path.join(temp,'fail-closed');await cp(site,probe,{recursive:true});await writeFile(path.join(probe,'extra.txt'),'forbidden','utf8');await mustReject(()=>validate(probe,manifest,false),'extra route');await unlink(path.join(probe,'extra.txt'));await unlink(path.join(probe,'qa.html'));await mustReject(()=>validate(probe,manifest,false),'missing route');
  console.log(`PASS: ${manifest.browserAllowlist.length} exact allowlisted routes; source pins/hash/size/byte identity; local links; forbidden-pattern scan; exact fresh rebuild; fail-closed missing/extra probes`);
}finally{await rm(temp,{recursive:true,force:true});}

async function validate(siteRoot,m,verifySources){
  assert(m.schema==='r4d.p0.frozen-prerelease.v1','Unexpected manifest schema');
  assert(m.status==='P0 — результат исследования, ожидает явной приёмки Max; P1 закрыт','Exact status changed');assert(m.publication==='forbidden','Publication gate opened');
  const formal=`assets/formal/formal-reference-v1.${m.sourcePins.formal.sha256}.svg`;
  const expected=['index.html','site.css','assets/reference/03-sun-temple.jpg',formal,'assets/boards/f1.png','assets/boards/f2.png','assets/boards/f3.png','assets/boards/f4.png','assets/failures/d1-single-shot.png','assets/failures/c1-corrected-single-shot.png','assets/failures/f1-qa-failed-composite.png','recipe.html','qa.html'].sort();
  assert(JSON.stringify(m.browserAllowlist)===JSON.stringify(expected),'Manifest allowlist differs from frozen routes');
  const actual=(await listFiles(siteRoot)).sort();assert(JSON.stringify(actual)===JSON.stringify(expected),`Browser tree missing/extra routes: ${JSON.stringify(actual)}`);
  for(const route of expected){const bytes=await readFile(path.join(siteRoot,...route.split('/')));const entry=m.files[route];assert(entry&&entry.size===bytes.length&&entry.sha256===sha(bytes),`${route}: hash/size mismatch`);}
  assert(Object.keys(m.files).sort().join('|')===expected.join('|'),'Manifest file map has missing/extra entries');
  assert(m.byteIdentity.reference.sha256==='f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32','Reference identity changed');
  const boardExpected=['6c9e6c221ebf17cc6f9549b8b43f29cea1f04416beffbe185f9252b17d084e4e','873e58c160e7ecfd0831002b6c5c3cd273693518fe39ea38d2953643c05ed52b','114c16ed5c412191e27175b6a498e109f56f02b9ac302c8b80fc0b237ff836c6','4db1465934ad1e7fb3f831d81b06c7995d02ec38c72ed58b9555e77be8916225'];
  for(let i=0;i<4;i++)assert(m.byteIdentity.boards[`F${i+1}`].sha256===boardExpected[i],`F${i+1} accepted hash changed`);
  if(verifySources)for(const [id,pin] of Object.entries(m.sourcePins)){const bytes=pin.kind==='git-blob'?gitBlob(pin.commit,pin.path):await readFile(pin.path);assert(bytes.length===pin.size&&sha(bytes)===pin.sha256,`${id}: source pin mismatch`);}
  const identity=[['assets/reference/03-sun-temple.jpg','reference'],['assets/boards/f1.png','board-01'],['assets/boards/f2.png','board-02'],['assets/boards/f3.png','board-03'],['assets/boards/f4.png','board-04'],['assets/failures/d1-single-shot.png','d1'],['assets/failures/c1-corrected-single-shot.png','c1'],['assets/failures/f1-qa-failed-composite.png','failedF1'],[formal,'formal']];
  for(const [route,id] of identity)assert((await readFile(path.join(siteRoot,...route.split('/')))).equals(await sourceBytes(m.sourcePins[id])),`${route}: not byte-identical to pinned source`);
  const textRoutes=expected.filter(x=>/\.(?:html|css|svg)$/.test(x));let all='';for(const route of textRoutes){const text=await readFile(path.join(siteRoot,...route.split('/')),'utf8');all+=`\n${text}`;for(const link of links(text,route)){if(link==='data:,')continue;assert(!/^(?:[a-z]+:|\/|\\)/i.test(link),`${route}: non-local link ${link}`);const clean=link.split(/[?#]/)[0];if(!clean)continue;const target=path.posix.normalize(path.posix.join(path.posix.dirname(route),clean));assert(expected.includes(target),`${route}: link outside allowlist ${link}`);}}
  assert(!/(?:file:|(?:^|[^A-Za-z])[A-Za-z]:[\\/]|drive\.google\.com|docs\.google\.com)/i.test(all),'Local/Drive locator leaked into browser tree');
  const urls=[...all.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(x=>x[0]).filter(x=>x!=='http://www.w3.org/2000/svg');assert(urls.length===0,`External URL/runtime found: ${urls[0]}`);assert(!/<script\b/i.test(all),'Runtime script is forbidden');
  assert(!/(?:BEGIN [A-Z ]*PRIVATE KEY|(?:api|secret|token|password)[_-]?key\s*[:=])/i.test(all),'Inline secret pattern found');
  const withoutStatus=all.replaceAll('P0 — результат исследования, ожидает явной приёмки Max; P1 закрыт','');assert(!/\bP[1-9][0-9]*\b/.test(withoutStatus),'Later-stage scope leaked into browser content');
  assert(!/(?:physics|collider|sim-core|шарик)/i.test(all),'Out-of-scope runtime topic leaked into browser content');
  assert((actual.filter(x=>x.startsWith('assets/failures/'))).length===3,'Exactly three failure images required');assert(actual.filter(x=>x.endsWith('.svg')).length===1,'Exactly one formal SVG required');
}
async function sourceBytes(pin){return pin.kind==='git-blob'?gitBlob(pin.commit,pin.path):readFile(pin.path);}
function gitBlob(commit,file){const repo=path.resolve(root,'..','..','..','..');const r=spawnSync('git',['show',`${commit}:${file}`],{cwd:repo,encoding:null,maxBuffer:64*1024*1024});if(r.status!==0)throw new Error(`Cannot read pinned blob ${commit}:${file}`);return Buffer.from(r.stdout);}
async function listFiles(rootDir,dir=rootDir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())out.push(...await listFiles(rootDir,f));else out.push(path.relative(rootDir,f).replaceAll('\\','/'));}return out;}
function links(text,route){const found=[];if(route.endsWith('.html'))for(const m of text.matchAll(/\b(?:href|src)="([^"]+)"/g))found.push(m[1]);if(route.endsWith('.css'))for(const m of text.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g))found.push(m[1]);return found;}
async function mustReject(fn,label){let rejected=false;try{await fn();}catch{rejected=true;}assert(rejected,`Checker did not reject ${label}`);}
function canonical(b){return Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');}function sha(b){return createHash('sha256').update(b).digest('hex');}function assert(c,m){if(!c)throw new Error(m);}
