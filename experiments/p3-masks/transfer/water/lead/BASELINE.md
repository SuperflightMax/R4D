# P3 Water — исходный способ и входы до переноса

29 октября 2026. Lead `lead-r4d-p3-masks-01`.
Это фиксация выбранного CTO исходного способа, не QA или результат переноса.

## Основание

Прямой приоритет Max через доверенный Dot09:04:16Z, уточнение09:13:39Z:
существующая команда P3 переносит способ на Water/Dark сейчас параллельно P5.
Адресный stage2 CTO заменяет прежнюю административную очередность карточек.
Четыре карточки полностью прочитаны через git show exact
`c6603f0f327350172df44687a4d4ead19e0e5e6b`:
`P3-transfer-water-dark.md`, `P3-masks.md`, `ORDER.md`, `P2-P6-transfer.md`.
Jungle остаётся принятой ограниченной частичной попыткой; его QA не переоткрыта.

## Неизменяемая отправная точка

| Материал | Exact identity |
| --- | --- |
| Исходный вариант | P3 frozen-01 Jungle |
| CODE | `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74` |
| ART | `f899a308aed156a11e2a1013292ed68c6669959d` |
| Frozen manifest | `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f` |
| Native commit | `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023` |
| Pixi | 8.22.0, MIT |

[Передача frozen кандидата](../../../builder/FROZEN_CANDIDATE.md),
[применённый Artist contract](../../../asset-artist/CONSUMER_CONTRACT.md),
[consumer schema](../../../builder/ASSET_CONTRACT.md),
[частичный итог Jungle](../../../RESULT.md).
Исходные scripts/PNG/assets.json закреплены ART commit; поздний documentation
HEAD не заменяет исходные bytes. Jungle bundle, документы и публикация не меняются.

Цельная картинка — неизменная статичная основа. Source-aligned alpha PNG
восстанавливают её исходные пиксели поверх шара/тени. Это не перемещаемые
извлечённые препятствия и не восстановление пола. Тела не включают падающие тени.

Исходный depth contract: pin.y как scalar; для областей границ — scalar
near-endpoint или разрешённая depthLineNative, линейная интерполяция по ball.x
с ограничением концами. Части сложного силуэта имеют стабильные ID и свои
основания. Контуры не зависят от seed/tick. Передние края корзин — отдельные
полосы с depthLineNative; перекрытие соседних полос1px устраняет AA-щели.
Geometry выше арта; Art-off выключает художественные маски.

Ball — собственный RGBA растровый объёмный шар без встроенной падающей тени,
uniform scale по физическому радиусу и локальной горизонтальной проекции.
Shadow — отдельная текстура на плоскости, согласованная с исходным светом.
Jungle параметры scaleRadius[1.15,2.6], offsetRadius[-0.45,0.5], alpha0.72
сохраняются как исходная запись, не как обязательные значения другой сцены.
PRNG/native state визуализация не расходует и не меняет.

В исходном рецепте: author_boundaries.py → extend_regions.py → prepare_masks.py
→ validate_assets.py → freeze_handoff.py exactcommit; consumer извлекает exact
Git bytes и собирает отдельный immutable bundle с paths/sizes/SHA256 manifest.
Water contours/обычные параметры и новые ассеты готовятся заново этим способом.
Существенно новый depth/asset algorithm требует сохранения результата исходного
переноса и отдельной версии с причиной изменения; задним числом не подставляется.

## Принятый общий вход Water

P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, prefix
`experiments/p1-collider-mapping/clean-repeat-01/`.
Используется board04 trial02; trial01 — сохранённый startup FAIL, не вход переноса.

| Файл относительно prefix | SHA256 exact UTF-8/LF |
| --- | --- |
| `simulation/boards/04/trial-02/config.json` | `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| `simulation/boards/04/trial-02/manifest.json` | `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| `research/board04-projection.candidate-02.json` | `ee0c6e429d4e0b1da6c342174d22369cd293c3fc4b18ccd7d09a4690f71da54f` |

Lead независимо прочитал Git blobs и пересчитал SHA256. Source read-only
`K:\Agents\R4D\Assets\perspective\04-water-temple.jpg`,1536², actual SHA256
`8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` совпал.
6pins/106segments/4buckets/1drop, `board04-start`; r16,tick5ms,g980,speed2000,
noise2deg/0.02,wallBounce1,lcg32,quantize7. Меняется только ordinary rng.seed.
Config и manifest целиком сохраняются без скрытого remap/пересериализации.
Историческое provisional wording внутри manifest не редактируется: текущая
передача accepted P1 определяется заказом и exact commit.

Water в общей геометрии — одна плоская область; каналы/ступени не получают
выдуманную физику воды/высоты. У арок отдельные опоры, lintel collider отсутствует.
Доступность проёма для r16 устанавливается отдельно и фактическим движением.
Недоступный случай или отскок от свободного пола — точное воспроизведение CTO,
без локальной подгонки входа/траектории. Незатронутая работа продолжается.

## Границы результата

Обычные новые runs, replay/pause/точные ticks, независимые Арт/Геометрия,
неизменный Millionko+Pixi обязательны. Water QA: обе опоры, перемычка, проём,
реальные overlap до/во/после, движение, границы и фактический вход в корзину,
шар/тень в обычном масштабе. Численный depth switch сбоку не заменяет overlap.
Хорошие и проблемные ordinary случаи сохраняются, winning seeds не ищутся.
Water получает собственный вывод; Dark не засчитывается за Water.

Server_write=false. Будущая отдельная страница `/review/r4d/p3-masks-water/`;
серверные действия только после QA/exact intent и нового CTO token. P5 имеет
первое следующее окно. Старый Jungle token закончился и повторно не используется.
