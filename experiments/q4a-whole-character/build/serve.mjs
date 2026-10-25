import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

await import('./build.mjs');
const root = fileURLToPath(new URL('./site/', import.meta.url));
const port = Number(process.env.Q4A_PORT || 4194);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.map': 'application/json' };
createServer(async (req, res) => {
  try {
    let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    if (relative.endsWith('/')) relative += 'index.html';
    // Development reads current art directly; packaged build/site remains standalone.
    const base = relative.startsWith('art/') ? fileURLToPath(new URL('../', import.meta.url))
      : /^early-v02-0[12]\//.test(relative) ? fileURLToPath(new URL('./', import.meta.url)) : root;
    const target = path.resolve(base, relative);
    if (!target.startsWith(base)) { res.writeHead(403); res.end(); return; }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store' }); res.end(body);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end('File unavailable'); }
}).listen(port, '127.0.0.1', () => console.log(`Q4A http://127.0.0.1:${port}`));
