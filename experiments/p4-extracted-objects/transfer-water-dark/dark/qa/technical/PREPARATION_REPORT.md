# P4 Dark — независимая техническая подготовка

30 октября 2026. **Native/input prep завершена; consumer QA и Art PASS не проводились.**
Активен board02/trial-01. Материалы/выводы Dark отделены от Water/Jungle.

## Exact inputs и native

Canon `b1382dd4c230815a019e52e2ec4617ef705661d5`; transfer-card blob
`0db67e8c3c841ede323a809789f5146ca4f77f11`. Назначенные общие документы и роль
обновлены. Продукты/арт/findings других опытов не изучались.
Accepted P1: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`.

| Вход | Bytes | SHA-256 |
| --- | ---: | --- |
| 02-dark-temple.jpg | 536988 | `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` |
| boards/02/trial-01/config.json | 19508 | `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| boards/02/trial-01/manifest.json | 13939 | `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| common view-math.mjs | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |

Git show извлёк точные bytes, без PowerShell re-encode. JPG только прочитан.
Свой Jungle oracle `6b011256d31c4ab0e617721420a92feda65ffbfd` переиспользован
на неизменённом core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`.
Все27 сохранённых исполняемых native files сверены по прежним exact hashes
до и после работы; Node24 type stripping прежний. Нового private checkout,
native build, bundle copy или симулятора нет. Package-tree pin
`008d16a80a26bb77d562a45218b01da09b0d9ff0` получен из задания, полное дерево
с tests заново не реконструировалось; actual execution опирается на проверенные
27 files, а не на новый dump ядра.

## Startup и сохранённые runs

Штатные validateConfig/createSimRunSession/step работают. 12 pins /70 segments
/4 buckets /1 drop. r16/tick5ms/quantize7/g980/maxspeed2000/noise2deg/0.02/lcg32
и actual start не изменены. Drop `[33349.528039973346,33109.09546312392]`,
angle90/speed0. Ближайший collider `far`: расстояние101.791020595, запас после
r16 `+85.791020595`; startup overlap не обнаружен.

Сверены157 projection points, максимальный round-trip `1.03e-11 native units`.
Собственная translation Dark `[33307,33912]` сохранена; Jungle/Water числа не
подставлялись вместо этого профиля.

Заранее заданная серия0/1/2 сохранена целиком, без поиска хорошего исхода:

| Seed | Последний tick | Результат | Отражающие contacts |
| --- | ---: | --- | ---: |
| 0 | 888 | IN_BUCKET receiver-01 | 7 |
| 1 | 884 | IN_BUCKET receiver-01 | 7 |
| 2 | 1812 | LOST, finalX32824.3930072 | 11 |

Три разные физические pos/vel trajectories. Каждый native tick и PRNG
проверен, конечный результат совпал со штатным runUntilDone. Seed0 full replay
точен; восстановление его ранее наблюдённого checkpoint перед первым контактом
дало те же следующие состояния/events. Менялся только rng.seed.

## Доступные corner/face/border windows

| Случай | Seed | Native ID | Event → post-state | Соседние ticks |
| --- | ---: | --- | --- | --- |
| Corner endpoint | 2 | pillar-02:edge-01 | 367→368 | 366/367/368/369 |
| Передняя грань (больший native Y) | 2 | pillar-02:edge-03 | 972→973 | 971/972/973/974 |
| Боковая грань | 0 | pillar-04:edge-04 | 840→841 | 839/840/841/842 |
| Левая граница | 0 | left-3 | 460→461 | 459/460/461/462 |
| Receiver capture | 0 | receiver-01 | IN_BUCKET888 | 886/887/888 |

Corner — настоящий endpoint contact, closest segment parameter t=1. Конец
edge01 совпадает с началом edge02: `[32958.43714453147,33844.427583699246]`.
В post-state368 расстояние центра шара до вершины `16.000000018872093`
при r16; quantize не превращён в изменение геометрии. Это конкретный
воспроизводимый сложный случай для первой сборки Dark.

