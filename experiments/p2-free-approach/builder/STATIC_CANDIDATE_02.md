# P2: frozen static candidate 02

28 октября 2026. Builder `builder-r4d-p2-free-01`. **FROZEN_PENDING_INDEPENDENT_QA**; P2 не закрыт, artistic PASS отсутствует.

Source commit: `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`. Exact Lead base `ec090addd2f261b4f4f2b5abd8c742df4672d115` merged недеструктивно; старые diagnostic/source-only пакеты сохранены. Сборка и compiled-core проверки выполнены из чистого source commit.

## Единственный frozen candidate

- Candidate: `p2-jungle-static-candidate-02`.
- Artifact: `E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-02/`.
- Browser tree: `bundle/review/r4d/p2-free-approach/` внутри artifact.
- Route после разрешённой доставки: `/review/r4d/p2-free-approach/`.
- Полный файловый manifest/provenance: `BUILD_MANIFEST.json` вне browser tree.
- Manifest SHA256: `6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0`.
- Tree SHA256: `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d`.
- Tree digest rule: `SHA256(JSON.stringify(sorted per-file records)+LF)`.
- Browser files: **15 / 2448166 bytes**.
- Отчёт собственной проверки: `STATIC_CHECK.json`, SHA256 `f8cc4c29d70f524a6a79c7d39e169f060c0d7b98543b460847e4b4de03161384`.

Не пересобирать и не редактировать этот browser tree после проверки. Независимые TQA/VQA получают exact candidate/tree digest. Release возможен только после отдельного exact gate Lead на эти байты.

## Состав browser tree

| Route-relative файл | Bytes | SHA256 |
| --- | ---: | --- |
| `assets/files/ball-v2.png` | 851662 | `3484ec77027226f061bce2738972aed404455bb15c8c778fe5a3de6c7ffecfc3` |
| `assets/files/shadow-native-disc-v1.png` | 2263 | `bd54c9f8251b634657076831fd38854855aea8004ea4dc71603b3bac3a39f572` |
| `assets/manifest.json` | 13262 | `c8934af825aa604d3f7c0e98e93c618677e3361c5f893d89af3b3f018afde245` |
| `index.html` | 2463 | `ea1c05d681d94eadcda68e6914570e17f26b0ba9f79a3f6aa1b9fd2ebefd20d9` |
| `inputs/config.json` | 9503 | `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db` |
| `inputs/manifest.json` | 11533 | `425c4050c0f3389ad1c77381f4462b739ee79893ecd17e957a7478d3051ca323` |
| `inputs/view-math.mjs` | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |
| `metadata.json` | 863 | `8933eec095cf9418ddcff78bff31744fa189fabb70d4d4ea6a58bc3e6804b90a` |
| `runtime/sim-core.mjs` | 21962 | `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7` |
| `source/01-jungle.jpg` | 671136 | `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72` |
| `src/controller.mjs` | 2370 | `63e73fb0235c95bd8846f8ab427a3105a86c5cef5cd5da5be56df0f83524a2dd` |
| `src/main.mjs` | 14551 | `4c7bdeda5f2b30b98c1fb6f8b84c9d3c9c9d2f03ba6bb0ae31018a3587c1e072` |
| `style.css` | 1174 | `edbd2ee2f5a5f4e0cefb6c5689e0f119d28c1db939b391c3ef607c8943509267` |
| `vendor/PIXI-LICENSE.txt` | 1092 | `5ce7447bc57f7349ffc48338782fbcabe613696e00712b20d66bc58e780f9473` |
| `vendor/pixi.mjs` | 841282 | `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef` |

## Что изменилось и что сохранено

