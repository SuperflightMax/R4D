import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const artwork = resolve(here, '../artwork');
const art01 = resolve(here, '../../ART-01');
const out = resolve(here, 'review-package');
const assets = new Map();
const images = new Map();
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const add = async (path, source) => assets.set(path, await readFile(source));
const textFile = async (path) => (await readFile(path, 'utf8')).replaceAll('\r\n', '\n');
const addText = async (path, source) => assets.set(path, Buffer.from(await textFile(source)));
const html = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function imageLink(id, section, path, title, caption = '') {
  if (images.has(id)) throw new Error(`Повтор изображения: ${id}`);
  images.set(id, { section, path, title, caption });
  return `../image.html?file=${encodeURIComponent(id)}`;
}

async function addArt02(assembly) {
  for (const name of ['viewer.css', 'viewer.js', 'assembly.json']) {
    await addText(`art-02/${name}`, join(here, name));
  }
  const pixi = join(here, 'node_modules/pixi.js');
  if ((await readJson(join(pixi, 'package.json'))).version !== '8.22.0') {
    throw new Error('Требуется PixiJS 8.22.0 из lock-файла');
  }
  const bundle = await readFile(join(pixi, 'dist/pixi.min.js'), 'utf8');
  assets.set('art-02/pixi.js', Buffer.from(bundle.replace(/\r?\n\/\/# sourceMappingURL=pixi\.min\.js\.map\s*$/, '\n')));
  await add('art-02/pixi.LICENSE.txt', join(pixi, 'LICENSE'));
  const sheets = [
    ['comparison-1to1.png', 'Сравнение пересборок в масштабе 1:1', 'Исходник и пересборки 1:1. Первый 02-P показан для сравнения с коррекцией.'],
    ['bronze-detail-4x.png', 'Кольцо глаза до и после правки, 4×', 'Кольцо глаза до и после правки, 4×.'],
    ['alpha-boards-1to1.png', 'Прозрачность краёв на трёх подложках', 'Края листа на белой, чёрной и контрастной подложках.'],
  ];
  let viewer = await textFile(join(here, 'index.html'));
  for (const [name, title, caption] of sheets) {
    await add(`art-02/artwork/evidence/${name}`, join(artwork, 'evidence', name));
    const path = `artwork/evidence/${name}`;
    const original = `href="./${path}"`;
    if (!viewer.includes(original)) throw new Error(`Ссылка на лист ART-02 не найдена: ${name}`);
    viewer = viewer.replace(original, `href="${imageLink(`art02-${name}`, 'art-02', path, title, caption)}"`);
  }
  assets.set('art-02/index.html', Buffer.from(viewer));
  if (assembly.reference !== 'reference/control.png') throw new Error('Неожиданный эталон ART-02');
  await add(`art-02/artwork/${assembly.reference}`, join(artwork, assembly.reference));
  for (const [method, path] of Object.entries(assembly.methods)) {
    if (!/^02-[PR]\/[a-z0-9-]+\/manifest\.json$/.test(path) || !path.startsWith(method + '/')) {
      throw new Error(`Неожиданный путь манифеста: ${path}`);
    }
    const manifest = await readJson(join(artwork, path));
    const { schema, frame_size_wh, crop_source_ltrb, layer_order_back_to_front, motion } = manifest;
    const replace_layer = manifest.states.bronze.replace_layer;
    const ids = [...new Set([...layer_order_back_to_front, ...Object.values(replace_layer)])];
    const layers = {};
    for (const id of ids) {
      const { path: image, bbox_crop_ltrb, pivot_texture_xy } = manifest.layers[id];
      if (!/^layers\/[a-z0-9-]+\.png$/.test(image)) throw new Error(`Неожиданный слой: ${image}`);
      layers[id] = { path: image, bbox_crop_ltrb, pivot_texture_xy };
      const relative = `${dirname(path).replaceAll('\\', '/')}/${image}`;
      await add(`art-02/artwork/${relative}`, join(artwork, relative));
    }
    assets.set(`art-02/artwork/${path}`, json({
      schema, method, frame_size_wh, crop_source_ltrb, layer_order_back_to_front, layers,
      states: { bronze: { replace_layer } },
      motion: { layer: motion.layer, axis: motion.axis, demonstrated_dx: motion.demonstrated_dx },
    }));
  }
}

async function addGallery(catalog) {
  const figure = async ([source, title, note], kind) => {
    if (!/^(raw|review)\/[a-z0-9-]+\.(png|jpg)$/i.test(source)) throw new Error(`Неожиданный путь галереи: ${source}`);
    const path = `images/${basename(source)}`;
    const link = imageLink(`art01-${kind}-${basename(source)}`, 'art-01', path, title, note);
    if (!assets.has(`art-01/${path}`)) await add(`art-01/${path}`, join(art01, source));
    const caption = note ? `<span>${html(note)}</span>` : '';
    const loading = kind === 'initial' ? 'decoding="sync"' : 'loading="lazy" decoding="async"';
    return `<figure><a href="${link}" target="_blank" rel="noopener"><img src="./${path}" alt="${html(title)}" ${loading}></a><figcaption>${html(title)}${caption}</figcaption></figure>`;
  };
  const grid = async (rows, kind) => {
    const pictures = await Promise.all(rows.map((row) => figure(row, kind)));
    return `<div class="gallery ${kind}">\n${pictures.join('\n')}\n</div>`;
  };
  const groups = [];
  groups.push(`<h2>Четыре исходных кадра</h2>\n${await grid(catalog.initial, 'initial')}`);
  groups.push('<h2>Мастера и уточнённые правки</h2>');
  for (const [title, rows] of catalog.refined) {
    groups.push(`<h3>${html(title)}</h3>\n${await grid(rows, 'pair')}`);
  }
  groups.push(`<h2>Первый общий проход</h2><p>В обеих версиях сосуд сместился дальше намеченного.</p>\n${await grid(catalog.firstEdit, 'pair')}`);
  groups.push(`<h2>Сравнительные листы</h2>\n${await grid(catalog.sheets, 'sheets')}`);
  const template = await textFile(join(here, 'review/art-01.html'));
  assets.set('art-01/index.html', Buffer.from(template.replace('{{GALLERY}}', groups.join('\n'))));
}

const assembly = await readJson(join(here, 'assembly.json'));
const catalog = await readJson(join(here, 'review/art-01.json'));
await addText('index.html', join(here, 'review/index.html'));
await addText('review.css', join(here, 'review/review.css'));
await addArt02(assembly);
await addGallery(catalog);
await addText('image.html', join(here, 'review/image.html'));
const imageScript = await textFile(join(here, 'review/image.js'));
assets.set('image.js', Buffer.from(imageScript.replace('/* IMAGE_CATALOG */ []', JSON.stringify([...images]))));

const existing = await realpath(out).catch((error) => {
  if (error.code !== 'ENOENT') throw error;
});
if (existing) {
  if (existing !== out) throw new Error(`Неожиданный выходной каталог: ${existing}`);
  await rm(out, { recursive: true });
}
const files = [];
for (const path of [...assets.keys()].sort()) {
  const bytes = assets.get(path);
  const file = join(out, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes);
  files.push({ path, bytes: bytes.length, sha256: hash(bytes) });
}
const allowlist = json({ route: '/review/r4d/art-2d/', art01: catalog.version, art02: assembly.version, files });
await writeFile(join(here, 'review-package.allowlist.json'), allowlist);
console.log(`${files.length} files, allowlist SHA-256 ${hash(allowlist)}`);
