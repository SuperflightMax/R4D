# P5 Regenerated Objects — рабочая карточка Lead

Старт: 2026-10-28 22:16 UTC (2026-10-29 Europe/Kyiv). Это состояние исполнения, не изменение заказа.

## Полномочия и границы

CTO адресно открыл Stage 2 существующей команде после подтверждённой публикации P4; delivery window освобождён 2026-10-28 22:11:01 UTC. Человеческое основание: R4D 64061757802dc60770ab156ef5672af741d65d03, work/requests/PERSPECTIVE_POST_P1_UPDATE.md, пункт 3 и заключительные абзацы. Поручение разрешает пять адресных передач существующим специалистам. Другие команды/роли/worktree/subagents не создаются; P6 не запускается.

Неизменяемые требования: ORDER редакция 4 и P5 card на R4D 64061757802dc60770ab156ef5672af741d65d03; Staff e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3; Playbook c32f3ee79ca73c1bf87e8ee6a9c0844252568f3e/blob d3066526699a9a21fb8e8e5806958fbd105c8cf2. Реализации, арт, маски, кандидаты, результаты и Review P2–P4/P6 не используются. Общие P0/P1/native/deps и opaque publication wrapper допустимы.

## Владельцы

| Область | Существующий чат | Собственный каталог worktree/runtime |
|---|---|---|
| Lead | текущий | lead |
| Pixi/native consumer, схема и сборка | 01a1842d-b417-7d60-a517-13b4007efc3b | builder |
| Генерация, художественная подготовка и provenance | 01a1842d-becc-7012-b425-bc311371f6f9 | asset-artist |
| Независимая техническая проверка | 01a1842d-c7b2-7842-a27f-a3b29c18673a | technical-qa |
| Независимая визуальная проверка | 01a1842d-d2ce-76a0-ba58-d47073a5db7c | visual-qa |
| Privacy/package/delivery | 01a1842d-ddd8-7b20-a27a-2ebc52ecea57 | release-engineer |

Корни: E:/R4D/perspective/p5-worktrees/<role> и E:/R4D/perspective/p5-runtime/<role>. В чужие checkout не писать. Исходники и manifests передавать точными Git commit/path; тяжёлые private/raw/evidence — разрешёнными read-only path+SHA256+bytes. Для собственных изменений commit/push в свою codex/r4d-p5-regenerated-<role>-01. Каждая область имеет одного пишущего владельца. Lead собирает ссылки и коррекции, не пишет product вместо Builder/Artist и не проводит вместо QA их приёмку.

## Общие входы

- Read-only JPG: K:/Agents/R4D/Assets/perspective/01-jungle.jpg, 1536x1536, SHA256 c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72.
- Accepted P1: 4b47db04c7140ebf88f69b91faa0b790d46f22ec; prefix experiments/p1-collider-mapping/clean-repeat-01/.
  - simulation/boards/01/trial-01/config.json: 9503 bytes; SHA256 dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db.
  - simulation/boards/01/trial-01/manifest.json: 11565 bytes; SHA256 7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18.
  - simulation/projection.mjs: 614 bytes; SHA256 b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431.
  - viewer/src/view-math.mjs: 3050 bytes; SHA256 96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e.
- P0 recipe: ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b:experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md. Recipe не диктует вид ассетов.
- Private Millionko source read-only: D:/dev/millionko, exact 5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023, packages/sim-core tree 008d16a80a26bb77d562a45218b01da09b0d9ff0. Материализация только exact Git bytes в собственный private E runtime; source checkout не менять. Raw private TS/maps/dumps не публиковать; допустимый compiled runtime+licenses проходят privacy-check.

## Единый контракт данных и сборки

