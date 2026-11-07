import { Application } from 'pixi.js';
import { DT, INTRO_DURATION, SceneModel, TRANSFORM_DURATION } from './model.js';
import { KEY_BEATS } from './motion.js';
import { SceneView, loadProductionSkins } from './view.js';
import './style.css';

const host = document.querySelector('#stage');
const hint = document.querySelector('#hint');
const status = document.querySelector('#status');
const unfoldButton = document.querySelector('#unfold');
const messages = {
  waiting: ['Коснитесь сцены или нажмите любую клавишу', 'Маячок ожидает сигнала'],
  beacon: ['Сигнал принят', 'Посылка уже в пути'],
  falling: ['Посылка с неба', 'Капсула приближается к маячку'],
  impact: ['Есть контакт', 'Механизм приходит в равновесие'],
  legs: ['Открываются посадочные створки', 'Лапы выходят из корпуса'],
  eye: ['Любопытство — первый признак жизни', 'Открывается оптический глаз'],
  capsule: ['Нажмите «Раскрыться» или E', 'Капсула следит за курсором и касанием'],
  transforming: ['', 'Механизм раскрывается'],
  mantis: ['', 'Богомол следит за курсором и касанием'],
};

try {
  const params = new URLSearchParams(location.search);
  const initialSeed = params.has('seed') ? Number(params.get('seed')) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0];
  const model = new SceneModel(initialSeed);
  const app = new Application();
  await app.init({ antialias: true, backgroundAlpha: 0, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, resizeTo: host, preference: 'webgl' });
  host.prepend(app.canvas);
  app.canvas.setAttribute('aria-hidden', 'true');
  const view = new SceneView(app, await loadProductionSkins());
  let paused = params.get('paused') === '1';
  let lastPhase;
  let rendered;
  const beatOffsets = Object.freeze(Object.fromEntries(KEY_BEATS.map(({ id, time }) => [id, Math.ceil(time / DT - 1e-9)])));

  function render(paint = false, seconds) {
    view.resize(host.clientWidth, host.clientHeight);
    model.prepareEntry(view.toWorld(0, 0).y);
    const snapshot = seconds === undefined ? model.snapshot() : model.advance(seconds);
    view.render(snapshot);
    rendered = snapshot;
    if (snapshot.phase !== lastPhase) {
      [hint.textContent, status.textContent] = messages[snapshot.phase];
      unfoldButton.hidden = snapshot.phase !== 'capsule';
      host.dataset.phase = snapshot.phase;
      lastPhase = snapshot.phase;
    }
    if (paint) app.render();
    return snapshot;
  }

  function trace() {
    // Clone the evaluated tick and sample its actual Pixi nodes without advancing time.
    const state = structuredClone(rendered);
    const command = state.events.find(event => event.type === 'transform');
    const keyTicks = command && Object.fromEntries(Object.entries(beatOffsets).map(([id, offset]) => [id, command.tick + offset]));
    return {
      ...state,
      keyTicks: keyTicks ?? null,
      planted: state.pose.legs.filter(leg => leg.planted).map(leg => leg.stem + '.foot'),
      render: view.trace(state.pose),
    };
  }

  function pointer(event) {
    const rect = host.getBoundingClientRect();
    const target = view.toWorld(event.clientX - rect.left, event.clientY - rect.top);
    model.setPointer(target.x, target.y);
  }
  host.addEventListener('pointerdown', event => {
    pointer(event);
    if (model.activate(event.pointerType || 'pointer')) render(true);
    host.focus({ preventScroll: true });
  });
  host.addEventListener('pointermove', pointer);
  function unfold(source) {
    if (!model.requestTransform(source)) return false;
    host.focus({ preventScroll: true });
    render(true);
    return true;
  }
  unfoldButton.addEventListener('click', () => unfold('button'));
  window.addEventListener('keydown', event => {
    // Enter/Space retain the focused button's native click. Other keys still
    // activate the scene when restart has left keyboard focus on that button.
    if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return;
    if (event.code === 'KeyE' && unfold('keyboard')) return;
    if (model.activate('keyboard')) render(true);
    if (event.code === 'Space') event.preventDefault();
  });
  document.querySelector('#restart').addEventListener('click', () => { model.reset(initialSeed); render(true); });
  app.ticker.add(ticker => {
    // Do not skip elapsed motion after a slow frame. The model always advances at 120 Hz.
    render(false, !paused && !document.hidden ? ticker.elapsedMS / 1000 : undefined);
  });
  new ResizeObserver(() => render(true)).observe(host);
  document.addEventListener('visibilitychange', () => app.ticker.lastTime = performance.now());
  window.__Q3C__ = Object.freeze({
    ready: true,
    assets: view.skinInfo,
    timing: Object.freeze({ hz: 1 / DT, introSeconds: INTRO_DURATION, transformSeconds: TRANSFORM_DURATION, beatOffsets }),
    snapshot: () => model.snapshot(),
    trace,
    pause: () => { paused = true; return render(true); },
    resume: () => { paused = false; return render(true); },
    activate: () => { model.activate('debug'); return render(true); },
    transform: () => { model.requestTransform('debug'); return render(true); },
    step: seconds => { model.advance(seconds); return render(true); },
    seek: (seconds, options) => { paused = true; model.seek(seconds, options); return render(true); },
    reset: (seed = initialSeed) => { model.reset(seed); return render(true); },
    setPointer: (x, y) => { model.setPointer(x, y); return render(true); },
  });
  render(true);
} catch (error) {
  document.querySelector('#error').hidden = false;
  document.querySelector('#error').textContent = 'Сцена не запустилась: ' + error.message;
  console.error(error);
}
