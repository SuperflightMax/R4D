import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distRoot = path.resolve('dist');
const manifestPath = path.resolve('scale-candidate-manifest.sha256');
const route = '/review/r4d/p1-collider-mapping/';

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(absolute) : [absolute];
  }));
  return files.flat().sort();
}

function sha(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const files = await filesUnder(distRoot);
const relativeFiles = files.map((file) => path.relative(distRoot, file).replaceAll('\\', '/'));
assert(!relativeFiles.some((file) => file.endsWith('.ts') || file.endsWith('.map')), 'release contains source or source map');

const index = await readFile(path.join(distRoot, 'index.html'), 'utf8');
assert(index.includes(`${route}assets/`), 'index does not use the nested review route');
assert(!index.includes('src="/assets/') && !index.includes('href="/assets/'), 'index leaks a root-relative asset URL');

const publicText = (await Promise.all(files
  .filter((file) => /\.(?:html|js|css)$/.test(file))
  .map((file) => readFile(file, 'utf8')))).join('\n');
assert(!/[A-Za-z]:\\(?:Users|dev|Agents|Windows|Program Files)(?:\\|$)/i.test(publicText), 'release contains an absolute Windows path');
assert(!publicText.includes('millionko-source'), 'release contains the private sim-core checkout path');
assert(!publicText.includes('board-03-mapping-v0.2.json'), 'release contains the private Research mapping filename');
assert(!publicText.includes('board-01-jungle') && !publicText.includes('mapping-v0.1.json'), 'release contains the private board-01 Research path');
assert(!publicText.includes('board-02-dark-temple'), 'release contains the private board-02 Research path');
assert(!publicText.includes('board-04-water-temple'), 'release contains the private board-04 Research path');
assert(!publicText.includes('sourceMappingURL='), 'release contains a source-map reference');

const expectedAssets = new Map([
  ['assets/03-sun-temple.jpg', 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32'],
  ['assets/01-jungle.jpg', 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72'],
  ['assets/02-dark-temple.jpg', '7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a'],
  ['assets/04-water-temple.jpg', '8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d'],
  ['assets/ball-candidate-b-64.png', '05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087'],
  ['assets/shadow-candidate-c-r18-54x27.png', 'ee10607ce00c2a3d7e8644e941879748cdb841f671dda8399353929fce5ed213'],
]);
for (const [relative, digest] of expectedAssets) {
  const file = path.join(distRoot, relative);
  assert(await stat(file).then(() => true, () => false), `release is missing ${relative}`);
  assert(sha(await readFile(file)) === digest, `release hash mismatch for ${relative}`);
}
assert(!relativeFiles.includes('assets/shadow-candidate-b-96x48.png'), 'release still contains candidate-B shadow');

const manifest = `${(await Promise.all(files.map(async (file) => {
  const relative = path.relative(distRoot, file).replaceAll('\\', '/');
  return `${sha(await readFile(file))}  ${relative}`;
}))).join('\n')}\n`;

if (process.argv.includes('--write-manifest')) {
  await writeFile(manifestPath, manifest, 'utf8');
} else {
  assert((await readFile(manifestPath, 'utf8')).replace(/\r\n/g, '\n') === manifest, 'scale-candidate-manifest.sha256 is stale');
}

console.log(`PASS nested candidate privacy: route=${route} files=${files.length}`);
