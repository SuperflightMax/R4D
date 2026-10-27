import { Application, Assets, Container, Graphics, Matrix, Sprite } from 'pixi.js';
import * as core from '/private/core/index.js';
import { Controller, randomSeed } from './controller.mjs';
import { transform } from '../inputs/view-math.mjs';

const $ = id => document.getElementById(id);
const json = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
};

async function main() {
  const [config, accepted, metadata, art] = await Promise.all([
    json('/inputs/config.json'), json('/inputs/manifest.json'), json('/metadata.json'), json('/assets/manifest.json'),
  ]);
  if (JSON.stringify(art.sourceSize) !== '[1536,1536]') throw new Error('Asset sourceSize must match accepted Jungle');
  const project = point => transform(accepted.projection.nativeToSource, point);
  const params = new URLSearchParams(location.search);
  const requestedSeed = params.has('seed') ? Number(params.get('seed')) : randomSeed();
  const provenance = { ...metadata, projection: accepted.projection, source: accepted.source };
  const sim = new Controller(core, config, provenance, requestedSeed);
  let paused = params.get('paused') === '1';
  let accumulator = 0, runCounter = 0, contactSignature = '', lastSaved = '';
  const observations = [];
  let runId = `observed-${++runCounter}`;
  const stage = $('stage');
  const app = new Application();
  await app.init({ width: stage.clientWidth, height: stage.clientHeight, background: '#182421', antialias: true, preference: 'webgl', resolution: 1, preserveDrawingBuffer: true });
  stage.appendChild(app.canvas);
  const scene = new Container();
  app.stage.addChild(scene);
  const base = new Sprite(await Assets.load('/source/01-jungle.jpg'));
  scene.addChild(base);
  const shadowLayer = new Container(), shadowOcclusion = new Container(), ballLayer = new Container(), ballOcclusion = new Container();
  const diagnostic = new Graphics();
  scene.addChild(shadowLayer, shadowOcclusion, ballLayer, ballOcclusion, diagnostic);
  const sourceFile = file => '/assets/files/' + file.split('/').map(encodeURIComponent).join('/');
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
    const texture = await Assets.load(sourceFile(item.file));
    const makePatch = container => {
      const sprite = new Sprite(texture);
      const [x, y, width, height] = item.sourceRect;
      sprite.position.set(x, y); sprite.width = width; sprite.height = height;
      container.addChild(sprite); return sprite;
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
    const lift = radiusPx * (art.ball?.liftRadii ?? 0.8);
    const isArt = $('art').checked;
    base.visible = isArt; shadowLayer.visible = isArt; shadowOcclusion.visible = isArt; ballOcclusion.visible = isArt;
    marker.clear();
    if (ballSprite) {
      ballSprite.visible = isArt;
      ballSprite.position.set(point.x, point.y - lift);
      ballSprite.scale.set(2 * radiusPx / art.ball.diameterPx);
    }
    if (!ballSprite || !isArt) marker.circle(point.x, point.y, radiusPx).stroke({ color: 0xffdc5b, width: 3 });
    const shadowPosition = { x: ball.x + (art.shadow?.offsetNative?.[0] ?? 8), y: ball.y + (art.shadow?.offsetNative?.[1] ?? 12) };
    if (shadowSprite) {
      const p = project(shadowPosition), px = project({ x: shadowPosition.x + 1, y: shadowPosition.y }), py = project({ x: shadowPosition.x, y: shadowPosition.y + 1 });
      const radii = art.shadow.nativeRadii ?? [1.15, 0.65];
      const sx = 2 * r * radii[0] / art.shadow.footprintPx[0], sy = 2 * r * radii[1] / art.shadow.footprintPx[1];
      shadowSprite.setFromMatrix(new Matrix((px.x-p.x)*sx, (px.y-p.y)*sx, (py.x-p.x)*sy, (py.y-p.y)*sy, p.x, p.y));
    }
    for (const patch of occluders) {
      patch.ball.visible = ball.y < patch.depth;
      patch.shadow.visible = shadowPosition.y < patch.depth;
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
    const signature = contacts.map(c => `${c.objectId}:${c.observedAtTick}`).join(',');
    if (signature !== contactSignature) {
      contactSignature = signature;
      $('contacts').replaceChildren(new Option('Выбрать контакт', ''));
      for (const event of contacts) $('contacts').add(new Option(`${event.observedAtTick}: ${event.objectKind} ${event.objectId}`, String(event.observedAtTick)));
    }
    const result = sim.state.result ? ` · ${sim.state.result.kind}${sim.state.result.bucketId ? ' '+sim.state.result.bucketId : ''}` : '';
    $('status').textContent = `Seed ${sim.seed} · тик ${sim.state.tick} · ${(sim.state.tick*config.defaults.tickMs/1000).toFixed(3)} с · контактов ${contacts.length}${result}`;
    if (document.activeElement !== $('seed')) $('seed').value = sim.seed;
    if (document.activeElement !== $('target')) $('target').value = sim.state.tick;
    $('state').textContent = JSON.stringify({ state: sim.snapshot(), lastContact: contacts.at(-1), ballSource: point, radiusPx, occludedBy: occluders.filter(p=>p.ball.visible).map(p=>p.id) }, null, 2);
    $('pause').textContent = paused ? 'Продолжить' : 'Пауза';
    app.render();
  }

  function record(reason) {
    const item = { id: runId, reason, ...sim.descriptor() };
    const i = observations.findIndex(run => run.id === runId);
    const previous = observations[i];
    const inspectedTicks = [...new Set([...(previous?.inspectedTicks || []), item.tick])];
    if (i < 0) observations.push({ ...item, inspectedTicks });
    else observations[i] = { ...(previous.tick > item.tick ? previous : item), inspectedTicks };
    return item;
  }
  async function save(reason = 'manual') {
    record(reason);
    const response = await fetch('/api/checkpoint', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ schema:'r4d.p2.checkpoint.v1', reason, observations, artManifest: art }) });
    if (!response.ok) throw new Error(await response.text());
    const saved = await response.json();
    $('save-status').textContent = `Повтор сохранён: ${saved.saved}`;
    return saved;
  }
  function start(seed, reason) {
    record('superseded'); sim.reset(seed); runId = `observed-${++runCounter}`;
    accumulator = 0; contactSignature = ''; lastSaved = ''; record(reason); render();
  }
  function step(count) { paused = true; accumulator = 0; sim.advance(count); render(); return sim.snapshot(); }
  function seek(tick) { paused = true; accumulator = 0; sim.seek(tick); contactSignature = ''; render(); return sim.snapshot(); }
  $('random').onclick = async () => { await save('before-new-random'); start(randomSeed(), 'ordinary-random'); paused = false; render(); };
  $('replay').onclick = async () => { await save('before-replay'); const seed = sim.seed; start(seed, 'replay'); paused = false; render(); };
  $('pause').onclick = () => { paused = !paused; accumulator = 0; render(); };
  $('step1').onclick = () => step(1); $('step10').onclick = () => step(10); $('step100').onclick = () => step(100);
  $('seek').onclick = () => seek(Number($('target').value));
  $('load-seed').onclick = async () => { const seed = Number($('seed').value); await save('before-explicit-seed'); start(seed, 'explicit-seed'); paused = true; render(); };
  $('save').onclick = () => save().catch(showError);
  $('contacts').onchange = () => { if ($('contacts').value) seek(Number($('contacts').value)); };
  $('art').onchange = render; $('geometry').onchange = render;
  for (const field of [$('seed'), $('target')]) field.onfocus = () => { paused = true; accumulator = 0; render(); };
  app.ticker.add(ticker => {
    if (!paused && !sim.state.done) {
      accumulator += ticker.deltaMS;
      const ticks = Math.min(Math.floor(accumulator / config.defaults.tickMs), sim.maxTicks - sim.state.tick);
      if (ticks) { sim.advance(ticks); accumulator -= ticks * config.defaults.tickMs; render(); }
    }
    if (sim.state.done && lastSaved !== `${runId}:${sim.state.tick}`) {
      lastSaved = `${runId}:${sim.state.tick}`;
      save('completed').catch(showError);
    }
  });
  window.addEventListener('unhandledrejection', event => showError(event.reason));
  window.p2QA = {
    snapshot: () => ({ state: sim.snapshot(), seed: sim.seed, contacts: structuredClone(sim.contacts), provenance, art: structuredClone(art), paused }),
    pause: () => { paused = true; accumulator = 0; render(); },
    step, seek,
    replay: seed => { record('before-qa-replay'); start(seed, 'qa-replay'); paused = true; render(); return sim.snapshot(); },
    random: () => { record('before-qa-random'); start(randomSeed(), 'ordinary-qa-random'); paused = true; render(); return sim.seed; },
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
