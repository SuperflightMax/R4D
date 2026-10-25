import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const experiment = path.resolve(root, '..');
const modelPath = path.join(experiment, 'research', 'perspective-model-v0.1.json');
const outFlag = process.argv.indexOf('--out');
const outDir = outFlag >= 0 ? path.resolve(process.argv[outFlag + 1]) : path.join(root, 'generated');
const portableGallery = process.argv.includes('--portable-gallery');

const modelText = await readFile(modelPath, 'utf8');
const model = JSON.parse(modelText);
validateModel(model);

const geometry = deriveGeometry(model);
const metrics = buildMetrics(model, geometry);
await mkdir(outDir, { recursive: true });

const files = new Map([
  ['formal-reference-v1.svg', renderFormalSvg(model, geometry)],
  ['diagnostic-comparison-v1.svg', renderComparisonSvg(model, geometry, metrics)],
  ['metrics-v1.json', `${JSON.stringify(metrics, null, 2)}\n`],
]);

for (const [name, contents] of files) {
  await writeFile(path.join(outDir, name), contents, 'utf8');
}

const galleryAssets = portableGallery
  ? { source: 'reference-03.jpg', research: 'research-template-v0.1.svg', concept: 'concept-template-v0.1.png' }
  : { source: pathToFileURL(model.source.readOnlyPath).href, research: '../../research/perspective-template-v0.1.svg', concept: '../../concept/visual-template.png' };
if (portableGallery) {
  await Promise.all([
    copyFile(model.source.readOnlyPath, path.join(outDir, galleryAssets.source)),
    copyFile(path.join(experiment, 'research', 'perspective-template-v0.1.svg'), path.join(outDir, galleryAssets.research)),
    copyFile(path.join(experiment, 'concept', 'visual-template.png'), path.join(outDir, galleryAssets.concept)),
  ]);
}
await writeFile(path.join(outDir, 'gallery-v1.html'), renderGallery(galleryAssets), 'utf8');
console.log(`Built ${files.size + 1} deterministic artifacts${portableGallery ? ' plus portable preview inputs' : ''} in ${outDir}`);

function validateModel(value) {
  if (value.schema !== 'r4d.p0.perspective-model.v0.1') throw new Error(`Unexpected schema: ${value.schema}`);
  if (value.source.widthPx !== 1536 || value.source.heightPx !== 1536) throw new Error('P0 v1 expects a 1536 × 1536 source frame');
  if (value.selectedModel.fieldQuadNormalizedClockwise.length !== 4) throw new Error('Expected four field corners');
  if (value.controlRows.length < 3) throw new Error('At least three control rows are required');
  if (value.frame.aspectRatio[0] !== value.frame.aspectRatio[1]) throw new Error('P0 v1 requires a square frame');
}

function deriveGeometry(value) {
  const W = value.source.widthPx;
  const H = value.source.heightPx;
  const quad = value.selectedModel.fieldQuadNormalizedClockwise;
  const farY = (quad[0][1] + quad[1][1]) / 2;
  const nearY = (quad[2][1] + quad[3][1]) / 2;
  const centerX = value.frame.centerNormalized[0];
  const halfFar = (quad[1][0] - quad[0][0]) / 2;
  const halfNear = (quad[2][0] - quad[3][0]) / 2;
  const scaleMatch = value.selectedModel.objectScaleFormula.match(/^\s*([0-9.]+)\s*\+\s*([0-9.]+)\s*\*\s*z\s*$/);
  if (!scaleMatch) throw new Error(`Unsupported scale formula: ${value.selectedModel.objectScaleFormula}`);
  const scaleIntercept = Number(scaleMatch[1]);
  const scaleSlope = Number(scaleMatch[2]);
  const point = (u, z) => {
    const halfWidth = halfFar + (halfNear - halfFar) * z;
    return { x: W * (centerX + u * halfWidth), y: H * (farY + (nearY - farY) * z) };
  };
  const homography = (a, b) => {
    const m = value.comparisonProjectiveHomography.matrixNormalizedImage;
    const d = m[2][0] * a + m[2][1] * b + m[2][2];
    return {
      x: W * (m[0][0] * a + m[0][1] * b + m[0][2]) / d,
      y: H * (m[1][0] * a + m[1][1] * b + m[1][2]) / d,
    };
  };
  return {
    W, H, quad, farY, nearY, centerX, halfFar, halfNear,
    scaleIntercept, scaleSlope, point, homography,
    scale: (z) => scaleIntercept + scaleSlope * z,
    vp: {
      x: value.selectedModel.virtualVanishingPointNormalized[0] * W,
      y: value.selectedModel.virtualVanishingPointNormalized[1] * H,
    },
  };
}

