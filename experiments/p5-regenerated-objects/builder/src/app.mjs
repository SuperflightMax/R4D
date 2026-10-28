import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import { NativeRun } from './controller.mjs';
import { project, bounds } from './p1-projection.mjs';

const read = async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
};
const [config, p1, inputs, targets, preview, deps] = await Promise.all([
  read('data/config.json'), read('data/p1-manifest.json'), read('data/input-verification.json'),
  read('data/targets.json'), read('data/preview-input.json'), read('data/dependency-pins.json'),
]);
const pins = { configSha256: targets.configSha256, p1ManifestSha256: targets.manifestSha256, p1Commit: targets.p1Commit, artistManifest: preview.artistManifest ?? null,
  core: inputs.native, projectionSha256: inputs.inputs.find(f => f.destination === 'src/p1-projection.mjs').sha256,
  viewMathSha256: inputs.inputs.find(f => f.destination === 'src/p1-view-math.mjs').sha256, dependencies: deps };
const run = new NativeRun(config, pins);
const matrix = p1.projection.nativeToSource;
const point = (x, y) => project(matrix, [x, y]);
const ring = (x, y, r, count = 128) => Array.from({ length: count }, (_, i) => point(x + Math.cos(i * 2 * Math.PI / count) * r, y + Math.sin(i * 2 * Math.PI / count) * r));
const circleWidth = (x, y, r) => { const b = bounds(ring(x, y, r)); return b.maxX - b.minX; };
const el = id => document.getElementById(id);
const host = el('stage');
const app = new Application();
await app.init({ width: host.clientWidth, height: host.clientHeight, preference: 'webgl', backgroundColor: 0x0b1711,
  antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true });
host.appendChild(app.canvas);
const scene = new Container();
const art = new Container();
art.sortableChildren = true;
const geometry = new Container();
scene.addChild(art, geometry);
app.stage.addChild(scene);
const staticGeometry = new Graphics();
const dynamicGeometry = new Graphics();
geometry.addChild(staticGeometry, dynamicGeometry);
const view = { art: true, geometry: true, framing: 'whole' };
let running = false;
let accumulatedMs = 0;
let lastStamp = performance.now();
let manifest = null;
const sprites = [];
const dynamicSprites = [];
const circleLine = (graphics, object, color, width = 3.5) => {
  const points = ring(object.x, object.y, object.r).flat();
  graphics.poly(points, true).stroke({ color: 0x061319, width: width + 4 });
  graphics.poly(points, true).stroke({ color, width });
};
const actual = run.config();
for (const pin of actual.board.pins) circleLine(staticGeometry, pin, 0xf8d651);
for (const segment of actual.board.segments) {
  const a = point(segment.x1, segment.y1), b = point(segment.x2, segment.y2);
  staticGeometry.moveTo(...a).lineTo(...b).stroke({ color: 0x061319, width: 8 });
  staticGeometry.moveTo(...a).lineTo(...b).stroke({ color: 0xff805d, width: 4 });
}
for (const bucket of actual.board.buckets) circleLine(staticGeometry, bucket, 0x5affb0, 3);
for (const drop of actual.board.drops) {
  const [x, y] = point(drop.x, drop.y);
  staticGeometry.moveTo(x - 9, y).lineTo(x + 9, y).moveTo(x, y - 9).lineTo(x, y + 9).stroke({ color: 0xccecff, width: 2 });
}

function positionSprite(item, state) {
  const { spec, texture, sprite, layer } = item;
  if (spec.targetId === '$source') {
    const scale = 1536 / texture.sizePx[0];
    sprite.scale.set(scale);
    sprite.position.set(-texture.groundAnchorPx[0] * scale, -texture.groundAnchorPx[1] * scale);
    layer.zIndex = spec.role === 'floor' ? -1e8 : 1e8;
    return;
  }
  const target = spec.targetId === '$ball'
    ? { x: state.ball.pos.x, y: state.ball.pos.y, r: actual.board.ball.r }
    : actual.board.pins.find(o => o.id === spec.targetId) ?? actual.board.buckets.find(o => o.id === spec.targetId);
  if (!target) throw new Error(`Unknown native binding ${spec.targetId}`);
  const sourceAnchor = point(target.x, target.y);
  const width = circleWidth(target.x, target.y, target.r);
  const scale = width / texture.footprintPx.width;
  sprite.scale.set(scale);
  sprite.position.set(sourceAnchor[0] - texture.groundAnchorPx[0] * scale, sourceAnchor[1] - texture.groundAnchorPx[1] * scale);
  layer.zIndex = spec.role === 'shadow' ? -1e7 + target.y : target.y + target.r * spec.depthOffsetRadii;
}

