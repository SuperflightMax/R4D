import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'');
if(!root.startsWith(path.resolve('E:/R4D/perspective/p3-runtime/builder')+path.sep))throw Error('Only own P3 runtime may be served');
const port=Number(process.argv[3]||0);
const prefix='/review/r4d/p3-masks/';
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
 const file=path.resolve(root,pathname.slice(prefix.length)||'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.listen({host:'127.0.0.1',port,exclusive:true},()=>console.log(JSON.stringify({url:`http://127.0.0.1:${server.address().port}${prefix}`,root,pid:process.pid})));
