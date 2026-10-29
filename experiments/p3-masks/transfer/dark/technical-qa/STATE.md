# Dark — независимая Technical QA

29 октября 2026, Europe/Kyiv. `technical-qa-r4d-p3-masks-01`.
Статус: **DARK_FULL_METHOD_03_TECHNICAL_QA_COMPLETE**.
Technical PASS для exact inputs/payload/native/PRNG/events/JSON/controls.
Общий художественный/mapping PASS по всем masks и движению не выдан.

Текущий кандидат: `dark-full-method-03`, CODE
`c73d6128970b2b022d5313b08c34cafdec9a1bc3`, ART
`17dc9fcdc261562acb581dd8590096819734c807`, frozen manifest
`b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307`.
QA стартовала с clean `fe09f8e37cff8352dbe629e28bd3e4e2c0e019aa` в прежнем
собственном worktree/branch. Все 88 local/HTTP files проверены; 8 distinct
runs / 11 793 native states и 66 browser checkpoint samples совпали с direct
oracle. Первые три собственных UI seeds: 2190736337→receiver02/t1357,
277429092→LOST/t1962, 3061636154→LOST/t2441. No filtering.

Реальные cases: seed0/pillar02/t364–368 partial overlap,
seed0/pillar04/t839–841 corner/side, seed0/receiver01/t860–888 entry,
seed2/pillar04/t895–900 occluded front approach + geometry. Объём и пределы
наблюдения, actual import/identity-negative, network observability и
provenance-path allowlist изложены в
[полном отчёте](reports/dark-full-method-03.md) и
[evidence index](evidence/full-method-03/index.json).

Подтверждённых technical defects в проверенном объёме нет. Source/ART/frozen
и P1 inputs не правились; server_write=false. Own IAB закрыта, Builder
preview6869 оставлен. Water/Jungle не менялись; их статусы не переоткрывались.

Ниже сохранена история input preparation и заранее объявленная матрица.

## Поручение и исходный способ

Actual turn `01a186fc-3cd2-7173-b970-246428cca6de`; прежний собственный E-worktree
`E:\R4D\perspective\p3-worktrees\technical-qa`, ветка
`codex/r4d-p3-masks-technical-qa-01`, чистый исходный HEAD
`c0db64fe4a0204d77be0d3ab61ffe21331d9c90a`.
Первый tool/action — read-only git show P3-transfer-water-dark. Все четыре
карточки полностью прочитаны на `c6603f0f327350172df44687a4d4ead19e0e5e6b`.
Прямой старт Max от29.10 09:04:16Z/09:13:39Z через CTO/Lead разрешает перенос
сейчас. Это меняет только очередь, не содержание P3 или ограничения Jungle.

Сохранённый исходный метод: CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`,
ART `f899a308aed156a11e2a1013292ed68c6669959d`, manifest
`e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`;
exact CODE `experiments/p3-masks/builder/ASSET_CONTRACT.md`/`src/app.js`,
exact ART `experiments/p3-masks/asset-artist/assets.json`.
Jungle-файлы/raw/frozen/страница и прежний PARTIAL/MAP-01/post-auth вердикт
не изменялись; Jungle QA не переоткрывалась. Соседние методы не читались.

## Независимо сверенные входы Dark

P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`,
prefix `experiments/p1-collider-mapping/clean-repeat-01/`.

| Вход | Путь / raw Git LF SHA256 |
| --- | --- |
| Config | `simulation/boards/02/trial-01/config.json` — `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| Manifest | `simulation/boards/02/trial-01/manifest.json` — `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| Projection | `research/board02-projection.candidate-01.json` — `4dfa46589bb3fdfc8e2ad8ff2554737697e3ce9172c5b8d5c5583577df0c8c48` |
| Source | `K:\Agents\R4D\Assets\perspective\02-dark-temple.jpg` — `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` |