1. Различать native simulation units, принятую проекцию P1, source-image pixels 1536x1536, texture-local pixels и viewport CSS/device pixels. Native coordinates, config/IDs/radii/drop/buckets, projection translation/matrix и tick/RNG не изменять ради арта. Builder публикует точную схему/пример и математику соответствия; Artist готовит manifest к ней до полного набора. Общие ошибки входа — отдельные findings, без скрытой подгонки.
2. Каждая generated texture/part имеет стабильный id/family, роль, exact file SHA256/bytes, ширину/высоту px, alpha policy и измеренный alpha/visible bounds, texture-local ground anchor, привязку к source/native anchor и целевой ground footprint/размер. Поворот/масштаб объясняются согласованием с принятой геометрией, не траекторией. Ball: r16 в native через принятую проекцию; без произвольного увеличения. Height/silhouette не выдавать за footprint.
3. Для parts/теней явно указать parent, слой/occlusion role, общий ground anchor, свет, offsets и состав. Частичное скрытие проверяется в движении: сортировка по центру не считается доказательством. Floor/receiver/foreground также заново генерируются; original crops только refs. Читаемые тени, опора, свет/резкость/объём оцениваются в сборке при обычном масштабе.
4. Provenance включает source/ref pins, реальные prompts/tool outputs, raw/candidate/selected/final связи и существенные коррекции. Artist владеет ассетами/provenance; Builder — consumer manifest/schema/rendering. Минимальный первый handoff: floor, несколько разных obstacle families, ball+shadow и необходимая foreground/receiver part. Не ждать всех 25.
5. Native defaults/fields/API сверить по exact source: r16, tickMs5, quantizeDigits7, gravityY980, maxBallSpeed2000, angleDeviationDeg2, bounceDeviation.02, lcg32; 25 pins/16 segments/4 buckets/1 drop. UI view/art/geometry/pause/step/replay не меняют состояние/RNG кроме явно запрошенного шага или нового/повторного запуска. Обычные seeds, проблемные replays сохраняются, отбор только красивого запрещён.
6. Consumer: PixiJS; независимые Арт/Геометрия; геометрия из actual config поверх арта, без невидимых масок при отключённом арте; pause и точный tick step/replay. Небольшой стенд без редактора. Native integration и actual browser runtime отделяются от model/code assertions.
7. Preview только own localhost после проверки свободного порта. Builder фиксирует owner PID/session/URL/root; QA согласует доступ и не управляет чужими устройствами. Остановка только собственных процессов. Новый public/security/credentials доступ не создавать.
8. Frozen handoff: consumer commit, asset-manifest commit+hash, build file hashes, config/projection/native pins, dep/lockfile pins, package privacy listing, воспроизводимый запуск, обычные seed/tick cases и known defects. TQA и VQA независимо проверяют эти же exact bytes; значимые дельты требуют адресной перепроверки, не бессмысленного повтора готовых матриц.

## Порядок, бюджет, ресурсы

Ориентир попытки 8–12 активных часов включает коррекции и независимые QA; ожидание/очередь отмечаются отдельно. Первый материальный checkpoint через 90–150 активных минут: generated элементы разных типов+floor+ball/shadow+foreground в реальном Pixi/native, anchors/scale/light и первые полезные независимые замечания. Оценка пересматривается по этому результату; это не autoPASS и не автоматический cutoff.

Builder и Artist начинают совместимость на малом наборе; TQA независимо готовит common/native/projection oracle, VQA самостоятельно знакомится с Jungle/P1 и входит в раннюю реальную сборку; Release сейчас только короткая read-only/local подготовка контракта delivery/privacy/QA handoff. Lead передаёт согласованные интерфейсы и связные исправления по первичной причине, отмечает потраченное время и материальный прогресс.

Перед тяжёлым шагом fresh systemwide+aggregate guard, собственная оценка peak и allowance другим процессам: 4 GiB RAM/2 GiB E. Учитывать initial imagegen writes на C. TEMP/TMP/cache/output/staging только own E/process-local, без global settings/CODEX_HOME/security redirects. E <=4 GiB warn+diagnose, <=2 GiB safe checkpoint STOP; чужие PID/data не чистить. Lead sample 22:16:27 UTC: RAM free16.967/31.907 GiB, CPU10%, C16.220/D16.282/E12.203 GiB.

Исторический denied composite call_7b166cdf46834d468b5f9c297aad6e9f не повторять, не дробить, не переносить; file:// не fallback. Новая denial останавливает exact action/target и same-target обходы; сообщить call/action/target/primary reason. Обычную ошибку классифицировать по первичному тексту, без выдуманной policy/race причины.

