import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root, runtime, deps } from './runtime.mjs';

const require = createRequire(import.meta.url);
const esbuild = require(deps.esbuild);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const site = resolve(runtime, 'site');
mkdirSync(resolve(site, 'assets'), { recursive: true });
mkdirSync(resolve(site, 'data'), { recursive: true });
const nativeEntry = resolve(runtime, 'private-native/src/index.ts');
const depPins = Object.fromEntries(Object.entries(deps).map(([name, path]) => {
  const bytes = readFileSync(resolve(path, 'package.json'));
  const json = JSON.parse(bytes);
  return [name, { name: json.name, version: json.version, packageJsonSha256: sha(bytes), license: json.license ?? null }];
}));
if (depPins.pixi.version !== '8.17.1' || depPins.esbuild.version !== '0.25.12') throw new Error('Dependency version mismatch');
const alias = { '@millionko/sim-core': nativeEntry, 'pixi.js': resolve(deps.pixi, 'lib/index.mjs') };
const common = { bundle: true, format: 'esm', target: 'es2022', minify: true, sourcemap: false, sourcesContent: false, legalComments: 'none', logLevel: 'warning', alias };
const result = await esbuild.build({ ...common, platform: 'browser', entryPoints: [resolve(root, 'src/app.mjs')], outfile: resolve(site, 'app.js'), metafile: true });
await esbuild.build({ ...common, platform: 'node', entryPoints: [resolve(root, 'src/controller.mjs')], outfile: resolve(runtime, 'output/controller.mjs') });
writeFileSync(resolve(runtime, 'output/esbuild-metafile.private.json'), JSON.stringify(result.metafile, null, 2));
for (const file of ['config.json', 'p1-manifest.json', 'input-verification.json', 'targets.json']) copyFileSync(resolve(root, 'public/data', file), resolve(site, 'data', file));
for (const file of ['index.html', 'style.css']) copyFileSync(resolve(root, 'public', file), resolve(site, file));
const preview = { schema: 'r4d.p5.preview-input/1', manifestUrl: null, earlyFloor: null, warnings: ['Сборка совместимости: комплект Artist ещё не подключён.'] };
const manifestFlag = process.argv.indexOf('--manifest');
if (manifestFlag >= 0) {
  const path = resolve(process.argv[manifestFlag + 1]);
  const verification = execFileSync(process.execPath, [resolve(root, 'scripts/verify-assets.mjs'), path], { encoding: 'utf8' });
  writeFileSync(resolve(runtime, 'output/asset-verification.json'), verification);
  const verified = JSON.parse(verification);
  console.log(JSON.stringify({ assetVerification: verified.status, textures: verified.textures, instances: verified.instances,
    bodyFootprints: verified.footprintFits.filter(f => f.instanceId.endsWith('-body')) }));
  const sourceBytes = readFileSync(path);
  const handoffPinPath = resolve(dirname(path), 'handoff-pin.json');
  const handoffPin = existsSync(handoffPinPath) ? JSON.parse(readFileSync(handoffPinPath)) : {};
  if (handoffPin.sha256 && (handoffPin.sha256 !== sha(sourceBytes) || handoffPin.bytes !== sourceBytes.length)) throw new Error('Artist handoff pin mismatch');
  const manifest = JSON.parse(sourceBytes);
  writeFileSync(resolve(runtime, 'output/artist-manifest.original.json'), sourceBytes);
  for (const texture of manifest.textures) {
    // Binding aliases share exact PNG bytes. A shared URL also lets Pixi reuse
    // one texture resource while Sprite anchors/scales remain per alias.
    const name = `${texture.sha256}.png`;
    const textureBytes = readFileSync(resolve(dirname(path), texture.file));
    if (textureBytes.length !== texture.bytes || sha(textureBytes) !== texture.sha256) throw new Error(`Texture changed before staging: ${texture.id}`);
    writeFileSync(resolve(site, 'assets', name), textureBytes);
    texture.file = name;
    texture.provenanceSha256 = sha(JSON.stringify(texture.provenance));
    delete texture.provenance;
  }
  manifest.schema = 'r4d.p5.render-assets/1';
  const stagedBytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(resolve(site, 'assets/manifest.json'), stagedBytes);
  preview.artistManifest = { commit: handoffPin.commit ?? null, path: handoffPin.path ?? null, sourceSha256: sha(sourceBytes), sourceBytes: sourceBytes.length, stagedSha256: sha(stagedBytes), stagedBytes: stagedBytes.length,
    transformation: 'Exact final texture bytes; file URLs normalized; full provenance kept outside web root with per-texture digest' };
  preview.manifestUrl = 'assets/manifest.json';
  preview.warnings = manifest.status === 'partial' ? ['Неполный ранний набор Artist; качество ещё проверяется.'] : [];
} else {
  // Exact early raw handoff from Lead. This adapter is deliberately outside the
  // final Artist manifest; it cannot turn missing provenance into a final asset.
  const input = 'E:/R4D/perspective/p5-runtime/asset-artist/raw/floor-v1.png';
  const buffer = readFileSync(input);
  const expected = '24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06';
  if (buffer.length !== 3079122 || sha(buffer) !== expected) throw new Error('Early floor handoff pin mismatch');
  const metrics = JSON.parse(execFileSync('python', [resolve(root, 'scripts/image-metrics.py'), input], { encoding: 'utf8' }));
  if (metrics.sizePx[0] !== metrics.sizePx[1]) throw new Error('Early floor must be a square; no axis warp/crop');
  copyFileSync(input, resolve(site, 'assets/early-floor.png'));
  preview.earlyFloor = { file: 'assets/early-floor.png', sha256: expected, bytes: buffer.length, ...metrics, status: 'raw-candidate-preview-only', provenance: 'Lead exact read-only handoff; final Artist provenance pending' };
}
writeFileSync(resolve(site, 'data/preview-input.json'), JSON.stringify(preview, null, 2) + '\n');
writeFileSync(resolve(site, 'data/dependency-pins.json'), JSON.stringify(depPins, null, 2) + '\n');
console.log(JSON.stringify({ site, appBytes: readFileSync(resolve(site, 'app.js')).length, appSha256: sha(readFileSync(resolve(site, 'app.js'))), preview, dependencies: depPins, sourceMaps: false, rawNativeInSite: false }));