if (preview.manifestUrl) {
  manifest = await read(preview.manifestUrl);
  const assetBase = new URL('.', new URL(preview.manifestUrl, location.href));
  const textureMap = new Map();
  for (const info of manifest.textures) {
    const texture = await Assets.load(new URL(info.file, assetBase).href);
    textureMap.set(info.id, { info, texture });
  }
  for (const spec of [...manifest.instances].sort((a, b) => a.id.localeCompare(b.id))) {
    const resource = textureMap.get(spec.textureId);
    const sprite = new Sprite(resource.texture);
    let layer = sprite;
    if (spec.sourceClipPx) {
      // The exact Artist-declared source1536 contour clips only this generated
      // floor part. Both sprite and mask remain under the same Art tree.
      layer = new Container();
      const mask = new Graphics().poly(spec.sourceClipPx.polygon.flat(), true).fill({ color: 0xffffff });
      layer.addChild(sprite, mask);
      sprite.mask = mask;
    }
    const item = { spec, texture: resource.info, sprite, layer };
    art.addChild(layer);
    positionSprite(item, run.snapshot());
    sprites.push(item);
    if (spec.targetId === '$ball') dynamicSprites.push(item);
  }
} else if (preview.earlyFloor) {
  const texture = await Assets.load(preview.earlyFloor.file);
  const floor = new Sprite(texture);
  floor.scale.set(1536 / preview.earlyFloor.sizePx[0]);
  floor.zIndex = -1e8;
  art.addChild(floor);
}

function layout() {
  const width = host.clientWidth, height = host.clientHeight;
  app.renderer.resize(width, height);
  const domain = view.framing === 'whole' ? { minX: 0, maxX: 1536, minY: 0, maxY: 1536 }
    : bounds([...targets.objects.flatMap(o => o.sourcePx.groundPolygon), ...actual.board.segments.flatMap(s => [point(s.x1, s.y1), point(s.x2, s.y2)])]);
  const margin = 8;
  const scale = Math.min((width - margin * 2) / (domain.maxX - domain.minX), (height - margin * 2) / (domain.maxY - domain.minY));
  scene.scale.set(scale);
  scene.position.set((width - (domain.maxX - domain.minX) * scale) / 2 - domain.minX * scale,
    (height - (domain.maxY - domain.minY) * scale) / 2 - domain.minY * scale);
}

function render() {
  const state = run.snapshot();
  for (const item of dynamicSprites) positionSprite(item, state);
  art.visible = view.art;
  geometry.visible = view.geometry;
  dynamicGeometry.clear();
  circleLine(dynamicGeometry, { ...state.ball.pos, r: actual.board.ball.r }, 0xffffff, 2.5);
  const [x, y] = point(state.ball.pos.x, state.ball.pos.y);
  dynamicGeometry.moveTo(x - 3, y).lineTo(x + 3, y).moveTo(x, y - 3).lineTo(x, y + 3).stroke({ color: 0xffffff, width: 1.5 });
  el('tick-value').textContent = state.tick;
  el('tick').value = state.tick;
  el('state').textContent = `seed ${run.seed} · ${state.tick} × 5 ms · ${state.result?.kind ?? 'в движении'}${state.result?.bucketId ? ' / ' + state.result.bucketId : ''}`;
  el('pause').textContent = running ? 'Пауза' : 'Продолжить';
  el('current-state').textContent = JSON.stringify(state, null, 2);
}

