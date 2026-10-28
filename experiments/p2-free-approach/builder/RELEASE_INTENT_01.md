# P2 candidate-02: exact локальный release intent 01

28 октября 2026. **LOCAL_READY_AWAITING_EXACT_LEAD_GATE_AND_SINGLE_CTO_TOKEN**. Подготовлены только локальные данные на E; серверных writes/upload/mkdir/staging/scripts/root switch/reload нет.

## Замороженный вход

Candidate `p2-jungle-static-candidate-02`, source `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`; 15 files/2448166 bytes.
Tree SHA256 `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d`.
Frozen BUILD_MANIFEST SHA256 `6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0`.
Ни один frozen byte не менялся и не пересобирался. При локальном копировании/упаковке все15 файлов сверены с frozen manifest и исходными artifact bytes; compiled runtime не исполнялся, QA не повторялась.

## Единственный reviewable payload

Каталог: `E:/R4D/perspective/p2-runtime/output/p2-review-release-intent-01/`.
Машинный план: `RELEASE_INTENT.json`.
Машинный intent SHA256: `5e0a7825b56d92a0ad12665a758a959676747081a8e080408a89db72aacfd401`. После подготовки он не редактировался; дополнительный MIME-field для gate находится отдельно в `MIME_FIELD.json` и не входит в transfer.
Full planned manifest: `patch/RELEASE_MANIFEST.json` (в будущем release вне browser tree).
Transfer: `release-patch.tar`, **17 regular files**, USTAR, нормализованные root:root644 headers. Содержит только full manifest, новый catalog и15 frozen files. Старую демку не скачивали/не пересобирали: она сохраняется guarded remote copy после token. Архив распакован в память при сверке, каждый member совпал с patch bytes, symlink/absolute/traversal entries нет.

| Локальный файл | Bytes | SHA256 |
| --- | ---: | --- |
| `patch/RELEASE_MANIFEST.json` | 94171 | `f4424787464ea998d6062055ebb1717868efea47da2ff858c1c6cb32addc3a9a` |
| `patch/review/index.html` | 11371 | `e4cb0687551aa54658011a5be731fbf4f4c44f044c526a19ef0d8b4140d6b346` |
| `review.locations.conf.next` | 1084 | `ba91de49370a9ac987c4a432825450f464ecac1280bb85a7774b3374b7d27bc0` |
| `release-patch.tar` | 2570240 | `f823d9f104ab8073cb32e652b166ed6ab896272d161503041ebc96cfd7e49e95` |

Planned full browser tree: **472 files / 85200946 bytes** =456 прежних неизменённых файлов +1 изменённый catalog +15 frozen P2 files. Полный manifest перечисляет каждый path/bytes/SHA256. Прежний immutable manifest остаётся canonical source/provenance по точной ссылке/hash; прежний release сохраняется.

## Точное изменение catalog

Old catalog: **10381 bytes**, SHA256 `584aa3f83c2264e349a3ee66ba7f2b376f22737ed5160f72873a597ad3f79247`.
New: **11371 bytes**, SHA256 `e4cb0687551aa54658011a5be731fbf4f4c44f044c526a19ef0d8b4140d6b346`, delta **+990 bytes**.

Меняется только счётчик раздела перспективных досок `1 демонстрация` → `2 демонстрации`, после существующей P0 добавляется одна строка P2. Скелетный счётчик11, P0, остальные карточки/ссылки/заголовки/CSS не меняются. Удаление этой строки и обратная замена счётчика точно восстанавливают исходный catalog.

Новая карточка:
```html
<a class="card" href="./r4d/p2-free-approach/"><p class="eyebrow">R4D · P2 · ограниченный просмотр</p><strong>Jungle · свободный способ оживления доски</strong><span>Пробный candidate-02: настоящий Millionko, объёмный шарик и отдельная тень, повтор по seed и пошаговый просмотр. Статус runtime/visual-unverified: работа интерфейса и качество движения в браузере ещё не подтверждены. Перекрытия подготовлены только для четырёх объектов; остальные препятствия, ограда и бортики корзин остаются без накладок. Публикация для проверки, без финальной QA и художественной приёмки.</span><b>Открыть пробную доску →</b></a>
```

P2 frozen route для подписи не редактировался. Подпись и release metadata честно показывают runtime/visual-unverified; публикация для проверки не является финальной QA/приёмкой или art PASS.

## Base guards, new root и fresh rollback

- Alias: `vps1-direct`, обычный existing connection, без изменения host keys/settings/credentials.
- Expected live root: `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6`.
- Base full manifest: SHA256 `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`,261716 bytes,457 browser files/82751790 bytes.
- Expected live snippet SHA256 `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`,1095 bytes.
- Proposed release id/new root: `p2-jungle-static-candidate-02` / `/srv/superflight-review/releases/p2-jungle-static-candidate-02`.
- Proposed fresh rollback/evidence: `/opt/superflight-studio/backups/review-p2-candidate-02-20261027T234352Z`.
- Оба target на последнем read-only preflight отсутствовали; перед **любой** записью после token повторно проверить отсутствие и свежие baseline guards. При изменении base/наличии target — остановка, без перезаписи и без самовольной смены intent.
- Prospective snippet1084 bytes, SHA256 `ba91de49370a9ac987c4a432825450f464ecac1280bb85a7774b3374b7d27bc0`: заменён только root. Обратная замена восстанавливает exact1095 old bytes; защита не редактировалась.
- Snapshot rollback будет реально снят непосредственно перед switch с фактическим UTC в evidence; старое имя каталога не является доказательством свежести.

