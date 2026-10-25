# Evidence viewer v02 — editorial-only exact handoff

25 октября 2026. Builder `builder-r4d-q4a-01`. **VIEWER_V02_FROZEN_READY_FOR_LEAD_DISPATCH.** По прямому поручению CTO v01 superseded для QA, но все37 его файлов сохранены без изменения. Один актуальный snapshot для четырёх reviews — v02.

## Точная версия

- **URL:** http://127.0.0.1:4197/review/r4d/q4a-whole-character/
- **Folder:** `build/negative-review-v02/`, entry `review/r4d/q4a-whole-character/index.html`.
- **Build manifest SHA256:** `c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8`.
- **Source manifest SHA256:** `51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c`.
- Server exec session72786, `app/negative-review/serve.mjs --v02`, static snapshot, loopback4197. V01 snapshot/сервер4196 не заменены.

## Exact content diff

1. Header: «Локальный просмотр · v01» → **«Просмотр свидетельств · v02»**.
2. Footer: **«R4D · Q4A · Просмотр свидетельств · v02»**.
3. Удалена зависимая от момента фраза «приёмка и отдельная публикация ещё не выполнены». Стабильный вывод: «Исследование Q4A закрыто по решению CTO. Здесь показаны сохранённые данные отрицательного/частичного опыта».
4. В раскрытии provenance версия показывается из snapshot manifest, вместо версии неизменного dataset. Единственное изменение `viewer.mjs`: `${data.version}` → `${manifest.version}` в текстовой строке. Controls/rendering/playback не менялись.

Из37 файлов snapshot изменены только `index.html`, compiled `viewer.js`, `source-manifest.json`, `build-manifest.json`, root `SNAPSHOT.json`. **Все data/assets/reports/CSS побайтово идентичны v01**. `data/evidence.json.version=negative-review-v01` сохранён как идентификатор прежней неизменной projection; текущий UI/snapshot называетсяv02. Numeric arrays/geometry/metrics/26 outputs/rejected state/источники без изменений.

Машинный diff — `editorial-v02/CONTENT_DIFF.json`. Исходные6 файлов source v01 до правок сохранены с проверенными hashes в `editorial-v02/v01-source/`; immutable build v01 не перезаписывался. Сборщик v02 копирует exact v01 bytes, применяет только editorial source/build metadata и проверяет allowlist изменённых файлов до freeze. Первый staging остановился на Windows-разделителях путей; нормализация исправлена, неподписанный staging оставлен локально. Удаление staging было отклонено автоматической проверкой; оно не требовалось, сборка завершена через новый staging без удаления. Эти временные staging исключены из Git в своей зоне.

## Самопроверка frozen v02

Браузер Playwright CLI:1440×1000,390/360/768×844, оба фона; все5 whole selectors/crops, native End/ArrowLeft scrub, play/pause/restart/speed, stop строго на25, grid/texture controls, rejected отдельно. Default/final low0 paused, interpolation=false. Header/footer/provenance versionv02 проверены; устаревающая фраза в выводе отсутствует. Errors0, bad responses0, external requests0. Лично просмотрены `output/playwright/v02-header.png` и `v02-conclusion.png`; full desktop/mobile screenshots имеют префиксv02 и не заменяют v01 evidence.

`SELF_CHECK_V02.json` / raw `output/playwright/BROWSER_CHECK_FROZEN_V02.json`; `INTEGRITY_CHECK_V02.json` / `SNAPSHOT_TREE_SHA256_V02.json`: все35 content HTTP200/byte hashes, source origins/build linkage; все37 old v01 files неизменны, все44 frozen research hashes совпали. Никаких solver/нового арта/repair/deploy. Это Builder self-check, не verdict Concept/Asset/Technical/Visual QA.

Все четыре review получают **только эту frozen v02** через Lead. После этого snapshot не менять; приёмка/публикация — отдельное решение CTO.
