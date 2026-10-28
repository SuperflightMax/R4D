import { Application, Assets, Container, Graphics, Matrix, Rectangle, Sprite, Texture } from 'pixi.js';
import * as core from '../runtime/sim-core.mjs';
import { Controller, randomSeed } from './controller.mjs';
import { PlaybackClock, mergeObservation } from './playback-clock.mjs';
import { transform } from '../inputs/view-math.mjs';

const $ = id => document.getElementById(id);
const routeBase = new URL('../', import.meta.url);
const resource = relative => new URL(relative, routeBase).href;
const json = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
};

async function main() {
  const [config, accepted, metadata, art] = await Promise.all([
    json(resource('inputs/config.json')), json(resource('inputs/manifest.json')), json(resource('metadata.json')), json(resource('assets/manifest.json')),
  ]);
  if (JSON.stringify(art.sourceSize) !== '[1536,1536]') throw new Error('Asset sourceSize must match accepted Jungle');
  const project = point => transform(accepted.projection.nativeToSource, point);
  const params = new URLSearchParams(location.search);
  const requestedSeed = params.has('seed') ? Number(params.get('seed')) : randomSeed();
  const provenance = { ...metadata, projection: accepted.projection, source: accepted.source };
  const sim = new Controller(core, config, provenance, requestedSeed);
  let paused = params.get('paused') === '1';
  let knownContacts = [];
  const clock = new PlaybackClock(config.defaults.tickMs, Number($('playback-rate').value));
  let runCounter = 0, contactSignature = '', lastSaved = '';
  let presentationHistory = [], presentationSequence = 0;
  const observations = [];
  let runId = `observed-${++runCounter}`;
  const stage = $('stage');
  const app = new Application();
  await app.init({ width: stage.clientWidth, height: stage.clientHeight, background: '#182421', antialias: true, preference: 'webgl', resolution: 1, preserveDrawingBuffer: true });
  stage.appendChild(app.canvas);
  const scene = new Container();
  app.stage.addChild(scene);
  const base = new Sprite(await Assets.load(resource('source/01-jungle.jpg')));
  scene.addChild(base);
  const shadowLayer = new Container(), shadowOcclusion = new Container(), ballLayer = new Container(), ballOcclusion = new Container();
  const diagnostic = new Graphics();
  scene.addChild(shadowLayer, shadowOcclusion, ballLayer, ballOcclusion, diagnostic);
  const sourceFile = file => resource('assets/files/' + file.split('/').map(encodeURIComponent).join('/'));
  let ballSprite, shadowSprite;
  const marker = new Graphics();
  ballLayer.addChild(marker);
  if (art.ball) {
    ballSprite = new Sprite(await Assets.load(sourceFile(art.ball.file)));
    ballSprite.anchor.set(art.ball.centerPx[0] / ballSprite.texture.width, art.ball.centerPx[1] / ballSprite.texture.height);
    ballLayer.addChild(ballSprite);
  }
  if (art.shadow) {
    shadowSprite = new Sprite(await Assets.load(sourceFile(art.shadow.file)));
    shadowSprite.anchor.set(art.shadow.centerPx[0] / shadowSprite.texture.width, art.shadow.centerPx[1] / shadowSprite.texture.height);
    shadowSprite.alpha = art.shadow.opacity ?? 1;
    shadowLayer.addChild(shadowSprite);
  }
  const occluders = [];
  for (const item of art.occluders) {
    const pin = config.board.pins.find(pin => pin.id === item.id);
    const bucket = config.board.buckets.find(bucket => bucket.id === item.id);
    const depth = item.depthNativeY ?? pin?.y ?? bucket?.y;
    if (!Number.isFinite(depth)) throw new Error(`Occluder needs accepted collider id or depthNativeY: ${item.id}`);
    const texture = item.fileRole === 'source'
      ? new Texture({ source: base.texture.source, frame: new Rectangle(...item.sourceRect) })
      : await Assets.load(sourceFile(item.file));
    const makePatch = container => {
      const sprite = new Sprite(texture);
      const [x, y, width, height] = item.sourceRect;
      sprite.position.set(x, y); sprite.width = width; sprite.height = height;
      container.addChild(sprite);
      if (item.polygonRectLocalPx) {
        const mask = new Graphics().poly(item.polygonRectLocalPx.flat()).fill(0xffffff);
        mask.position.set(x, y);
        container.addChild(mask);
        sprite.mask = mask;
      }
      return sprite;
    };
    occluders.push({ id: item.id, depth, ball: makePatch(ballOcclusion), shadow: makePatch(shadowOcclusion) });
  }
  $('asset-status').textContent = art.mode === 'diagnostic' || !ballSprite
    ? 'Диагностический круг · художественная проверка ещё не пройдена'
    : `Объёмный шар · накладки: ${occluders.length}`;

  function fit() {
    const zoom = Number($('zoom').value);
    const scale = Math.min(stage.clientWidth, stage.clientHeight) / 1536 * zoom;
    const width = Math.max(stage.clientWidth, Math.round(1536 * scale));
    const height = Math.max(stage.clientHeight, Math.round(1536 * scale));
    app.renderer.resize(width, height);
    scene.scale.set(scale);
    scene.position.set((width - 1536 * scale) / 2, (height - 1536 * scale) / 2);
  }
  new ResizeObserver(fit).observe(stage);
  $('zoom').onchange = fit;
  fit();

  function circlePath(graphics, center, radius, color, width = 2) {
    for (let i = 0; i <= 64; i++) {
      const a = i / 64 * Math.PI * 2;
      const p = project({ x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius });
      if (i === 0) graphics.moveTo(p.x, p.y); else graphics.lineTo(p.x, p.y);
    }
    graphics.stroke({ color, width });
  }

  function render() {
    const ball = sim.state.ball.pos, r = config.board.ball.r, point = project(ball);
    const right = project({ x: ball.x + r, y: ball.y }), left = project({ x: ball.x - r, y: ball.y });
    const radiusPx = Math.hypot(right.x - left.x, right.y - left.y) / 2;
    const dy = project({ x: ball.x, y: ball.y+1 }).y - project({ x: ball.x, y: ball.y-1 }).y;
    const k = dy / 2 / (radiusPx/r);
    const lift = radiusPx * (art.ball?.liftRadii ?? Math.sqrt(Math.max(0, 1-k*k)));
    const isArt = $('art').checked;
    base.visible = isArt; shadowLayer.visible = isArt; shadowOcclusion.visible = isArt; ballOcclusion.visible = isArt;
    marker.clear(); marker.visible = isArt && !ballSprite;
    if (ballSprite) {
      ballSprite.visible = isArt;
      ballSprite.position.set(point.x, point.y - lift);
      ballSprite.scale.set(2 * radiusPx / art.ball.diameterPx);
    }
    if (!ballSprite) marker.circle(point.x, point.y-lift, radiusPx).stroke({ color: 0xffdc5b, width: 3 });
    const shadowPosition = { x: ball.x + (art.shadow?.offsetNative?.[0] ?? 8), y: ball.y + (art.shadow?.offsetNative?.[1] ?? 12) };
    if (shadowSprite) {
      const p = project(shadowPosition), px = project({ x: shadowPosition.x + 1, y: shadowPosition.y }), py = project({ x: shadowPosition.x, y: shadowPosition.y + 1 });
      const radii = art.shadow.nativeRadii ?? [1.15, 0.65];
      const sx = 2 * r * radii[0] / art.shadow.footprintPx[0], sy = 2 * r * radii[1] / art.shadow.footprintPx[1];
      shadowSprite.setFromMatrix(new Matrix((px.x-p.x)*sx, (px.y-p.y)*sx, (py.x-p.x)*sy, (py.y-p.y)*sy, p.x, p.y));
    }
    for (const patch of occluders) {
      patch.ball.visible = ball.y < patch.depth;
      // The floor shadow never paints any visible object surface. This pass is
      // below the ball, so it cannot hide a foreground ball with the same patch.
      patch.shadow.visible = true;
    }
    // Both the collision path and geometry are above every artistic occluder.
    diagnostic.clear(); diagnostic.visible = $('geometry').checked;
    if (diagnostic.visible) {
      for (const pin of config.board.pins) circlePath(diagnostic, pin, pin.r, 0x55ffff);
      for (const seg of config.board.segments) {
        const a = project({ x: seg.x1, y: seg.y1 }), b = project({ x: seg.x2, y: seg.y2 });
        diagnostic.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: 0xff86fa, width: 2 });
      }
      for (const bucket of config.board.buckets) circlePath(diagnostic, bucket, bucket.r, 0x83ff5f);
      const start = project(config.board.drops[0]);
      diagnostic.moveTo(start.x-8,start.y).lineTo(start.x+8,start.y).moveTo(start.x,start.y-8).lineTo(start.x,start.y+8).stroke({color:0xffffff,width:2});
      sim.frames.forEach((frame, i) => {
        const p = project(frame.ball.pos);
        if (i === 0) diagnostic.moveTo(p.x, p.y); else diagnostic.lineTo(p.x, p.y);
      });
      diagnostic.stroke({ color: 0xffffff, width: 1.5, alpha: 0.9 });
      circlePath(diagnostic, ball, r, 0xffdc5b, 3);
    }
    const contacts = sim.contacts;
    for (const event of contacts) {
      if (!knownContacts.some(c => c.objectId === event.objectId && c.observedAtTick === event.observedAtTick)) knownContacts.push(structuredClone(event));
    }
    const signature = knownContacts.map(c => `${c.objectId}:${c.observedAtTick}`).join(',');
    if (signature !== contactSignature) {
      contactSignature = signature;
      $('contacts').replaceChildren(new Option('Выбрать контакт', ''));
      for (const event of knownContacts) $('contacts').add(new Option(`${event.observedAtTick}: ${event.objectKind} ${event.objectId}`, String(event.observedAtTick)));
    }
    const result = sim.state.result ? ` · ${sim.state.result.kind}${sim.state.result.bucketId ? ' '+sim.state.result.bucketId : ''}` : '';
    $('status').textContent = `Seed ${sim.seed} · тик ${sim.state.tick} · ${(sim.state.tick*config.defaults.tickMs/1000).toFixed(3)} с симуляции · ${String(clock.rate).replace('.', ',')}× · контактов ${contacts.length}${result}`;
    if (document.activeElement !== $('seed')) $('seed').value = sim.seed;
    if (document.activeElement !== $('target')) $('target').value = sim.state.tick;
    $('state').textContent = JSON.stringify({ state: sim.snapshot(), lastContact: contacts.at(-1), ballSource: point, radiusPx, occludedBy: occluders.filter(p=>p.ball.visible).map(p=>p.id) }, null, 2);
    $('pause').textContent = paused ? 'Продолжить' : 'Пауза';
    app.render();
  }

  function presentation() {
    return { schema: 'r4d.p2.presentation.v1', atTick: sim.state.tick,
      clock: clock.snapshot(), history: structuredClone(presentationHistory) };
  }
  function record(reason, details = {}) {
    presentationHistory.push({ sequence: ++presentationSequence, reason, atTick: sim.state.tick,
      rate: clock.rate, paused, hidden: document.hidden, zoom: Number($('zoom').value),
      art: $('art').checked, geometry: $('geometry').checked, ...details });
    const item = { id: runId, reason, ...sim.descriptor(), presentation: presentation() };
    const i = observations.findIndex(run => run.id === runId);
    const previous = observations[i];
    const merged = mergeObservation(previous, item);
    if (i < 0) observations.push(merged);
    else observations[i] = merged;
    return item;
  }
  function save(reason = 'manual') {
    record(reason);
    const checkpoint = { schema:'r4d.p2.checkpoint.v1', reason, observations:structuredClone(observations), artManifest:structuredClone(art) };
    const filename = `r4d-p2-seed-${sim.seed}-tick-${sim.state.tick}.json`;
    const url = URL.createObjectURL(new Blob([JSON.stringify(checkpoint,null,2)+'\n'], {type:'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link);
    link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('save-status').textContent = `JSON передан браузеру для скачивания: ${filename}`;
    return { filename, checkpoint };
  }
  function start(seed, reason, nextPaused = paused) {
    record('superseded'); sim.reset(seed); runId = `observed-${++runCounter}`;
    paused = nextPaused; clock.reset(); presentationHistory = []; presentationSequence = 0;
    contactSignature = ''; knownContacts = []; lastSaved = ''; record(reason); render();
  }
  function step(count) { paused = true; clock.reset(); sim.advance(count); record('manual-step', { requestedTicks: count }); render(); return sim.snapshot(); }
  function seek(tick) { paused = true; clock.reset(); sim.seek(tick); contactSignature = ''; record('seek', { requestedTick: tick }); render(); return sim.snapshot(); }
  function setPlaybackRate(rate) {
    clock.setRate(rate); $('playback-rate').value = String(rate);
    record('rate-change'); render(); return presentation();
  }
  $('random').onclick = () => start(randomSeed(), 'ordinary-random', false);
  $('replay').onclick = () => start(sim.seed, 'replay', false);
  $('pause').onclick = () => { paused = !paused; clock.reset(); record(paused ? 'pause' : 'continue'); render(); };
  $('playback-rate').onchange = () => setPlaybackRate(Number($('playback-rate').value));
  $('step1').onclick = () => step(1); $('step10').onclick = () => step(10); $('step100').onclick = () => step(100);
  $('seek').onclick = () => seek(Number($('target').value));
  $('load-seed').onclick = () => start(Number($('seed').value), 'explicit-seed', true);
  $('save').onclick = () => { try { save(); } catch(error) { showError(error); } };
  $('contacts').onchange = () => { if ($('contacts').value) seek(Number($('contacts').value)); };
  $('art').onchange = render; $('geometry').onchange = render;
  for (const field of [$('seed'), $('target')]) field.onfocus = () => { paused = true; clock.reset(); record('focus-pause'); render(); };
  clock.setSuspended(document.hidden);
  document.addEventListener('visibilitychange', () => {
    clock.setSuspended(document.hidden);
    record(document.hidden ? 'visibility-hidden' : 'visibility-visible');
    if (!document.hidden) render();
  });
  app.ticker.add(ticker => {
    if (!paused && !sim.state.done) {
      const ticks = clock.consume(ticker.deltaMS, sim.maxTicks - sim.state.tick);
      if (ticks) { sim.advance(ticks); if (sim.state.done) clock.reset(); render(); }
    }
    if (sim.state.done && lastSaved !== `${runId}:${sim.state.tick}`) {
      lastSaved = `${runId}:${sim.state.tick}`;
      record('completed');
      $('save-status').textContent = 'Запуск завершён. «Сохранить повтор» скачивает JSON всех наблюдавшихся запусков.';
    }
  });
  window.addEventListener('unhandledrejection', event => showError(event.reason));
  window.p2QA = {
    snapshot: () => ({ state: sim.snapshot(), seed: sim.seed, contacts: structuredClone(sim.contacts), provenance, art: structuredClone(art), paused, presentation: presentation() }),
    pause: () => { paused = true; clock.reset(); record('qa-pause'); render(); },
    step, seek, setPlaybackRate,
    replay: seed => { record('before-qa-replay'); start(seed, 'qa-replay', true); return sim.snapshot(); },
    random: () => { record('before-qa-random'); start(randomSeed(), 'ordinary-qa-random', true); return sim.seed; },
    finish: () => step(sim.maxTicks),
    setArt: visible => { $('art').checked = visible; render(); },
    setGeometry: visible => { $('geometry').checked = visible; render(); },
    setZoom: value => { $('zoom').value = String(value); fit(); render(); },
    exportRuns: () => { record('qa-export'); return structuredClone(observations); }, save,
    ready: true,
  };
  record(params.has('seed') ? 'requested-start' : 'ordinary-random-start');
  render();
}
function showError(error) {
  $('save-status').textContent = error?.message || String(error);
  $('save-status').classList.add('error');
  console.error(error);
}
main().catch(error => { $('asset-status').textContent = 'Сцена не запущена'; showError(error); });