## Declared server write-set: только после exact gate и single token

1. Новый `/srv/superflight-review/releases/p2-jungle-static-candidate-02/`: guarded remote copy текущего immutable root, затем overlay17 exact patch files; полный manifest/path/hash/permissions контроль до switch.
2. Новый `/opt/superflight-studio/backups/review-p2-candidate-02-20261027T234352Z/`: transfer archive/prospective snippet, fresh baseline snippet, references/hashes/state/actual UTC/rollback plan/postchecks и before-copies изменяемых docs. Никакой session DB.
3. Временный `/etc/nginx/snippets/.review.locations.conf.p2-candidate-02.next` (также должен отсутствовать) и атомарная замена `/etc/nginx/snippets/review.locations.conf` только сменой root, с сохранением прочих bytes и прежнего root:root644.
4. Только штатные `nginx -t` до/после и graceful `systemctl reload nginx`.
5. Append фактической записи в `/home/sf/assistant-context/vps/services/superflight-studio.md` и `/home/sf/assistant-context/vps/CHANGELOG.md` после postchecks.

Все остальные configs/vhost/auth/Origin/GET-only/headers/DB/sessions/credentials/ACL/firewall/DNS/containers/ports/services/чужие проекты и старые releases сохраняются. Новые files/dirs получают только существующие режимы644/755, никаких новых прав доступа. Реальная возможность privileged writes не проверялась и не обходилась до token.

Postchecks: exact new root/snippet/full manifest;472 paths/bytes/SHA256,15 frozen hashes,456 preserved oldfiles; modes/ownership/no symlinks; nginx active; прежний auth303/Origin403/dotfiles404/GET-only/headers; настоящий post-auth browser/UI/Pixi/download только при доступном existing authorized session, иначе честное непроверено. После записей docs — освободить эксклюзивный token. Rollback guard — expected live snippet `ba91de49370a9ac987c4a432825450f464ecac1280bb85a7774b3374b7d27bc0`, затем только fresh saved root/snippet + nginx test/graceful reload; поздние чужие изменения не затирать.

## Границы и фактически выполненное

### Отдельный delivery-field `.mjs`: факты и prediction

По адресному поручению Lead выполнен только узкий read-only MIME lookup обычным alias, без nginx -T/секретных configs/security scans/правок. Факты: `/etc/nginx/mime.types:8` содержит `application/javascript js;`, `.mjs` в этой таблице не найден. `/etc/nginx/nginx.conf:15` подключает эту таблицу, строка16 задаёт `default_type application/octet-stream;`. Vhost на строке39 включает прежний Review snippet; в exact скачанном Review snippet нет types/default_type/mjs override. Три vhost `default_type text/html` на179/231/284 относятся к named location `@studio_offline`, не задают JS MIME для Review.

**Prediction по прочитанной цепочке наследования:** успешный static ответ для `.mjs` получит `application/octet-stream`, что несовместимо с загрузкой ES modules при сохранённом nosniff. **Фактический HTTP200/Content-Type не наблюдался**: route ещё не опубликован и готового post-auth доступа нет. Это конкретная delivery-зависимость для отдельного решения Lead/CTO, не доказательство проверенной browser ошибки и не новый общий аудит.

Payload/frozen15/full manifest/archive/prospective snippet не изменены; `RELEASE_INTENT.json` сохраняет исходный hash. Config не исправлялся, frozen candidate не пересобирался и расширения не переименовывались. Перед gate обязательно передать этот field вместе с intent; нельзя выдавать подготовленный пакет за подтверждённый запускаемый browser-result. Локальный `MIME_FIELD.json` — отдельная operator запись, не browser/transfer файл.

- Все данные manifest/catalog/snippet скачаны read-only обычным alias на E. Multi-source SCP скачал catalog, но второй filename получил protocol mismatch; отдельный точный SCP request snippet завершился успешно с прежней strict filename validation, без `-T`/обхода/смены credentials.
- Свободное место перед малой подготовкой: C7.859528/D16.306396/E37.314228 GiB; payload меньше10MiB не исчерпывает диск. TEMP/TMP/Python cache параметры только process-local на E, bytecode запись отключена. Старый резерв10GiB не применялся; cleanup не выполнялся.
- Нет нового candidate, source/build исправлений или P2 runtime. Отдельный finding будущего build-scan остаётся открытым; TQA current bytes чисты в описанном объёме, не полный browser/visual PASS.
- Exact gate Lead и single token CTO **не получены**. Пакет локально готов для проверки intent. Остановиться до адресного gate; не выполнять server writes самостоятельно.
