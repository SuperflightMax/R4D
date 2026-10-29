# Dark full-method-03 — независимая Technical QA

29 октября 2026, Europe/Kyiv. `technical-qa-r4d-p3-masks-01`.

**Technical PASS в проверенном объёме:** exact payload/input identity,
native physics/PRNG/events, browser checkpoints, JSON roundtrip и controls.
Подтверждённых технических дефектов в этом объёме не найдено. Общий
художественный/mapping вердикт по всем 60 маскам и движению не выдан.
Визуальное покрытие ниже ограничено конкретными воспроизводимыми случаями.

## Точный кандидат

| Поле | Значение |
| --- | --- |
| Candidate | `dark-full-method-03` |
| CODE | `c73d6128970b2b022d5313b08c34cafdec9a1bc3` |
| ART | `17dc9fcdc261562acb581dd8590096819734c807` |
| Artist assets.json SHA256 | `ef5eb34be622f5ce6356d6fa51d7902c334a1f1f3c95acce225d7340928bbc29` |
| file-manifest SHA256 | `b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307` |
| Frozen root | `E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\full-method-03` |
| Preview | `http://127.0.0.1:6869/review/r4d/p3-masks-dark/` |
| Handoff прочитан exact | `cd1f7ada0c4789b0d512d0a9c47d513c036ee31f`, Dark builder `STATE.md` и `RECIPE.md` |
| QA baseline | `fe09f8e37cff8352dbe629e28bd3e4e2c0e019aa`, собственная прежняя ветка/worktree |

`server_write=false`. Проверен существующий Builder preview; его процесс
не запускался и не останавливался. Source, ART, frozen payload и P1 inputs
не изменялись. Water preview/candidate не использовался. Негативный тест
менял только `boardId` в копии собственного Dark checkpoint, без данных Water.
Jungle и его прежние PARTIAL/MAP-01/post-auth статусы не менялись.

## Identity, delivery и privacy

На диске и по HTTP проверены **все 88 файлов / 3 398 225 bytes**:
87 payload entries / 3 383 383 bytes и manifest / 14 842 bytes.
Набор файлов точный, лишних файлов нет; размер и SHA256 каждого совпали.
Каждый HTTP GET вернул 200 и побайтно исходный файл. MIME проверен по
расширению у всех файлов, включая пять JavaScript modules/vendor files,
JSON, HTML, CSS, PNG, JPG и MIT notice.

71 файл связан непосредственно с Git objects: восемь CODE input/source
files и все 63 ART files (60 masks, ball, shadow, assets.json).
Config/manifest/projection/view-math также совпали с exact P1
`4b47db04c7140ebf88f69b91faa0b790d46f22ec`, board02/trial01. Source JPG
совпал с подготовленным SHA256
`7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a`.
Подробные pins и проверки orientated loops/translations сохранены в
[INPUT_PREFLIGHT.json](../INPUT_PREFLIGHT.json).

Приватных TS/TSX/map-файлов, `sourcesContent`, `sourceMappingURL`,
private-key markers и неожиданных абсолютных путей в payload не найдено.
**Два объявленных абсолютных reference к исходному JPG диска K: остаются**
в P1 manifest/projection. Verifier допускает только точное значение
`INPUT_PREFLIGHT.source.path` в этих двух exact inputs; остальные пути
проверяются. Metadata не редактировалась. Это проверка доставки и явных
маркеров, не полный security audit. Pixi/vendor и MIT notice совпали с
проверенными ранее bytes; notice входит в HTTP/hash matrix.

Actual browser дважды загрузил сцену с 60 masks. В root Resource Timing
видны 12 ресурсов со status 200; PNG/JPG туда не попали. CDP Network не
вернул событий, console warn/error entries — 0. Пустой CDP stream не принят
за доказательство полного browser-network coverage. Все 88 HTTP bodies/MIME
проверены отдельно. См. [browser-observability.json](../evidence/full-method-03/browser-observability.json).

## Независимый native oracle

Использован direct native `Sim` из ранее самостоятельно подготовленного
oracle, а не Builder adapter в качестве ожидаемого результата. Его 14
transformed modules побайтно сверены с exact Git blobs на этапе подготовки
Dark. Native commit
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree
`008d16a80a26bb77d562a45218b01da09b0d9ff0`, src tree
`6539b91a379d32c22281d43e71bb17fecb608437`.

