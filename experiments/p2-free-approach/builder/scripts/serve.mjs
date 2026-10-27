import http from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import { root, pins, defaults, verifyInputs, verifyCore, sha256 } from './pins.mjs';

const arg = name => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const coreRoot = arg('--core-root') || defaults.coreRoot;
const sourcePath = arg('--source') || defaults.source;
const pixiRoot = arg('--pixi-root') || defaults.pixiRoot;
const outputRoot = path.resolve(arg('--output') || defaults.output);
const assetsPath = path.resolve(arg('--assets') || path.join(root, 'assets.manifest.json'));
const port = Number(arg('--port') || 4387);
if (!outputRoot.replaceAll('\\', '/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/')) {
  throw new Error('Runtime output must stay under E:/R4D/perspective/p2-runtime');
}
verifyInputs();
const coreSrc = verifyCore(coreRoot);
const sourceBytes = readFileSync(sourcePath);
if (sha256(sourceBytes) !== pins.sourceSha256) throw new Error('Wrong Jungle source bytes');
const pixiPackage = JSON.parse(readFileSync(path.join(pixiRoot, 'package.json'), 'utf8'));
if (pixiPackage.version !== '8.22.0') throw new Error('Expected existing PixiJS 8.22.0');
const pixiDist = path.join(pixiRoot, 'dist');
const pixiBytes = readFileSync(path.join(pixiDist, 'pixi.mjs'));
const metadata = { ...pins, pixiVersion: pixiPackage.version, pixiSha256: sha256(pixiBytes), transport: 'loopback-only, private core modules separate from public scene' };
const mime = { '.html':'text/html', '.css':'text/css', '.mjs':'text/javascript', '.js':'text/javascript', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const privateModules = new Map();

function beneath(base, relative) {
  const result = path.resolve(base, relative);
  if (!result.startsWith(path.resolve(base) + path.sep)) throw new Error('Path outside served directory');
  return result;
}
function send(res, bytes, type = 'application/json') {
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(bytes);
}
function file(res, filename) { send(res, readFileSync(filename), mime[path.extname(filename)] || 'application/octet-stream'); }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    if (req.method === 'POST' && pathname === '/api/checkpoint') {
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8 * 1024 * 1024) throw new Error('Checkpoint exceeds 8 MiB');
        chunks.push(chunk);
      }
      const packet = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (packet.schema !== 'r4d.p2.checkpoint.v1') throw new Error('Wrong checkpoint schema');
      mkdirSync(outputRoot, { recursive: true });
      const target = path.join(outputRoot, `run-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.json`);
      writeFileSync(target, JSON.stringify({ ...packet, serverProvenance: metadata }, null, 2) + '\n');
      send(res, JSON.stringify({ saved: target })); return;
    }
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    if (pathname === '/metadata.json') { send(res, JSON.stringify(metadata)); return; }
    if (pathname === '/source/01-jungle.jpg') { send(res, sourceBytes, 'image/jpeg'); return; }
    if (pathname === '/assets/manifest.json') { file(res, assetsPath); return; }
    if (pathname.startsWith('/assets/files/')) { file(res, beneath(path.dirname(assetsPath), pathname.slice('/assets/files/'.length))); return; }
    if (pathname.startsWith('/vendor/')) { file(res, beneath(pixiDist, pathname.slice('/vendor/'.length))); return; }
    if (pathname.startsWith('/private/core/')) {
      const relative = pathname.slice('/private/core/'.length);
      if (!relative.endsWith('.js')) throw new Error('Private runtime route expects a JS module');
      if (!privateModules.has(relative)) {
        const tsPath = beneath(coreSrc, relative.replace(/\.js$/, '.ts'));
        // No source map or copied private TS file is written to disk or public artifacts.
        privateModules.set(relative, stripTypeScriptTypes(readFileSync(tsPath, 'utf8'), { mode: 'strip' }));
      }
      send(res, privateModules.get(relative), 'text/javascript'); return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!(relative === 'index.html' || relative === 'style.css' || relative.startsWith('src/') || relative.startsWith('inputs/'))) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const target = beneath(root, relative);
    if (!existsSync(target) || !statSync(target).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    file(res, target);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.message);
  }
});
server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ url: `http://127.0.0.1:${port}`, metadata, assetsPath, outputRoot })));
