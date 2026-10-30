# P4 Water — перенос и открытая доводка

30 октября 2026. **Исходный полный вариант: технический PASS, художественный FAIL WF-01/02/03.** Способ P4 воспроизведён в живом native/Pixi consumer, включая реальные проходы у воротец и частичные перекрытия ободом. Нижняя вода, тени приёмников и пропущенные участки каменных стен требуют доводки. Artist готовит отдельный `full-v02`; он ещё не принят двумя QA и не заменяет проверенный baseline. Перенос Water не объявлен завершённым.

## Исходный полный опыт

Immutable target `water-full-original-p4-candidate-01`: artifact SHA256 **`12c5f6a96a1c2c7571b13c303ffca0da4e84676916edd21fd1ddd87c39758a6c`**, payload root **`be302ce69e86ca2f0ca73b2ee7143440013ee0c6dd077bef0d78e5e18d72d59c`**, 206 payload files / 208 вместе с artifact и FROZEN. Local root `E:/R4D/perspective/p4-runtime/builder/transfer-water-dark/water/candidates/water-full-original-p4-candidate-01`, [preview baseline4398](http://127.0.0.1:4398/). При handoff проверен PID18384 с этим frozen serve; owner перед новым использованием проверяется заново. Это **не passing publication candidate**.

Artist local commit **`f973db5b20a99eb241a88c677b1b83ed307e1eaf`**, manifest **`f1cdda7a9cf4865e5ece6893eaa5f6c7214e2d29c4a0bafa52f276b6d4a34a23`**, directory `E:/R4D/perspective/p4-worktrees/asset-artist/experiments/p4-extracted-objects/transfer-water-dark/water/artwork/full-v01`. Комплект: 21 floor object — 8 arch, 6 frog и 7 pillar — плюс 4 receiver; 70 object parts + 5 scene parts, 78 runtime PNG. В 50 видимых body/rear/front/scene частях RGB при ненулевом alpha побайтно совпал с исходником. Полный комплект заменил starter с тремя извлечёнными объектами; starter сохранён отдельно и не выдан за полную доску.

Builder source **`b6226979df39662e745e8636553019fae14fa19e` LOCAL_HELD**, app **`96ddc0443f311dd46f7f07b287171118608a583f0fd26416dbaa18ad8c8e84d0`**, native bundle **`8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`**. В app отдельно исправлен ввод точного тика во время Play: render больше не перезаписывает draft. Техническая QA закрыла прежний P3 TQA-WATER-01-01 тремя повторениями Go1009 на этом полном target. Это исправление управления, а не изменение P4 sorting или native physics.

## Рецепт, привязка и обнаруженные дефекты

Сохранены исходные видимые RGB и ручной/GrabCut alpha, локальный repair скрытого пола, отдельные оценочные ground-shadow PNG, receiver rear/front и fixed scene parts. Вода внутри приёмников остаётся ground; реальные стенки должны иметь единственного структурного владельца. Шар и его оценочная тень переиспользованы из собственного Jungle: gold body, display offset[-.95,.86]R, shadow half-size[1.55,.58]R, opacity.65, физический r16 без uplift. Это исходный P4 с grouped nativeY, без новой высоты или per-face depth.

Использован только принятый **Water04/trial-02**, P1 **`4b47db04c7140ebf88f69b91faa0b790d46f22ec`**: config **`9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`**, manifest **`48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`**, source JPG **`8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d`**. Старый trial-01 остаётся историческим startup FAIL. H/inverse/translation/25 anchors сохранены, 6 pins / 106 segments / 4 buckets / 1 drop не менялись. У arch есть две footprint опоры, по 4 edges; lintel collider и искусственная высота берега не добавлялись. Native core5a6fa03, r16/tick5ms/quantize7/drop/noise/PRNG неизменны; новый native build не выполнялся.

VQA подтвердил три дефекта исходного полного комплекта:

- **WF-01:** слишком яркая/резкая нижняя вода в background, source ROI x0–1536,y1188–1536. Широкая восстановленная полоса заметно отличается от исходной живописи при Parts ON и OFF.
- **WF-02:** грязные серые угловатые тени и жёсткие внутренние срезы у receiver01–04. Точные ROI02 x505–665,y1480–1503 и ROI03 x880–1030,y1480–1503. Прозрачные края PNG не исключают резкий контур внутри texture.
- **WF-03:** пропущенный alpha реальных rear/inner стенок receiver02/03 даёт синие водяные клинья. В частности source(720,1115) RGB(144,165,109) принадлежит камню, а в baseline все structural alpha там0. Нужна исходная stone alpha/ownership, не искусственное расширение front-rim.

Линия grout у arch04 присутствует в source и дефектом не признана. Новая доводка `full-v02` сохраняет исходный полный вариант, другие тела и привязки. Уточняются локальные repair masks/тон воды, мягкие тени и только подтверждённые пропущенные stone pixels. В WIP сдвиг нижней воды уменьшился примерно с +42G/+57B до +4.2G/+3.7B; это диагностическая метрика, не Art PASS. Соседние столбы исключены из sampling локальных water plates. Manifest/handoff и две QA на новом immutable hash ещё требуются.

## Реальные состояния и непроверенные входы

- Seed0: frog01 states104–110, contact event105→state106; arch04 right-foot696–700, event697→698.
- Seed1: arch07 states1005–1021, foot events1006→1007,1012→1013,1018→1019. Левый столб, перемычка и правый столб проверены с настоящим частичным перекрытием. Переход глубины1015 произошёл после фактического освобождения силуэта.
- Receiver02 capture: seed2 ticks1273/1274→1275. Шар полностью виден; front alpha0. Это подход/захват, **не capture-rim partial proof**.
- Receiver02 отдельный partial-rim: seed0/LOST1326, states1248–1281;1252/1253 partial,1262 hidden,1277 exit. Это другая сохранённая траектория, без native capture02.
- Receiver03 отдельный partial-rim: seed1/LOST1196, states1120–1145;1124/1125/1126 дают около37.49/50.19/63.20% overlap,1130–1138 hidden,1146 front overlap0. Подход и native capture03 не выдумывались.

Receiver01/04 approach/capture/front-rim остаются **UNOBSERVED** в полных обычных0/1/2; это не доказательство невозможности. Outer guards имеют настоящие alpha-overlaps; divider contacts без пересечения силуэтов не выданы за occlusion PASS. Все исходы сохранены: seed0 LOST1326, seed1 LOST1196, seed2 IN_BUCKET02/1275; дополнительные ordinary LOST1100/1429 отдельно отражены в supplied provenance. Удобные seeds, ручные позы и sinking после IN_BUCKET не создавались.

## Независимая QA и дальнейшая сдача

Обе QA проверили **один artifact12c5f6a9…**, с неизменными roots до/после. [TQA383e7f3](https://github.com/SuperflightMax/R4D/blob/383e7f3b644e0988c0e4cbb57c5da429c3d44364/experiments/p4-extracted-objects/transfer-water-dark/water/qa/technical/FULL_01_REVIEW.md):160/160 own exact native state/RNG/ordered events observations без epsilon; sourceRGB/25 anchors/75parts/78texture hashes и dimensions, controls/import/guard/seek PASS. [VQAbe4407f](https://github.com/SuperflightMax/R4D/blob/be4407f463bfb8ee41f60f1a8db1b9680fb1e09c/experiments/p4-extracted-objects/transfer-water-dark/water/qa/visual/FULL_ORIGINAL_01.md):89 paused captures, реальные arch/rim cases подтверждены, **Art FAIL WF01/02/03**.

Для повторения: whole view1280×720,DPR1,board574²,zoom1/noFollow,ArtON/GeometryOFF; Go к указанному seed/tick, соседние exact states и matched PartsON/OFF. Сохраняются full-precision DOM JSON, PRNG/ordered events и обычные исходы. Worker-response hash остаётся UNVERIFIED; unsupported Target.setAutoAttach не повторяется другим actor/transport.

Дальше нужен новый immutable consumer с `full-v02`, независимые TQA/VQA на его общем hash и отдельный passing local Release package. Публикации Water нет: текущий Review PROTECTED, tokenGranted=false; нужен новый конкретный CTO token на готовый пакет. Старые Jungle RESULT/frozen/public и все baseline остаются. Source Git HOLD/UNKNOWN не снят, compiled demo не заменяет доставку held исходника.
