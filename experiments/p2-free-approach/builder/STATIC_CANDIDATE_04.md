# P2: frozen static candidate 04

28 октября 2026. **FROZEN_PENDING_INDEPENDENT_QA**. Новый immutable candidate построен по адресному Lead/CTO gate после review playback source. Lead независимо сверил16 exact files/actual set/tree/BUILD_MANIFEST, подтвердил freeze и передал exact04 targeted TQA. Результат новой независимой QA ещё не получен; Technical/art PASS и slot-free не заявляются.

**Actual build HEAD: `08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`**, чистый перед build. Отдельный implementation commit: `0a80b0b63c688b6f77b8f710576adf2ea5c263c1`; diagnostic/plan `086d0852732815014ed4a596bcd67528874a04df`. SourceRecords предыдущего targeted selfcheck сверены с каждым из6 code/check files перед build. Build не приписывается implementation HEAD0a80; фактически построен08f9 с bookkeeping поверх него. Последующий handoff docs commit не меняет sourceCommit artifact.

## Exact identity и пакет

Artifact: `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-04/`. Browser root внутри: `bundle/review/r4d/p2-free-approach/`; eventual route `/review/r4d/p2-free-approach/`. Эти16 browser files и BUILD_MANIFEST заморожены: не редактировать/не пересобирать под тем же именем.

| Запись | Bytes / count | SHA256 |
| --- | ---: | --- |
| Browser tree |16 files/2452021 bytes| `60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed` |
| BUILD_MANIFEST.json |8751| `60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7` |
| Compiled runtime/sim-core.js |21962| `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7` |
| CANDIDATE_TRANSFER.tar |2478080/17 regular members| `833d38e59547897571a01273191152be984ff4cfcec62c22dc9ad06f56963f29` |
| SCOPE_DIFF_03_04.json |8251| `94122f77971c968202568692245fd96db436a46b1112ad15083b3f5d7f2f70e9` |
| STATIC_ARTIFACT_CHECK.json |2091| `68fbf2845e89d559624853d95f3fbc2992ffc5fe9cbe7154ae2874f620233920` |
| Boundary EVIDENCE.json |89011| `c00555b4f9898047dfffccca11f195f20864743130c803a9a53c5eec1c593373` |

Tree digest rule: `SHA256(JSON.stringify(sorted per-file records)+LF)`. Transfer USTAR содержит BUILD_MANIFEST и16 exact route-prefixed files, root:root644/mtime0 headers.17 members прочитаны обратно в память и сравнены с frozen input bytes; absolute/traversal/symlink entries отсутствуют. Operator scripts/checks/logs/scope не входят в archive/browser tree. Это standalone candidate transport, не новый Review release patch.

## Полный browser file set

| Route-relative файл | Bytes | SHA256 |
| --- | ---: | --- |
| `assets/files/ball-v2.png` |851662| `3484ec77027226f061bce2738972aed404455bb15c8c778fe5a3de6c7ffecfc3` |
| `assets/files/shadow-native-disc-v1.png` |2263| `bd54c9f8251b634657076831fd38854855aea8004ea4dc71603b3bac3a39f572` |
| `assets/manifest.json` |13262| `de506e952cba509bf756fd1ccf218f63e60f97d16fc727dcf9972d62f9ef5be7` |
| `index.html` |2661| `df1eb312951f07ab6200bcd3aea274a13ea6c59fddb2947aa1ef34cc26540ec4` |
| `inputs/config.json` |9503| `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db` |
| `inputs/manifest.json` |11533| `425c4050c0f3389ad1c77381f4462b739ee79893ecd17e957a7478d3051ca323` |
| `inputs/view-math.js` |3050| `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |
| `metadata.json` |863| `b9341c162b420ae6b762f8fe6a4c9e814d1c7e7eab6279b0ede0f091378520d3` |
| `runtime/sim-core.js` |21962| `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7` |
| `source/01-jungle.jpg` |671136| `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72` |
| `src/controller.js` |2370| `63e73fb0235c95bd8846f8ab427a3105a86c5cef5cd5da5be56df0f83524a2dd` |
| `src/main.js` |15771| `a1cbef60ac52950f50a5123e8eef674dc8fae8d534b354a548634d47ebd32f78` |
| `src/playback-clock.js` |2437| `30cb773fdfece6fa2acb6a88380b437b67ce1fa093821da56f5b594429b49878` |
| `style.css` |1174| `edbd2ee2f5a5f4e0cefb6c5689e0f119d28c1db939b391c3ef607c8943509267` |
| `vendor/PIXI-LICENSE.txt` |1092| `5ce7447bc57f7349ffc48338782fbcabe613696e00712b20d66bc58e780f9473` |
| `vendor/pixi.js` |841282| `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef` |

## Source→browser provenance и scope03→04

Пять module-emission receipts проверены через actual08f9 Git blobs, canonical-LF SHA и точный список replacement references:

| Source | Browser output | Явных references |
| --- | --- | ---: |
| `index.html` | `index.html` |2|
| `src/main.mjs` | `src/main.js` |4|
| `src/controller.mjs` | `src/controller.js` |0|
| `src/playback-clock.mjs` | `src/playback-clock.js` |0|
| `inputs/view-math.mjs` | `inputs/view-math.js` |0|

HTML имеет только2 browser-path адаптации; main —4 (добавилась helper import). Controller/playback-clock/view-math скопированы без content adaptation. Неправдивое byte-exact совпадение адаптированного main с source не заявляется; новый consumer Git blob в asset manifest — `1ab69de3b95657f3ccba315f4278c3356a0feec2`, соответствие main.js доказано declared emissions. Browser modules только.js, active graph из6 modules разрешился и связался без Pixi/DOM execution.

Scope по фактическим03/04 bytes/hash: **11 existing files identical,4 changed,1 added,0 deleted**. Изменены index(+200 bytes),main(+1223),asset manifest(provenance только candidate и consumerGitBlob),metadata(только candidate/sourceCommit); добавлен clock2437 bytes. Суммарная прибавка3860 bytes. Полный machine scope сохраняет old/new bytes/SHA и JSON field deltas.

Config/projection/Controller/compiled core/Pixi/license/JPG/два PNG/CSS сохранены. Native core exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`; compiled bytes имеют тот же SHA dbb01… как frozen03. Core TS/maps и private checkout paths в browser tree/public Git не копировались. Four-occluder art остаётся прежним; touch/gestures/size/radius/occlusion/fit исправлений нет.

