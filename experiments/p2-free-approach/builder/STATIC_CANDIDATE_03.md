# P2: frozen static candidate 03

28 октября 2026. Builder `builder-r4d-p2-free-01`. **FROZEN_PENDING_INDEPENDENT_QA**. Lead независимо сверил exact 15 browser files и BUILD_MANIFEST и направил новый handoff TQA/VQA. P2 не закрыт; browser/visual/artistic PASS отсутствует.

Source commit **`e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`** содержит реальные build/scanner изменения и был чистым перед сборкой. Последующая документация не меняет sourceCommit artifact. Старые candidate-02 и release-intent-01 сохранены как история; их token/publication не запрашиваются.

## Exact artifact и транспорт

Artifact: `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-03/`. Browser root: `bundle/review/r4d/p2-free-approach/`; route `/review/r4d/p2-free-approach/`. Не редактировать эти 15 browser files и BUILD_MANIFEST и не пересобирать под тем же candidate.

| Запись | Bytes / число | SHA256 |
| --- | ---: | --- |
| Browser tree | 15 files / 2448161 bytes | `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d` |
| BUILD_MANIFEST.json | вне browser tree | `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575` |
| STATIC_CHECK.json | собственная проверка | `4037cecfbe162e08c5ffe1dc19d49de0e74322cf7ec9a5ab60193082a8d79874` |
| CANDIDATE_TRANSFER.tar | 2478080 bytes / 16 regular files | `795860cbe83800a07dad1d7aeb2f62f6fe99ce07aa1ca8397b919f1d5714e038` |
| SCOPE_DIFF.json | 9097 bytes | `4f799c461c2c3c4189ececad748c14f22a43337fcb973586aad2214157289fc0` |

Tree rule: `SHA256(JSON.stringify(sorted per-file records)+LF)`. Standalone transport — USTAR с нормализованными root:root644 headers/mtime0: BUILD_MANIFEST плюс15 route-prefixed browser files. Каждый member прочитан обратно и сравнен с exact входными bytes; абсолютных/traversal/symlink entries нет. Это не полный Review release patch; scope/check/logs/операторские scripts в transport не входят.

## Browser files

| Route-relative файл | Bytes | SHA256 |
| --- | ---: | --- |
| `assets/files/ball-v2.png` | 851662 | `3484ec77027226f061bce2738972aed404455bb15c8c778fe5a3de6c7ffecfc3` |
| `assets/files/shadow-native-disc-v1.png` | 2263 | `bd54c9f8251b634657076831fd38854855aea8004ea4dc71603b3bac3a39f572` |
| `assets/manifest.json` | 13262 | `924b42c5907e7372c65504a3190b23e531255e898c7e5cbc62fca5ac6d078b19` |
| `index.html` | 2461 | `8bebd1f5587764f7504bb5c179f51abdf8f5b576e01a9542d2707e806354c32a` |
| `inputs/config.json` | 9503 | `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db` |
| `inputs/manifest.json` | 11533 | `425c4050c0f3389ad1c77381f4462b739ee79893ecd17e957a7478d3051ca323` |
| `inputs/view-math.js` | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |
| `metadata.json` | 863 | `833eb9cb65b542e4333c9f68e70ac95fb603821bb4c7b62ff693077f249617f1` |
| `runtime/sim-core.js` | 21962 | `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7` |
| `source/01-jungle.jpg` | 671136 | `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72` |
| `src/controller.js` | 2370 | `63e73fb0235c95bd8846f8ab427a3105a86c5cef5cd5da5be56df0f83524a2dd` |
| `src/main.js` | 14548 | `d83429332dde641732aa57d7fe456e389ec5669a9d2eb424c2259e975424eacd` |
| `style.css` | 1174 | `edbd2ee2f5a5f4e0cefb6c5689e0f119d28c1db939b391c3ef607c8943509267` |
| `vendor/PIXI-LICENSE.txt` | 1092 | `5ce7447bc57f7349ffc48338782fbcabe613696e00712b20d66bc58e780f9473` |
| `vendor/pixi.js` | 841282 | `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef` |

## Узкий scope относительно candidate-02

Пять имён ES modules меняются с `.mjs` на `.js`: `inputs/view-math`, `runtime/sim-core`, `src/controller`, `src/main`, `vendor/pixi`. Одиннадцать из15 соответствующих файлов сохранили content bytes, включая compiled core, Pixi, config, projection inputs и готовые изображения. Четыре content изменения:

