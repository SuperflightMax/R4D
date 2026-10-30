# Dark d02 — адресная independent technical QA

2026-10-30. **Known lower-floor drift исправлен в проверенном scope.** Near boundary теперь попадает в полосу accepted sourceY1121; actual Whole/Field и geometry overlay подтверждают согласованный стык пола и чаш без нового заметного зазора. Полный Dark PASS не выдан. `D01-TQA-V01` остаётся OPEN: receiver preparation не изменена и entry audit здесь не повторялся.

Frozen consumer `ce110a387919bbb10c467c70afce678f8b4ee4a7`, Artist `9647869d6dbf672ee5922b0fc57df254b9fdbb93`; preview `http://127.0.0.1:55195/`. Собственный runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d02/`; index/SHA в `D02_EVIDENCE_PINS.json`. D01 artifacts и отчёт не менялись.

## Frozen и loaded contract

Все20 public files disk/HTTP200 exact; sidecar index проверен отдельно вне public. Source/staged manifests exact. Новый только floor PNG `f9474768fe208f8dc4f26fd97714b862ab37f23f23125a2d17778f920233c472`; все34 non-floor instances и14 non-floor texture entries точно равны d01. Итог8 PNG/15 texture IDs/35 instances,12/24 body groups и4 receivers. Optical anchors/capture/O/uniform scale/hR/offsets receiver прежние.

Loaded manifest во всех11 actual snapshots равен frozen. Все11 state/config/RNG/normalized event prefixes точно совпали с собственным cached native oracle. Native/config/projection/start/PRNG не менялись и не запускались повторно. Renderer floor-rank extension здесь не затрагивает actors: target-bound floor instances в Dark отсутствуют; source floor уже имел прежний−1e8 rank.

## Independent floor evidence

Отдельно просмотрен исходный1254² floor-v3 PNG. Визуально идентифицируемая верхняя фаска near edge лежит примерно в y912–918 texture. Независимые RGB row queries по x200…1050 подтверждают начало светлой кромки около912: median RGB row delta+63.67. При едином1254→1536 scale1.224880383 полоса равна sourceY1117.09…1124.44 и включает accepted1121. Номинальная середина915 даёт1120.76555, residual−0.23445, но это **не subpixel измерение**; различимость фаски около±3 texture px/±3.675 source px. Численный диапазон, метод и queries в `floor-edge-independent.json`, отдельно от producer `FLOOR_CORRECTION.json`.

Actual seed0/t0 сохранён в Whole/Field с geometry и без. Кромка больше не уходит к прежнему estimated1260. Верхняя фаска и тёмная вертикальная передняя стенка читаются отдельными поверхностями, чаши примыкают к переднему краю; нового заметного зазора, двойного борта или плоской наклейки в этих видах не обнаружено. Ближняя pillar03 опирается на пол перед кромкой; верхние body bases и локальные shadow support сохранены. Старый d01 start screenshot также просмотрен для сравнения; часть старого края была скрыта чашами, поэтому абсолютное old edge1260 остаётся прежней raster-estimate, не новым actual измерением. Новый floor alignment проверен независимо; весь верхний floor raster не объявляется pixel-identical старому.

## Узкая regression и границы

Сохранён seed2 pillar02 corner367/368/369: прежнее частичное перекрытие шара опорой. Front973 с art, geometry, Art Off и Whole restore сохраняет прежнее front ordering, state и RNG. Контактные anchors/body footprints прежние, нового пустого отскока в этих выбранных состояниях не наблюдается. Нового motion audit и44-snapshot d01 matrix нет.

Field domain точно равен d01 и постоянен во всех11 состояниях/видах. Framing/crop/viewport/геометрия не менялись для сокрытия края. Art Off убирает floor и actors, оставляя geometry. Browser console errors0; свой tab закрыт, producer server сохранён.

Открытый abrupt whole-sphere reveal receivers01/02 (`D01-TQA-V01`) не закрывается floor fix. Receivers03/04/front rims,6 bowls/4 skulls/blocks05–06, masks/rare contours/environment остаются PARTIAL/UNVERIFIED. Отчёт подтверждает только lower-floor correction и выбранную regression. Fresh resource guard: RAM9.414 GiB free, E9.122 GiB, CPU20%, aggregate working set28.162 GiB; резерв соседям4 GiB RAM/2 GiB E выдержан. serverWrites=0, tokenGranted=false.
