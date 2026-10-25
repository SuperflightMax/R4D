import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import { Motion, STEP } from './motion.mjs';

const host = document.querySelector('#stage');
const status = document.querySelector('#asset-status');
const motionStatus = document.querySelector('#motion-status');
const actions = [...document.querySelectorAll('[data-command]')];
const app = new Application();
await app.init({ resizeTo: host, antialias: true, background: '#eee9df', preference: 'webgl',
  autoDensity: true, resolution: Math.min(devicePixelRatio, 2) });
host.appendChild(app.canvas);
app.canvas.setAttribute('aria-label', 'Мирон — сборка из растровых частей');
const ground = new Graphics();
const figure = new Container();
const debug = new Graphics();
app.stage.addChild(ground, figure, debug);
let model = null, motion = null, parts = [], paused = false, speed = 1, dark = false;
let sourceSprite = null, errorText = '', loading = false;
let sourceRest = false;
// Current CTO authorization covers only neutral/low; a complete candidate is closed.
const earlyOnly = true;

const point = value => Array.isArray(value) ? { x: value[0], y: value[1] } : value;
function readModel(raw) {
  const jointPoints = Object.fromEntries(Object.entries(raw.jointPoints).map(([key, p]) => [key, point(p)]));
  const required = ['pelvis', 'chest', 'neck', 'head', ...['near', 'far'].flatMap(s =>
    ['Hip', 'Knee', 'Ankle', 'Toe', 'Shoulder', 'Elbow', 'Wrist'].map(k => s + k))];
  for (const key of required) {
    const p = jointPoints[key];
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error(`Нет анатомического ориентира ${key}`);
  }
  if (!raw.parts?.length) throw new Error('parts.json не содержит частей');
  if (!raw.figureBounds || raw.figureBounds[3] <= 0) throw new Error('Нужен figureBounds исходной фигуры');
  for (const part of raw.parts) {
    if (!jointPoints[part.from] || !jointPoints[part.to]) throw new Error(`Нужны from/to для ${part.id}`);
    if (!part.cropRect || !part.file) throw new Error(`Нужны cropRect/file для ${part.id}`);
  }
  return { ...raw, jointPoints };
}

async function load() {
  if (loading) return;
  loading = true;
  status.textContent = 'Загрузка материалов…';
  try {
    const response = await fetch('art/parts.json', { cache: 'no-store' });
    if (!response.ok) {
      if (response.status !== 404) throw new Error(`parts.json: HTTP ${response.status}`);
      await showSource();
      return;
    }
    const next = readModel(await response.json());
    const nextParts = await Promise.all(next.parts.map(async part => {
      const texture = await Assets.load(new URL(part.file, new URL('art/parts.json', location.href)).href);
      const sprite = new Sprite(texture);
      return { ...part, sprite };
    }));
    const contacts = next.contacts ? Object.fromEntries(Object.entries(next.contacts).map(([side, c]) =>
      [side, { heel: point(c.heel), toe: point(c.toe) }])) : null;
    if (earlyOnly && !contacts) throw new Error('Для раннего теста нужны измеренные контакты обеих подошв');
    const nextMotion = new Motion(next.jointPoints, next.figureBounds[3], { contacts, groundY: next.groundY, early: earlyOnly });
    figure.removeChildren().forEach(child => child.destroy());
    sourceSprite = null;
    model = next; parts = nextParts; motion = nextMotion;
    figure.sortableChildren = true;
    for (const part of parts) { part.sprite.zIndex = part.z ?? 0; figure.addChild(part.sprite); }
    errorText = '';
    status.textContent = `Ограниченный тест neutral/low · ${next.version || 'working'} · ${parts.length} реальных частей. Это не полный кандидат.`;
    actions.forEach(button => { button.disabled = earlyOnly && !['idle', 'low'].includes(button.dataset.command); });
    document.querySelector('.hint').textContent = 'Ограниченный тест: исходная раскладка, общая опора и глубокий присед. Ходьба и прыжок пока закрыты. Пробел — пауза; → — шаг.';
    draw();
  } catch (error) {
    errorText = error.message;
    status.textContent = `Сборка не загружена: ${error.message}`;
    console.error(error);
  } finally { loading = false; }
}

async function showSource() {
  if (motion) {
    status.textContent = 'parts.json отсутствует; сохранена уже загруженная сборка. Перечитайте после подготовки файлов.';
    return;
  }
  actions.forEach(button => { button.disabled = true; });
  try {
    const image = await fetch('art/source/whole-v01.png', { method: 'HEAD' });
    if (!image.ok) {
      status.textContent = 'Анимационные части ещё не подготовлены. Художественный результат отсутствует.';
      return;
    }
    if (!sourceSprite) {
      sourceSprite = new Sprite(await Assets.load(new URL('art/source/whole-v01.png', location.href).href));
      figure.addChild(sourceSprite);
    }
    status.textContent = 'Цельный источник v01 · неподвижный, ещё не анимация. Части не подготовлены.';
  } catch (error) { status.textContent = `Источник не загружен: ${error.message}`; }
  draw();
}

