# Water w06 — independent actual technical QA

2026-10-30. **Scoped actual QA COMPLETE / visual PARTIAL, full PASS=false.** В выбранных обычных случаях нового подтверждённого technical defect не установлено. Сохранённый receiver02 pop не вернулся, gate07 regression сохранён; foreground демонстрирует hiding/reveal на проверенных stone regions. Это не full contact/contour/light PASS из counts21/21.

Сначала опубликован cached plan `2f983b8823defaa7bd62fdbd89e76ffca4083692` (`CASE_PLAN_W06.md/json`); actual выполнен после exact frozen handoff. Consumer `b8a070ab60e97aee3f71018ff614c2cf21c8f10f`, Artist `189fe2e7f4264270f60b4a2ebe247d0d49b3c72e`, preview `http://127.0.0.1:55196/`. Собственный runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w06/`, index/SHA в `W06_EVIDENCE_PINS.json`. Старые reports/evidence и source plan сохранены.

## Contract и независимая численная сверка

Все25 public files disk/HTTP200 bytes/SHA exact. FILE_INDEX8432 bytes/SHA `9ba0caf153b7528d551cd6da9ed8b6ccb90ab2ad4e96aba558eeb6b5c0ef5108` проверен вне public. Source manifest125833/SHA `b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27`, staged103822/SHA `44fa6b45ac8f513b9231e16eb2db0dbece54c9255d549b0d8a7d24ad99f39a0c`.13 PNG/22 texture IDs/84 instances,21 body groups/29 obstacle physical targets/4 receivers/11 foreground — подтверждённый inventory.

Все34 старых instances и19 texture entries exact относительно w05. App570889 bytes/SHA `ba21d2d6a308acbbb4658d937f4ba942ebc6f473d7d934f3eb267c4f6c16afd8` и native input data byte-identical w05. Меняется `preview-input.json` с preview metadata; он не объявляется native fixture. Target-floor/base stable-order contract и renderer прежние; нового sort/native/schema/rank нет.13 binding rows независимо воспроизводятся арифметически из exact frozen targets/textures: source anchors, uniform scales, widths/depth residuals. Это проверка регистрации, не восстановленная3D геометрия или прямой Pixi zIndex probe.

**101 actual snapshot**: каждый state/config/RNG/normalized event prefix exact относительно собственных полных cached traces; каждый loaded art manifest exact. Native object_hit tickT сопоставлен post-step stateT+1. Новых standalone oracle runs/export/compile/seeds нет; actual native/Pixi play/seek происходил в выданном preview. Сохранены все outcomes:0 LOST1326,1 LOST1196,2 receiver02/1275,3 LOST589; terminal hold не меняет result/RNG/events.96 captures1265×712 сохранены в исходных bytes провайдера, без crop/zoom/viewport override/transcoding. Содержимое JPEG, исторические имена `.png` сохранены; `capture-format.json` фиксирует реальный формат. Running JSON и screenshot не атомарны, точный tick относится к JSON; paused captures точные. Это screenshots actual play fragments, не записанное видео.

## Frogs и gates

| Actual case | Exact states | Наблюдение и предел |
|---|---|---|
|frog02 /mid-v6, seed0|408/409/410 +geometry409; motion398–428|Front contact читается у основания; заметного empty-floor bounce в subset нет|
|frog05 /near-v7, seed0|996/997/998 +geometry997; motion986–1015|Side support/contact читается; шар выходит на соседнее paving/water без нового исчезновения|
|frog04 /near-v7, seed2|314/315/316 +geometry315; motion304–332|На rear contact шар закрыт телом, после выходит видимым. Видимый point-contact/residual этим не подтверждён|
|arch03 right-foot, seed2|350/351/352 +geometry351; motion340–377|Сфера у правой опоры, дальнейшее движение открыто; крупного пустого отскока не видно|
|arch03 front, seed3|348/349/350 +geometry349; motion338–372|Front contact читается у ноги, без нового дискретного появления|
|arch04, seed0|697/698/699 +geometry698; motion688–714|Шар закрыт raised beam в этом окне; native contact exact, визуальная точка касания остаётся непроверенной|
|arch08, seed0|1147/1148/1149 +geometry1148; motion1138–1164|Front/left-foot contact читается у ноги и затем в открытом русле|
|arch07 regression, seed1|1012/1013/1014 и1018/1019/1020; motion1005–1031|Сохранились inner-foot contacts и читаемый проход через void; fake whole-block/lintel collision не возник|

Frog03/06 не имеют native contact в этих полных seeds. Для frog06 ближайший gap126.962478 native px на seed0/t1164; этот distant context попал в actual `s0-motion-arch08-paused`, но не проверяет residual−5.091063 source px или inferred rear ellipse±6texturepx. Frog03 closest gap108.345150 на seed0/t847 только аналитический. Их contact quality UNVERIFIED. Arch01/02/05/06 не имеют contact/opening/body-bbox cases в cache; dynamic visibility UNVERIFIED. Gate rear support inferred, depth residuals−5.22…−6.56 source px не превращены в допуск3D/corner PASS.

На normal Whole/Field тела, ноги и локальные shadows читаются опирающимися на сцену. Новая cast lobe под lintel видна отдельно от foot support; суммарное пятно местами заметно плотнее соседних frog/pillar shadows. Artist maxAlpha172 выше brief90–130 сохранён, runtime alpha не менялась. Освещение/сила/extent совместных foot+lintel shadows остаются PARTIAL: численный maxAlpha и выбранные виды не закрывают photometric/creative quality.

## Foreground: actual anatomy отдельно от proxy

Все11 polygons — source1536 того же floor-v1, parentfloor/target$source/roleforeground. Raw1254 применяется только через uniform1536/1254 один раз. Аналитический disc/probes из плана не названы actual alpha coverage; boundary±3rawpx и мелкие foam/bevel остаются неопределённостью.

| Region | Seed | Actual before /overlap /after |
|---|---:|---|
|wall-right-middle-cap|0|1034 /1039 /1046, play1029–1060: partial cap hiding и reveal в воду|
|wall-left-middle-cap|3|409 /418 /437, play402–429 и425–455: закрытие у stone cap и выход в открытое русло|
|island-left-front-face|2|1213 /1218 partial /1224 hidden /1268–1272 reveal /1273 clear; play1206–1236 и1258–1275|
|island-middle-front-face|1|1052 /1074 /1102; play1045–1073 и1093–1126; water-clear control1115|
|wall-left-near-face|2|1156 /1166 /1176: paused secondary subset|
|wall-left-upper-cap|1|514 /520 /526: paused secondary, неглубокий partial overlap|

На сильных выбранных переходах перекрытие соответствует каменным cap/front faces; отдельного маскирования open water/paving или вырезанной дырки в void не обнаружено. Это ограниченное actual наблюдение6 regions, не полнота контуров. У middle-island после выхода из **этого polygon** на1102 шар ещё закрыт rear rim следующей чаши; polygon-clear не означает clear всех art parts. К1115 сфера читается над водой receiver03, miss остаётся LOST. На left-island partial1218/full1224 и reveal1268–1273 подтверждены отдельными кадрами; receiver-before-entry остаётся видимым.

В1224 Geometry видна над маской, Art Off убирает floor/foreground/base/rim/body вместе, без оставшихся stone fragments.18clear/9stone supplied static probes не перенесены в dynamic PASS. У left-far/right-far/right-upper/right-near/island-right нет cached visual-disc overlaps; динамика и rare side views UNVERIFIED. Внешние дальние колонны/arch legs/мелкие bevel/foam не получили blanket coverage PASS.

## Regression и framing

Seed2 receiver02 **1273/1274/1275 +hold**: sphere над painted water до entry, старого binary pop нет. Whole/Field/Geometry/Art Off на1274 сохраняют exact state/RNG/events. W04-TQA-V01 closure остаётся scoped к этому repro, front-hide NOTE W05-TQA-L01 сохраняется без нового установленного defect/искусственного скрытия.

Field domain во всех101 snapshots одинаков: X[−10.637626390503007,1533.7323088433782], Y[208.22966507177034,1403.2984506144696]. От w05 только minY delta−41.49844877081924 source px: верх нового right-far foreground cap. Это derived art envelope при прежней policy; camera/viewport/geometry не подгонялись. Whole показывает исходную полную сцену.

Console errors0 в обоих собственных tabs; tabs закрыты, producer55196/PID33028 сохранён. Guard перед последним fragment: RAM8.679GiB free, CPU14%, aggregateWS29.03GiB, C13.563/D14.602/E8.869GiB; собственный peak1GiB RAM и резерв4GiB RAM/2GiB E выдержаны. Все новые writes в собственном QA source/runtime; product/frozen artifacts и Dark не изменены. Review/VPS/serverWrites0, tokenGranted=false. Следующий Dark d03 — отдельный batch и отчёт.