## Собственные actual-artifact проверки

Проверены exact16 paths/bytes/hash/tree,13 textfiles/strict privacy включая новый.js, source-blob receipts, relative HTML/resource/import refs, default PNG/config/domain data, отсутствие обязательного POST. Единственное SDK exception осталось прежним точным Pixi URI-regex span при pinned normalized SDK SHA; scanner не ослаблялся. Все6 actual.js разобраны standard ES-module parser и связаны с required exports без evaluation Pixi/DOM. Compiled core byte parity позволила не повторять старую11087/3909-state fullnative matrix.

`STATIC_ARTIFACT_CHECK.json` находится вне browser tree. Operator checker в `output/builder/candidate04-own-checks/` переиспользует source static-check prefix, явно исключает старый full-run native block и добавляет actual graph/blob/SDK parity assertions. Адаптация описана в CHECK_ADAPTER.json; source08f9 не менялся.

**10 emitted-module boundary checks passed**: тот же meaningful closed-form integer-quarter-ms oracle, fractional carry/rate-change/reset/hidden/terminal/validation/history-rewind fixtures, теперь import именно frozen04 `src/playback-clock.js`, `src/controller.js`, `runtime/sim-core.js` и actual artifact config. One256-tick reference seed1 и4 prefixes до128 через contact95; каждое callback state/event и все physical frames совпали. Rates0.25/0.5/1/mixed потребовали203/101/51/176 synthetic frames; ambient RNG accesses0. Native seek94/+1/+10/+100/seek95 точны в Node. UI bindings/visibility event delivery этим не доказаны.

Boundary evidence: `E:/R4D/perspective/p2-runtime/output/builder/playback-artifact-candidate04-01/EVIDENCE.json`. Она содержит actual source/build/tree/manifest identity, samples и canonical source records. CHECK_ADAPTER.json раскрывает8 точных text adaptations существующего selfcheck:4 import paths, actual config path, artifact identity/schema/status и честное scope description; clock/test oracle не переписаны. Поле newBuildPerformed=false внутри boundary evidence относится к checker: он использовал уже созданный04, а не выполнял compilation.

Build stdout537/stderr0 bytes; static checker stdout1580/stderr176 (только стандартный Node ExperimentalWarning о VM Modules); boundary stdout462/stderr0, все exit0. Логи только `E:/R4D/perspective/p2-runtime/output/builder/*04*.log`. Packaging заново сравнил all16 frozen04 и all15 old03 bytes/hash и подтвердил оба BUILD_MANIFEST unchanged; старые artifacts не редактировались.

## Resources и границы

Перед build:06:13:28.4221539UTC RAM31.907GiB total/11.013free,CPU4%,C/D/E8.040821/16.324112/41.738964GiB. Ретained conservative peak C1.525/D0.25/E1.375GiB, RAM≤1GiB; build/checks последовательны, Node heap limit512MiB. Свежая memory/disk проверка повторена в build command; all tested source hashes совпали, output04/log targets отсутствовали. Snapshot учитывает сосуществующие Millionko/P3/system workloads, не гарантирует будущий free и не приписывает общую динамику дисков Builder.

Перед Node artifact checks06:20:00.3718248UTC freeRAM11.861GiB,CPU19%,C/D/E8.041733/16.322075/40.763302GiB. Rule4/2 соблюдено; заведомо исчерпывающей операции нет. TEMP/TMP/npm cache process-localE, Node compile cache disabled; install/global settings/cleanup не выполнялись.

Actual browser/Android/Pixi/WebGL/UI/rate select/download и HTTP200/JS MIME **не наблюдались**. Existing mapping.js даёт только положительный MIME prediction. Source helper/emitted Node clock checks и module link не равны full Technical/visual/art PASS. Только4 occluders; остальные21/rails/basket rims не покрыты. Slow playback не доказывает исправление этих ограничений.

Server writes/upload/staging/mkdir/nginx/reload/rollback=0 в этом04 этапе. Старый03 limited release/immutable sourcee7ed и old reports/evidence сохранены; старый token released. Новый release intent/gate/token пока не выдавался и не готовился. Ready artifact не является публикацией, P2closure или освобождением slot.

Lead уже назначил exact04 targeted independent TQA; этот handoff завершает собственную упаковку/scope/docs вне browser tree. Дальнейший build/release не запускается без отдельного адресного поручения; activewait отсутствует.
