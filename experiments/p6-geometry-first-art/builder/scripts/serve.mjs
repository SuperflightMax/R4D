import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { site } from './paths.mjs';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const port=41766;
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  const target=path.resolve(site,relative);
  if(!target.startsWith(path.resolve(site)+path.sep)||!types[path.extname(target)]){res.writeHead(403);res.end();return;}
  fs.stat(target,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);
  });
});
server.listen(port,'127.0.0.1',()=>console.log(`P6 consumer: http://127.0.0.1:${port}/\nRuntime site: ${site}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