Counts: **12 pins / 70 segments / 4 buckets / 1 drop**, `board02-start`.
Сверены 48 рёбер 12 ориентированных loops, 22 bounds, circle/bucket/drop
translation и согласованность матриц/whole-source domains. Вершины и
направления не заменялись axis-aligned рамками. Roundtrip максимум
7.275957614183426e-12. Стартовый зазор при r16 — **85.79102059486468** units.
Сохранены r16/tick5ms/quantize7/g980/speed2000/noise2deg/0.02/lcg32.
Исторический provisional текст manifest не редактируется.

Native exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, clean package.
Tree levels: repository `03bb35e908ae8c5ab16e02cf62640b6663ae18f5`,
package `008d16a80a26bb77d562a45218b01da09b0d9ff0`,
src `6539b91a379d32c22281d43e71bb17fecb608437`.
Сохранённый независимый oracle из14 modules побайтно сверен с transform exact
Git blobs, без записи в native-копию. Равенство replay states проверено;
у seeds0/1/2 разные trace hashes. Приватные TS не попали в Git.

Заранее объявленные input-probe seeds без отбора:
0→receiver01/t888; 1→receiver01/t884; 2→LOST/t1812.
Первый native ориентир для грани — seed0/pillar-02:edge-01/t366;
для бокового ребра — seed0/pillar-04:edge-04/t840. У seed2 есть
pillar-04:edge-01/t897/1058/1380 и pillar-02:edge-03/t972.
Это не утверждение, что соответствующие нарисованные углы/маски уже испытаны.

Факты: [INPUT_PREFLIGHT.json](INPUT_PREFLIGHT.json),
helper [check-inputs.mjs](check-inputs.mjs) с явными параметрами nativeRepo и
read-only cached oracle. Runtime только
`E:\R4D\perspective\p3-runtime\technical-qa\transfer-water-dark\dark`.
Water данные/логи/кандидаты сюда не подставлялись.

## Матрица Dark, объявленная до frozen-кандидата

| Проверка | Доказательство после exact frozen выдачи |
| --- | --- |
| Identity | Dark source/art/build/manifest; все local/HTTP file hashes, board02/trial01, route `/review/r4d/p3-masks-dark/`, JS MIME, Pixi/MIT и отсутствие private sources/maps. |
| Native | Полный config неизменён кроме обычного seed; direct pinned oracle, первые три UI seeds без отсева, states/events/outcomes/PRNG; replay. |
| Углы/грани | Реальные соседние кадры до/во время/после silhouette overlap у ориентированных pillars/square bases; передние и боковые проходы, partial ball/shadow. Численная смена depth при проходе сбоку недостаточна. |
| Начальные ориентиры | Seed0/t365–367 и839–841 как native face/side anchors, без заявления о visual PASS; затем фактические ordinary candidate cases. |
| Bounds/buckets | Реальные отскоки/пустое место и входы в приёмники; seed0/receiver01/t888 — input ориентир. Недостигнутые случаи явно отметить, не охотиться за выигрышами. |
| Time/JSON | Real-time/pause/+ticks/seek в обе стороны, export/import после fresh load, продолжение, одинаковые tick/state/rngU32. |
| Просмотр | Независимые Art/Geometry, контуры actual config выше art и без заливки, Art-off снимает невидимые masks; view/zoom/pan не меняют native. |
| Метод/качество | Цельная Dark-картинка, сохранённый исходный метод глубины/масок; перед существенной сменой сохранить исходную попытку. VQA оценивает собранный кадр и движение отдельно. |

На этапе подготовки требовался именованный Dark frozen source/art/build/hash/
file-manifest с одинаковыми bytes для обеих QA и отдельным preview/port.
Тогда candidate verdict отсутствовал. Текущее исполнение и ограничения —
в отчёте выше. `server_write=false`; staging/lock/service/upload не разрешены.

Ресурсы перед probe, 09:36:44UTC: RAM free16.737/31.907 GiB, CPU4%/24logical,
C/D/E free16.288/16.280/11.941 GiB. Общая добавочная оценка двух лёгких QA
probes≤0.7 GiB RAM/0.01 GiB E, не резерв/гарантия. Temp/output разделены на E,
env process-local; global settings и чужие проекты не затрагивались.
