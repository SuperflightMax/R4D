# P2 candidate04: read-only delivery preflight 04-01

28 октября 2026. **READ_ONLY_COHERENT_BASELINE_READY_FOR_FUTURE_QA_FINALIZATION**. Адресный новый read-only preflight после freeze04, пока targeted independent TQA04 идёт. Это не release gate/token и не резервирование shared окна. **Server writes/upload/staging/mkdir/root switch/nginx reload/rollback=0; token not issued; final release intent/manifest/archive не готовились.**

Local output: `E:/R4D/perspective/p2-runtime/output/builder/review-preflight-04-01/` (перед началом отсутствовал). Existing alias `vps1-direct`, прежние BatchMode/ConnectTimeout15, только Python-B read/check. Никаких SSH config/keys/credentials/host-key/permissions/settings изменений, old launcher/scripts/browser/логина не было. Initial source HEAD083e4cfadff30c8d63c6806ccd7835dd4f137e90 clean; это не build HEAD04.

## Fresh coherent baseline

Root извлечён из actual snippet, не подставлен как ожидаемый03. Begin **2026-10-28T06:33:02.089604+00:00**, end **06:33:03.097066+00:00** (08:33:02–08:33:03 Europe/Kiev). Root/snippet/manifest/catalog SHA до/после совпали. Между этими чтениями проверено всё фактическое browser file set. Это coherent snapshot, не обещание будущего состояния; если shared/P3 release произойдёт позже, final intent не строится на старом sample.

| Факт | Actual |
| --- | --- |
| Live root | `/srv/superflight-review/releases/p2-jungle-static-candidate-03` |
| Review snippet SHA256 | `d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104` |
| RELEASE_MANIFEST |100094 bytes / `171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35` |
| Browser tree |472 files /85200941 bytes|
| Catalog |11371 bytes / `84a652cdf90b42416ebfb2c61fc9d02babd19e9bb2905cc2d0451507e7610a4d` |
| File verification | all472 paths/bytes/SHA256/root:root files644/dirs755 exact, errors0/symlinks0 |
| Live P2 subtree |15 files/2448161 bytes, exact frozen03; frozen04 пока не live |

Все прочие456 browser files, остальные cards/routes/counters должны сохраняться побайтно при будущем P2 обновлении. Чужие/P3 implementation/art/recipes не изучались и не использовались: возвращены только shared published path/bytes/hash/mode metadata. File bytes читались исключительно для checksum; не сохранялись как чужие исходники/ассеты. Другие поля полного release manifest не retained; source provenance будущей доставки связывается exact previous immutable manifest path/hash.

Accepted P1 source input остаётся `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Shared delivery baseline03 не подменяет P1/physics/projection input. Frozen04 source08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a/tree60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed/BUILD_MANIFEST60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7 и old03 manifests не менялись.

## Runbook refresh и безопасные baseline checks

Staff/R4D ReleaseEngineer роли ранее прочитаны полностью на e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3/ec090addd2f261b4f4f2b5abd8c742df4672d115. Все4 mandatory server docs побайтно совпали с уже полностью прочитанными версиями (service doc включая фактический append03); изменившихся инструкций нет. Старые исторические roots в docs не приняты за live.

| Approved document | Bytes | SHA256 |
| --- | ---: | --- |
| `/home/sf/assistant-context/vps/INDEX.md` |15577| `e925b847f4cf1bb747a68817f7a2755a58c39efccee724ce967649bd65f62064` |
| `/home/sf/assistant-context/vps/PROCEDURES.md` |5146| `34fb7d9ac43a8b234a86bb6272b23a329afda28b9a1adf4dbf1fda3a56728bc9` |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` |61049| `8f7f857d1f12510af3f2c91ab7169fe6d6af8a9963e70a34e405aecd3130efb4` |
| `/opt/superflight-studio/README_RU.txt` |10915| `7b4e78bcd3bda70daa7ed4203d28b8be367c51cb596c9f54db8ac366ed9f1cf9` |

Сняты только hashes/owner/modes8 ранее approved protected config/app/Compose paths — значения в PREFLIGHT.json. Содержимое vhost/auth/portal/MIME/credentials не выводилось и не правилось. Review snippet прочитан лишь для actual root/coherent hash, GET-only directive и root-only inverse proof.

Ordinary unauthenticated HTTPS **GET**, без redirect-follow/cookies/browser: `/review/` и текущий P2 route→303 на прежний login; foreign Origin→403; dotfile→404.403/404 содержат no-store/noindex/nosniff/same-origin/DENY headers.303 named login redirect не содержит Review-location headers, как уже записано в delivery03. `limit_except GET { deny all; }` найден в unchanged snippet; POST в этом preflight не отправлялся. Это security-preservation baseline новой delivery цели, не повтор login-only browser QA и не candidate04 HTTP200/Pixi PASS.04 ещё не опубликован.

