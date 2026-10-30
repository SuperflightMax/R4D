# Water w06 — cached case plan, 2026-10-30

**Аналитический план, не actual verdict; full PASS=false.** Только собственные полные cached seeds0–3 из `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/input-oracle-001/`. Каждый кадр tickT — строкаT+1 в `private/seed-N/states.ndjson`; event `object_hit` tickT относится к post-step stateT+1. Точные refs/bytes/SHA и координаты в `CASE_PLAN_W06.json` и runtime `w06-plan-001/case-analysis.json`. Новых oracle runs, export/compile, seed sweep, искусственного движения, browser stage или product edits при составлении плана нет.

Artist `189fe2e7f4264270f60b4a2ebe247d0d49b3c72e`: manifest125833 bytes/SHA `b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27`. Проверено точное сохранение всех34 mini04 instances и19 texture entries. Новые counts13 PNG/22 IDs/84 instances/21 groups/29 physical targets/11 foreground — coverage inventory, не visual PASS. Frozen handoff w06 поступил после аналитической подготовки; actual начнётся отдельно после публикации плана и frozen verification.

## Frogs: три настоящих contact cases

| Приоритет | Texture/target | Seed | Before/at/after states | Вопрос actual |
|---|---|---:|---|---|
|Primary|frog-mid-v6 / frog02|0|408/409/410|Касание круглой опоры против пустого пола; support/shadow, скрытие телом отдельно от contact circle|
|Primary|frog-near-v7 / frog04|2|314/315/316|Near variant на заднем подходе; не читать поднятый силуэт как native footprint|
|Primary|frog-near-v7 / frog05|0|996/997/998|Другой near target/контакт; contour/support и повторное появление после body|

Короткое motion вокруг каждого at±10 ticks; не расширять до полного повторного matrix. Frog03 не имеет contact events: closest seed0/t847 с clearance108.345150 native px за суммой радиусов. **Frog06 contact unavailable:** closest seed0/t1164, clearance126.962478 native px. Это далёкий проход, не проверка residual−5.091063 source px или rear support inferred±6texturepx/±0.636872 source px. Frog06/03 contact quality остаётся UNVERIFIED; static/context view не заменяет contact. Дополнительные контакты frog02 есть seed1/422,793 и seed2/424,493, но не входят в primary minimum.

## Gates: доступность не расширять по одному арту

Primary arch03 seed2 **350/351/352** right-foot и seed3 **348/349/350** front; arch04 seed0 **697/698/699** right-foot. Дополнительно доступен arch08 seed0 **1147/1148/1149** left-foot/front. Regression arch07 seed1 **1012/1013/1014** и **1018/1019/1020**, объединённый short motion1005–1027. Gate07 radius-clear Ground-opening proxy доступен1009–1012,1014–1018,1020. Другие известные contacts arch03/686,894, arch07/1007 и seed2/1106 остаются резервом, без повторного полного gate audit.

**Arch01/02/05/06:** нет foot-contact events, radius-clear opening pass или даже new-body bbox overlap в этих cached traces. Dynamic contact/under-lintel visibility остаются UNVERIFIED. Для arch03/04/08 bbox overlap есть, но включает прозрачный проём и не доказывает painted-pixel hiding. Native feet — отдельные коллайдеры; whole gate не получает lintel/height collider. На доступных случаях проверить постепенное скрытие/reveal по видимому камню, свободный ground void, опору обеих ног и совместный foot+lintel cast. MaxAlpha172/opaque0 — Artist measurement выше brief, actual свет/сила/направление и support PARTIAL; counts не закрывают этот вопрос.

## Foreground: source1536, не raw1254

Native Ground проецируется P1 homography в source1536. Видимая сфера поднята относительно Ground на523 texture px×uniform ball scale; её projected-width disc используется **только для отбора**, не как exact PNG alpha/Pixi proof. Все11 polygons уже source1536; для raw lookup делить на1536/1254. Boundary uncertainty±3raw=±3.674641 source px.317 grid samples дают ориентир силы overlap, а не долю actual скрытой сферы. Ни bbox, ни 18clear/9stone static probes не означают dynamic PASS.

| Polygon suffix | Seed | Overlap states | Before / peak / after | Nominal disc sample overlap | Scope |
|---|---:|---|---|---:|---|
|island-left-front-face|2|1214–1272|1213 /1224 /1273|100%|Primary: exit соединяется с receiver regression1273–1275|
|wall-left-middle-cap|3|410–436|409 /418 /437|84.2%|Primary: wall bounce + каменный cap|
|wall-right-middle-cap|0|1035–1045|1034 /1039 /1046|49.5%|Primary: отдельно right-side anatomy|
|island-middle-front-face|1|1053–1101|1052 /1074 /1102|100%|Primary: vertical face → clear approach к сохранённому miss|
|wall-left-near-face|2|1157–1175|1156 /1166 /1176|93.1%|Secondary, если нужно покрыть near wall face|
|wall-left-upper-cap|1|515–525|514 /520 /526|27.4%|Secondary, неглубокий overlap с заметной boundary uncertainty|

Короткое actual motion отдельно на entry и exit, не весь длинный masked interval. Before/after у каждой строки — analytically clear sphere disc. На primary island-left также смотреть1268–1275, чтобы переход stone→water не спрятал w05 regression. Внутри intended stone допустимы partial hiding/reveal; open water, paving и arch void не должны исчезать вместе с шаром. При неожиданной маске сохранять exact кадры и anatomical surface, не делать вывод о новом sorting defect только по числу overlap.

Ещё доступны island-left seed3/483–524 и island-middle seed0/1174–1230, не обязательные дополнительные повторы. У **left-far, right-far, right-upper, right-near и island-right** нет visual-disc overlap на cached5ms states до terminal. Их ближайшие signed clearances87.831/328.558/204.117/60.632/14.158 source px соответственно; динамика остаётся UNVERIFIED, sub-tick motion не выдумывается. Ground-inside ranges сохранены отдельно: например island-left/seed2 Ground1218–1262 против sphere-disc1214–1272; эти координаты нельзя смешивать.

## Минимальный regression и acceptance evidence

Seed2 receiver02 **1273/1274/1275 + terminal hold**; same paused1274 ArtOff/Geometry/Whole/Field. Сопоставить с w05, где TQA pop repro закрыт. Front-hide NOTE/UNVERIFIED сохранён; специальное скрытие не искать. Pin actual first Field domain, требовать invariance по state/view/replay. Отдельно записать derived art-envelope delta относительно w05, без ручной компенсации камерой.

Каждый actual snapshot сверять state/config/RNG/event prefix и loaded frozen manifest с собственным cache. Сохранить все outcomes: seed0 LOST1326, seed1 LOST1196, seed2 receiver02/1275, seed3 LOST589. Actual foreg/body/shadow наблюдения отдельно от рассчитанного expected order и alpha/bbox. Frozen/native/controller проверки не закрывают отсутствующие контакты, rare contours или full visual quality. serverWrites=0, tokenGranted=false.
