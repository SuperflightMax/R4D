# P4 Water — независимая техническая подготовка

30 октября 2026. **Native/input prep завершена; consumer QA и Art PASS не проводились.**
Активен только board04/trial-02. Исторический startup FAIL trial-01 не заменён
на PASS и повторно не запускался. Общий вход не изменялся.

## Exact inputs и исполнение

Canon `b1382dd4c230815a019e52e2ec4617ef705661d5`, transfer-card blob
`0db67e8c3c841ede323a809789f5146ca4f77f11`. Прочитаны назначенные ORDER,
transfer/P4, COMMON и собственная роль. Другие продукты/опыты не читались.

Accepted P1: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`.

| Вход | Bytes | SHA-256 |
| --- | ---: | --- |
| 04-water-temple.jpg | 527016 | `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` |
| boards/04/trial-02/config.json | 27231 | `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| boards/04/trial-02/manifest.json | 15870 | `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| common view-math.mjs | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |

Config/manifest/view-math получены raw bytes через git show из разрешённого
read-only reader. JPG только прочитан. Source/profile/geometry не заменялись
числами Jungle или композиционным эталоном P0.

Переиспользован свой Jungle oracle `6b011256d31c4ab0e617721420a92feda65ffbfd`,
core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`. До и после работы сверены27
сохранённых native files. Исполнялись эти неизменённые TS средствами прежнего
Node24 type stripping; нового native build/checkout или симулятора нет.
Package-tree pin `008d16a80a26bb77d562a45218b01da09b0d9ff0` получен в поручении;
полное дерево с неисполняемыми tests не реконструировалось. Проверка фактически
используемых27 bytes выполнена по сохранённым exact Git blob/SHA fingerprints.
Compiled bundle не копировался и не пересобирался.

## Startup и обычные runs

Штатный validateConfig ошибок не вернул; createSimRunSession и первый native
шаг работают. 6 pins /106 segments /4 buckets /1 drop; все physics settings
прежние: r16, tick5ms, quantize7, g980, maxspeed2000, noise2deg/0.02, lcg32.
Start неизменён: `[33192.751665295094,33184.49424667716]`, angle90/speed0.
Ближайший initial collider — `far`, расстояние28.7793323246, запас после r16
`+12.7793323246`. Стартовой коллизии не обнаружено.

Прямая/обратная P1-проекция сверена на223 точках; максимальный round-trip
`1.03e-11 native units`. Translation этой доски `[33256,34124]` сохранён.

Заранее выбраны только seed0/1/2. Все состояния и исходы сохранены:

| Seed | Последний tick | Результат | Отражающие contacts |
| --- | ---: | --- | ---: |
| 0 | 1326 | LOST, finalX32866.4825074 | 10 |
| 1 | 1196 | LOST, finalX33728.1429454 | 9 |
| 2 | 1275 | IN_BUCKET receiver-02 | 15 |

Три физические траектории различны по pos/vel, не только RNG metadata.
Для каждого run сверены ticks, PRNG (два native обращения на отражающий
контакт) и штатный конечный результат. Seed0 целиком повторён точно;
восстановление его ранее наблюдённого checkpoint перед первым контактом
дало те же следующие native states/events. Менялся только rng.seed.

## Воротца: что действительно доступно

**Закрытого под r16 просвета между опорами в исследованной геометрии не
обнаружено.** У всех восьми пар опор горизонтальные ширины на концах/середине
их depth band52.0113–61.4377 native units при диаметре32. Проверенные точки
оси имеют положительный запас к остальным config colliders (минимум+10.0056).
Это измерение опор и выбранной оси, не доказательство всех маршрутов.

Есть реальный ordinary **native passage arch-07, seed1, ticks1009–1020**:
состояние1008 ещё перед band,1021 уже после; шар проходит между опорами с
обычными столкновениями. Сохранены entry/inside/exit и полные events:

| Native event | ID | Состояние после |
| ---: | --- | ---: |
| 1006 | arch-07-left-foot:edge-01, endpoint | 1007 |
| 1012 | arch-07-right-foot:edge-04, inner face | 1013 |
| 1018 | arch-07-left-foot:edge-02, inner face | 1019 |

Отдельный support-face case: seed0, `arch-04-right-foot:edge-01`, event697
→ state698. В остальных семи воротцах full-band passage в этих трёх runs не
наблюдался; это UNOBSERVED, а не доказательство невозможности прохода.

