# P1 PUBLIC delivery: HTTP/inventory подтверждены, Root VQA ожидается

Фаза **AWAIT_ROOT_VQA_DOCS_PENDING_LOCK_HELD**.
CTO gate выдан 2026-10-28T14:53:26Z; существующий single-use token использован
этим же Builder/ReleaseEngineer при первом lock write. Второй token не создавался.
Literal token хранится только в private E operational receipt, не в Git/public.
Окно CTO **не освобождено**. Документы VPS ещё не дополнены: по поручению ждут
фактический результат назначенного Root VQA. Lock удержан с тем же nonce/inode;
точная ownership/state сохранена в private `OWNERSHIP.json`.

Адрес **для actual PUBLIC VQA**:
https://superflight.space/review/r4d/p1-mapping-report/ .
Статус готовности страницы/desktop/mobile/render пока не заявлен.

## Собственный checkpoint и первый fresh guard

Стартовый свой checkout clean `f0c172f415731bdf1c2f31f9ff8769570eaa8ab9`,
`E:\R4D\perspective\p2-worktrees\builder`, branch
`codex/r4d-p2-free-builder-01`. Reset/clean/model/actor/session/worktree/device
changes не было. New execution output был свободен до создания:
`E:\R4D\perspective\p2-runtime\output\builder\p1-static-report-execution-01`.

Первый completed **read-only** guard:
2026-10-28T15:03:09.149051Z–15:03:10.526411Z.
Проверены exact raw snippet/vhost/globalMIME/approved docs, root/catalog/P2,
полный550-files+dirs inventory/bytes/SHA/modes/owners/no symlinks, восемь targets
absence и ancestors. Все сравнения совпали с bound14:15 expected snapshot.
Actual guarded values, а не dated snapshot, послужили разрешением первого write.

Host snapshot15:02:51 UTC:31.907GiB RAM/free18.491GiB, CPU2%; все C/D/E>4GiB.
Aggregate planned RAM17.616GiB включает allowance роста P4/Millionko4GiB и
own0.2GiB; allowance E2GiB+own0.1GiB — план, не измеренный будущий чужой peak.
VPS: memory available5339029504 bytes, CPU7.92%, free disk30438019072 bytes.
Stage/switch повторили host snapshots и fresh VPS resource guards. Порог4/2
соблюдён, temp/output/cache только process-local E; чужие процессы не трогались.

Private `FIRST_GUARD.json` SHA256:
`2f0184edc3184846d608e31da6259f55d25a1c6f431bed27ab842400b1f04c9e`.

## Реальные write phases

Перед первым write guard повторён **15:06:57.981557–15:06:59.242017 UTC**.
15:06:59.251566 UTC собственный exclusive lock получен. Под lock ещё раз
проверены raw guards; созданы только declared backup/upload/staging targets.
Скопирован exact old root отдельными inode без symlinks/hardlinks, наложены
только14 разрешённых tar leaves. Полные562 files/dirs/SHA/bytes/modes/owners
совпали с planned inventory; old550-file root повторно неизменён.
15:07:06.086887 UTC выполнен no-replace atomic staging→newroot rename.

New immutable root:
`/srv/superflight-review/releases/p1-mapping-report-candidate-01`.
**562 files/90770774 bytes**, tree SHA256
`0e6c8f857cf60a77f7383580a87b243c2204e127095c26512fbefeec020a65b7`.
14-leaf archive2191360 bytes SHA256
`b66db602929b95bb0d3f8a5a22e90f90a38d14ca7bbe93ca8702cc0a9dd3858f`.
Все548 opaque inherited records сохранены побайтно. P2 live03 не заменён04.
Frozen P1:12 files/2057712 bytes/tree88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7,
BUILD_MANIFEST00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c
не менялись/rebuild/extract/generate не было.

Непосредственно перед switch: phase-aware raw guards и full old/new inventory
повторены, fresh exact PUBLIC before snapshot обновлён в declared backup,
nginx-t до изменения прошёл. **15:08:16.715563 UTC** snippet атомарно заменён:
before948/d264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598 →
after953/289c2de9aa8c535a7755d94d4e69b4368ae82ea154c148449eec9d98467e2bd8,
только exact root literal. auth_request не возвращался, PUBLIC security bytes,
vhost/globalMIME/credentials/auth unchanged. После switch выполнены nginx-t,
graceful reload и active check; switch не повторялся, rollback не выполнялся.