function draw() {
  const W = app.screen.width, H = app.screen.height;
  const floor = H - 52;
  const displayHeight = Math.min(420, H * 0.64, W * 0.98);
  app.renderer.background.color = dark ? '#242631' : '#eee9df';
  ground.clear().moveTo(0, floor).lineTo(W, floor).stroke({ width: 1, color: dark ? 0x858896 : 0x9c9588 });
  const groundOffset = (motion?.worldX || 0) * (model ? displayHeight / model.figureBounds[3] : 1);
  for (let x = 0; x < W + 80; x += 80) {
    const actual = x - groundOffset % 80;
    ground.moveTo(actual, floor + 8).lineTo(actual - 10, floor + 15).stroke({ width: 1, color: dark ? 0x626571 : 0xc4bdae });
  }
  debug.clear();
  if (!model) {
    if (sourceSprite) {
      const scale = displayHeight / sourceSprite.texture.height;
      sourceSprite.scale.set(scale);
      sourceSprite.position.set(W / 2 - sourceSprite.texture.width * scale / 2, floor - sourceSprite.texture.height * scale);
    }
    motionStatus.textContent = 'Анимационные команды станут доступны после загрузки реальных частей.';
    return;
  }
  const r = model.jointPoints, p = sourceRest ? r : motion.pose;
  const scale = displayHeight / model.figureBounds[3];
  const floorInSource = motion.groundY ?? model.figureBounds[1] + model.figureBounds[3];
  figure.scale.set(scale);
  figure.position.set(W / 2 - r.pelvis.x * scale, floor - floorInSource * scale);
  for (const part of parts) {
    const a = r[part.from], b = r[part.to], A = p[part.from], B = p[part.to];
    const sprite = part.sprite;
    sprite.pivot.set(a.x - part.cropRect[0], a.y - part.cropRect[1]);
    sprite.position.set(A.x, A.y);
    sprite.rotation = part.rigidPelvis || sourceRest ? 0 : Math.atan2(B.y - A.y, B.x - A.x) - Math.atan2(b.y - a.y, b.x - a.x);
  }
  if (document.querySelector('#joints').checked) {
    for (const part of parts) {
      const a = p[part.from], b = p[part.to];
      const x1 = figure.x + a.x * scale, y1 = figure.y + a.y * scale;
      const x2 = figure.x + b.x * scale, y2 = figure.y + b.y * scale;
      debug.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 1, color: 0x24bde3 });
      debug.circle(x1, y1, 2.5).fill(0xd41364);
    }
  }
  const phaseName = { ground: 'на земле', prepare: 'подготовка', air: 'полёт', land: 'приземление' };
  const targetName = { idle: 'покой', low: 'присед', walk: 'ходьба' };
  const phase = motion.jump?.phase || 'ground';
  motionStatus.textContent = `${sourceRest ? 'Исходная раскладка v02, без исправления опоры' : paused ? 'Пауза' : 'Движение'} · ${motion.time.toFixed(2)} с · ${phaseName[phase]} · ${phase === 'ground' ? 'цель' : 'после посадки'}: ${targetName[motion.target]} · ${speed}×`;
  if (document.querySelector('details').open) document.querySelector('#measurements').textContent = JSON.stringify(motion.measurements(p), (_, v) => typeof v === 'number' ? Math.round(v * 10000) / 10000 : v, 2);
  for (const button of actions) button.setAttribute('aria-pressed', String(button.dataset.command === (motion.jump ? 'jump' : motion.target)));
}

function command(value) {
  if (motion) {
    if (motion.command(value)) {
      sourceRest = false;
      document.querySelector('#rest').setAttribute('aria-pressed', 'false');
    }
    draw();
  }
}
function togglePause() {
  paused = !paused;
  document.querySelector('#pause').textContent = paused ? 'Продолжить' : 'Пауза';
  document.querySelector('#pause').setAttribute('aria-pressed', String(paused));
  draw();
}
function step() { if (!paused) togglePause(); if (motion) motion.advance(STEP); draw(); }
actions.forEach(button => button.addEventListener('click', () => command(button.dataset.command)));
document.querySelector('#pause').addEventListener('click', togglePause);
document.querySelector('#step').addEventListener('click', step);
document.querySelector('#rest').addEventListener('click', () => {
  sourceRest = !sourceRest;
  document.querySelector('#rest').setAttribute('aria-pressed', String(sourceRest));
  draw();
});
document.querySelector('#speed').addEventListener('change', e => { speed = Number(e.target.value); draw(); });
document.querySelector('#background').addEventListener('change', e => { dark = e.target.value === 'dark'; draw(); });
document.querySelector('#joints').addEventListener('change', draw);
document.querySelector('#reload').addEventListener('click', load);
window.addEventListener('keydown', e => {
  if (['INPUT', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); togglePause(); }
  else if (e.code === 'ArrowRight') { e.preventDefault(); step(); }
  else if (['1', '2', '3', '4'].includes(e.key)) command(['idle', 'low', 'walk', 'jump'][Number(e.key) - 1]);
});
app.ticker.add(ticker => {
  if (!paused && motion) motion.advance(Math.min(ticker.deltaMS / 1000, 0.05) * speed);
  draw();
});
// Read-only diagnostic snapshot; UI and QA can inspect the exact current state.
window.q4a = { snapshot: () => ({ version: model?.version || null, loaded: Boolean(motion),
  paused, speed, error: errorText, state: motion?.snapshot() || null }) };
await load();