Front-face parameter t=0.8342600671, side-face t=0.5280325251: контакты внутри
соответствующих segments, не придуманный угол/скрытый объём. График
critical-native.png показывает эти реальные native positions и r16 outlines;
он не доказывает вид боковой/передней поверхности raster art.

На новом consumer нужно просмотреть эти окна в Art on/off и Geometry on,
проверить основание/частичное скрытие/отсутствие видимого отскока от пустого
места. Наблюдённые ID не означают проверку всех pillar/block/skull/bowl
силуэтов: прочие художественные overlap cases остаются непроверенными.

## Корзины и границы вывода

Подтверждён только native trigger receiver01 в двух обычных runs. Отдельные
подход/захват/front-rim при пересечении actual silhouettes проверяются после
подключения арта. Полностью видимый ball в отверстии не front-rim PASS.
Receiver02/03/04 capture не наблюдался: ближайшие выбранные состояния остаются
далеко от их trigger circles. Это не доказательство недоступности этих корзин
вообще. Нового sinking после IN_BUCKET или height physics не создавалось.

Dark input не подгонялся под ожидаемый угол, bounce или удачный run. Ошибки
consumer/art по этой подготовке не заявляются: самого frozen consumer ещё нет.
Нового доказанного common-input дефекта не установлено. Блокировка отдельного
будущего случая не должна останавливать разрешённую работу другой доски.

## Handoff и evidence

Raw root: `E:\R4D\perspective\p4-runtime\technical-qa\transfer-water-dark\dark`.

- INPUTS.json SHA `117f7dd2bdfdc9ae4b2d88eb1995e19ccb0fafe9189f75537c5622f88d1f99d3`.
- NATIVE_PREP.json SHA `1fbd961a1362dc86f27464394942415a29c4729ff8c3198601168e9be85ad5ca`.
- CRITICAL_CASES.json SHA `2c8c6d6eb2529c5b0134b384aac8615640c9ce59101c53ab83e7b723d5125a0d`.
- runs/seed-0..2.jsonl: все3587 states, event deltas; replay fixtures содержат
  actual config/seed/final state/full events. LOST не отброшен.
- CRITICAL_CASES: шесть сценариев с полными state/PRNG/events и source centres.
- DATA_INDEX.json:16 files/1112035 bytes с hashes; curated metadata рядом
  с отчётом в evidence/. Статические PNG остаются в собственном runtime.

Builder нужны точный paused tick, +ticks/seek/replay и наблюдаемые native
state/rngU32/events по **Dark binding**. Contact e отражается в post-state e+1;
capture event относится уже к final tick. Native/research/source coordinates
не смешивать. Формат native QA fixtures не является обещанием consumer import
schema. Следующая независимая UI-проверка — только на одном exact named frozen
Dark artifact, общем с VQA. Water имеет отдельные inputs/report/windows.
Будущие UI observations сохранять как raw DOM JSON text/raw export с локальным
JSON.parse; object transport не использовать для exact unquantized event
numbers. Точность чисел/PRNG и порядок массива events не ослаблять из-за
ordering/prototype различий канала чтения.

Работа шла в прежней своей ветке/worktree. Jungle result, held source и
frozen/public bytes не изменялись. Доставка QA отчётов не доставляет Builder
LOCAL_HELD ancestry; server/Review token/security операции не выполнялись.

Та же ресурсная проверка, что для Water: RAM10.35/31.91 GiB free, CPU35%,
C/D/E15.724/14.652/9.783 GiB. Процессы были короткими и последовательными,
runtime/temp/cache/output — свои Water/Dark подпапки с process-local env;
каждый CLI имел явный собственный workdir. При оценке<0.5 GiB своей RAM
учтён второй активный слот. Пороги4/2 GiB не достигались. Старые данные,
глобальные settings, чужие процессы и доступы не изменялись.
