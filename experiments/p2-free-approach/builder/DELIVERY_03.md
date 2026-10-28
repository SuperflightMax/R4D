# P2 candidate-03: actual limited Review delivery

28 октября 2026. **DELIVERED_LIMITED_RUNTIME_VISUAL_UNVERIFIED; TOKEN_RELEASED_BY_LEAD**. URL: [Jungle P2](https://superflight.space/review/r4d/p2-free-approach/). Limited publication завершена; P2 не закрыт, полного Technical QA/artistic PASS нет. После независимой сверки8 evidence/index и delivery/postchecks/docs Lead прислал явное уведомление об освобождении единственного CTO token и сообщил, что CTO уведомлён. Builder token самостоятельно не освобождал и P3 server_write/slot-free не объявлял. После уведомления выполнена только локальная report/state/git финализация.

## Authorization и exact identity

- Exact Lead gate: `8dd5d6a727edf99fa71683d928f8cdd1abeb98ac:experiments/p2-free-approach/LEAD_RELEASE_GATE_03.md`, прямое сообщение Lead с single CTO token. Значение token не записывалось в browser bytes/frozen manifest.
- Final intent SHA256 `50b99bf62cb40ea579fbe4346f68e64ca42ea854b09514fbd0ddc0e2b7744f2c`,11913 bytes. Выполнен только его declared write-set/control actions.
- Frozen source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`; executor docs HEAD перед запуском `58afc5fa9b8fdefe5aa05984e23a371e1d229c1e`, чистый и pushed. Actual executor turn ID интерфейс инструментов не раскрывает; Lead может подтвердить его через статус чата. Sensitive logs/config не читались для поиска ID.
- Candidate `p2-jungle-static-candidate-03`;15 browser files/2448161 bytes; tree SHA256 `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`.
- Frozen BUILD_MANIFEST SHA256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`. Browser15/BUILD_MANIFEST, old02/preliminary03/final local intent не редактировались и не пересобирались.

## Fresh guards и фактический switch

До ANY server write на2026-10-28T00:40:03.405513+00:00 сверены expected live root `fd851ad78adfec67c11ed59f07fa24dbef2761c6`, manifest `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`, snippet `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`, catalog `584aa3f83c2264e349a3ee66ba7f2b376f22737ed5160f72873a597ad3f79247`. Все457 baseline paths/bytes/hash/modes совпали; symlinks нет, root:root files644/dirs755. Newroot/rollback/temp отсутствовали. Перед staging guard повторён, непосредственно перед switch заново проверены полный baseline и protected hashes.

Свежая system оценка учитывала уже сосуществующие процессы: desktop31.907 GiB totalRAM/9.965 free, CPU8%, C/D/E7.701797/16.304111/31.385365 GiB на00:37:14 UTC. Перед guard memory/disk пересчитаны: freeRAM10.113 GiB, C/D/E7.708/16.304/31.385 GiB; local plannedRAM64MiB/E16MiB. VPS guard: availableRAM4.978 GiB, disk28.763 GiB, load0.89/1.07/1.20 on4CPU; plannedRAM128MiB/disk256MiB. Пакет не исчерпывал ресурсы; rule4/2GiB соблюдено. Иные worktrees не читались и не менялись.

- Новый release создан guarded copy старого immutable root + exact17 archive overlay. До switch все472 файла/85200941 bytes проверены.
- Fresh rollback snapshot снят **2026-10-28T00:41:08.994866+00:00**, непосредственно перед switch. Имя backup20261028T002536Z не выдаётся за actual snapshot time.
- Atomic root-only switch **2026-10-28T00:41:09.021470+00:00**, то есть **02:41:09 Europe/Kiev (UTC+2)**. В одном intermediate update ошибочно было UTC+3; исправлено. `nginx -t` и graceful reload прошли, nginx active; rollback не выполнялся.

| Live запись | Значение |
| --- | --- |
| Root | `/srv/superflight-review/releases/p2-jungle-static-candidate-03` |
| Full manifest100094 bytes | `171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35` |
| Archive2580480 bytes/17 files | `a63433f59c5ec84c15a627938d394101810c89843544738e9171d2852918faae` |
| Snippet1084 bytes | `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` |

## Postchecks и точное ограничение headers

Actual472-file tree, все15 frozen P2 hashes/tree,456 unchanged inherited records/bytes/modes и retained old457-file immutable release подтверждены после switch. Protected vhost/portal app/Compose/Imagen/legacy redirect/portal snippet/global nginx/MIME hashes и их ownership/modes совпали с fresh snapshot. Изменены только declared newrelease/evidence, Review root и append двух docs; контейнеры/другие сервисы не перезапускались, новых портов/прав/ACL/credentials не было.

| Public HTTPS запрос | Actual |
| --- | --- |
| Catalog/P2/main.js/старыйP0 без сессии |303 к прежнему `/login?next=review` |
| Foreign Origin |403 |
| Dotfile |404 |
| POST static Review route |403, GET-only сохранён |

403/404/POST responses имеют прежние no-store/noindex/nosniff/same-origin/DENY headers. Первая собственная HTTP-проверка ошибочно требовала те же Review-location headers от named `@review_login`303 и дала harness FAIL. В fresh saved baseline у этого named location только return303, Review add_header там нет; live snippet побайтно равен baseline после обратной root-подстановки, protected vhost/hash сохранён, текущие P0/catalog/P2/JS303 responses одинаковы. Критерий исправлен без конфигурационных правок. Это вывод о сохранении поведения по exact configuration identity; pre-switch HTTP headers отдельно не снимались. Оригинальный POSTCHECKS.json с FAIL и POSTCHECKS_CORRECTED.json с обоснованием сохранены; failure не скрыт.

Итог corrected postchecks: **DELIVERY_POSTCHECKS_PASSED_WITH_EXISTING_LOGIN_REDIRECT_BEHAVIOR**. Это не claim headers на redirect303 или на непроверенный authenticated200.

Ready authorized post-auth session не предоставлена/не подтверждена. Реальные HTTP200/JavaScript MIME, module loading/Pixi/UI/download/непрерывное движение/перекрытия/корзина **не наблюдались**; browser не открывался. Cookies/ключи/login/session workaround не использовались. Никакие denied Windows launcher/file-preview не повторялись и не переносились; нового policy refusal нет.

Новые03 TQA3861384dd37ffd224bfabee707f7fdc478c95728 и VQA28881ee9c0470a3cbabbba56de82b09d35de862b уже отражены exact в released manifest: offline scope подтверждён/scanner finding закрыт; VQA RUNTIME_VISUAL_NOT_OBSERVED. Только четыре occluders; остальные21/ограда/бортики не покрыты. Lead передаёт опубликованный URL той же TQA/VQA; Builder не выдаёт scene/art PASS.

## Docs, evidence и rollback

После postchecks в2026-10-28T00:43:41.918295+00:00 append3634 bytes в каждый из двух declared docs. Before bytes сохранены; старое содержимое, ownership/modes не менялись.

| Doc | After bytes | After SHA256 |
| --- | ---: | --- |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` | 61049 | `8f7f857d1f12510af3f2c91ab7169fe6d6af8a9963e70a34e405aecd3130efb4` |
| `/home/sf/assistant-context/vps/CHANGELOG.md` | 285273 | `4f0e4fda0bd6aa762b97cef425e92403dc113c3ce8202909464b230e09a279dd` |

Rollback/evidence directory: `/opt/superflight-studio/backups/review-p2-candidate-03-20261028T002536Z`. Содержит exactarchive/snippet-next, fresh snippet-before, docs-before, baseline/preswitch/switch/postchecks/docs receipts; DB/sessions не читались и не копировались. Guarded rollback только при exact live published snippetSHA d8cf0b…: через тот же declared temp target восстановить `review.locations.conf.before`, nginx -t/graceful reload. Поздние чужие изменения не затирать; old releases/DB/sessions не удалять/не восстанавливать.

Локальные phase/evidence данные: `E:/R4D/perspective/p2-runtime/output/builder/review-delivery-03-01/`. Byte-exact server evidence copies скачаны read-only и сверены; `EVIDENCE_INDEX.json` содержит каждую receipt.

| Evidence | Bytes | SHA256 |
| --- | ---: | --- |
| `server-evidence/PRE_SWITCH_SNAPSHOT.json` | 6242 | `0e0bf13235385f62146e841ab0bad94a84b46c372283c0712ff004aaa21d821d` |
| `server-evidence/POSTCHECKS_CORRECTED.json` | 7197 | `1d03f9273caf237a7821553453f3a57ee80b9a445c5496d8a8d509881b785ec5` |
| `server-evidence/DOCUMENTATION_RESULT.json` | 2693 | `a49ead3889b076558a77990262261d7cc22597f63363bd9d5983d4c96bbadfaf` |

Builder завершил delivery/postchecks/docs. **tokenReleasedByLead=true** по последующему уведомлению Lead; запись `TOKEN_RELEASE_NOTIFICATION.json` в local E delivery output хранит источник и время наблюдения уведомления, которое не выдаётся за точный timestamp release. Исторические raw server receipts с tokenHeldByLead=true отражают своё время и не переписывались. Дальнейшие server writes/reload по этому token запрещены и не выполнялись.

Lead также сообщил, что обе последующие QA попытки увидели login redirect; canvas/actual JS MIME/runtime PASS нет. Полные postpublication reports ведёт Lead, их ожидание Builder не поддерживает. P2 не закрыт; local docs commit/push завершает checkpoint.
