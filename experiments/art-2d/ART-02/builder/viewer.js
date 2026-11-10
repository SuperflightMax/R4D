const WIDTH = 354;
const HEIGHT = 320;
const GAP = 12;
const SELECTORS = { '02-P': '#method-p', '02-R': '#method-r' };
const LABELS = {
  base: 'Фон, восстановленная область и неподвижный цветок',
  serpent: 'Голова змея',
  monstera: 'Монстера',
  'contact-shadow': 'Контактная тень',
  'serpent-bronze': 'Голова змея, бронзовое кольцо',
};
const $ = (selector) => document.querySelector(selector);
const status = $('#status');
const backdrop = $('#backdrop');
const overlay = $('#overlay');
const eye = $('#eye');

function assetUrl(file) {
  return '/artwork/' + file.split('/').map(encodeURIComponent).join('/');
}

async function sprite(file, bbox, pivot = [0, 0]) {
  const [x, y, width, height] = bbox;
  const texture = await PIXI.Assets.load(assetUrl(file));
  if (texture.width !== width || texture.height !== height) {
    throw new Error(`${file}: ${texture.width}×${texture.height}, ожидалось ${width}×${height}`);
  }
  const node = new PIXI.Sprite(texture);
  node.pivot.set(...pivot);
  node.position.set(x + pivot[0], y + pivot[1]);
  return node;
}

async function readManifest(path, key) {
  const response = await fetch(assetUrl(path));
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const manifest = await response.json();
  if (manifest.schema !== 1 || manifest.method !== key
      || manifest.frame_size_wh.join(',') !== `${WIDTH},${HEIGHT}`
      || manifest.crop_source_ltrb.join(',') !== '48,912,402,1232') {
    throw new Error(`${path}: неожиданные метод, версия схемы или рамка`);
  }
  const directory = path.slice(0, path.lastIndexOf('/') + 1);
  const layer = (id) => {
    const part = manifest.layers[id];
    const [left, top, right, bottom] = part.bbox_crop_ltrb;
    return {
      id, label: LABELS[id] ?? id, file: directory + part.path,
      bbox: [left, top, right - left, bottom - top], pivot: part.pivot_texture_xy,
    };
  };
  const [replacement] = Object.entries(manifest.states.bronze?.replace_layer ?? {});
  const motion = manifest.motion;
  if (motion.axis !== 'x' || motion.demonstrated_dx[1] !== 0) {
    throw new Error(`${path}: ожидается сдвиг влево от исходной позиции`);
  }
  return {
    layers: manifest.layer_order_back_to_front.map(layer),
    reveal: { layers: [motion.layer], maxLeftPx: -motion.demonstrated_dx[0] },
    eyeAfter: replacement && { ...layer(replacement[1]), replaces: replacement[0] },
  };
}

function addPanel(stage, index) {
  const group = new PIXI.Container({ x: index * (WIDTH + GAP) });
  const background = new PIXI.Graphics();
  const contents = new PIXI.Container();
  const crop = new PIXI.Graphics().rect(0, 0, WIDTH, HEIGHT).fill(0xffffff);
  group.addChild(background, contents, crop);
  contents.mask = crop;
  stage.addChild(group);
  return { background, contents };
}

function drawBackdrop(background, kind) {
  const color = { checker: 0x302a44, white: 0xffffff, black: 0x000000 }[kind];
  background.clear().rect(0, 0, WIDTH, HEIGHT).fill(color);
  if (kind === 'checker') {
    const tile = 16;
    for (let y = 0; y < HEIGHT; y += tile) {
      for (let x = (y / tile % 2) * tile; x < WIDTH; x += 2 * tile) {
        background.rect(x, y, Math.min(tile, WIDTH - x), tile);
      }
    }
    background.fill(0xd2b7e3);
  }
}

async function loadMethod(panel, method, reference) {
  const layers = await Promise.all(method.layers.map(async (part) => ({
    ...part, node: await sprite(part.file, part.bbox, part.pivot),
  })));
  const moving = new Set(method.reveal.layers);
  if (moving.size === 0 || [...moving].some((id) => !layers.some((part) => part.id === id))) {
    throw new Error('Для раскрытия нужны ID подвижных слоёв из карты сборки');
  }
  if (!Number.isInteger(method.reveal.maxLeftPx) || method.reveal.maxLeftPx < 1) {
    throw new Error('Для раскрытия нужна положительная граница сдвига в пикселях');
  }
  const after = method.eyeAfter;
  if (after) {
    const target = layers.findIndex((part) => part.id === after.replaces);
    if (target === -1) throw new Error('Для правки глаза нужен опорный слой из карты сборки');
    layers.splice(target, 0, { ...after, node: await sprite(after.file, after.bbox, after.pivot) });
  }
  panel.contents.addChild(...layers.map((part) => part.node));
  const comparison = reference && await sprite(reference, [0, 0, WIDTH, HEIGHT]);
  if (comparison) {
    comparison.alpha = 0.5;
    panel.contents.addChild(comparison);
  }
  return { layers, moving, after, comparison, maxLeftPx: method.reveal.maxLeftPx };
}

