import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const spec=JSON.parse(fs.readFileSync(path.join(here,'transfer.json'),'utf8'));
const root=path.resolve(process.argv[2]??'');
if(!root.startsWith(path.resolve(spec.runtime)+path.sep))throw Error('Only this board own runtime may be served');
const build=JSON.parse(fs.readFileSync(path.join(root,'build.json'),'utf8'));
if(build.board!==spec.board)throw Error('Preview board identity differs');
const port=Number(process.argv[3]??0);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 if(!pathname.startsWith(spec.route)){res.writeHead(404);res.end();return;}
 const file=path.resolve(root,pathname.slice(spec.route.length)||'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.listen({host:'127.0.0.1',port,exclusive:true},()=>console.log(JSON.stringify({board:spec.board,url:`http://127.0.0.1:${server.address().port}${spec.route}`,root,pid:process.pid,sourceCommit:build.sourceCommit})));
