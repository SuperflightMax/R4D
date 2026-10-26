import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const source = 'K:\\Agents\\R4D\\Assets\\perspective\\03-sun-temple.jpg';
const expected = 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32';
const target = path.resolve('public/assets/03-sun-temple.jpg');
const bytes = await readFile(source);
const actual = createHash('sha256').update(bytes).digest('hex');

if (actual !== expected) {
  throw new Error(`board 03 SHA-256 mismatch: ${actual}`);
}

await mkdir(path.dirname(target), { recursive: true });
await copyFile(source, target);
console.log(`Prepared read-only board 03 asset: ${actual}`);