function setPaused(paused) {
  running = !paused && !run.snapshot().done;
  accumulatedMs = 0;
  lastStamp = performance.now();
  render();
}
function replay(seed = run.seed) {
  setPaused(true);
  run.reset(seed);
  el('seed').value = seed;
  render();
}
function step(count) { setPaused(true); const state = run.step(count); render(); return state; }
function setView(patch) {
  Object.assign(view, patch);
  el('art').checked = view.art;
  el('geometry').checked = view.geometry;
  el('framing').value = view.framing;
  layout(); render();
}
el('new-run').onclick = () => { const seed = crypto.getRandomValues(new Uint32Array(1))[0]; replay(seed); setPaused(false); };
el('replay').onclick = () => { const seed = Number(el('seed').value); replay(seed); };
el('pause').onclick = () => setPaused(running);
el('step-one').onclick = () => step(1);
el('step-ten').onclick = () => step(10);
el('art').onchange = () => setView({ art: el('art').checked });
el('geometry').onchange = () => setView({ geometry: el('geometry').checked });
el('framing').onchange = () => setView({ framing: el('framing').value });
el('tick').max = run.maxTicks;
el('tick').oninput = () => { const tick = Number(el('tick').value); setPaused(true); run.seek(tick); render(); };
el('save').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(run.replayRecord(), null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `p5-seed-${run.seed}-tick-${run.snapshot().tick}.json`; anchor.click(); URL.revokeObjectURL(url);
};
const pinBodies = new Set((manifest?.instances ?? []).filter(i => ['body'].includes(i.role)).map(i => i.targetId));
const receiverBodies = new Set((manifest?.instances ?? []).filter(i => i.role === 'receiver-back').map(i => i.targetId));
const footprintFits = sprites.filter(item => item.spec.targetId !== '$source' && item.spec.targetId !== '$ball').map(item => {
  const target = targets.objects.find(o => o.id === item.spec.targetId);
  const scale = target.sourcePx.footprintWidth / item.texture.footprintPx.width;
  return { instanceId: item.spec.id, targetId: target.id, uniformScale: scale,
    targetDepth: target.sourcePx.footprintDepth, authoredDepthAfterUniformScale: item.texture.footprintPx.depth * scale,
    depthDeltaSourcePx: item.texture.footprintPx.depth * scale - target.sourcePx.footprintDepth };
});
el('coverage').textContent = `${pinBodies.size}/25 препятствий · ${receiverBodies.size}/4 приёмников · ${manifest?.status ?? 'ранний floor без комплекта'}`;
el('notice').textContent = preview.warnings.join(' ') + (!manifest ? ' Шарик пока показан диагностическим контуром.' : ` ${25 - pinBodies.size} препятствие(й) и ${4 - receiverBodies.size} приёмник(а) ещё без арта; физическая геометрия сохранена.`);
const clippedForegroundParts = (manifest?.instances ?? []).filter(i => i.sourceClipPx).map(i => ({ instanceId: i.id, parentId: i.parentId, textureId: i.textureId, role: i.role, ...i.sourceClipPx }));
el('diagnostics').textContent = JSON.stringify({ pins, earlyFloor: preview.earlyFloor, nativeCounts: inputs.counts, footprintFits, clippedForegroundParts,
  eventFrameRule: 'collision event tick t → state t+1; lifecycle events retain state tick', manifestStatus: manifest?.status ?? null }, null, 2);
new ResizeObserver(layout).observe(host);
app.ticker.add(() => {
  const now = performance.now();
  if (running) {
    accumulatedMs += Math.min(now - lastStamp, 250);
    const ticks = Math.floor(accumulatedMs / actual.defaults.tickMs);
    if (ticks > 0) { run.step(ticks); accumulatedMs -= ticks * actual.defaults.tickMs; }
    if (run.snapshot().done) running = false;
    render();
  }
  lastStamp = now;
});
layout(); render();
window.__P5__ = {
  ready: true, snapshot: () => run.snapshot(), config: () => run.config(), replay, step,
  seek: tick => { setPaused(true); const state = run.seek(tick); render(); return state; },
  setPaused, setView, view: () => ({ ...view }), record: () => run.replayRecord(),
  meta: () => structuredClone({ pins, preview, manifest, renderer: app.renderer.type }),
};