Frozen compiled native SHA256
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`
совпал с ранее независимо rebuild-verified bundle; 14 consumed blob IDs
в build provenance совпали с prepared oracle. Новый native build не делался.
Private TS и cached native modules не добавлялись в Git/payload.

| Набор | Seed | Terminal tick | Native outcome |
| --- | ---: | ---: | --- |
| Объявленный | 0 | 888 | IN_BUCKET receiver-01 |
| Объявленный | 1 | 884 | IN_BUCKET receiver-01 |
| Объявленный | 2 | 1812 | LOST |
| Объявленный | 1189667321 | 1470 | LOST |
| Объявленный | 1551806092 | 971 | IN_BUCKET receiver-02 |
| Первый собственный UI random | 2190736337 | 1357 | IN_BUCKET receiver-02 |
| Второй собственный UI random | 277429092 | 1962 | LOST |
| Третий собственный UI random | 3061636154 | 2441 | LOST |

Собственные seeds получены первыми тремя нажатиями «Новый бросок», без
отбрасывания исходов. Все три доведены в UI до terminal; у третьего была
пауза для controls/import tests, затем продолжение и полный повтор.
Для восьми distinct runs сверены **11 793 полных состояния**, ordered hit
events и outcomes; у всех сохранены неизменённые r16/tick5ms/quantize7/
g980/speed2000/noise2deg/0.02/lcg32. Полный config отличается от P1 только
обычным `rng.seed`. Trace hashes сохранены отдельно.

Все девять shipped checkpoints независимо совпали с native config/state
и прошли replay import. Wrong/missing board identity и изменённый `rngU32`
программно отклонены. **66 browser checkpoint samples** (65 public
snapshots и один actual download) дополнительно сверены по full
checkpoint/config/state/`rngU32`; `runInfo` всех 65 snapshots с полным
списком контактов и terminal outcome также совпал с direct oracle.

## UI и JSON

На собственном seed `3061636154` фактически проверены:

- Pause t76 → +1 t77 → +10 t87.
- Все четыре комбинации Art/Geometry на t87. Art-off не оставляет
  невидимые foreground masks; diagnostic contours отображаются без art.
- Source/whole/100% → flat/floor/200% и pan: full checkpoint не изменился.
  Видимый pan дополнительно подтверждён на seed0/t888, с сохранением
  checkpoint до/после. Flat выпрямляет пол; высокие нарисованные объекты
  не становятся 3D видом сверху.
- Настоящий browser download t87 → fresh reload → file chooser import
  того же файла: full checkpoint восстановлен точно. Следующий +1 — t88,
  native state/PRNG совпали.
- Импорт fixture с изменённым только `boardId` отклонён; t88/config/state
  остались неизменны. Файл fixture лежит отдельно от положительных samples.
- Продолжение до LOST/t2441; «Повторить seed» с нуля до того же terminal,
  в replay изменялось только отображение. Seek Home→0, End→2441 и назад
  через numeric input→87 дали exact native states.

Восемь checkpoints приложены к packet: один actual download с неизменёнными
bytes и семь checkpoint objects, извлечённых из public browser snapshots.
Способ происхождения указан в [index.json](../evidence/full-method-03/index.json).

## Реальные контакты и границы визуального вывода

Кадры сняты из actual browser, не реконструированы программно. Raw сохранён;
23 выбранных screenshots лежат в `evidence/full-method-03/frames/`.

| Case | Фактическое наблюдение / replay |
| --- | --- |
| seed0 / pillar-02 | t360/364/365–368/372. Native hit `pillar-02:edge-01` на t366. В просмотренных кадрах 364/366/368 шар частично закрыт боковой гранью; нет замены этого случая одним численным depth switch. Приложены соседние кадры и geometry overlay. |
| seed0 / pillar-04 | t832/836/838–841/844/848; native corner/side hit `pillar-04:edge-04` на t840. Просмотрены 839/840/841/844; visible ball проходит у нижнего левого края основания. Это конкретная ориентация/траектория. |
| seed0 / receiver-01 | Видимые panned frames t860/880/887/888, native IN_BUCKET на t888. Шар проходит через верхнюю границу нарисованного отверстия и остаётся видим внутри; code не менялся для сокрытия terminal. Frames без pan, где корзина оставалась вне viewport, сохранены в raw и не используются как доказательство входа. |
| seed2 / pillar-04 | t895–897/900, native hit `pillar-04:edge-01` на t897 в LOST run. В art шар закрыт корпусом; geometry overlay t896 показывает native footpoint перед контактом. Это не заявляется как отдельное доказательство видимого corner bounce. |

Общий алгоритм depth/foreground restoration и отдельный shadow pass
сохранены. Diff app к исходному проверенному методу затрагивает путь
source image и board-specific имя download; run-model добавляет board
identity guard. Seed/tick-specific masks и исправления физики не добавлялись.

Эти кадры подтверждают wiring и ограниченные случаи частичного перекрытия.
**Не закрыты** исчерпывающая оценка всех silhouette edges/углов, partial
shadow на каждом переходе, материал/свет/контактная тень и соответствие
всех P1 colliders рисунку. Отдельный увеличенный visual case боковой bounds
не снимался; его events/states входят в native сравнение. Сохранённый binary
depth ordering может требовать отдельной оценки на других углах. Water
finding не переносится на Dark без собственного воспроизведения. Финальная
оценка цельного кадра и движения остаётся за VQA/Lead.

## Повторение и состояние среды

Для native/package повторения использовать
[verify-full-03.mjs](../verify-full-03.mjs); `--browser` проверяет сохранённый
собственный raw. Скрипт ожидает объявленные frozen/oracle/runtime paths.
Для UI: импортировать приложенный Dark checkpoint, source/whole/200%,
снимать +1 соседние тики из таблицы; для корзины перетащить сцену вверх
и снять viewport непосредственно после pan. Смена вида/zoom снова подгоняет
кадр. Checkpoint identity и state проверяются до/после изменения отображения.

Все own raw files индексированы SHA256 в
[raw-index.json](../evidence/full-method-03/raw-index.json), runtime:
`E:\R4D\perspective\p3-runtime\technical-qa\transfer-water-dark\dark\full-method-03`.
Собственная временная IAB tab закрыта; существующий Builder preview оставлен.
Нет staging/upload/lock/service/deploy операций или изменений global env.
Temp задан только процессам в собственном E-runtime.

Перед browser: 10:33:35Z, free RAM16.129/31.907GiB, CPU12%,
C/D/E16.224/16.277/11.873GiB. Postflight 10:53:41Z: free RAM16.450/31.907GiB,
CPU5%, C/D/E16.133/16.277/11.789GiB. Это snapshots общих ресурсов,
не измерение/резерв собственной памяти. Фактические raw/curated bytes —
в evidence index. Новые серверы, threads, branches и worktrees не создавались.
