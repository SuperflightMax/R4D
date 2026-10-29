import { createServer } from 'node:http';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { runtime, board } from './runtime.mjs';

const root = resolve(process.argv[2] ?? resolve(runtime, 'site'));
const port = Number(process.argv[3] ?? 55186);
if (!root.startsWith(resolve(runtime) + sep)) throw new Error('Preview root must be inside own runtime');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname);
  const path = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
  try {
    if (!statSync(path).isFile()) throw new Error('not a file');
    response.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(readFileSync(path));
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  const owner = { pid: process.pid, host: process.env.COMPUTERNAME, url: `http://127.0.0.1:${port}/`, root, startedUtc: new Date().toISOString(), command: 'node own transfer scripts/preview.mjs <own-root> <own-port>', scope: 'own localhost; no release server writes' };
  writeFileSync(resolve(runtime, 'preview-owner.json'), JSON.stringify(owner, null, 2) + '\n');
  console.log(JSON.stringify(owner));
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
