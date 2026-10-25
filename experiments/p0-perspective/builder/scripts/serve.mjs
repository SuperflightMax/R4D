import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const rootFlag = process.argv.indexOf('--root');
const portFlag = process.argv.indexOf('--port');
const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : 'output/playwright/gallery-v1/site');
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : 4175);
const types = new Map([['.html','text/html; charset=utf-8'],['.svg','image/svg+xml'],['.png','image/png'],['.jpg','image/jpeg'],['.json','application/json; charset=utf-8']]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relative = pathname === '/' ? 'gallery-v1.html' : pathname.replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error('Path outside preview root');
    const info = await stat(target);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types.get(path.extname(target).toLowerCase()) ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Static P0 preview: http://127.0.0.1:${port}/ from ${root}`));
