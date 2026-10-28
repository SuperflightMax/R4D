import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { root, runtime, deps } from './runtime.mjs';

const sha = data => createHash('sha256').update(data).digest('hex');
const outputFlag = process.argv.indexOf('--output-root');
const outputRoot = resolve(outputFlag >= 0 ? process.argv[outputFlag + 1] : resolve(runtime, 'site'));
const frozenRoot = resolve(runtime, 'output/previews');
if (outputRoot === frozenRoot || outputRoot.startsWith(frozenRoot + sep)) throw new Error('Do not change immutable preview packages');
mkdirSync(resolve(outputRoot, 'data'), { recursive: true });
const outputLockFlag = process.argv.indexOf('--lock-output');
const lockOutput = resolve(outputLockFlag >= 0 ? process.argv[outputLockFlag + 1] : resolve(root, 'DEPENDENCIES.lock.json'));
const meta = JSON.parse(readFileSync(resolve(runtime, 'output/esbuild-metafile.private.json')));
const packages = new Map();
const inputFiles = [];
for (const input of Object.keys(meta.inputs)) {
  const path = resolve(input);
  const bytes = readFileSync(path);
  inputFiles.push({ path, bytes: bytes.length, sha256: sha(bytes) });
  if (!path.includes('node_modules')) continue;
  let folder = dirname(path);
  while (folder !== dirname(folder)) {
    const packagePath = resolve(folder, 'package.json');
    if (existsSync(packagePath)) {
      const buffer = readFileSync(packagePath);
      const pkg = JSON.parse(buffer);
      if (pkg.name && pkg.version) {
        if (!packages.has(pkg.name)) packages.set(pkg.name, { name: pkg.name, version: pkg.version, license: pkg.license ?? null, packageJsonSha256: sha(buffer), root: folder });
        break;
      }
    }
    folder = dirname(folder);
  }
}
for (const key of ['esbuild']) {
  const folder = deps[key];
  const buffer = readFileSync(resolve(folder, 'package.json'));
  const pkg = JSON.parse(buffer);
  packages.set(pkg.name, { name: pkg.name, version: pkg.version, license: pkg.license ?? null, packageJsonSha256: sha(buffer), root: folder, buildToolOnly: true });
}
const privateInputs = JSON.stringify(inputFiles.sort((a, b) => a.path.localeCompare(b.path)), null, 2) + '\n';
writeFileSync(resolve(runtime, 'output/build-input-inventory.private.json'), privateInputs);
const terms = [];
const publicPackages = [];
for (const pkg of [...packages.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const licenses = [];
  for (const name of readdirSync(pkg.root).filter(name => /^(licen[cs]e(?:\..*)?|copying|notice)$/i.test(name))) {
    const file = resolve(pkg.root, name);
    if (!existsSync(file)) continue;
    const bytes = readFileSync(file);
    licenses.push({ file: basename(file), bytes: bytes.length, sha256: sha(bytes) });
    if (!pkg.buildToolOnly) terms.push(`--- ${pkg.name}@${pkg.version} / ${basename(file)} ---\n${bytes.toString('utf8')}`);
  }
  if (pkg.name === '@pixi/colord' && !licenses.length) {
    const supplementRoot = resolve(root, 'licenses/pixi-colord-2.9.6');
    const source = JSON.parse(readFileSync(resolve(supplementRoot, 'SOURCE.json')));
    if (pkg.version !== source.version || pkg.packageJsonSha256 !== source.installedIdentity.packageJsonSha256) throw new Error('Colord version/package metadata differs from verified license source');
    for (const file of source.installedIdentity.files) {
      const installedBytes = readFileSync(resolve(pkg.root, file.path));
      if (installedBytes.length !== file.bytes || sha(installedBytes) !== file.sha256) throw new Error(`Colord bytes differ from official published archive: ${file.path}`);
    }
    const bytes = readFileSync(resolve(supplementRoot, 'LICENSE.md'));
    const pin = source.repository.license;
    if (bytes.length !== pin.bytes || sha(bytes) !== pin.sha256) throw new Error('Pinned Colord license bytes differ');
    licenses.push({ file: 'LICENSE.md', bytes: bytes.length, sha256: sha(bytes), origin: 'exact-repository-supplement', source: { repository: source.repository.name, commit: source.repository.commit, url: pin.url, gitBlob: pin.gitBlob, publishedArchiveSha256: source.publishedArchive.sha256 } });
    terms.push(`--- ${pkg.name}@${pkg.version} / LICENSE.md / ${pin.url} ---\n${bytes.toString('utf8')}`);
  }
  const { root: privateRoot, ...publicPin } = pkg;
  publicPackages.push({ ...publicPin, licenseFiles: licenses });
}
const lock = {
  schema: 'r4d.p5.dependency-lock/1',
  mode: 'Read-only installed common native dependencies; no npm install or synthetic npm lockfile',
  nodeVersion: process.version,
  installedNativePnpmLockSha256: sha(readFileSync('D:/dev/millionko/pnpm-lock.yaml')),
  actualBuildInputInventorySha256: sha(privateInputs),
  packages: publicPackages,
};
writeFileSync(lockOutput, JSON.stringify(lock, null, 2) + '\n');
writeFileSync(resolve(outputRoot, 'data/dependency-lock.json'), JSON.stringify(lock, null, 2) + '\n');
writeFileSync(resolve(outputRoot, 'THIRD_PARTY_LICENSES.txt'), terms.join('\n\n') + '\n');
console.log(JSON.stringify({ inputs: inputFiles.length, packages: publicPackages.map(p => ({ name: p.name, version: p.version, licenseFiles: p.licenseFiles.length })), missingRuntimeLicenseFiles: publicPackages.filter(p => !p.buildToolOnly && !p.licenseFiles.length).map(p => p.name), nativeLicense: 'private native compiled use is authorized by P5 contract; no open-source grant asserted' }));