- `index.html`: две объявленные ссылки (importmap Pixi и entry main),2463→2461 bytes.
- `src/main.js`: три объявленных import references core/controller/view-math,14551→14548 bytes. Byte-exact identity с source main не заявляется.
- `assets/manifest.json`: только `provenance.candidate`02→03.
- `metadata.json`: только candidate02→03 и sourceCommit5f40→e7ed.

`moduleEmissions` содержит четыре receipts: sourceGitBlob, canonical-LF SHA256 и точный список literal replacements с требованием единственного совпадения. Controller/view-math копируются без адаптации; HTML/main адаптируются только этими references. Rolldown отдельно компилирует неизменённое настоящее core; prebuilt Pixi не подвергается внутренним заменам. Node/source scripts остаются `.mjs`. Массового переименования и изменения физики, PRNG, config, проекции, арта или UX нет.

## Scanner correction и MIME

В той же явно разрешённой source revision исправлен собственный scanner regression candidate-02. Все browser text files, в том числе каждый `.js`, проверяются. Drive matcher не зависит от quotes/boundary: ловит template literals, file URI, lower-case и drive paths внутри HTTP URL. HTTP(S) scheme delimiter классифицируется отдельно, остальная часть URL проверяется.

Единственное исключение — публичный Pixi URI-regex span `[135846,135849)` при точном normalized SDK SHA256 `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef`, output `vendor/pixi.js` и точном контексте. Полный файл/регекс/неподписанный SDK не пропускаются. 10 positive controls обнаружили leaks; normal HTTP scheme принят; tampered и renamed SDK rejected. Контроли пройдены до source freeze и на actual emitted SDK. Первый syntax escaping дефект helper найден и исправлен до commit/build;03 не перезаписывался.

Узкий read-only lookup существующего nginx mapping ранее подтвердил `application/javascript js;`, include mime.types и default application/octet-stream; Review snippet не задаёт другой type. Для новых `.js` это **положительный MIME prediction**, а не наблюдение HTTP200/Content-Type. Nginx/MIME/auth/security configs не менялись. Фактические ответы проверяются после отдельно разрешённой limited publication.

## Собственные проверки и независимый handoff

- Exact file set and all bytes/SHA256.
- Actual artifact privacy scan including every emitted .js; pinned SDK exact-span exception only.
- Declared source→.js module emission receipts; only explicit references changed.
- Relative HTML/import/resource references under route.
- No required POST API; replay download source present.
- Jungle v2 exact PNG/config and four-object data.
- Compiled real sim-core trajectories match earlier pinned native baseline.
- Exact contact replay and one physical tick.

Реальные compiled-core seed1/2 без отбора совпали с pinned native baseline по каждому кадру: LOST ticks1735/1290; exact leaf-01 post-step95 и переход96 воспроизведены. Core21962 bytes SHA256 `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7` совпадает с02. Native core exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, source package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`; private TS/maps не включены.

Логи только на E runtime: build stdout537/stderr0 bytes; static-check331/0; scanner-controls336/0. Это собственные targeted checks. Старый TQA report candidate-02 — baseline, его PASS не переносится. Новая независимая TQA/VQA exact03 назначена Lead; её результат пока не получен.

Browser/Pixi, DOM download, реальный HTTP200/Content-Type и непрерывное движение не наблюдались. Четыре occluders flower-01/leaf-01/frog-01/wood-01 сохраняют прежний scope; остальные21 препятствие, ограда и бортики корзин не покрыты. Вход в корзину на этих seed не показан.

Перед build03: C7.727386/D16.304802/E31.543625 GiB; плановый пик C1.525/E1.375 GiB не исчерпывал диск. TEMP/TMP/Node/npm cache/output process-local на E. Cleanup и глобальных настроек нет.

Lead поручил параллельно QA подготовить новый ЛОКАЛЬНЫЙ03 release write-set/manifest/catalog/guards на E. Final gate требует свежих результатов QA, exact нового03 intent и единственного CTO token. Старые denied launcher/file-preview не повторялись/не обходились; личный Chrome/credentials не использовались. Server writes/upload/staging/root switch/reload =0; token=false. Limited publication сама по себе не закрывает P2 и не даёт artistic PASS.
