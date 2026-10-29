# Dark02/trial-01 — input/native oracle

2026-10-30, Independent Technical QA. Вход и настоящий native запуск подтверждены. Frozen Dark candidate отсутствует; художественный перенос, actual browser и перекрытия **UNVERIFIED**. Общий input blocker в выполненных проверках не найден.

## Вход и физические условия

Канон `b1382dd4c230815a019e52e2ec4617ef705661d5`, принятый P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; только активный `simulation/boards/02/trial-01/` внутри `experiments/p1-collider-mapping/clean-repeat-01/`. Общий transfer JSON прочитан целиком. Все Git bytes проверены без нормализации:

| Вход | Bytes | SHA256 |
| --- | ---: | --- |
| config.json | 19508 | `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| manifest.json | 13939 | `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| accepted `viewer/src/view-math.mjs` | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |
| `K:/Agents/R4D/Assets/perspective/02-dark-temple.jpg` | 536988 | `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` |

JPG1536×1536 прочитан read-only, исходник просмотрен. Настоящее ядро: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Собственный ранее проверенный private runtime повторно использован после проверки 26 executable JS по cached inventory; повторного экспорта/компиляции ядра и Jungle matrix нет. Private TS/maps не публикуются.

`validateConfig=[]`; 12 pins/70 segments/4 buckets/1 drop. Настройки: r16/bounce0.9, tick5ms/quantize7, g980/maxspeed2000/angleDeviation2deg/bounceDeviation0.02/wallBounce1, lcg32. Старт `(33349.528039973346,33109.09546312392)`, angle90°, speed0, проекция `(768,293)`. Минимальный начальный зазор до коллайдеров — 85.791021 native units (`far`). Core/config/geometry/projection/start не менялись.

## Полные запуски и replay

Seed0–3 объявлены до первого запуска, без отбора. На seed — один запуск и exact replay, всего 8 запусков доски; все исходы сохранены.

| Seed | Terminal tick | Исход | Native contacts |
| ---: | ---: | --- | ---: |
| 0 | 888 | IN_BUCKET receiver-01 | 7 |
| 1 | 884 | IN_BUCKET receiver-01 | 7 |
| 2 | 1812 | LOST | 11 |
| 3 | 1269 | IN_BUCKET receiver-02 | 9 |

Полные state traces и event arrays совпали между запуском и replay. Config и world start неизменны. Четыре position traces различаются; первый расход PRNG при bowl-base-01 — state90; первые разные позиции seed1/2/3 против0 — state91. При speed0 одинаковый участок до первого отскока ожидаем. 19428 численных компонентов конечны; после tick0 соответствуют quantize7, ticks непрерывны. Нет молчаливого отбрасывания LOST.

Новая проекция: 161 проверенная точка, native roundtrip ≤1.03e-11, отличие от accepted view-math0, source corner error ≤5.05e-12 px. Все 87 native primitives единожды покрыты idMapping. По16 точек каждой из4 receiver trigger circles дополнительно roundtrip ≤1.03e-11. Ground footprint шарика r16: старт≈27.75×14.07 source px, receivers≈37.16×25.22; это не видимый силуэт объёмного шарика.

## Случаи граней, углов и корзин

`case-windows-001/windows.json` содержит28 окон с exact states, projected centers и motion ranges. При event tick`t` контакт уже отражён в state`t+1`; сохранены `t/t+1/t+2`. Классификация ниже получена из реального hit center и nearest point accepted segment, не из интерпретации арта.

| Случай | Seed | Exact states | Основание |
| --- | ---: | --- | --- |
| Боковая грань pillar-04 edge04 | 0 | 840/841/842 | tAlong0.528, внутренность сегмента |
| Передняя грань pillar-02 edge03 | 2 | 972/973/974 | tAlong0.834, внутренность сегмента |
| Угол pillar-02 edge01 | 2 | 367/368/369 | tAlong=1, endpoint |
| Угол pillar-04 edge01 | 3 | 934/935/936 | tAlong=0, endpoint |
| Подход с задней стороны pillar-02 edge01 | 0 | 366/367/368 | tAlong0.964; близко к углу, но endpoint contact не приписан |
| Bowl-base-01 первый контакт | 0 | 89/90/91 | Реальный круглый pin; все события в cached trace |
| Skull-base-05 | 3 | 1005/1006/1007 | Реальный круглый pin |
| Receiver-01 entry | 0 | 886/887/888 | IN_BUCKET888, min center distance35.9799 при r43.0097 |
| Receiver-02 entry | 3 | 1267/1268/1269 | IN_BUCKET1269, min center distance42.2633 при r42.5162 |
| Receiver-01 missed approach | 2 | 1735/1736/1737 | distance57.3462 >r43.0097; позднее LOST1812 |

Для contact motion смотреть ещё ±10 соседних тиков из сохранённых ranges. Terminal tick не имеет более позднего физического состояния; после входа можно проверять сохранение terminal render, но нельзя придумывать sink trajectory. Bucket trigger: строгая дистанция центра <r, без вычитания r16, высоты или погружения. Передний обод и видимое попадание требуют просмотра generated candidate. Входы receiver03/04 в объявленной серии не достигнуты; они не доказаны недоступными вообще и не получают PASS.

Все грани/углы пока являются целями визуальной проверки. Реальные силуэты, alpha/masks, пустое место при отскоке, частичное скрытие, окружение/rails, тени, UI replay/Art/Geometry/framing/pause и движение не проверены без frozen build. Численные контакты не подтверждают художественную цель.

## Evidence, ресурсы и следующий шаг

Runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/`, source pins и полные seed/contact references — `EVIDENCE_PINS.json`. Summary SHA `2d1394abf032af1b9491ad4ccfb0f02b716ccc631a99cbc9862e5df27bd80911`; windows SHA `30ba177a71f07d4eb873550cf14f80be6f95a0f17f3a8ac0438e7655d276a976`. Размеры/SHA всех22 файлов input index и case index перепроверены. Input evidence≈0.90 MB, peak RSS<67 MiB. Guard до запуска: C/D/E free≈15.10/14.65/9.78 GiB, RAM11.02 GiB, CPU4%; после E9.775 GiB. Собственная оценка0.25 GiB RAM/0.03 GiB E + резерв4/2 GiB выдержана. Foreign processes и servers не изменены; serverWrites=0, tokenGranted=false.

Jungle result `df0d95f40e60991632c885f0bc53d32497a090e7`, consumer recipe `af23e124cf5bd1d9de884082ffbc993448217112`, Artist `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966` и их ограничения сохранены. Материалы P4/P6 и готовые PNG Jungle не используются как новый арт. После Water candidate и при выдаче Dark frozen URL/index — независимое сравнение native states/RNG, UI invariant checks и actual motion на этих случаях.

Helper общий только для собственной QA: `experiments/p5-regenerated-objects/transfer-water-dark/water/qa/technical/prepare-oracle.mjs dark input-oracle-NNN` и `select-case-windows.mjs dark case-windows-NNN`. Runtime разделён по доскам; новый индекс обязателен, evidence append-only. Дополнительные native runs без конкретного вопроса не нужны.
