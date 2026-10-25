# P0 final series — frozen layouts and cross-series gate

Этот checkpoint создан **до новых изображений**. Он фиксирует ровно четыре
независимых layout и проверяющий контракт; boards и component sources здесь не
создаются и не собираются.

## Freeze

```powershell
npm run build:series-freeze
npm run check:series-freeze
```

`freeze-manifest-v1.json` содержит SHA-256 каждого layout. После появления
изображений layout-файлы и эти hashes не меняются. Все четыре layout используют
одинаковые frame/quad/seams/q/scales/base-center/z-order/shadow правила из
contract v2, но имеют разные `p`, `instanceId` и component source slots.

## Будущая фактическая проверка серии

Каждая готовая команда передаёт один integration manifest:

```text
<integration-dir>/board-01.json
<integration-dir>/board-02.json
<integration-dir>/board-03.json
<integration-dir>/board-04.json
```

Проверка:

```powershell
node final-series/scripts/check-cross-series.mjs --integration-dir <integration-dir>
```

Схема будущего manifest: `r4d.p0.final-board-integration.v1`. Обязательны:

- `boardId`, exact `layoutSha256`, `frame`, `playablePlane`;
- три source SHA-256 в `sources.plate/master/shadow`;
- exact frozen `instances`;
- `baseCenterDefinition = "center of lowest visible base-contact edge beneath the object axis"`;
- `deterministicAssembly=true`, stable sort `(q,p,instanceId)`, far-to-near;
- shadow/master одинаковые anchor/destination/scale, shadow перед master;
- `controlMarkersAllowed=false`, пустой список overlays;
- новые изображения и component sets, не L1 hashes.

Checker требует четыре уникальных plate hashes, четыре уникальных master hashes,
четыре уникальных shadow hashes и четыре уникальных тройки. Любой L1 source
hash запрещён. `--self-test` проверяет положительный synthetic contract и
обязательные отказы duplicate/L1/invariant drift без создания изображений.