## Минимальный draft delta, не final payload

- `/srv/superflight-review/releases/p2-jungle-static-candidate-04`: absent в данном snapshot.
- `/opt/superflight-studio/backups/review-p2-candidate-04-20261028T063302Z`: absent в данном snapshot.
- `/etc/nginx/snippets/.review.locations.conf.p2-candidate-04.next`: absent в данном snapshot.

Никакой target не создавался. Proposed rollback name использует время preflight; настоящего fresh rollback snapshot сейчас нет. Он снимается только непосредственно перед будущим отдельно разрешённым switch с actual UTC, protected hashes и before-copies; DB/sessions не читать/не копировать.

В памяти проверена только замена существующей P2card: candidate03→04 и добавление «замедление0,25×/0,5×/1×» к прежнему описанию повторов. Все остальные catalog bytes, число карточек и counters неизменны; exact inverse восстановил old bytes. Полный modified catalog или prospective snippet файл сейчас не создавались, только draft fields в PREFLIGHT.json.

| Draft field | Proposed value |
| --- | --- |
| New root | `/srv/superflight-review/releases/p2-jungle-static-candidate-04` |
| Catalog |11371→11410 bytes; delta+39|
| Proposed catalog SHA256 | `41db08d928b7540939485c965cff9fcc3437caf0a8368c96f54652730a003196` |
| Root-only snippet |1084 bytes / `6a3c830425d59b55f04af5d1ff9d3626bae8a96d51700e6a51ed54a69f8dcb56` |
| Planned count from this sample |473 files /85204840 bytes|
| Preservation |456 other files exact; current15 P2 replaced by16 frozen04; catalog only P2card changed |

Root-only inverse восстановил actual snippet без иных изменений. Это минимальное описание будущего write-set/root/catalog delta, **не сформированный RELEASE_INTENT.json, full planned RELEASE_MANIFEST или release-patch archive**. Standalone candidate04 transport из прежнего build handoff — другой уже существующий artifact, не новый release archive.

## Resources, rollback и следующий gate

Remote sample06:33:03.100478UTC: RAM total10.780GiB/available4.905GiB, load0.90/1.01/0.91 на4CPU, diskfree30636916736 bytes (28.533GiB). Current release allocated86605824 bytes; conservative future copy/archive/evidence peak268435456 bytes (256MiB), RAM128MiB помещался в snapshot. Это не будущая гарантия; после actual TQA/final gate ресурсы и source/delivery guards нужны свежие с учётом shared P3/Millionko нагрузок.

После actual04 TQA verdict и отдельного задания Lead final LOCAL write-set+manifest/archive готовятся один раз на актуальном coherent baseline, с exact QA records и честными UI limits. Если root/snippet/manifest/catalog/file set изменились либо target занят, остановить старый intent/proposal и сообщить Lead; не перезаписывать чужие changes и не выбирать alternate target под старым gate. При будущем execution нужен single CTO token, fresh full guards и snapshot directly preswitch; без этого server write не разрешён. Shared P3 может готовиться/выпускаться, P2 не имеет бессрочного приоритета.

Rollback только при совпадении будущего опубликованного snippet SHA и отсутствии поздних foreign edits: восстановить лишь fresh saved Review root/snippet, nginx-t/graceful reload. Old immutable releases/DB/sessions не восстанавливать/удалять; прочие apps/security/MIME/auth/firewall/permissions не менять.

## Local evidence

- PREFLIGHT.json: **218203 bytes**, SHA256 `1c98b26dc9af7918b53451680794b9d1200e1c3100439e3e32acc1b1e1dccf32`. Полный nonsecret snapshot, metadata/target checks/draft fields; immutable/raw assets не менялись.
- BASELINE_FILE_HASH_METADATA.json: **207925 bytes**, SHA256 `50d99638f4e9f9dd04dde33d168e0da4a34378110b89300417ba760be2c3e9a8`. Только shared file-hash/mode metadata; ни чужих recipes, ни raw full manifest content.
- SUMMARY.json и read-only collector sources сохранены рядом, новых server scripts/files не создавалось. Никаких новых policy denials.
- Browser/session/candidate04 HTTP200/MIME/scene не наблюдались. Read-only preflight не является Technical/art acceptance; P2slot1 не closed.

После bounded MD commit/push preflight checkpoint завершён без activewait. Следующий шаг — адресный actual TQA verdict/final local preparation scope от Lead, не самостоятельный выпуск.
