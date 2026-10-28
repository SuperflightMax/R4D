import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { root, runtime, deps } from './runtime.mjs';

const sha = data => createHash('sha256').update(data).digest('hex');
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
writeFileSync(resolve(root, 'DEPENDENCIES.lock.json'), JSON.stringify(lock, null, 2) + '\n');
writeFileSync(resolve(runtime, 'site/data/dependency-lock.json'), JSON.stringify(lock, null, 2) + '\n');
writeFileSync(resolve(runtime, 'site/THIRD_PARTY_LICENSES.txt'), terms.join('\n\n') + '\n');
console.log(JSON.stringify({ inputs: inputFiles.length, packages: publicPackages.map(p => ({ name: p.name, version: p.version, licenseFiles: p.licenseFiles.length })), missingRuntimeLicenseFiles: publicPackages.filter(p => !p.buildToolOnly && !p.licenseFiles.length).map(p => p.name), nativeLicense: 'private native compiled use is authorized by P5 contract; no open-source grant asserted' }));