function buildMetrics(value, g) {
  const rows = value.controlRows.map((row) => {
    const selectedLeft = g.point(-1, row.z);
    const selectedRight = g.point(1, row.z);
    const projectiveLeft = g.homography(0, row.z);
    const projectiveRight = g.homography(1, row.z);
    return {
      z: row.z,
      selected: {
        yPx: round(selectedLeft.y),
        widthPx: round(selectedRight.x - selectedLeft.x),
        objectScale: round(g.scale(row.z), 4),
      },
      strictHomography: {
        yPx: round(projectiveLeft.y),
        widthPx: round(projectiveRight.x - projectiveLeft.x),
        impliedRelativeScaleToMid: round((projectiveRight.x - projectiveLeft.x) / strictWidthAtMid(g), 4),
      },
      delta: {
        yPx: round(projectiveLeft.y - selectedLeft.y),
        fieldWidthPx: round((projectiveRight.x - projectiveLeft.x) - (selectedRight.x - selectedLeft.x)),
      },
    };
  });
  return {
    schema: 'r4d.p0.builder-metrics.v1',
    sourceModelSchema: value.schema,
    sourceModelSha256: sha256(Buffer.from(modelText)),
    sourceImage: value.source,
    provenance: {
      base: 'e5892fbea71fbbfeb9f22e6a18f0f788cf9a1449',
      research: '627a9feb33cc6fdc8e63738ada13577752b9bf4a',
      concept: 'd38139573648f097bd04e1c833ffff9be467ff71',
      visualQaRubric: '21150e583311e8688146a27fa48aaa8c41c8aaa8',
    },
    selectedModel: {
      type: value.selectedModel.type,
      claim: 'deterministic 2.5D composition reference; not exact camera recovery',
      fieldQuadNormalizedClockwise: value.selectedModel.fieldQuadNormalizedClockwise,
      fieldQuadPxClockwise: value.selectedModel.fieldQuadNormalizedClockwise.map(([x, y]) => [round(x * g.W), round(y * g.H)]),
      virtualVanishingPointPx: [round(g.vp.x), round(g.vp.y)],
      objectScale: { intercept: g.scaleIntercept, slope: g.scaleSlope },
      nearToFarFieldWidthRatio: round(g.halfNear / g.halfFar, 10),
      nearToFarObjectScaleRatio: round(g.scale(1) / g.scale(0), 10),
    },
    comparison: {
      purpose: 'diagnostic vector only; no opaque aggregate score',
      rows,
    },
    tolerances: value.tolerances,
    exclusions: value.nonGoals,
  };
}