function addControls(element, method, redraw) {
  if (!method) {
    element.textContent = 'Ожидаются слои';
    return;
  }
  element.innerHTML = `
    <div class="method-controls">
      <label>Лист <input aria-label="Сдвиг листа влево" type="range" min="0" value="0">
        <output>0 px</output>
      </label>
      <button type="button" disabled>Вернуть</button>
      <label>Показать <select aria-label="Показать слой">
        <option value="">Все слои</option>
      </select></label>
    </div>
    <ol class="layer-meta" aria-label="Слои снизу вверх"></ol>`;
  const range = element.querySelector('input');
  const output = element.querySelector('output');
  const reset = element.querySelector('button');
  const select = element.querySelector('select');
  const list = element.querySelector('ol');
  range.max = method.maxLeftPx;
  range.title = `Диапазон сдвига влево: 0–${method.maxLeftPx} px`;
  const rows = method.layers.map((part) => {
    select.add(new Option(part.label, part.id));
    const row = list.appendChild(document.createElement('li'));
    if (method.moving.has(part.id)) row.dataset.moving = '';
    return row;
  });
  const refresh = () => {
    const selected = select.value;
    const amount = Number(range.value);
    range.disabled = Boolean(selected);
    reset.disabled = Boolean(selected) || amount === 0;
    output.value = amount ? `−${amount} px` : '0 px';
    method.layers.forEach((part, index) => {
      const variant = part.id === method.after?.id;
      const active = variant ? eye.checked : !eye.checked || part.id !== method.after?.replaces;
      const shown = selected ? part.id === selected : active;
      const offset = !selected && method.moving.has(part.id) ? amount : 0;
      const [x, y] = part.bbox;
      const pivot = part.pivot ?? [0, 0];
      part.node.visible = shown;
      part.node.x = x + pivot[0] - offset;
      rows[index].hidden = !active && !shown;
      rows[index].textContent = `${part.label} · bbox [${part.bbox.join(', ')}] · pivot [${pivot.join(', ')}] · позиция [${part.node.x}, ${part.node.y}]`;
    });
    if (method.comparison) method.comparison.visible = !selected && overlay.checked;
  };
  range.addEventListener('input', redraw);
  select.addEventListener('change', redraw);
  reset.addEventListener('click', () => {
    range.value = '0';
    redraw();
  });
  return refresh;
}

async function start() {
  $('#version').textContent = `PixiJS ${PIXI.VERSION}`;
  const response = await fetch('/assembly.json');
  if (response.status === 404) {
    status.textContent = 'Ожидается карта сборки с готовыми слоями';
    return;
  }
  if (!response.ok) throw new Error(`Карта сборки недоступна (HTTP ${response.status})`);
  const assembly = await response.json();
  const app = new PIXI.Application();
  await app.init({
    width: 3 * WIDTH + 2 * GAP, height: HEIGHT, resolution: 1,
    preference: 'webgl', autoStart: false, background: 0x16191b,
  });
  const panels = [0, 1, 2].map((index) => addPanel(app.stage, index));
  if (assembly.reference) {
    panels[0].contents.addChild(await sprite(assembly.reference, [0, 0, WIDTH, HEIGHT]));
  } else {
    $('#source-info').textContent = 'Ожидается исходный кроп';
  }
  const methods = await Promise.all(Object.entries(SELECTORS).map(async ([key, selector], index) => ({
    selector,
    key,
    data: assembly.methods[key] && await loadMethod(
      panels[index + 1], await readManifest(assembly.methods[key], key), assembly.reference,
    ),
  })));
  const available = methods.filter(({ data }) => data);
  if (available.length === 0) throw new Error('В карте сборки нет готовых методов ART-02');
  overlay.disabled = !assembly.reference;
  eye.disabled = !available.some(({ data }) => data.after);
  const refreshers = methods.map(({ selector, data }) => addControls($(selector), data, redraw));
  function redraw() {
    for (const refresh of refreshers) refresh?.();
    app.render();
  }
  const refreshBackdrop = () => {
    for (const panel of panels) drawBackdrop(panel.background, backdrop.value);
    redraw();
  };
  backdrop.addEventListener('change', refreshBackdrop);
  overlay.addEventListener('change', redraw);
  eye.addEventListener('change', redraw);
  $('#scene').appendChild(app.canvas);
  refreshBackdrop();
  status.textContent = `Сборка ${assembly.version} · загружено: ${available.map(({ key }) => key).join(', ')}`;
}

start().catch((error) => {
  status.dataset.error = '';
  status.textContent = `Сборка недоступна. ${error.message}`;
  console.error(error);
});