Release gate закрыт: серверные writes сейчас 0. После лучшего разумного результата нужны frozen bytes, обе независимые QA, новый exact CTO review/single-use token. Existing /review/r4d/p5-regenerated-objects/ и shared wrapper сохраняются opaque. Закрытие попытки отдельно от technical/artistic успеха; неподтверждённое прямо указывать.

## Текущее состояние

Первый материальный checkpoint закреплён в CHECKPOINT_C01.md, commit4eeac03. Пять initial send receipts и новые Stage2 turns — DISPATCH.json, commita1ca011; все пять отправок success, без повторного первоначального запуска. Общая рабочая карточка не меняет заказ. Production нового метода начался; release/server writes остаются0.

### Exact ранний результат и завершённые QA

- Consumer0c611039246904443128b9d12084af2c5a0ae6e6; handoffa259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d:experiments/p5-regenerated-objects/builder/HANDOFF_C01.md.
- Generated Artist mini01:5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json, GitLF23553bytes,SHA2567b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f. Selected PNG read-only root E:/R4D/perspective/p5-runtime/asset-artist/selected/mini-set-01/. Raw/nativeC refs сохранены.
- C01 immutable root E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public;22files/13937155bytes. Index рядомindex.json7149bytes,SHA256a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac. AppSHA25639d0cc5cdc8e869df975f008057c3c408ed3e41ce40bdd870dd0f001f19f1f44. Coverage4/25pins,1/4receivers,10textures/13instances;ball/shadow иgeneratedfloor реально вPixi/native. Native/source anchors/config/projection неизменны; uniformscale, безXYwarp.
- Preview http://127.0.0.1:55185/, own Builder PID32108/session55195, rootc01. Обе QA завершили и закрыли собственные вкладки, listener не меняли. Старый ownPID22076 завершён штатно; exit1 не был denial/runtimeerror. Новые candidate/preview только по адресу с ownership/freeport, c01 не перезаписывать.
- TQA sourceoracle:4e989becd94a3e25b22988ca644c608b04c4528b:experiments/p5-regenerated-objects/qa/technical/REPORT_SOURCE_ORACLE_001.md.37nativefiles/tree exact,1922projectionpoints иupfront0–3replays уже проверены; без причины не повторять.
- TQA actualc01 completed/pushed:955af7f4d7d576c6296671f141e5314198eb3f1f:experiments/p5-regenerated-objects/qa/technical/REPORT_C01.md иC01_EVIDENCE_PINS.json.22files disk/HTTP,10PNG/metadata и33browserstates подтверждены. Runtime controls/state/RNG/config invariance проверены actual UI. Evidence root E:/R4D/perspective/p5-runtime/technical-qa/c01/,indexSHA256b34472b1c85021f73f24f432cb856a2e7ea29df40e3adae99a7eaf01b1edaf85. Ordinaryseed3957814979 LOST847 иreplay сохранён.
- VQA actualc01 completed/pushed:ca0219cf65490242a55b1b5b57591e458e556be6:experiments/p5-regenerated-objects/qa/visual/REPORT_C01.md иEVIDENCE_C01.json (29521bytes,SHA2569523761e4e36277ca6f559a0b2a532cef7c7eee4932c18069d6d2b719977dd5e). Evidence root E:/R4D/perspective/p5-runtime/visual-qa/evidence/c01/. Четыре семейства/материалы/тени/опора содержательны, без выраженногоsticker/matte в просмотренных кадрах. Узкиеflower/frogконтакты просмотрены. Ordinaryseed3339315606 LOST1709 сохранён. ОбщегоartisticPASS нет.

### Текущая очередь полезных коррекций

