import { Application, Graphics } from 'pixi.js';
import { AnimationController } from './animation';
import { CharacterRig, loadManifest } from './rig';
import type { AnimationState } from './types';
import './styles.css';

const STATE_LABELS: Record<AnimationState, string> = {
  idle: 'стойка',
  move: 'движение',
  jumpPrepare: 'подготовка прыжка',
  jumpAir: 'полёт',
  jumpLand: 'приземление',
};

function requiredElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Не найден обязательный элемент ${selector}`);
  return element;
}

const stageElement = requiredElement('#stage');
const stateElement = requiredElement('#state');
const phaseElement = requiredElement('#phase');
const blendElement = requiredElement('#blend');
const errorElement = requiredElement('#error');

async function start(): Promise<void> {
  const app = new Application();
  await app.init({
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio, 2),
    background: '#111827',
  });
  stageElement.appendChild(app.canvas);

  const background = new Graphics();
  const drawBackground = (): void => {
    background.clear();
    const width = app.screen.width;
    const height = app.screen.height;
    const ground = height * 0.82;
    background.rect(0, 0, width, height).fill(0x111827);
    background.rect(0, ground, width, height - ground).fill(0x172033);
    background.moveTo(0, ground).lineTo(width, ground).stroke({ width: 2, color: 0x5b6d89, alpha: 0.7 });
    for (let x = -40; x < width + 80; x += 80) {
      background.moveTo(x, ground + 44).lineTo(x + 38, ground + 44).stroke({ width: 3, color: 0x26334a, alpha: 0.7 });
    }
  };
  app.stage.addChild(background);
  drawBackground();

  const manifest = await loadManifest();
  const rig = await CharacterRig.create(manifest);
  const animation = new AnimationController(manifest.bones);
  app.stage.addChild(rig.container);

  let paused = false;
  let showBones = false;
  let autoTransitions = false;
  let autoClock = 0;
  let inputDirection = 0;
  let horizontalVelocity = 0;
  let facing = 1;
  let worldX = app.screen.width * 0.5;
  const keys = new Set<string>();
  const characterScale = manifest.stage?.characterScale ?? 1;

  const updateMovementIntent = (): void => {
    const left = keys.has('KeyA') || keys.has('ArrowLeft');
    const right = keys.has('KeyD') || keys.has('ArrowRight');
    inputDirection = Number(right) - Number(left);
    if (inputDirection !== 0) facing = inputDirection;
    animation.setMovementRequested(inputDirection !== 0);
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.repeat && ['Space', 'KeyP', 'KeyB', 'KeyT', 'KeyR'].includes(event.code)) return;
    keys.add(event.code);
    if (event.code === 'Space') animation.requestJump();
    if (event.code === 'KeyP') paused = !paused;
    if (event.code === 'KeyB') showBones = !showBones;
    if (event.code === 'KeyT') {
      autoTransitions = !autoTransitions;
      autoClock = 0;
    }
    if (event.code === 'KeyR') {
      animation.reset();
      worldX = app.screen.width * 0.5;
      horizontalVelocity = 0;
      autoTransitions = false;
      keys.clear();
    }
    updateMovementIntent();
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
    updateMovementIntent();
  });

  window.addEventListener('blur', () => {
    keys.clear();
    updateMovementIntent();
  });

  window.addEventListener('resize', drawBackground);

  app.ticker.add((ticker) => {
    const delta = paused ? 0 : ticker.deltaMS / 1000;
    if (autoTransitions && !paused) {
      autoClock += delta;
      const segment = autoClock % 8;
      animation.setMovementRequested(segment >= 1.2 && segment < 6.5);
      inputDirection = segment >= 1.2 && segment < 6.5 ? 1 : 0;
      if ((segment >= 2.7 && segment - delta < 2.7) || (segment >= 6.8 && segment - delta < 6.8)) {
        animation.requestJump();
      }
    }

    const snapshot = animation.update(delta);
    if (!paused) {
      const targetSpeed = inputDirection * (snapshot.airborne ? 150 : 115);
      const acceleration = inputDirection === 0 ? 420 : 600;
      const velocityStep = acceleration * delta;
      if (horizontalVelocity < targetSpeed) horizontalVelocity = Math.min(horizontalVelocity + velocityStep, targetSpeed);
      if (horizontalVelocity > targetSpeed) horizontalVelocity = Math.max(horizontalVelocity - velocityStep, targetSpeed);
      if (Math.abs(horizontalVelocity) > 0.01) facing = Math.sign(horizontalVelocity);
      worldX += horizontalVelocity * delta;
      const margin = 110;
      if (worldX > app.screen.width + margin) worldX = -margin;
      if (worldX < -margin) worldX = app.screen.width + margin;
    }

    const groundY = app.screen.height * 0.82 + (manifest.stage?.groundOffset ?? 0);
    rig.container.position.set(worldX, groundY);
    rig.container.scale.set(
      facing * characterScale,
      characterScale,
    );
    rig.applyPose(snapshot.pose, showBones);

    stateElement.textContent = `Состояние: ${STATE_LABELS[snapshot.state]} → ${STATE_LABELS[snapshot.targetState]}`;
    phaseElement.textContent = `Фаза: ${snapshot.phase.toFixed(2)} · запрос: ${snapshot.requestedMovement ? 'движение' : 'стойка'}`;
    blendElement.textContent = `Смешивание: ${(snapshot.blend * 100).toFixed(0)}%${paused ? ' · ПАУЗА' : ''}${autoTransitions ? ' · АВТО' : ''}${showBones ? ' · КОСТИ' : ''}`;
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  errorElement.hidden = false;
  errorElement.textContent = `Демо не запущено: ${message}`;
  stateElement.textContent = 'Ошибка загрузки';
  console.error(error);
});
