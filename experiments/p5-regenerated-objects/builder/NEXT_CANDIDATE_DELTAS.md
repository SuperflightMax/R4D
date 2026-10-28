# Дельты после c01: license, clip, framing и receiver registration

2026-10-28 23:19UTC /29октября Europe/Kyiv. Это подготовка следующего candidate. **c01/public root/index/listener не менялись.** Ни новой сборки, ни повторной c01 QA/native oracle здесь нет.

## Зафиксированные source changes

- License: `365e8220221c6f26983e65f4496d875a9a222b1c`. Exact official @pixi/colord2.9.6 supplement и42published/installed file pins — `licenses/pixi-colord-2.9.6/README.md`, `LICENSE.md`, `SOURCE.json`. Isolated future terms9330bytes SHA256 `583c1487aefadfa1b72c181ab73a5f7a2030afb0545cf49b90ff66973faef82f`; missingRuntimeLicenseFiles0. Это не исправляет frozen c01 задним числом.
- Generated floor clip: `8bf447629ec78a1ccb088b4ba7a784746e0aca83`; `contracts/GENERATED_FLOOR_CLIP.md`, schema и `source-clip.instance.example.json`. Optional `sourceClipPx` повторно использует exact generated floor texture; parent floor instance, SHA, source1536 polygon и provenance/limitations объявлены. Sprite+mask под Art tree, actual Geometry sibling отдельно. Production contour не задан Builder и ещё нужен от Artist.
- Field source fix: `src/framing.mjs` + узкая интеграция в app. Geometry domain дополняется alpha>=16 visible bounds только receiver/foreground parts; full floor/shadow canvas и dynamic ball не расширяют Field. Для clip используется пересечение visible sprite bounds с declared source polygon bbox. Все вычисления в source1536 до camera transform, затем uniform contain с прежним8CSSpx margin.

Field domain вычисляется после загрузки/регистрации parts **без условия Art/Geometry visible** и фиксирован для candidate; поэтому сравнение Art/Geometry сохраняет общую камеру. Полный source frame0..1536 в Whole не меняется, config/native/RNG/scale самих targets не меняются.

На exact mini01 данных source calculation дал:

| Bounds | MinX | MaxX | MinY | MaxY |
|---|---:|---:|---:|---:|
| Старый Field по ground geometry |281.000|1345.000|300.000|1286.912|
| Новый Field с important visible parts |214.248|1345.000|300.000|1426.500|

Оба receiver01 parts полностью внутри нового domain. МинY300, а не0: full floor canvas не превратил Field в Whole. Exact numbers — `E:/R4D/perspective/p5-runtime/builder/output/license-source-001/field-framing-source-check.json`,973bytes,SHA256 `79d8dc40c54b0023d54a923b643ae92b7a7aac799e5c25791ae3036bf801d690`.

JS syntax проверен, прежний manifest example проходит updated JSON schema/custom shape verifier. **Actual mask/framing runtime не проверен до следующего build/Artist handoff.** Last built app по-прежнему c01 `39d0cc5...`; `DEPENDENCIES.lock.json` actual build-input inventory соответствует последнему build и должен обновиться обычным build/pin шагом следующего candidate.

## C01-V01/F-C01-01: что измерено в consumer

Прочитаны завершённые independent TQA `955af7f4d7d576c6296671f141e5314198eb3f1f:experiments/p5-regenerated-objects/qa/technical/REPORT_C01.md` и VQA `ca0219cf65490242a55b1b5b57591e458e556be6:experiments/p5-regenerated-objects/qa/visual/REPORT_C01.md`. Их actual наблюдение terminal sphere у far rim подтверждено; numeric IN_BUCKET не объявляется видимым попаданием.

Ниже повторно не считалась физика: использованы уже сохранённые states874/875 наблюдавшегося обычного seed1696420279 и exact c01 manifest/config/P1 project. Размер берётся из принятого r16, uniform scale; положение равно `project(native ball.pos) - textureGroundAnchor * scale`. Никакого дополнительного consumer y offset нет.

| Source1536 quantity | State874 | State875 |
|---|---:|---:|
| Ball projected ground point Y |1217.070966|1221.626231|
| Ball alpha>=16 visible minY |1181.574589|1186.089394|
| Ball visible maxY |1217.146571|1221.701922|
| Visible-bounds center lift above ground point |17.710387|17.730573|
| Receiver front visible minY |1221.882616|1221.882616|
| Ball/front vertical bbox overlap |−4.736045|−0.180694|

Отрицательная overlap означает, что declared visible bounds поY ещё не пересеклись. Faint alpha<16 и субпиксельная filtering boundary этим не объявляются нулевыми, но читаемый front lip не может закрыть большую часть сферы в такой регистрации. Переставить слой поверх шарика недостаточно.

Объявленный native depth порядок на875 уже **back34848.651592 < ball34857.871307 < front34915.699574**. Это соответствие текущему part contract, не доказательство его художественной правильности. Receiver source anchor `(358.559462,1238.209859)`; visible back maxY1426.236492/front maxY1426.499834 также объясняют Field crop.

![c01, тот же наблюдавшийся terminal875](E:/R4D/perspective/p5-runtime/builder/evidence/mini01-seed1696420279-state875-art.png)

**Граница вывода:** настоящая aperture boundary/center в generated receiver пока не измерена. Эти цифры подтверждают отсутствие нужного front-overlap и роль текущего bottom-anchor lift, но не изолируют окончательно первичную причину между aperture/anchor/part-depth/2.5D height policy. Ball visible-bounds center — диагностический proxy, не восстановленный физический3Dцентр.

Нужная следующая совместная дельта: Artist связывает measured actual aperture и front/back contours с declared texture-local anchor/trigger footprint; Builder сверяет ту же affine placement и согласованную ball ground/height policy. Коррекция должна действовать на общий контракт и обычные cases. Native/source targets, r16/drop/config/physics не менять; auto vanish/sink/посторонний offset ради этого seed не добавлены. Если остаётся проблема общего input, она возвращается Lead отдельно. Receiver artwork/anchor сейчас не редактировались.

Exact calculation data: `E:/R4D/perspective/p5-runtime/builder/output/license-source-001/receiver-c01-registration-study.json`,2933bytes,SHA256 `ea99c0197d8d7df05be373aa65bd76d3e69c16730b66d16a2d7641d5124aeef8`.

## Сохранность c01 и следующий реальный контроль

Read-only проверка23:17:47UTC: index SHA256 `a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac`, все22public file pins совпали; ownership record unchanged, port55185 по-прежнему ownPID32108/session55195/rootc01. Новые source files не обслуживаются этим listener. C01 artifact сохраняется.

Actual исправление C01-V02 и clip подтверждаются на следующем frozen candidate:874/875 Whole/Field, Art/Geometry с общей камерой, partial occlusion по exact declared region. C01-V01 — только после согласованной receiver/ball/art дельты, без объявления источником ошибки native и без повторов уже готовой common oracle matrix. QA ordinary LOST cases сохранены у владельцев: TQA3957814979/847, VQA3339315606/1709; не отбрасываются и здесь не переигрывались.

Release gate закрыт, server release writes0. Нового candidate/preview/публикации нет. Следующий производственный вход — exact Artist mini02/contours/aperture measurements через Lead; ожидание будущего арта не считалось выполненной работой этого прохода.
