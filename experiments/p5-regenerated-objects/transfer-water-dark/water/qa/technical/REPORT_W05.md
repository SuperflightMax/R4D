# Water w05 — адресная independent technical QA

2026-10-30. **W04-TQA-V01 закрыт для сохранённого repro на w05.** На seed2 receiver02 шар виден над painted water до entry1275: actual1273/1274 больше не воспроизводят прежнее полное исчезновение и появление целой сферы на1275. Это scoped closure собственного TQA finding; отдельный VQA verdict не присваивается. Полный Water PASS не выдан.

Frozen consumer `ce110a387919bbb10c467c70afce678f8b4ee4a7`, extension `eedd183a2652a8b9a2dce60118c0f32c8755d3b7`, Artist `9647869d6dbf672ee5922b0fc57df254b9fdbb93`. Preview `http://127.0.0.1:55194/`. Собственный runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/`; полный index и SHA в `W05_EVIDENCE_PINS.json`. Baseline w04 и его исходные выводы сохранены.

## Frozen и loaded contract

Все22 public files disk/HTTP200 exact, sidecar index проверен отдельно вне public. Source/staged manifest instances exact, старые9 PNG сохранены, добавлен1 rim PNG; итог10 PNG/19 texture IDs/34 instances,9/21 body groups и4 receivers. Loaded manifest exact во всех31 actual snapshots. Native config/P1 targets/projection/start/PRNG не менялись; config/state/RNG/normalized event prefixes каждого snapshot точно равны ранее сохранённому независимому oracle. Новых native runs/seed sweep нет. Seed1 остаётся LOST1196, seed2 — receiver02/1275.

Изменение renderer ограничено применением существующего floor-rank−1e8 к target-bound `role:floor`; stable ID sort сохранён. Полный back raster стал receiver base на floor layer; отдельный rim-back имеет−1, прежний front+1. O/capture/optical anchors, uniform scale, radii mapping прежние. Новый floor role не меняет native trigger. Это source inspection и loaded inputs, не прямое измерение Pixi zIndex.

## Actual repro и обычный miss

Сохранены paused1240/1250/1260/1272–1275, terminal hold и короткий real-time отрезок1240–1266. На1250 шар закрывает физический задний борт; на1260/1266 он раскрывается постепенно. Alpha query535 внутренних точек сферы даёт покрытие новым rear rim511/474/250 на1250/1260/1266,24 на1272,0 на1273/1274/1275. У старого w04 на1273/1274 back water закрывал все535. Base теперь ниже шара; вода больше не работает как верхняя непрозрачная заслонка. Actual Whole и Field подтверждают читаемую сферу до native entry. На проверенных normal-scale видах нового заметного шва, двойного front-контура или разрыва water/rim не обнаружено; тень локальная и слабая на светлой воде. Это наблюдение выбранных состояний, не pixel-perfect/full-board art PASS.

Seed1 receiver03:1114/1115/1116, motion1105–1131, terminal1196. Шар проходит по painted water, miss сохраняется. Ближайшая native дистанция60.903519 больше радиуса31.136575; painted aperture не превращена в trigger.

**W05-TQA-L01 — NOTE / front-hide UNVERIFIED, не установленный новый defect.** На том же seed1/receiver03 дополнительно сохранены actual1118/1119/1120 для прямого сопоставления с VQA. Заметного рывка/дискретного появления на1118–1123 и motion1105–1131 не обнаружено. Рассчитанный logical front-depth35213.308927 пройден между1114/1115; при последующем alpha overlap Ground point уже впереди logical capture footprint. Поэтому наблюдаемый порядок согласуется с текущей proxy/depth policy и сам по себе не доказывает неправильную объёмную окклюзию: painted cup шире logical capture. Legitimiate partial hiding именно передним бортом в этих кадрах не подтверждено и не требуется автоматически выводить из пространственного raster overlap.

| Seed1/receiver03 tick | Ball nativeY | Front depth | Spatial alpha overlap из535 | Expected front above ball |
| --- | --- | --- | --- | --- |
|1118|35234.8038315|35213.30892737734|10|false|
|1119|35240.6946407|35213.30892737734|59|false|
|1120|35246.6099499|35213.30892737734|127|false|
|1121|35252.5497591|35213.30892737734|208|false|
|1122|35258.5140683|35213.30892737734|292|false|
|1123|35264.5028775|35213.30892737734|375|false|
|1131|35313.2953511|35213.30892737734|535|false|

Concrete actual: [1118](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-t1118-front-vqa-match.png), [1119](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-t1119-front-vqa-match.png), [1120](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-t1120-front-vqa-match.png), [1122](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-t1122-front-overlap-at.png), [1131](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-motion-miss-paused.png). На1122 сфера перекрывает зелёно-золотую верхнюю кромку около центрального front ornament третьей чаши слева; на1131 её изображение попадает на светлую переднюю стенку рядом с верхом медальона. «Поверх стенки» описывает видимый raster overlap, **не доказанный defect**. Front PNG/offset прежние; новая регрессия w05 не установлена. Скачок как в закрытом water-over-ball repro отсутствует. Source-calculated depth/alpha отдельно от actual наблюдения; прямого Pixi zIndex probe нет. Никаких sorting/physics исправлений не выполнялось. Seed0 receiver02 1244–1246 проверен только расчётом alpha/depth; actual там UNVERIFIED.

## Узкая regression и границы

Seed1 gate07/t1013 совпал с oracle и прежним contact view; полная gate matrix не повторялась. На paused1274 проверены Art/Geometry/Whole/Field: state/RNG/events одинаковы; Art Off убирает base/rim/front вместе с остальным art, geometry остаётся. Field domain постоянен во всех31 snapshots. От w04 X bounds изменились на−0.319326/+0.336235 source px из-за примерно1 texture px нового rim; Y delta0. Policy прежняя, ручного camera offset/viewport override/crop нет. Whole/Field screenshots сохранены в обычном viewport; UI scroll не меняет camera transform.

Непроверенные receivers01/04, остальные front contacts, missing groups, masks/rare contours/environment остаются PARTIAL/UNVERIFIED. Ранее подтверждённые native/controller проверки не расширены до full visual PASS. Browser errors0, свой tab закрыт; producer server и frozen artifacts сохранены. Resource guards оставили соседям резерв4 GiB RAM/2 GiB E; serverWrites=0, tokenGranted=false.
