# P2 candidate-03: локальный release intent 03

28 октября 2026. **LOCAL_PREPARED_PENDING_FRESH_QA_EXACT_LEAD_GATE_AND_SINGLE_CTO_TOKEN**. По указанию Lead подготовлен новый локальный03 write-set параллельно свежей независимой TQA/VQA. Это предварительный reviewable intent; final intent/gate должен учесть её новые результаты. Server writes/upload/staging/root switch/reload=0; single CTO token не получен.

## Замороженный вход

Candidate `p2-jungle-static-candidate-03`; source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`; **15 browser files /2448161 bytes**. Tree SHA256 `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`; BUILD_MANIFEST SHA256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`. Полная передача — [STATIC_CANDIDATE_03.md](STATIC_CANDIDATE_03.md). Ни15 files, ни BUILD_MANIFEST не изменялись при подготовке patch; native/runtime/браузер заново не запускались.

## Новый локальный payload

Каталог `E:/R4D/perspective/p2-runtime/output/p2-review-release-intent-03/`. Машинный план `RELEASE_INTENT.json`: 8504 bytes, SHA256 `ddbb989398ff384a026969760dd5047fd93e35a2580fcb34613031a4b1f58e37`. Сверка упаковки `LOCAL_PREPARATION_CHECK.json` вне transfer. Никакие новые local files не считаются серверными staging или разрешением записи.

| Файл | Bytes | SHA256 |
| --- | ---: | --- |
| `patch/RELEASE_MANIFEST.json` | 97647 | `0495e9eadb33cf71c6a80811a62f28c17dcb570e26c2507fca4b32a50998a7f5` |
| `patch/review/index.html` | 11371 | `84a652cdf90b42416ebfb2c61fc9d02babd19e9bb2905cc2d0451507e7610a4d` |
| `review.locations.conf.next` | 1084 | `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` |
| `release-patch.tar` | 2580480 | `dcb9e3037bf3feec5be890dba017bed9a42d7ae1b965a37c98945468f908c872` |

Full planned browser tree: **472 files /85200941 bytes** =456 неизменённых прежних файлов +1 изменённый catalog +15 exact frozen03. Полный manifest содержит каждый path/bytes/SHA256; inherited source/provenance связаны точным предыдущим immutable manifest path/hash. Прежний release сохраняется; его browser bytes не скачивались и не пересобирались.

Release-patch USTAR содержит ровно17 regular files: полный RELEASE_MANIFEST, catalog и15 route-prefixed frozen03 files. Нормализованные headers root:root644/mtime0. Проверены точный файл-набор, bytes/hash каждого member после чтения архива, отсутствие symlink/absolute/traversal entries; всех15 сравнены с original artifact. Operator scripts, prospective snippet, checks/logs, TS/maps и старая демка не входят в transfer. Standalone CANDIDATE_TRANSFER.tar из artifact03 — другой архив для адресной QA-передачи, его SHA256 `795860cbe83800a07dad1d7aeb2f62f6fe99ce07aa1ca8397b919f1d5714e038`.

Catalog:10381→11371 bytes, delta+990. Добавлены только одна P2card после P0 с подписью candidate-03/runtime-visual-unverified и perspective count1→2. Скелетный count11 и все старые карточки/ссылки/CSS сохранены. Удаление этой строки и обратный count точно восстанавливают baseline. Technical module/MIME details в пользовательскую карточку не добавлялись.

## Exact base guards и предлагаемые targets

- Alias `vps1-direct` — существующий штатный доступ, credentials/config не извлекались и не менялись.
- Expected live root `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6`.
- Base RELEASE_MANIFEST261716 bytes SHA256 `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`;457 files/82751790 bytes.
- Base catalog10381 bytes SHA256 `584aa3f83c2264e349a3ee66ba7f2b376f22737ed5160f72873a597ad3f79247`.
- Base snippet1095 bytes SHA256 `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`.
- Proposed new root `/srv/superflight-review/releases/p2-jungle-static-candidate-03`.
- Proposed fresh rollback/evidence `/opt/superflight-studio/backups/review-p2-candidate-03-20261028T002536Z`.
- Proposed temporary snippet `/etc/nginx/snippets/.review.locations.conf.p2-candidate-03.next`.
- Prospective snippet меняет только root; точная обратная замена восстанавливает1095 baseline bytes.

