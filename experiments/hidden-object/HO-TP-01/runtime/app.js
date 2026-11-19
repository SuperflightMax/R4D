'use strict';

const SOURCE_SHA256 = 'f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e';
const MANIFEST_SHA256 = '8d6cc5010886ec46a66258afe8685b93b137376c7bf87bc8c66bb80441edeff0';
const SIZE = { width: 1672, height: 941 };
const DURATION = 200;
const ITEMS = ['bread', 'bowl'];
const STATE_NAMES = ['both', 'bread_removed', 'bowl_removed', 'both_removed'];
const STATE_LABELS = ['Хлеб и миска на месте', 'Хлеб подобран; миска на месте', 'Миска подобрана; хлеб на месте', 'Оба предмета подобраны'];
const sceneCanvas = document.querySelector('#scene');
const sceneContext = sceneCanvas.getContext('2d');
const frames = document.querySelector('#frames');
const compareButton = document.querySelector('#compare');
const zoomButton = document.querySelector('#zoom');
const resetButton = document.querySelector('#reset');
const statusLine = document.querySelector('#status');
const images = {};
const hitLuma = {};
const hitMaskStats = {};
const progress = { bread: 0, bowl: 0 };
const animations = new Map();
const events = [];
let loaded = false;
let comparison = false;
let nativePixels = false;
let removed = 0;
let animationFrame = 0;
let run = 1;

function fitCanvas() {
  const availableHeight = frames.clientHeight - document.querySelector('#work-caption').offsetHeight;
  const scale = nativePixels ? 1 : Math.min(frames.clientWidth / SIZE.width, availableHeight / SIZE.height);
  sceneCanvas.style.width = (SIZE.width * Math.max(0, scale)) + 'px';
  sceneCanvas.style.height = (SIZE.height * Math.max(0, scale)) + 'px';
}

function drawScene() {
  if (!loaded) return;
  sceneContext.globalAlpha = 1;
  sceneContext.drawImage(images.source, 0, 0);
  if (!comparison) {
    for (const item of ITEMS) {
      sceneContext.globalAlpha = progress[item];
      const origin = window.HOTP01_ASSETS.objects[item].origin;
      sceneContext.drawImage(images[item], origin[0], origin[1]);
    }
  }
  sceneContext.globalAlpha = 1;
}

function updateView() {
  drawScene();
  zoomButton.setAttribute('aria-pressed', String(nativePixels));
  zoomButton.textContent = nativePixels ? 'Вместить полный кадр' : 'Исходные пиксели 1:1';
  compareButton.setAttribute('aria-pressed', String(comparison));
  compareButton.textContent = comparison ? 'Вернуться к рабочему кадру' : 'Показать исходник';
  document.querySelector('#work-caption').textContent = comparison
    ? 'Оригинал C2 · прогон сохранён · подбор выключен'
    : 'Рабочий кадр · ' + STATE_LABELS[removed];
  statusLine.textContent = comparison
    ? 'Сравнение с исходником. Вернитесь к рабочему кадру, чтобы продолжить подбор.'
    : STATE_LABELS[removed] + '. ' + (removed === 3 ? 'Сброс начинает новый прогон.' : 'Нажмите на хлеб или миску.');
  sceneCanvas.setAttribute('aria-label', comparison ? 'Полный исходный кадр C2; подбор выключен' : STATE_LABELS[removed]);
  sceneCanvas.style.cursor = 'default';
  fitCanvas();
}

function animate(now) {
  animationFrame = 0;
  for (const [item, start] of animations) {
    progress[item] = Math.min(1, Math.max(0, (now - start) / DURATION));
    if (progress[item] === 1) animations.delete(item);
  }
  drawScene();
  if (animations.size) animationFrame = requestAnimationFrame(animate);
}

function contourAt(x, y) {
  if (x < 0 || y < 0 || x >= SIZE.width || y >= SIZE.height) return null;
  const index = Math.floor(y) * SIZE.width + Math.floor(x);
  for (const item of ITEMS) {
    if (hitLuma[item][index] >= 128) return item;
  }
  return null;
}

function hitTest(x, y) {
  if (!loaded || comparison) return null;
  const item = contourAt(x, y);
  return item && !(removed & (1 << ITEMS.indexOf(item))) ? item : null;
}

function nativePoint(event) {
  const rect = sceneCanvas.getBoundingClientRect();
  return [(event.clientX - rect.left) * SIZE.width / rect.width, (event.clientY - rect.top) * SIZE.height / rect.height];
}

sceneCanvas.addEventListener('click', event => {
  const [x, y] = nativePoint(event);
  const item = hitTest(x, y);
  if (!item) return;
  removed |= 1 << ITEMS.indexOf(item);
  animations.set(item, performance.now());
  progress[item] = 0;
  events.push({ run, type: 'pickup', item, x, y, state: STATE_NAMES[removed] });
  if (events.length > 32) events.shift();
  updateView();
  if (!animationFrame) animationFrame = requestAnimationFrame(animate);
});
sceneCanvas.addEventListener('pointermove', event => {
  const [x, y] = nativePoint(event);
  sceneCanvas.style.cursor = hitTest(x, y) ? 'pointer' : 'default';
});
sceneCanvas.addEventListener('pointerleave', () => { sceneCanvas.style.cursor = 'default'; });
compareButton.addEventListener('click', () => { comparison = !comparison; updateView(); });
zoomButton.addEventListener('click', () => { nativePixels = !nativePixels; updateView(); });
resetButton.addEventListener('click', () => {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  animations.clear();
  removed = 0;
  progress.bread = progress.bowl = 0;
  comparison = false;
  run++;
  events.push({ run, type: 'reset', state: 'both' });
  if (events.length > 32) events.shift();
  updateView();
});
new ResizeObserver(fitCanvas).observe(frames);

