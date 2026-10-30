# Dark d01 — first independent actual Technical QA

2026-10-30, Europe/Kyiv. **Sampled native/control checks пройдены; visual результат PARTIAL.** Четыре заданных front/side/corner случая содержательно просмотрены. Независимо наблюдён `D01-TQA-V01`: резкое появление целой сферы из-за задней внутренней стенки receiver01/02 на entry. Это отдельный Dark repro, не унаследованный Water verdict. Известное смещение нового floor остаётся ограничением; full Dark/P5 PASS нет.

## Frozen scope и собственные проверки

Consumer `aae514ed31720ab6d913f4bc6d63286c26992e0a`, Artist `0f70d00db096ee30f057dd65ca36a53df3f78899`; actual URL `http://127.0.0.1:55193/`. Root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/dark/output/previews/d01/public`. Своя ветка при старте чистая, HEAD `b4940d77a563f2d56df659a23d11385179562b92`. Read-only TCP55193/PID40328 совпал с owner record; producer process не изменён.

FILE_INDEX6109 bytes/SHA `d810ae08b53a0eaf44636df0adcb2c15eb4a0195b31db383534b4ea70af2116b`; все20 public-файлов exact по disk и HTTP200 bytes/SHA. Source manifest47851 bytes/SHA `c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7`, staged33628 bytes/SHA `18b7769115ac7d2dcba3a89869b50cc9c7824de01421201a886210a17ad3f900`. Source/staged instances, anchors и footprints совпадают. Проверены5 supporting records из exact Artist commit. Sidecar index вне public; HTTP-выдача не требовалась.

8 unique Dark PNG/15 texture IDs/35 instances:12/24 body groups и4 receiver back/front pairs. Принятый Dark02/trial-01 config SHA `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`, P1 manifest SHA `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` совпали с собственным oracle `761e6087c902fe5ea941b90b5ce4d72383a0d755`; core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, r16/tick5ms/quantize7/g980/maxspeed2000/noise2deg/0.02/lcg32. App bytes совпадают с w04, но данные/арт/наблюдения проверены отдельно для Dark. Новый экспорт, компиляция, oracle runs и numerical matrices не выполнялись.

Все **44 actual snapshots** совпали с cached Dark traces по полному state, RNG, config и event prefix; actual loaded art manifest совпал со staged. Это выбранные наблюдения, не каждый live tick. Control smoke: +1:0→1, +10:1→11, обратный/terminal seek, Replay reset0 и повтор state841, Pause/Continue и стабильная пауза856.10 пар state/RNG одинаковы при view/replay/hold; field domain неизменен на всех snapshots. Geometry видна над art; ArtOff убирает подключённые изображения. SourceClip parts нет: specific mask bypass UNVERIFIED. Кнопка случайного нового seed и файловая выгрузка replay не проверялись; никакого win hunt.

| Seed | Actual terminal tick | Outcome |
| ---: | ---: | --- |
| 0 | 888 | receiver-01 |
| 1 | 884 | receiver-01 |
| 2 | 1812 | LOST |
| 3 | 1269 | receiver-02 |

Все четыре исхода сохранены и совпали с prep, включая LOST. +1 после888/1269 сохраняет terminal, физических889/1270 нет. Ни sinking/fade, ни изменения native trigger/start/radius не обнаружено в проверенном scope.

## Грани, углы, опора и тени

| Target | Seed / exact before-at-after | Просмотр |
| --- | --- | --- |
| pillar04 side | 0:840/841/842 | Видимый отскок у левой стороны основания; real-time830→856 |
| pillar02 front | 2:972/973/974 | Шар остаётся перед видимой передней опорой, real-time960→987 |
| pillar02 corner | 2:367/368/369 | Частичное скрытие правым боковым силуэтом; real-time355→378 |
| pillar04 corner | 3:934/935/936 | Частичное скрытие у левой стороны, просмотрены соседние paused frames; отдельный motion fragment этого угла не сохранялся |

Event tick`t` отражён на state`t+1`; перечисленные тройки содержат реальный post-contact state. State/RNG/events точны. В этих кадрах грубого отскока от пустого места, полного ошибочного исчезновения или отрыва основания не найдено. Alpha-query подтверждает допустимое partial overlap: на corner368 body пересекает201/561 внутренних samples шара, на corner935 —172/561, при native depth шара позади body; front973 —229/561, но шар уже перед body. Это диагностическое подтверждение расположения, не замена просмотра и не универсальный corner PASS.

Uniform scale сохранён, bitmap XY warp/rotation не применялись. Видимые нижние грани и локальные мягкие тени связывают выбранные pillars/blocks с тёмным полом; на whole кадре малые тени слабее. Ball и его ground shadow видны в движении. Один новый Dark shadow PNG используется двумя aliases с разными footprint widths — это не две генерации. Rear quad vertex inferred; selected source-depth residual до3.8285px и texture uncertainty12px не превращены в восстановленную3D опору. Все другие грани/скулы/блоки/редкие контуры остаются вне этого вывода.

Known floor limitation сохранён: по handoff generated near edge околоsourceY1260 против accepted1121; actual overlay показывает, что нижняя зона floor и принятая граница не согласованы. Значения handoff не выдаются за новое независимое пиксельное измерение. Framing/crop/геометрия не менялись, mismatch не спрятан. Это art-registration issue, уже переданный Artist, не новый common-input defect.

## D01-TQA-V01 — abrupt reveal у задней стенки чаши

**Repro:** seed0 seek886 → +1/887 → +1/888; seed3 seek1267 → +1/1268 → +1/1269, ArtOn/GeometryOff/Field. В первых двух кадрах каждого случая сфера практически полностью скрыта, затем появляется целиком в чаше. Дополнительно просмотрены approaches874→888 и1254→1269 в real time: шар сначала заходит за видимую заднюю кромку, затем раскрывается скачком. Native states/RNG/events непрерывны и exact. Front rim не касается видимой сферы в этих терминальных положениях.

Независимый Dark pixel-check: у receiver01 в887 visual sphere center попадает в back texture `(620.63,329.63)`, RGBA`[34,24,21,252]`; у receiver02 в1268 —`(670.97,321.45)`, `[36,26,24,253]`. В каждом случае все561 sampled внутренних точек сферы закрыты почти непрозрачным **тёмным внутренним rear wall**, back alpha250–253/251–253; front в этих местах alpha0. Source back/front PNG отдельно просмотрены: back включает полную чашу с задней внутренней стенкой, front содержит передний корпус и прозрачный верх. Это **не вода и не доказанное исчезновение над открытой плоскостью**, как в Water repro.

| Case | Ball nativeY before/entry | Back depth | Front depth |
| --- | --- | ---: | ---: |
| seed0,887→888 | 34595.8404133→34603.2922882 | 34596.0242800 | 34682.0437401 |
| seed3,1268→1269 | 34593.8543064→34599.0656924 | 34597.0451138 | 34682.0775569 |

Offsets−1/+1 и radius/depthRadius mapping корректны. При пересечении back depth **вся** sphere меняет порядок относительно всей back raster, поэтому получается бинарное reveal. Это visual limitation плоского baseline part preparation/depth; common native/trigger bug не найден. Нельзя объявить каждый пиксель задней стены ошибочным occluder: сама стена должна закрывать шар. Открытым остаётся качество постепенного reveal по её видимой границе. Для successor имеет смысл уточнить разделение внутренних поверхностей/заднего борта и occlusion boundary, сохранив original d01; этот отчёт не поручает и не выполняет ремонт.

Собственная optical policy Dark проверена независимой проекцией128 точек: L544.5, diameter1073, O`[627.5,440]`, capture330×223. Logical back/front anchors всех4 aliases совпали с формулой с error0; shifts−18.85985…−18.96690sourceY. Числа Water/Jungle не подставлялись. Такая регистрация не доказывает правильность общей глубины полного back sprite. Depth values рассчитаны по exact frozen inputs/code, прямое Pixi zIndex чтение не заявляется. Receiver03/04 entries, все реальные front-rim silhouette contacts и полная pit registration UNVERIFIED.

## Evidence и сохранность

Runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d01/`:44 snapshots/32 screenshots, comparisons, alpha/depth/optical checks и supporting pins. Index15044 bytes/SHA `4c50946bc2bae0efdf9c03ee9679c9920ba5f92354f96eaeec0a574d5b3405ab`,93 файла/10102234 bytes; `D01_EVIDENCE_PINS.json` содержит точные paths/SHA/repro. Paused frames точны; running screenshot сделан позже state read и не выдаётся за атомарную пару с JSON. Browser error/warn capture пуст, debugger не использовался.

Missing6 bowls/4other skulls/block05/06/environment не оформлялись повторяющейся матрицей дефектов. Initial bowl hits без art остаются diagnostic. Source masks/невидимые foreground/редкие контакты не получают PASS. Fresh guard: до RAM≈9.92GiB,C/D/E≈13.89/14.62/9.36GiB,CPU0%; после9.39GiB,13.85/14.62/9.30GiB,CPU6%. Оценка своего RAM1GiB/E0.1GiB + reserve соседям4/2GiB выдержана; own evidence10.10MB. Свой hidden IAB tab закрыт, producer server/frozen d01/Water/Jungle не менялись. `serverWrites=0`, `tokenGranted=false`, STOP/denial не возникали. Результат не является release/privacy/full artistic approval.
