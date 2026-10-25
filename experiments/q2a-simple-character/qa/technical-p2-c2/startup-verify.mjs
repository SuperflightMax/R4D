import fs from 'node:fs';
import crypto from 'node:crypto';
const dir=new URL('.',import.meta.url),result=JSON.parse(fs.readFileSync(new URL('independent-results.json',dir)));
const hash=b=>crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const served=[];
for(const file of result.exact){const r=await fetch('http://127.0.0.1:4334/'+file.path);const b=Buffer.from(await r.arrayBuffer());served.push({path:file.path,status:r.status,equal:hash(b)===file.sha});}
fs.writeFileSync(new URL('startup-4334.json',dir),JSON.stringify(served,null,2));console.log({files:served.length,failed:served.filter(x=>!x.equal||x.status!==200)});