function renderFormalSvg(value, g) {
  const farYpx = g.farY * g.H;
  const nearYpx = g.nearY * g.H;
  const centerXpx = g.centerX * g.W;
  const fieldPoints = g.quad.map(([x, y]) => `${n(x * g.W)},${n(y * g.H)}`).join(' ');
  const farWidth = g.halfFar * 2 * g.W;
  const nearWidth = g.halfNear * 2 * g.W;
  const rows = value.controlRows.map((row, index) => {
    const left = g.point(-1, row.z);
    const right = g.point(1, row.z);
    const label = `z=${row.z.toFixed(2)} · S=${g.scale(row.z).toFixed(3)}`;
    return `<g class="row"><line x1="${n(left.x)}" y1="${n(left.y)}" x2="${n(right.x)}" y2="${n(right.y)}"/><text x="${n(left.x + 18)}" y="${n(left.y - 12)}">${label}</text></g>${volumePair(g, row.z, index)}`;
  }).join('\n');
  const longitudinal = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((u) => {
    const far = g.point(u, 0);
    const near = g.point(u, 1);
    return `<line class="guide" x1="${n(far.x)}" y1="${n(far.y)}" x2="${n(near.x)}" y2="${n(near.y)}"/>`;
  }).join('\n');
  const corners = g.quad.map(([x, y], index) => {
    const px = x * g.W;
    const py = y * g.H;
    const names = ['far-left', 'far-right', 'near-right', 'near-left'];
    return `<g class="anchor"><circle cx="${n(px)}" cy="${n(py)}" r="12"/><text x="${n(px + (index === 0 || index === 3 ? 18 : -18))}" y="${n(py + (index < 2 ? -18 : 34))}" text-anchor="${index === 0 || index === 3 ? 'start' : 'end'}">${names[index]} · ${round(px)},${round(py)}</text></g>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536" role="img" aria-labelledby="title desc">
  <title id="title">R4D P0 formal perspective reference v1</title>
  <desc id="desc">Deterministic 2.5D perspective template generated from research model v0.1</desc>
  <metadata>Research 627a9feb33cc6fdc8e63738ada13577752b9bf4a; Concept d38139573648f097bd04e1c833ffff9be467ff71; Visual QA 21150e583311e8688146a27fa48aaa8c41c8aaa8</metadata>
  <defs>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f3d79d"/><stop offset="1" stop-color="#dca65f"/></linearGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="9"/></filter>
    <style>
      text{font-family:Segoe UI,Arial,sans-serif;fill:#3b211b}.title{font-size:34px;font-weight:700}.note{font-size:20px}.guide,.row line{stroke:#4d9f98;stroke-width:4;stroke-dasharray:14 13;opacity:.78}.axis{stroke:#77463a;stroke-width:4;stroke-dasharray:18 10}.row text{font-size:18px;font-weight:650}.anchor circle{fill:#fff3cf;stroke:#b4443d;stroke-width:6}.anchor text{font-size:18px;font-weight:650}.outline{fill:none;stroke:#6d3d31;stroke-width:10}.volume-stroke{stroke:#713b31;stroke-width:6;stroke-linejoin:round}.badge{fill:#fff5dc;stroke:#9e674a;stroke-width:4}
    </style>
  </defs>
  <rect width="1536" height="1536" fill="#f7cc8f"/>
  <rect x="0" y="0" width="1536" height="${n(farYpx)}" fill="#d97849"/>
  <path d="M 0 340 L 360 230 L 600 300 L 768 160 L 936 300 L 1176 230 L 1536 340 L 1536 410 L 0 410 Z" fill="#b94d40" stroke="#7f332f" stroke-width="12"/>
  <polygon points="${fieldPoints}" fill="url(#floor)" class="volume-stroke"/>
  ${longitudinal}
  <line class="axis" x1="${n(centerXpx)}" y1="${n(farYpx)}" x2="${n(centerXpx)}" y2="${n(nearYpx)}"/>
  ${rows}
  ${corners}
  <path d="M 0 1160 L 150 1125 L 250 1200 L 1286 1200 L 1386 1125 L 1536 1160 L 1536 1536 L 0 1536 Z" fill="#bd5140" stroke="#7f332f" stroke-width="12"/>
  <g transform="translate(46 38)"><rect class="badge" width="720" height="120" rx="24"/><text class="title" x="28" y="46">FORMAL REFERENCE · Builder v1</text><text class="note" x="28" y="82">2.5D composition model · 1536×1536 · not an exact recovered camera</text><text class="note" x="28" y="108">geometry: Research JSON · visual hierarchy: Concept v0.1</text></g>
  <g transform="translate(1000 46)"><rect class="badge" width="490" height="112" rx="24"/><text class="note" x="24" y="38">FIELD: far y=${round(farYpx)} · near y=${round(nearYpx)}</text><text class="note" x="24" y="70">WIDTH: ${round(farWidth)} → ${round(nearWidth)} px (×${(g.halfNear/g.halfFar).toFixed(3)})</text><text class="note" x="24" y="100">OBJECT SCALE: S(z)=${g.scaleIntercept.toFixed(2)}+${g.scaleSlope.toFixed(2)}z</text></g>
</svg>\n`;
}

function volumePair(g, z, index) {
  const s = g.scale(z);
  const c = g.point(index % 2 === 0 ? -0.52 : -0.62, z);
  const b = g.point(index % 2 === 0 ? 0.48 : 0.58, z);
  const cw = 104 * s;
  const ch = 120 * s;
  const ry = 16 * s;
  const bw = 118 * s;
  const bh = 104 * s;
  const depth = 35 * s;
  const dx = (g.vp.x - b.x);
  const dy = (g.vp.y - b.y);
  const len = Math.hypot(dx, dy);
  const tx = dx / len * depth;
  const ty = dy / len * depth;
  const cylinder = `<g><ellipse cx="${n(c.x + 12)}" cy="${n(c.y + 12)}" rx="${n(cw * .58)}" ry="${n(ry * .85)}" fill="#6b3a2e" opacity=".25" filter="url(#shadow)"/><path d="M ${n(c.x-cw/2)} ${n(c.y-ch+ry)} L ${n(c.x-cw/2)} ${n(c.y-ry)} A ${n(cw/2)} ${n(ry)} 0 0 0 ${n(c.x+cw/2)} ${n(c.y-ry)} L ${n(c.x+cw/2)} ${n(c.y-ch+ry)} Z" fill="#c85342" class="volume-stroke"/><ellipse cx="${n(c.x)}" cy="${n(c.y-ch+ry)}" rx="${n(cw/2)}" ry="${n(ry)}" fill="#efb64d" class="volume-stroke"/><ellipse cx="${n(c.x)}" cy="${n(c.y-ry)}" rx="${n(cw/2)}" ry="${n(ry)}" fill="#b4453b" class="volume-stroke"/><circle cx="${n(c.x)}" cy="${n(c.y-ch*.56)}" r="${n(15*s)}" fill="#59aaa6"/></g>`;
  const x0 = b.x - bw / 2;
  const y0 = b.y;
  const block = `<g><ellipse cx="${n(b.x + 12)}" cy="${n(b.y + 12)}" rx="${n(bw * .62)}" ry="${n(16*s)}" fill="#6b3a2e" opacity=".23" filter="url(#shadow)"/><polygon points="${n(x0)},${n(y0)} ${n(x0+bw)},${n(y0)} ${n(x0+bw)},${n(y0-bh)} ${n(x0)},${n(y0-bh)}" fill="#d97849" class="volume-stroke"/><polygon points="${n(x0)},${n(y0-bh)} ${n(x0+tx)},${n(y0-bh+ty)} ${n(x0+bw+tx)},${n(y0-bh+ty)} ${n(x0+bw)},${n(y0-bh)}" fill="#f0b451" class="volume-stroke"/><polygon points="${n(x0+bw)},${n(y0)} ${n(x0+bw+tx)},${n(y0+ty)} ${n(x0+bw+tx)},${n(y0-bh+ty)} ${n(x0+bw)},${n(y0-bh)}" fill="#b8493e" class="volume-stroke"/><circle cx="${n(b.x)}" cy="${n(b.y-bh*.45)}" r="${n(13*s)}" fill="#59aaa6"/></g>`;
  return `${cylinder}${block}`;
}

function renderComparisonSvg(value, g, metrics) {
  const panel = (kind, x0) => {
    const useSelected = kind === 'selected';
    const q = useSelected
      ? [[g.point(-1, 0), g.point(1, 0), g.point(1, 1), g.point(-1, 1)]]
      : [[g.homography(0, 0), g.homography(1, 0), g.homography(1, 1), g.homography(0, 1)]];
    const pts = q[0].map((p) => `${n(x0+p.x/2)},${n(185+p.y/2)}`).join(' ');
    const rows = value.controlRows.map((row) => {
      const left = useSelected ? g.point(-1, row.z) : g.homography(0, row.z);
      const right = useSelected ? g.point(1, row.z) : g.homography(1, row.z);
      return `<line x1="${n(x0+left.x/2)}" y1="${n(185+left.y/2)}" x2="${n(x0+right.x/2)}" y2="${n(185+right.y/2)}"/>`;
    }).join('');
    return `<polygon points="${pts}" fill="#efd197" stroke="#713b31" stroke-width="6"/><g stroke="#4d9f98" stroke-width="4" stroke-dasharray="12 10">${rows}</g>`;
  };
  const rowText = metrics.comparison.rows.map((row, i) => `<text x="825" y="${1080+i*50}">z ${row.z.toFixed(2)} · selected ${row.selected.widthPx}px / strict ${row.strictHomography.widthPx}px · Δ ${row.delta.fieldWidthPx}px</text>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536">
  <rect width="1536" height="1536" fill="#f8e8c7"/>
  <style>text{font-family:Segoe UI,Arial,sans-serif;fill:#3b211b}.h{font-size:34px;font-weight:700}.s{font-size:22px}.m{font-size:20px;font-family:Consolas,monospace}</style>
  <text class="h" x="52" y="62">P0 v1 · selected 2.5D vs strict homography</text>
  <text class="s" x="52" y="102">Same four corners; different intermediate depth law. Homography remains diagnostic only.</text>
  <text class="h" x="210" y="160">Selected 2.5D</text><text class="h" x="980" y="160">Strict homography</text>
  ${panel('selected', 0)}${panel('strict', 768)}
  <rect x="42" y="1000" width="700" height="430" rx="24" fill="#fff5dc" stroke="#9e674a" stroke-width="4"/>
  <text class="h" x="76" y="1050">Selected object rule</text><text class="m" x="76" y="1100">S(z) = ${g.scaleIntercept.toFixed(2)} + ${g.scaleSlope.toFixed(2)}z</text>
  <text class="m" x="76" y="1150">field near/far = ${(g.halfNear/g.halfFar).toFixed(3)}</text><text class="m" x="76" y="1200">object near/far = ${(g.scale(1)/g.scale(0)).toFixed(3)}</text>
  <text class="s" x="76" y="1260">The weaker object scale matches the illustrated language</text><text class="s" x="76" y="1292">without claiming a physically exact recovered camera.</text>
  <rect x="790" y="1000" width="704" height="430" rx="24" fill="#fff5dc" stroke="#9e674a" stroke-width="4"/>
  <text class="h" x="825" y="1050">Explicit comparison vector</text><g class="m">${rowText}</g>
  <text class="s" x="825" y="1320">No aggregate score. Each difference stays visible.</text>
</svg>\n`;
}

function renderGallery(assets) {
  const formal = 'formal-reference-v1.svg';
  const diagnostic = 'diagnostic-comparison-v1.svg';
  const { source, research, concept } = assets;
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>R4D P0 checkpoint v1</title><link rel="icon" href="data:,"><style>
*{box-sizing:border-box}body{margin:0;background:#241916;color:#f9ecd2;font-family:Segoe UI,Arial,sans-serif}header{padding:28px 36px;background:#3c2520;position:sticky;top:0;z-index:2}h1{margin:0 0 8px;font-size:30px}p{margin:5px 0;color:#dbc5a8}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;padding:24px}.card{background:#3c2b25;border:1px solid #765044;border-radius:18px;overflow:hidden}.card h2{font-size:21px;margin:18px 20px 6px}.card p{margin:0 20px 16px;min-height:48px}.frame{aspect-ratio:1;background:#ead5a8;display:flex;align-items:center;justify-content:center}.frame img{width:100%;height:100%;object-fit:contain}.wide{grid-column:1/-1}.wide .frame{aspect-ratio:1}.role{display:inline-block;padding:3px 9px;border-radius:99px;background:#b65043;font-size:13px;font-weight:700;margin-left:8px}@media(max-width:900px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}}
</style></head><body><header><h1>R4D P0 · Builder checkpoint v1</h1><p>Сопоставимые квадратные кадры. Формальный control один: Research JSON → Builder SVG. Финальная серия генераций ещё не выполнялась.</p></header><main class="grid">
<section class="card"><h2>Исходный референс №03 <span class="role">ART REFERENCE</span></h2><p>Художественное качество, материал, свет и язык объёмов. Read-only, не копируется в Git.</p><div class="frame"><img src="${source}" alt="03 sun temple reference"></div></section>
<section class="card"><h2>Формальный эталон Builder v1 <span class="role">GEOMETRY CONTROL</span></h2><p>Точное поле, опорные точки, ряды и масштабы из Research JSON.</p><div class="frame"><img src="${formal}" alt="formal reference v1"></div></section>
<section class="card"><h2>Research template v0.1 <span class="role">SOURCE CONTROL</span></h2><p>Исходная визуализация числовой модели Researcher.</p><div class="frame"><img src="${research}" alt="research template"></div></section>
<section class="card"><h2>Concept template v0.1 <span class="role">ART DIRECTION ONLY</span></h2><p>Иерархия и художественный язык. Наблюдательная геометрия намеренно не используется как control.</p><div class="frame"><img src="${concept}" alt="concept art-direction template"></div></section>
<section class="card wide"><h2>Диагностическое сравнение <span class="role">NO AGGREGATE SCORE</span></h2><p>Основная 2.5D-модель и строгая гомография в одном кадре; различия сохранены как вектор метрик.</p><div class="frame"><img src="${diagnostic}" alt="2.5D and homography comparison"></div></section>
</main></body></html>\n`;
}

function strictWidthAtMid(g) {
  const l = g.homography(0, 0.5);
  const r = g.homography(1, 0.5);
  return r.x - l.x;
}

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function round(value, digits = 2) { const k = 10 ** digits; return Math.round(value * k) / k; }
function n(value) { return round(value, 2).toFixed(2); }
