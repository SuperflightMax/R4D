# P3 Dark — исходный способ и входы до переноса

29 октября 2026. Lead `lead-r4d-p3-masks-01`.
Перенос той же командой явно поручен CTO по прямому приоритету Max
09:04:16Z/09:13:39Z. Полностью прочитаны четыре карточки exact
`c6603f0f327350172df44687a4d4ead19e0e5e6b`; административная очередь заменена
адресным решением о старте сейчас параллельно P5. Jungle не меняется.

## Исходный способ

Выбран ДО переноса P3 frozen-01: CODE
`f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`, ART
`f899a308aed156a11e2a1013292ed68c6669959d`, frozen manifest
`e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`.
[Frozen handoff](../../../builder/FROZEN_CANDIDATE.md),
[Artist contract/рецепт](../../../asset-artist/CONSUMER_CONTRACT.md),
[consumer schema](../../../builder/ASSET_CONTRACT.md),
[итог Jungle](../../../RESULT.md). Полная исходная фиксация правил переноса —
[Water BASELINE](../../water/lead/BASELINE.md); она описывает тот же исходный
алгоритм, а не результат Water и не заменяет отдельную проверку Dark.

Цельный исходник остаётся основой; source-aligned alpha masks возвращают
его собственные пиксели поверх шара/тени. Телам не принадлежат падающие тени.
Исходный scalar pin.y/depthLineNative contract, раздельные части силуэта,
передние полосы корзин и независимый Art-off сохраняются. Native PRNG не
расходуется визуализацией. Объёмный растровый ball и отдельная floor shadow
согласуются с Dark светом/радиусом/проекцией, без овального растяжения шара.
Контуры и обычные параметры подготавливаются для Dark; существенная новая
сортировка/подготовка — отдельная версия после сохранения исходного переноса.
Поздние улучшения не подставляются незаметно. Jungle source/artifacts/release
и исторический partial QA остаются неизменны.

## Принятый общий вход Dark

P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, prefix
`experiments/p1-collider-mapping/clean-repeat-01/`.
Dark — board02 trial01, не Jungle и не board03.

| Файл относительно prefix | SHA256 exact UTF-8/LF |
| --- | --- |
| `simulation/boards/02/trial-01/config.json` | `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| `simulation/boards/02/trial-01/manifest.json` | `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| `research/board02-projection.candidate-01.json` | `4dfa46589bb3fdfc8e2ad8ff2554737697e3ce9172c5b8d5c5583577df0c8c48` |

Lead независимо прочитал Git blobs/пересчитал SHA256. Source read-only
`K:\Agents\R4D\Assets\perspective\02-dark-temple.jpg`,1536², actual SHA256
`7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` совпал.
12pins/70segments/4buckets/1drop, `board02-start`; r16,tick5ms,g980,speed2000,
noise2deg/0.02,wallBounce1,lcg32,quantize7. Native exact
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, Pixi8.22.0/MIT.
Whole config/projection сохраняются без remap; ordinary new run меняет seed.
Историческое provisional wording manifest не редактируется и не отменяет
адресную передачу accepted P1 exactcommit. Ошибки общего входа отдельно CTO,
без подгонки коллайдеров или траекторий под картинку.

## Проверка и доставка

Самостоятельная QA Dark: реальные частичные overlaps у углов, передних и
боковых граней прямоугольных/многогранных препятствий, соседние ticks и
движение; границы, фактический вход в корзину, читаемость shadow normal scale.
Ordinary хорошие и проблемные runs сохраняются без winning seed search.
Переключатели Арт/Геометрия независимы, pause/replay/ticks воспроизводимы.
Вердикт только после реального candidate, отдельно от Water.

Server_write=false; предполагаемый sibling `/review/r4d/p3-masks-dark/`.
Старый Jungle route/tree не заменяется; публикация требует отдельного
exact intent/нового CTO token. P5 получает следующее окно первым.
