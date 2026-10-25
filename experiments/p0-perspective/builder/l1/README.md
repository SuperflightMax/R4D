# P0 L1 — deterministic layered composite

Одна разрешённая L1-сборка из exact Asset components. Layout был зафиксирован
в [`layout-v1.json`](layout-v1.json) до первого render. Скрипт не генерирует и
не перерисовывает изображения: он кладёт неизменённый environment plate,
четыре раза использует один RGBA master и одну shadow layer.

## Воспроизведение

Из `experiments/p0-perspective/builder`:

```powershell
npm run build:l1
npm run check:l1
```

Результаты:

- `l1/output/composite-l1.png` — чистый законченный кадр 1536 × 1536;
- `l1/output/manifest-l1.json` — exact входы, hashes, frozen layout и draw
  rectangles;
- `l1/output/numeric-report-l1.json` — машинный отчёт identity/anchors/scales,
  quad containment и dimensions;
- `l1/output/hashes-l1.json` — SHA-256 компонентов и результатов;
- `l1/output/review-l1.html` — статический browser view без overlays.

Исходные компоненты сохранены без копирования в
`../../asset-artist/l1-components/`: environment plate, один master и одна
shadow layer. Их пути и hashes находятся в manifest.

## Инварианты

- Один source-normalization переводит production master к nominal visible
  height `120 px` при `S=1`; он одинаков для всех экземпляров.
- Затем применяются только contract scales `.939/.978/1.018/1.058`.
- Shadow и master используют один source canvas, один base-center anchor, один
  destination rectangle и один row scale.
- Painter order фиксирован по `(q,p,instanceId)`, far-to-near; для каждого
  экземпляра shadow рисуется непосредственно перед master.
- В composite нет сетки, точек, подписей, осей или иных control markers.
- Новые изображения, global redraw и финальная серия не выполняются.
