import './style.css';
import { board01Bundle } from './board01-bundle';
import { board03Bundle } from './board03-bundle';
import { BoardScene } from './scene';
import { formatTerminalResult } from './terminal-status';
import type { BoardBundle, BoardId } from './types';
import { ViewerState } from './viewer-state';

const queriedRoot = document.querySelector<HTMLElement>('#app');
if (!queriedRoot) throw new Error('#app is missing');
const root: HTMLElement = queriedRoot;

const bundles: Readonly<Record<BoardId, BoardBundle>> = Object.freeze({
  '03': board03Bundle,
  '01': board01Bundle,
});

try {
  root.innerHTML = layout();
  const viewport = root.querySelector<HTMLElement>('[data-viewport]');
  if (!viewport) throw new Error('viewer viewport is missing');

  let bundle = board03Bundle;
  let state = new ViewerState(bundle);
  let scene: BoardScene | undefined;
  let timer: number | undefined;
  let mountRevision = 0;

  const stopTimer = (): void => {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
    const play = root.querySelector<HTMLButtonElement>('button[data-play]');
    if (play) play.textContent = 'Старт';
  };

  const sync = (): void => {
    const snapshot = state.snapshot;
    setText(root, '[data-seed-value]', String(snapshot.seed));
    setText(root, '[data-tick]', String(snapshot.tick));
    setText(root, '[data-rng]', String(snapshot.rngU32));
    setText(root, '[data-status]', snapshot.done ? formatTerminalResult(snapshot.result) : 'running');
    const ball = snapshot.ball;
    const outsideMappedDomain = ball.x - ball.radius < 0
      || ball.x + ball.radius > bundle.projection.flatSize.width
      || ball.y - ball.radius < 0
      || ball.y + ball.radius > bundle.projection.flatSize.height;
    setText(root, '[data-ball-domain]', outsideMappedDomain ? 'ball outside mapped domain' : '');
    scene?.render();
    if (snapshot.done) stopTimer();
  };

  const mountBoard = async (boardId: BoardId): Promise<void> => {
    const revision = ++mountRevision;
    stopTimer();
    scene?.destroy();
    scene = undefined;
    bundle = bundles[boardId];
    const seedInput = root.querySelector<HTMLInputElement>('input[data-seed-input]');
    const seed = Number(seedInput?.value ?? 1);
    bundle.simulation.reset(seed);
    state = new ViewerState(bundle);

    root.querySelectorAll<HTMLButtonElement>('button[data-board]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.board === boardId));
      button.disabled = true;
    });
    root.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((input) => {
      input.checked = true;
    });
    setPins(root, bundle);
    setNotice(root, bundle);
    sync();
    const nextScene = new BoardScene(viewport, bundle, state);
    await nextScene.init();
    if (revision !== mountRevision) {
      nextScene.destroy();
      return;
    }
    scene = nextScene;
    root.querySelectorAll<HTMLButtonElement>('button[data-board]').forEach((button) => {
      button.disabled = false;
    });
    sync();
  };

  root.querySelectorAll<HTMLButtonElement>('button[data-board]').forEach((button) => {
    button.addEventListener('click', () => {
      void mountBoard(button.dataset.board === '01' ? '01' : '03').catch(showFailure);
    });
  });
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
  root.querySelectorAll<HTMLButtonElement>('button[data-seed]').forEach((button) => {
    button.addEventListener('click', () => {
      const seed = Number(button.dataset.seed);
      const input = root.querySelector<HTMLInputElement>('input[data-seed-input]');
      if (input) input.value = String(seed);
      state.reset(seed);
      sync();
    });
  });
  root.querySelector<HTMLButtonElement>('button[data-play]')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    if (timer !== undefined) {
      stopTimer();
      return;
    }
    button.textContent = 'Пауза';
    timer = window.setInterval(() => {
      state.stepTicks(1);
      sync();
    }, bundle.simulation.tickMs);
  });

  await mountBoard('03');
} catch (error) {
  showFailure(error);
}

function layout(): string {
  return `<header><div><p class="eyebrow">R4D P1 · collider mapping</p><h1>Collider mapping viewer</h1></div><div class="pins" data-pins></div></header>
  <section class="board-selector" aria-label="Board selection">
    <button data-board="03" aria-pressed="true">Board 03 · Sun Temple</button>
    <button data-board="01" aria-pressed="false">Board 01 · Jungle</button>
  </section>
  <section class="controls" aria-label="Viewer controls">
    <label><input type="checkbox" data-layer="art" checked> Арт</label>
    <label><input type="checkbox" data-layer="geometry" checked> Геометрия</label>
    <button data-view="perspective">Исходная перспектива</button>
    <button data-view="flat">Плоская доска</button>
    <button data-play>Старт</button><button data-step="1">+1 тик</button><button data-step="10">+10 тиков</button>
    <button data-seed="1">Seed 1</button><button data-seed="2">Seed 2</button>
    <input data-seed-input type="number" min="0" step="1" value="1" aria-label="Seed">
    <button data-reset>Новый запуск</button>
  </section>
  <section class="diagnostics"><span>seed <b data-seed-value></b></span><span>tick <b data-tick></b></span><span>rng <b data-rng></b></span><span>fixed tick 8 ms</span><span data-status></span><span data-ball-domain></span></section>
  <aside class="notice" data-notice></aside>
  <section class="viewport" data-viewport></section>`;
}

function setPins(rootNode: HTMLElement, bundle: BoardBundle): void {
  const pins = bundle.sourcePins;
  const node = rootNode.querySelector('[data-pins]');
  if (node) node.innerHTML = `${bundle.label}<br>config ${pins.configSha256.slice(0, 12)}…<br>mapping ${pins.mappingSha256.slice(0, 12)}…<br>sim-core ${pins.simCoreCommit.slice(0, 12)}…`;
}

function setNotice(rootNode: HTMLElement, bundle: BoardBundle): void {
  const node = rootNode.querySelector('[data-notice]');
  if (!node) return;
  node.innerHTML = `<strong>${bundle.label} · flat domain 1000×${bundle.domain.apronMaxY}:</strong> playable plane <code>y=0…${bundle.domain.playableMaxY}</code>; foreground receiver apron <code>y=${bundle.domain.playableMaxY}…${bundle.domain.apronMaxY}</code>. Geometry — только config primitives; bucket circles <code>r=${bundle.domain.goalRadius}</code>.`;
}

function setText(rootNode: HTMLElement, selector: string, text: string): void {
  const node = rootNode.querySelector(selector);
  if (node) node.textContent = text;
}

function showFailure(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `<section class="dependency-gate"><p class="eyebrow">P1 viewer · integration gate</p><h1>Viewer не запущен</h1><p>${escapeHtml(message)}</p><p>Projection/config/adapter не подменяются заглушкой.</p></section>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character);
}