## Неуспешная первая проверка и actual-state continuation

15:08:16.851622 UTC первый GET-check `figures/01-native-floor.jpg` сразу после
reload вызвал обычный assertion `PUBLIC byte/status mismatch`.
Сам первый status/body не был сохранён harness перед assertion — ограничение
этого первоначального receipt, не доказательство конкретной причины.
Это **не tool/policy denial**. Причина не доказана; reload race — только
возможное объяснение, не установленный факт. Source/runtime не исправлялись,
upload/backup/rename/switch/reload не повторялись, token повторно не применялся.
Состояние EXECUTION_STOPPED было записано с live after-snippet/owned lock.

Продолжение выполнено только как phase-aware actual-state read/HTTP verification
того же nonce/inode: live snippet exact after, oldroot intact, newroot exact
planned, vhost/MIME/docs raw unchanged, declared temp leaves отсутствуют,
owned backup/upload exact. Текущие nginx-t и active повторно прошли.

**15:10:44.016683 UTC actual PUBLIC postchecks PASS в bounded delivery scope:**

- `/review/`200,12702 bytes/SHA
  `bec395e0940223f0f2f3549a1726e9d61abb862e713ede1b2fab995e32d10581`;
  одна P1 card/count4 материала, остальные catalog bytes сохранены.
- Все12 P1 files200, exact bytes/SHA и HTML/CSS/JPEG MIME; no-store/noindex/
  nosniff/same-origin/DENY headers соответствуют PUBLIC baseline.
- Полный562-file tree exact planned;548 inherited unchanged; old550-file root
  intact; P2 current03 public200/body
  `8bebd1f5587764f7504bb5c179f51abdf8f5b576e01a9542d2707e806354c32a` unchanged.
- Vhost35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8 и
  MIME6f95d1d7d75e3c072907d845622a69d23110d1266c16ff122b3109b8b21f3ae9
  exact unchanged; approved docs ещё exact original owners/modes/bytes.

## Private evidence и дальнейшая работа

Server evidence:
`/opt/superflight-studio/backups/review-p1-static-report-01/`.
Exact verified local copies — `.../p1-static-report-execution-01/evidence/`:

| Receipt | bytes | SHA256 |
|---|---:|---|
| BASELINE_GUARD.json |4684|`5ebee0de9b7bb1eb1aa18ee41fe53539a9c8214cba17ea98ba8ef22010eb5d2e`|
| PAYLOAD_CHECKS.json |792|`9084e3e45643c471476e8eb82d8863e4de6c1726fb2a485f21204ce5289cff70`|
| PRE_SWITCH_GUARD.json |5156|`386e8438f63945d7592ab84fad64a002c421998b1bc7465ee18e6854e4038946`|
| POSTCHECKS.json |17723|`491c3e0c4d504f3f5beea2fd1cb7bce7e2200fc7f2b0660ff73bd7f4e0af306c`|

Local complete HTTP/guard result `POST_DELIVERY_RECHECK.json` SHA
`e46d0fed438a0a975438035a0ae31b5858212c2930d874c4f4c4f2b21617e181`;
initial `switch.result.json` SHA
`4249a517cf52a2d4b2c2edd930eb0b38a8460188edee83c26dca4644ef017cb6`.
Ownership and literal authorization receipt остаются private E, не в public/Git.

Root теперь назначает existing VQA только actual PUBLIC HTTP page desktop/mobile:
читаемость, captions/figures, full JPG/backlink, clipping/page overflow. Пока
**PAGE_RENDER_NOT_OBSERVED**, без full visual/physics/art PASS. Старый denied
file-URL call не повторялся и не обходился, новых tool denials нет.

После actual VQA результата — та же Builder/ReleaseEngineer сессия продолжает
docs phase: сначала latest+actual-state/owned nonce/inode и fresh raw doc guards,
затем только bound append templates с фактическими результатами, uid1003/gid27/
0640 и exact прежними prefixes, private render/docs receipts. Только свои
matching temp/lock можно завершить; immutable releases не удалять. CTO окно
может освободить только отдельно, это промежуточная передача не release окна.
