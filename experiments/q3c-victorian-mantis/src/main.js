import { Application } from 'pixi.js';
import { LEG_SPECS, SceneModel } from './model.js';
import { SceneView } from './view.js';
import './style.css';

const host = document.querySelector('#stage');
const hint = document.querySelector('#hint');
const status = document.querySelector('#status');
const messages = {
  waiting: ['Коснитесь сцены или нажмите любую клавишу', 'Маячок ожидает сигнала'],
  beacon: ['Сигнал принят', 'Посылка уже в пути'],
  falling: ['Посылка с неба', 'Капсула приближается к маячку'],
  impact: ['Есть контакт', 'Механизм приходит в равновесие'],
  legs: ['Открываются посадочные створки', 'Лапы выходят из корпуса'],
  eye: ['Любопытство — первый признак жизни', 'Открывается оптический глаз'],
  capsule: ['Попробуйте привлечь её внимание', 'Капсула следит за курсором и касанием'],
};

try {
  const params = new URLSearchParams(location.search);
  const initialSeed = params.has('seed') ? Number(params.get('seed')) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0];
  const model = new SceneModel(initialSeed);
  const app = new Application();
  await app.init({ antialias: true, backgroundAlpha: 0, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, resizeTo: host, preference: 'webgl' });
  host.prepend(app.canvas);
  app.canvas.setAttribute('aria-hidden', 'true');
  const view = new SceneView(app, LEG_SPECS);
  let paused = params.get('paused') === '1';
  let lastPhase;

  function render(paint = false) {
    view.resize(host.clientWidth, host.clientHeight);
    model.prepareEntry(view.toWorld(0, 0).y);
    const snapshot = model.snapshot();
    view.render(snapshot);
    if (snapshot.phase !== lastPhase) {
      [hint.textContent, status.textContent] = messages[snapshot.phase];
      host.dataset.phase = snapshot.phase;
      lastPhase = snapshot.phase;
    }
    if (paint) app.render();
    return snapshot;
  }

  function pointer(event) {
    const rect = host.getBoundingClientRect();
    const target = view.toWorld(event.clientX - rect.left, event.clientY - rect.top);
    model.setPointer(target.x, target.y);
  }
  host.addEventListener('pointerdown', event => {
    pointer(event);
    model.activate(event.pointerType || 'pointer');
    host.focus({ preventScroll: true });
  });
  host.addEventListener('pointermove', pointer);
  window.addEventListener('keydown', event => {
    // Enter/Space retain the focused button's native click. Other keys still
    // activate the scene when restart has left keyboard focus on that button.
    if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return;
    model.activate('keyboard');
    if (event.code === 'Space') event.preventDefault();
  });
  document.querySelector('#restart').addEventListener('click', () => { model.reset(initialSeed); render(true); });
  app.ticker.add(ticker => {
    // Do not skip elapsed motion after a slow frame. The model always advances at 120 Hz.
    if (!paused && !document.hidden) model.advance(ticker.elapsedMS / 1000);
    render();
  });
  new ResizeObserver(() => render(true)).observe(host);
  document.addEventListener('visibilitychange', () => app.ticker.lastTime = performance.now());
  window.__Q3C__ = Object.freeze({
    ready: true,
    snapshot: () => model.snapshot(),
    pause: () => { paused = true; return render(true); },
    resume: () => { paused = false; return render(true); },
    activate: () => { model.activate('debug'); return render(true); },
    step: seconds => { model.advance(seconds); return render(true); },
    seek: seconds => { paused = true; model.seek(seconds); return render(true); },
    reset: (seed = initialSeed) => { model.reset(seed); return render(true); },
    setPointer: (x, y) => { model.setPointer(x, y); return render(true); },
  });
  render(true);
} catch (error) {
  document.querySelector('#error').hidden = false;
  document.querySelector('#error').textContent = 'Сцена не запустилась: ' + error.message;
  console.error(error);
}
