import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const artwork = resolve(here, '../artwork');
const reviewOnly = process.argv.includes('--review');
const review = reviewOnly && JSON.parse(await readFile(resolve(here, 'review-package.allowlist.json'), 'utf8'));
const reviewFiles = review && new Set(review.files.map(({ path }) => path));
const routes = new Map([
  ['/', 'index.html'],
  ['/viewer.js', 'viewer.js'],
  ['/viewer.css', 'viewer.css'],
  ['/assembly.json', 'assembly.json'],
  ['/pixi.js', 'node_modules/pixi.js/dist/pixi.min.js'],
]);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const route = !reviewOnly && routes.get(pathname);
    let file = route && resolve(here, route);
    if (reviewOnly && pathname.startsWith(review.route)) {
      const relative = pathname.slice(review.route.length);
      const name = relative.endsWith('/') || !relative ? relative + 'index.html' : relative;
      if (reviewFiles.has(name)) file = resolve(here, 'review-package', name);
    } else if (!reviewOnly && pathname.startsWith('/artwork/')) {
      const asset = resolve(artwork, pathname.slice('/artwork/'.length));
      if (asset.startsWith(artwork + sep) && /(?:\.(png|jpe?g|webp)|[\\/]manifest\.json)$/i.test(asset)) {
        file = asset;
      }
    }
    if (!file || request.method !== 'GET') {
      response.writeHead(404).end('Файл не найден');
      return;
    }
    const bytes = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime[extname(file).toLowerCase()],
      'Cache-Control': 'no-store',
    }).end(bytes);
  } catch (error) {
    const status = error.code === 'ENOENT' ? 404 : error instanceof URIError ? 400 : 500;
    response.writeHead(status).end('Файл недоступен');
    if (status === 500) console.error(error);
  }
});

const port = Number(process.argv.slice(2).find((arg) => arg !== '--review') ?? 4182);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Укажите номер порта');
server.listen(port, '127.0.0.1', () => {
  console.log(`ART-02: http://127.0.0.1:${server.address().port}${review?.route || '/'}`);
});
