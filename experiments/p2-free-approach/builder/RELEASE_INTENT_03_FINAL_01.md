# P2 candidate-03: final local gate-packet 01

28 октября 2026. **FINAL_LOCAL_READY_AWAITING_EXACT_LEAD_GATE_AND_SINGLE_CTO_TOKEN**. Минимальная финализация по указанию Lead: фактические новые03 TQA/VQA отражены в release manifest и intent; статус FRESH_QA_PENDING удалён. Полного Technical QA/artistic PASS нет; limited runtime/visual-unverified сохранён. Server writes/upload/staging/mkdir/root switch/reload=0; exact gate/token=false.

Каталог: `E:/R4D/perspective/p2-runtime/output/p2-review-release-intent-03-final-01/`. Source candidate-03 `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`; frozen tree SHA256 `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`;15 files/2448161 bytes. BUILD_MANIFEST SHA256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`. Эти15 files и BUILD_MANIFEST не менялись и не пересобирались.

## Exact final files

| Файл | Bytes | SHA256 |
| --- | ---: | --- |
| `RELEASE_INTENT.json` | 11913 | `50b99bf62cb40ea579fbe4346f68e64ca42ea854b09514fbd0ddc0e2b7744f2c` |
| `patch/RELEASE_MANIFEST.json` | 100094 | `171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35` |
| `release-patch.tar` | 2580480 | `a63433f59c5ec84c15a627938d394101810c89843544738e9171d2852918faae` |
| `patch/review/index.html` | 11371 | `84a652cdf90b42416ebfb2c61fc9d02babd19e9bb2905cc2d0451507e7610a4d` |
| `review.locations.conf.next` | 1084 | `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` |

Полный planned browser tree: **472 files/85200941 bytes**. Transfer USTAR17 regular files содержит только полный RELEASE_MANIFEST, прежний catalog03 и15 exact frozen03 files; QA copies/evidence/check/script/snippet остаются вне transfer/browser tree. Архив прочитан обратно, все members сравнены с patch bytes, absolute/traversal/symlink entries отсутствуют. `FINAL_LOCAL_CHECK.json` содержит packaging receipts и список сохранённых условий.

## Фактическая новая QA

- TQA commit `3861384dd37ffd224bfabee707f7fdc478c95728`, report `experiments/p2-free-approach/qa/technical/candidate-03-REPORT.md`, turn `01a17fe3-6f9c-73d0-a462-f6b2cf137f95`. Report Git blob `63072475a5d2392dbcfcd5d5f50443c59e8ba414`;13577 bytes SHA256 `725b5327cf25e8f7e8482efbbad0c87020d3d0fa09d54e4c10b43abc323f7170`.
- Вывод TQA: offline-инварианты подтверждены в описанном объёме, новых code blockers там не найдено; замечание к сканеру02 закрыто.15 exact files,5 `.js` parse/link,3909 состояний seed1/490822599 с replay/seek/ticks; оба LOST (ticks1735/2172), IN_BUCKET не наблюдался. Полный Technical QA PASS не выдан.
- Технический evidence:76503 bytes SHA256 `0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41`, recorded UTC `2026-10-28T00:25:29.227Z`. Собственно проверены размер/hash существующего evidence, выполнения runner повторно не было.
- VQA commit `28881ee9c0470a3cbabbba56de82b09d35de862b`, report `experiments/p2-free-approach/qa/visual/CANDIDATE_03_STATIC_AND_ACCESS.md`, turn `01a17fe3-75b8-71c0-aad5-3ad49ae643a1`. Report Git blob `2ed2ab2e5e29c55566eeb7181d7b1782b2e17ff3`;7401 bytes SHA256 `989a23bb78d943f0f22d4bf20089a0c8eb2a8d747781b6d15e8f7a27aa3a2e35`.
- Вывод VQA: **RUNTIME_VISUAL_NOT_OBSERVED**. Подтверждены exact03 identity/PNG/config и четыре прежние накладки. Собранная сцена/движение/перекрытия/тени/UI/Pixi/download не наблюдались; artistic PASS не выдан.

Полные оба reports прочитаны адресно через exact Git commits. Их byte-exact copies и технический EVIDENCE сохранены для локального review в `qa/technical/` и `qa/visual/`; SHA256 указаны в intent. Release manifest ссылается на exact QA commits/report blobs/turns/evidence hash, не утверждая публикацию этих operator-файлов на сервер. Старые02 results остаются проверенным baseline, их PASS не переносится.

## Только QA/bookkeeping относительно предварительного03

- `patch/RELEASE_MANIFEST.json`: только actual03 QA records/ограничения и bookkeeping metadata; опубликованный file list472/bytes/hash не изменён.
- `RELEASE_INTENT.json`: final status, actual03 QA/report/evidence receipts, новый local directory и необходимые manifest/archive receipts.
- `release-patch.tar`: изменён только вследствие новых metadata полного manifest. Catalog11371 bytes SHA256 `84a652cdf90b42416ebfb2c61fc9d02babd19e9bb2905cc2d0451507e7610a4d` и prospective snippet1084 bytes SHA256 `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` сохранены.
- Все предварительные03 файлы, frozen03/browser15/BUILD_MANIFEST, write-set/newroot/rollback/temp target/guards/postchecks/permission flags проверены неизменными. Предварительный каталог `p2-review-release-intent-03/` и его archive/intent — история, не перезаписаны.

## Условия адресного gate

Прежние targets: new root `/srv/superflight-review/releases/p2-jungle-static-candidate-03`, rollback proposal `/opt/superflight-studio/backups/review-p2-candidate-03-20261028T002536Z`, temporary snippet `/etc/nginx/snippets/.review.locations.conf.p2-candidate-03.next`. Declared write-set и root-only snippet полностью прежние; никакой дополнительной серверной записи QA-файлов не добавлено.

Expected baseline — live root `/srv/superflight-review/releases/fd851ad78adfec67c11ed59f07fa24dbef2761c6`, full manifest SHA256 `9c6159e21fd655b86525a8b19427b6fe650318c28c899cd5f10da761c2b62b5c`, snippet SHA256 `544233b893c860cbe993a952232211b0a8641df6482f42815ec680d2cd23c7d4`, catalog SHA256 `584aa3f83c2264e349a3ee66ba7f2b376f22737ed5160f72873a597ad3f79247`. Это сохранённый snapshot `2026-10-27T23:45:35.751840Z`, не свежий серверный guard. До любой записи после exact gate/single token требуется новая полная сверка live baseline и отсутствие targets; при несовпадении остановиться. Fresh rollback снимается при исполнении перед switch с actual UTC.

Фактический HTTP200/JavaScript MIME, браузер/DOM/Pixi/движение остаются непроверенными. `.js` mapping даёт prediction; только четыре occluders покрыты, остальные21/ограда/бортики нет. Limited publication не закрывает P2 и не является финальной приёмкой. Отказанные launcher/file-preview не повторялись, новых browser/runner/service/port не было. Минимальная локальная упаковка на E с process-local temp и отключённым Python bytecode; C7.713070/D16.304302/E31.460545 GiB перед ней, объём менее10MiB диски не исчерпывал. Cleanup/global/security/auth/credentials/permissions не менялись.

Пакет готов для сверки Lead и запроса единственного CTO token. Builder завершает checkpoint без активного ожидания и без самостоятельной публикации.
