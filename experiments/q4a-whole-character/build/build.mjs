import { build } from 'esbuild';
import { mkdir, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'build/site');
await mkdir(out, { recursive: true });
await build({ entryPoints: [path.join(root, 'app/main.mjs')], bundle: true,
  outfile: path.join(out, 'main.js'), format: 'esm', sourcemap: true });
await copyFile(path.join(root, 'app/index.html'), path.join(out, 'index.html'));
await copyFile(path.join(root, 'app/style.css'), path.join(out, 'style.css'));
try { await cp(path.join(root, 'art'), path.join(out, 'art'), { recursive: true }); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log(`Built ${out}`);