Baseline — сохранённый read-only замер **2026-10-27T23:45:35.751840Z**, не свежий live guard03. При этой локальной подготовке сервер не опрашивался. Отсутствие новых03 targets не наблюдалось и не заявляется. После exact gate/token и перед ЛЮБОЙ записью нужно свежо сверить live root/snippet/manifest/catalog, все457 baseline paths/bytes/hashes и отсутствие new root/rollback/temp. Непосредственно перед switch повторить base/snippet guard. При изменении или занятом target остановиться, не перезаписывать и не выбирать другой путь под этим intent. Fresh rollback snapshot снимается при исполнении непосредственно перед switch с actual UTC; имя каталога не доказывает свежесть.

## Declared server write-set: только после нового gate/token

1. `/srv/superflight-review/releases/p2-jungle-static-candidate-03`: guarded remote copy текущего expected immutable root; overlay exact17-file patch; все472 planned paths/bytes/hash/modes до switch. Без rebuild.
2. `/opt/superflight-studio/backups/review-p2-candidate-03-20261028T002536Z`: exact transfer/snippet, fresh pre-switch snippet/protected hashes/state/actual UTC/rollback/postchecks и before-copies изменяемых docs. Никакой session DB.
3. Отсутствующий временный `.review.locations.conf.p2-candidate-03.next`, затем guarded atomic root-only замена `/etc/nginx/snippets/review.locations.conf`; прежние ownership/mode и остальные bytes сохраняются.
4. Только штатные `nginx -t` до/после switch и graceful `systemctl reload nginx`.
5. Append фактических результатов после postchecks в `/home/sf/assistant-context/vps/services/superflight-studio.md` и `/home/sf/assistant-context/vps/CHANGELOG.md`, с сохранением истории.

Другие configs/vhost/MIME/auth/Origin/GET-only/headers/DB/sessions/credentials/ACL/firewall/DNS/containers/ports/services и чужие проекты не входят в write-set. Новые dirs/files используют существующую convention root:root755/644; новых grants нет. Старый02 intent01 не даёт разрешения на03 и не менялся.

Postchecks: exact new root/snippet/full manifest/all472 files, exact15 frozen03 и456 сохранённых oldfiles; все старые routes/cards, modes/no symlinks/immutable oldreleases; nginx active; прежние auth303/foreign Origin403/dotfiles404/GET-only/headers. После публикации реальный authenticated HTTP200 и application/javascript всех5 `.js` modules — только через существующий разрешённый session/target; затем browser/UI/Pixi/download/VQA. Если такого доступа нет, явно записать непроверено. Старые denied launcher/fileURL не повторять и не обходить. После фактических docs/postchecks освободить единственный token.

Rollback guard — published snippet SHA256 `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104`; при отсутствии поздних чужих правок восстановить только fresh saved Review snippet/root, nginx test/graceful reload. DB/sessions и старые releases не восстанавливать/не удалять.

## QA/MIME границы

Все5 browser module outputs имеют `.js`; старое read-only наблюдение `application/javascript js;` даёт положительный MIME prediction. Реальный HTTP200/Content-Type не проверен. Scanner regression исправлен в source03 и targeted controls прошли; это не новый независимый TQA PASS. Старые02 results — baseline. В planned manifest и intent записан FRESH_EXACT03_TQA_VQA_PENDING; окончательный адресный gate должен учитывать свежие результаты.

Limited publication предназначена для проверки и сама не закрывает P2, не заменяет финальную QA/приёмку и не даёт artistic PASS. Четыре occluders остаются ограничением; остальные21/ограда/бортики не покрыты. Диск перед малой упаковкой: C7.723366/D16.304794/E31.525028 GiB; local payload менее10MiB не исчерпывал диск. TEMP/TMP на E process-local, Python bytecode отключён; cleanup/global settings отсутствуют. Candidate02/intent01 и frozen03 проверены неизменными после packaging.
