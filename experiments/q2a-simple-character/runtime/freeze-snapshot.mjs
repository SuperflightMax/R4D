import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const name=process.argv[2];
if(!/^[a-z0-9_]+$/.test(name||''))throw Error('Supply a lowercase snapshot name');
const target=path.join(root,'snapshots',name);
if(fs.existsSync(target))throw Error('Snapshot already exists; preservation forbids overwriting');
fs.mkdirSync(target,{recursive:true});
for(const filename of ['runtime','package.json','package-lock.json','README.md'])fs.cpSync(path.join(root,filename),path.join(target,filename),{recursive:true});
const binding=JSON.parse(fs.readFileSync(path.join(root,'runtime/art-binding.json'),'utf8'));
for(const part of Object.values(binding.parts)){
 const relative=part.url.replace(/^\//,'');const destination=path.join(target,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,relative),destination);
}
const metadata=JSON.parse(fs.readFileSync(path.join(root,binding.sourceMetadata),'utf8'));
const rawSources=metadata.sources||[metadata.source];
for(const relative of new Set([binding.sourceMetadata,...rawSources.map(source=>path.posix.normalize(path.posix.dirname(binding.sourceMetadata)+'/'+source)),...(binding.revisionMetadata?[binding.revisionMetadata]:[])])){
 const destination=path.join(target,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,relative),destination);
}
const port=Number(process.argv[3]||4323);
fs.writeFileSync(path.join(target,'README.md'),`# Q2A ${name}\n\nP2: полное движение. Ожидаются личные reviews и решение CTO. Независимые QA и release не открыты.\n\nИз этого каталога, нужен только Node.js (PowerShell):\n\n$env:Q2A_PORT='${port}'\nnode runtime/server.mjs\n\nhttp://127.0.0.1:${port}/runtime/\n\nVendor, PNG, metadata и raw включены; npm ci/сборка/сеть не нужны.\nСтойка, low, walk, jump; выбор наземной цели в полёте; пауза и история кадров.\n`);
fs.writeFileSync(path.join(target,'SNAPSHOT.md'),`# Q2A ${name}\n\nСохранение UTC: ${new Date().toISOString()}. Статус: ${binding.status}.\n\nИз этого каталога (PowerShell):\n\n$env:Q2A_PORT='${port}'\nnode runtime/server.mjs\n\nhttp://127.0.0.1:${port}/runtime/. PixiJS, все используемые PNG, metadata и raw включены; npm ci/сборка/сеть не нужны.\nИменованный кандидат P2, ожидаются личные reviews и CTO gate. Художественный/независимый QA PASS не заявлен. Не перезаписывать snapshot.\n`);
console.log(target);