Manifest planeCollapse сохраняет одну 2D navigation plane: islands/water
channels/short bridges/steps на одной плоскости. Только solid support
footprints; generated shoreline/height/lintel colliders=0. Физического
контакта с перемычкой в этом config быть не должно. **Вид прохода под/за
нарисованной перемычкой остаётся обязательной последующей Pixi-проверкой**;
native passage его не засчитывает. Новая height/водная физика не добавлялась.
Конкретного blocked native gate-case не найдено; общий input не исправлялся.

## Receiver и handoff для consumer

Доступный capture: seed2, receiver02, ticks1273/1274/1275; IN_BUCKET на1275.
Полностью видимый шар или один trigger не доказывают front-rim. Для
receiver03 сохранён близкий, но uncaptured подход seed1/t1115 и соседи1113–1117
(расстояние до центра60.9035, до trigger radius+29.7669). Реальное пересечение
нарисованного обода определяется только после подключения art silhouettes.
Receiver01/04 capture не наблюдался; недоступность вообще не утверждается.

Builder может открыть seed1 и interval1005–1021 без поиска нового seed:
нужны точный paused native tick, +ticks/seek, full state/rngU32/events,
Art/Geometry и source/native view без воздействия на симуляцию. Событие
контакта e относится к входному tick; post-state=e+1. Capture event уже имеет
финальный tick. Не смешивать native/research/source coordinates и binding
Water trial02 с Jungle/Dark/trial01. Восстановленная QA fixture — native
reference schema, а не готовый формат импорта будущего consumer.

Для последующей UI-сверки сохранять исходные DOM JSON text strings и raw
download/export bytes, разбирать JSON в собственной REPL. Не сравнивать
числа после browser-object transport: он уже наблюдался как источник1ULP
округления unquantized events и отличий ordering/prototype. Native numbers,
PRNG и порядок массива events не округлять/переписывать. Сообщённый Lead
Builder case seed2771772266/LOST1100 — полученный контекст, не мой run и не
дополнительный QA PASS; в собственную серию0/1/2 не включён.

## Файлы и следующий шаг

Raw root: `E:\R4D\perspective\p4-runtime\technical-qa\transfer-water-dark\water`.

- INPUTS.json SHA `818c78af2ec7e9106bb62be9606fadb54cb48aba4dca09afd89a1a5001727769`.
- NATIVE_PREP.json SHA `152317b2c07ff9da100406fcc1017bc510d8db1bda30afeb007fd8c628e48ada`.
- CRITICAL_CASES.json SHA `b55637e406f9bb3e2bb370e6ed025233959b3ba15acae4643f9d154537bb0d5f`.
- runs/seed-0..2.jsonl — все3800 состояний и event deltas; отдельные replay
  fixtures сохраняют actual config/seed/final state/full events.
- CRITICAL_CASES — восемь полезных сценариев с точными соседними состояниями,
  полными событиями до каждого tick и source projection centres.
- critical-native.png — статический график сохранённых native состояний,
  **не кадр consumer, не art и не визуальный gate PASS**.
- DATA_INDEX.json —16 files/1267921 bytes с hashes; небольшие summaries
  сохранены рядом с отчётом в evidence/.

Shared qa-tools — небольшая transfer-обвязка прежнего native harness и
статические измерения входа, без собственного интегратора/коллизий/сервера.
Дальше нужен один exact named frozen Water artifact, общий с VQA. Только
после него — реальная UI/движение/alpha/receiver-front QA. Dark подготовлена
отдельно и продолжается независимо. Старый Jungle результат/bytes и его
PARTIAL/UNVERIFIED случаи сохранены. Builder LOCAL_HELD source не переносился.

Ресурсы перед работой: RAM10.35/31.91 GiB free, CPU35%/24 logical,
C/D/E15.724/14.652/9.783 GiB. Короткие Node/Python процессы выполнялись
последовательно; оценка своей нагрузки<0.5 GiB RAM/<30 MiB outputs с запасом
для второго активного слота. Все CLI имели явный собственный E workdir;
TEMP/TMP и Matplotlib cache — process-local в своих board runtime.
Новых браузеров/серверов/прав/credentials или security writes не было.
Полные журналы/trajectories не чистились, исходные JPG и старые данные не менялись.