| ID | Проверенный факт и граница | Владелец/следующий шаг |
|---|---|---|
| A01 ракурс/полнота | Первые masters ближе к переднему ракурсу;far/mid variants иremaining21pins/3receivers ещё не переданы. Генерации не всегда выдерживают измереннуюdepth; названиеfarнеPASS. | Artist turn01a184ac-9f1c-7313-b8f6-ef0e340a32c5: отдельный mini02/fullcoverage, P0geometryguide толькоref, реальныеgenerations/отбор/остаточныеошибки. Mini01 immutable. |
| A04/C01-V01/F-C01-01 приёмник | ОбеactualQA:seed1696420279,874→875 nativeIN_BUCKET, sphereнаfar rim иterminalhold. Groundsource≈380.921/1221.626, receivercenter358.559/1238.210, validnative distance30.398<33.524; visible spherecenter≈17.7sourcepxвышеground из-заbottomanchor. Точнаяaperture/вкладparts ещёнеизолированы, P1bugне доказан. | Artist измеряетtrueaperture/authoredanchor/front-back; Builder диагностируетpolicy sphereheight/parts/contract. Исправлениепоизолированнойпричине вновомcandidate. Native/source target/r16/physics не двигать; ошибочныйtexture-localanchor допустимо уточнить по факту сprovenance. Не маскироватьодинcaseисчезновением илиложнымterminal. |
| A03 foreground | Двеnativeeditпробы сдвинулислойотносительноgeneratedfloor, rejected сохранены. | Принятsceneclip изтого жеgeneratedfloor. Builder8bf447629ec78a1ccb088b4ba7a784746e0aca83:contracts/GENERATED_FLOOR_CLIP.md+schema+пример опубликованы и переданыArtist. Artistproductionpolygon source1536+exactfloorSHA/parent/limitations; Builderminimalrender. Art off отключаетmask, Geometryповерх; actualQA следующегоcandidate. |
| C01-V02 framing | Field обрезает готовыйreceiver01;Wholeдоступен. Это рекомендацияпросмотру, отдельноотобязательногоvisibleentry. | Builder: учитыватьнужныеrenderedreceiver/foregroundbounds вField, uniformcontain, native/RNGне менять. Адресныйповтор874/875Whole/Field. |
| P01 license | Installed42files совпали сofficialnpm@pixi/colord2.9.6;LICENSEвtarballотсутствует. ТочныйofficialrepoLICENSE найденчерезgitHead/package.json. | Buildersource365e8220221c6f26983e65f4496d875a9a222b1c, futurepackagefragmentпроверен,LICENSEодинраз. Вc01gapисторическисохраняется, finalpackageпроверитRelease. |

### Следующий переход и ограничения

Builder turn01a184bb-7dbb-7c03-b8b1-4e361852627f работаетнадlicense/clip/framing/receiverdiagnosis, Artistнадновойверсией. TQA/VQA idle доmeaningful newfrozen handoff; готовыеcommonoracle/c01матрицы без причины не повторять. СледующаяindependentQA адресно проверяетдельты/fullcoverage и обязательныеcontact/partialocclusion/side/basketсценарии вactualmotion. Lead не генерирует, не пишетproduct и не проводитприёмку вместоних.

Release idle:6844d9a3ab0aa7ec6f4a621f98f8f436b9fd1262:experiments/p5-regenerated-objects/release/DELIVERY_CONTRACT.md. Толькоlocalподготовка;SSH/HTTP/servermetadata/writes0. Gate:лучшийразумныйрезультат→frozen+обенезависимыеQA→новыйexactCTOreview/singleusetoken→разрешённаядоставка. C01 не final/release.

Требование, рабочая техническая гипотеза и измеренный результат различаются. Uniformscale/partdepth consumer v1 — внутренний способ, не дополнительный заказ. Бюджет8–12активныхчасов сохраняется, основанийегоувеличивать/менятьсоставсейчаснет. Наблюдаемоеокновремени невыдаватьзаизмеренноеactiveвремя. E~12.12GiB/RAMfree~16GiB поlatestQAguards; передкаждымheavyсвойfreshguard+peak+aggregate/concurrentallowance. Модель/effort/host/settings/globalenv/credentials не менялись, новыхchats/roles/worktree/subagents/P6нет. Новаяdenialостанавливаетexactoperation/targetиобходы;ordinaryfailuresпоprimarytext.
