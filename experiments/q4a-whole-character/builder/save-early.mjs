import { cp, access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'build/early-v02-01');
try { await access(destination); throw new Error('First attempt already saved; do not overwrite it'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const bytes = await readFile(path.join(root, 'art/parts.json'));
await mkdir(destination, { recursive: true });
await cp(path.join(root, 'build/site'), destination, { recursive: true });
await cp(path.join(root, 'app'), path.join(destination, 'source/app'), { recursive: true });
await cp(path.join(root, 'builder/early-v02-01/measurements.json'), path.join(destination, 'measurements.json'));
const data = JSON.parse(bytes);
const files = ['art/parts.json', ...data.parts.map(p => `art/${p.file}`), `art/${data.source}`, 'app/main.mjs', 'app/motion.mjs'];
const hashes = Object.fromEntries(await Promise.all([...new Set(files)].map(async file => [file,
  createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])));
await writeFile(path.join(destination, 'FIRST_ATTEMPT.json'), JSON.stringify({ version: data.version,
  scope: 'Limited source-v02 neutral/low; not a complete candidate', files: hashes }, null, 2) + '\n');
console.log(`Saved first significant assembly: ${destination}`);
