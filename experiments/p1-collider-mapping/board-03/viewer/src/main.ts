import './style.css';
import { requireBoard03Bundle } from './dependency-gate';
import { Board03Scene } from './scene';
import { ViewerState } from './viewer-state';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('#app is missing');

try {
  const bundle = requireBoard03Bundle();
  const state = new ViewerState(bundle);
  root.innerHTML = layout(bundle.projection.mode === 'perspective');

  const viewport = root.querySelector<HTMLElement>('[data-viewport]');
  if (!viewport) throw new Error('viewer viewport is missing');
  const scene = new Board03Scene(viewport, bundle, state);
  await scene.init();

  const sync = (): void => {
    const snapshot = state.snapshot;
    setText(root, '[data-seed]', String(snapshot.seed));
    setText(root, '[data-tick]', String(snapshot.tick));
    setText(root, '[data-rng]', String(snapshot.rngU32));
    setText(root, '[data-status]', snapshot.done ? `done: ${String(snapshot.result)}` : 'running');
    scene.render();
  };

  root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.dataset.layer === 'art') state.setArt(input.checked);
      if (input.dataset.layer === 'geometry') state.setGeometry(input.checked);
      sync();
    });
  });
  root.querySelectorAll<HTMLButtonElement>('button[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.setView(button.dataset.view === 'flat' ? 'flat' : 'perspective');
      sync();
    });
  });
  root.querySelectorAll<HTMLButtonElement>('button[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      state.stepTicks(Number(button.dataset.step));
      sync();
    });
  });
  root.querySelector<HTMLButtonElement>('button[data-reset]')?.addEventListener('click', () => {
    const input = root.querySelector<HTMLInputElement>('input[data-seed-input]');
    state.reset(Number(input?.value ?? 1));
    sync();
  });
  sync();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `<section class="dependency-gate"><p class="eyebrow">Board 03 · integration gate</p><h1>Pixi viewer shell готов</h1><p>${escapeHtml(message)}</p><p>Projection/config/adapter не подменяются заглушкой. После их точной фиксации bridge установит единый bundle.</p></section>`;
}

function layout(hasFlatView: boolean): string {
  return `<header><div><p class="eyebrow">R4D P1 · board 03 only</p><h1>Collider mapping viewer</h1></div><div class="pins">config + projection + sim-core</div></header>
  <section class="controls" aria-label="Viewer controls">
    <label><input type="checkbox" data-layer="art" checked> Арт</label>
    <label><input type="checkbox" data-layer="geometry" checked> Геометрия</label>
    <button data-view="perspective">Исходная перспектива</button>
    ${hasFlatView ? '<button data-view="flat">Плоская доска</button>' : ''}
    <button data-step="1">+1 тик</button><button data-step="10">+10 тиков</button>
    <input data-seed-input type="number" min="0" step="1" value="1" aria-label="Seed">
    <button data-reset>Новый запуск</button>
  </section>
  <section class="diagnostics"><span>seed <b data-seed></b></span><span>tick <b data-tick></b></span><span>rng <b data-rng></b></span><span data-status></span></section>
  <section class="viewport" data-viewport></section>`;
}

function setText(rootNode: HTMLElement, selector: string, text: string): void {
  const node = rootNode.querySelector(selector);
  if (node) node.textContent = text;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character);
}