// Read-only QA access. Tests drive real mouse/buttons and control the browser's
// clock; no test-only mutation of gameplay state or replacement raster is used.
window.HOTP01 = Object.freeze({
  snapshot: () => ({
    loaded,
    readyForPickup: loaded && !comparison && removed !== 3,
    checkpoint: 'TECHNICAL_CANDIDATE_ART_PARTIAL',
    availableStates: loaded ? STATE_NAMES.slice() : [],
    state: loaded ? STATE_NAMES[removed] : null,
    removedMask: removed,
    run,
    comparison,
    nativePixels,
    view: comparison ? 'original' : 'working',
    transitionMs: DURATION,
    transitionProgress: { ...progress },
    animating: animations.size > 0,
    events: events.map(event => ({ ...event })),
    sourceSha256: SOURCE_SHA256,
    manifestSha256: MANIFEST_SHA256,
    hitDecoder: 'binary L luminance >=128; PNG alpha is not used',
    hitMasks: Object.fromEntries(ITEMS.map(item => [item, { ...hitMaskStats[item] }])),
    artStatus: 'PARTIAL: bowl upper linen seam; no independent or human art acceptance',
    ...SIZE,
    roi: { x: 0, y: 480, width: 960, height: 461 },
  }),
  contourAt: (x, y) => loaded ? contourAt(x, y) : null,
  hitTest,
});

async function loadImage(entry) {
  const image = new Image();
  image.src = entry.dataUrl;
  await image.decode();
  if (image.naturalWidth !== entry.width || image.naturalHeight !== entry.height) throw new Error('Размер входного растра не совпал с манифестом.');
  return image;
}

async function start() {
  const assets = window.HOTP01_ASSETS;
  if (!assets || assets.source.sha256 !== SOURCE_SHA256 || assets.manifestSha256 !== MANIFEST_SHA256) throw new Error('Нет exact-пакета manifest_v002. Выполните pack.ps1; другой вход не подставляется.');
  images.source = await loadImage(assets.source);
  const occupied = new Uint8Array(SIZE.width * SIZE.height);
  const hitOccupied = new Uint8Array(SIZE.width * SIZE.height);
  for (const item of ITEMS) {
    const object = assets.objects[item];
    images[item] = await loadImage(object.patch);
    const scratch = new OffscreenCanvas(object.patch.width, object.patch.height);
    const context = scratch.getContext('2d');
    context.drawImage(images[item], 0, 0);
    const pixels = context.getImageData(0, 0, scratch.width, scratch.height).data;
    for (let y = 0; y < scratch.height; y++) for (let x = 0; x < scratch.width; x++) {
      if (!pixels[(y * scratch.width + x) * 4 + 3]) continue;
      const sx = x + object.origin[0], sy = y + object.origin[1];
      if (sx < 0 || sx >= 960 || sy < 480 || sy >= SIZE.height) throw new Error('Альфа вставки выходит за ROI. STOP CTO.');
      const index = sy * SIZE.width + sx;
      if (occupied[index]) throw new Error('Альфы двух вставок перекрываются. STOP CTO.');
      occupied[index] = 1;
    }
    const maskImage = await loadImage(object.hitMask);
    const maskCanvas = new OffscreenCanvas(SIZE.width, SIZE.height);
    const maskContext = maskCanvas.getContext('2d');
    maskContext.drawImage(maskImage, 0, 0);
    const maskPixels = maskContext.getImageData(0, 0, SIZE.width, SIZE.height).data;
    const luma = new Uint8Array(SIZE.width * SIZE.height);
    let count = 0;
    for (let index = 0; index < luma.length; index++) {
      const offset = index * 4, value = maskPixels[offset];
      if (value !== maskPixels[offset+1] || value !== maskPixels[offset+2] || maskPixels[offset+3] !== 255 || (value !== 0 && value !== 255)) throw new Error('Hit-mask не является точной бинарной L-маской. STOP CTO.');
      luma[index] = value; // Read brightness. Alpha is 255 even on the black background.
      if (value >= 128) {
        if (hitOccupied[index]) throw new Error('Object-only hit masks перекрываются. STOP CTO.');
        hitOccupied[index] = 1;
        count++;
      }
    }
    if (count !== object.hitMaskGeometry.nonzero_pixels) throw new Error('Число пикселей hit-mask не совпало с манифестом. STOP CTO.');
    hitLuma[item] = luma;
    hitMaskStats[item] = { sha256: object.hitMask.sha256, nonzeroPixels: count, inwardGuardPx: object.hitMaskGeometry.native_inner_guard_px };
  }
  loaded = true;
  updateView();
  compareButton.disabled = zoomButton.disabled = resetButton.disabled = false;
}

start().catch(error => {
  statusLine.textContent = error.message;
  statusLine.classList.add('error');
});