Default art — source-ready Jungle v2: реально указаны ball-v2 и отдельная тень. PNG bytes/размеры/центры/diameter сохранены. Config exact SHA256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`, P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, проекция и все domains сохранены. Из browser inputs/manifest удалён только локальный путь JPG, заменён на route-relative source URL; численные входы не менялись.

Pixi 8.22.0 с MIT license; Rolldown 1.2.15, Node v24.15.0. Настоящее ядро `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0` компилируется в отдельный browser runtime. Core compiled SHA256 `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`. Он необходим для исполнения и хранится только в E artifact для авторизованного Review; приватные TS, source maps, private checkout/credential paths в browser tree и новые Git-файлы не копировались.

Все HTML/module/resource ссылки относительны route. GET-only просмотр не требует backend API. Явное «Сохранить повтор» создаёт browser download JSON с seed/config/provenance и всеми наблюдавшимися запусками; random/replay не зависят от POST. У завершения запуска нет автоматического скачивания. Старый serve.mjs и отклонённый Windows server/browser packet не используются; новых сервисов/портов/runner/профилей нет.

## Выполненная собственная проверка

Exact файл-набор, bytes/SHA256, route-relative HTML/import/resource references, default PNG/config, отсутствие обязательного POST проверены на готовом artifact. Отсутствуют TS/maps и локальные/private source references. Реальные траектории compiled runtime для заранее заданных seed1/2 совпали по SHA256 всех exact кадров с прежним pinned native baseline; replay leaf-01 post-step tick95 и переход к96 точны. Seed1 LOST tick1735; seed2 LOST tick1290. Это не отбор успешного примера.

Браузер/Pixi сцена и взаимодействие download DOM **не запускались**. Эта проверка не заменяет независимые TQA/VQA и не подтверждает художественное качество, контакт с корзиной или исправление общих входных проблем. Только четыре occluders: flower-01, leaf-01, frog-01, wood-01; остальные21, ограда и бортики корзин остаются непокрытыми.

Первый candidate-01 сохранён как неуспешная build попытка: слишком широкий static path scan принял часть стандартного Pixi URI-regex за drive path. Проверка исправлена в source без изменения физических/художественных входов; candidate-02 собран в новый каталог, первый не перезаписан. Логи build-02/check-02 stdout 537/331 bytes, оба stderr0; build-01 stderr832 bytes. Все логи — `E:/R4D/perspective/p2-runtime/output/builder/static-*.log`.

Свежий замер перед build-02 C7.882873535/D16.312126160/E41.491512299 GiB; ожидаемый плановый пик C1.525/E1.375 GiB диски не исчерпывал, прежний резерв10GiB не применялся. После compiled/static проверки C7.882706/D16.312122/E41.31377 GiB. Это общие показатели дисков, не атрибуция изменений одному процессу. TEMP/TMP/npm cache/Node cache/output были process-local на E.

## Доступ к просмотру и release boundary

Подтверждённого существующего маршрута **реального просмотра frozen candidate до root switch пока нет**. Указанный локальный проект `D:/vps_superflight` существует, но не содержит доступных файлов, AGENTS/README_RU; актуальные service/release docs там прочитать не удалось. TQA сообщил доступность IAB, однако exact candidate preview URL и post-auth доступ не подтверждены. Новые сервисы/порты, чужие cookies/passwords и auth обходы не создавались.

Нужен существующий разрешённый маршрут показа этих bytes; здесь не предлагается менять auth/nginx locations ради preview. Без такого маршрута browser-проверка остаётся непроведённой; static candidate уже пригоден для адресной передачи и чтения.

## Дополнительная оценка встроенного file-preview

CTO отдельно разрешил оценить file/встроенный preview exact нового bundle без старого Node server, изменения frozen bytes и нового сервиса/порта. Встроенный IAB выбран через `mcp__cua_repl`; личный Chrome не использовался. Действие `cua.createBrowserTab('iab', 'file:///E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-02/bundle/review/r4d/p2-free-approach/index.html?seed=1&paused=1', ...)` отклонено browser security policy. Дословная конкретная причина: **"The requested URL protocol is not allowed. Allowed protocols: \"http:\", \"https:\"."** Call ID инструмент не показал.

Навигация и приложение не выполнились; снимка сцены и visual PASS нет. IAB оставил `about:blank` вкладку1, её состояние прочитано и она закрыта. Повтор, альтернативная browser surface, raw CDP, data/blob URL, инъекция кода или новый сервис как обход не предпринимались. Этот отказ ограничивает конкретный file-preview и не расширяется до запрета обычной сборки/штатного release. Для дальнейшего просмотра нужен существующий разрешённый HTTP(S) target; такой exact preview URL пока не предоставлен. Дополнительная оценка не меняла artifact, BUILD_MANIFEST или STATIC_CHECK.

## Координация release-окна

Первое общее Review release-окно зарезервировано за P2. Перед **любыми** server writes Lead передаёт CTO exact candidate/release intent и получает единственный token; до этого только build/freeze/read-only preflight. Token не получен. После него общие writes выполняются без параллельных изменений до postchecks и освобождения окна. Текущий live root берётся свежим; исторические roots не используются как актуальные. SSH/security configs/credentials не читались, alias/host не выдумывались; CTO запросил у Макса только несекретный указатель.

Staff release-engineer прочитан на e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3, R4D роль — из exact Lead base. Перед будущей внешней записью всё ещё обязательны действующие service/release инструкции, read-only сверка текущих live route/root/manifest, immutable release с сохранением других cards/auth, свежий rollback и только разрешённый штатный root switch + nginx -t + graceful reload. Исторические roots из release record не приняты за текущие. Внешних записей/публикации/root switch сейчас нет; отдельный exact gate Lead не получен.
