# P3-frozen-01 — фактическая доставка

28 октября 2026, Europe/Kyiv. `release-engineer-r4d-p3-masks-01`.
**PUBLISHED_DELIVERY_VERIFIED_WITH_AUTH_LIMITATION**

**https://superflight.space/review/r4d/p3-masks/**
Каталог: https://superflight.space/review/

Опубликован ровно принятый CTO **частичный исследовательский результат**.
Не full visual/art PASS и не полное исполнение визуальной цели. MAP-01:
общий P1 mapping left-5, seed2818447218/t612 — ранний отскок от видимого
свободного пола. Плохой повтор сохранён; caveat указан в карточке и manifest.

## Разрешение и exact bytes

Единственный token `CTO-P3-F01-20261028T064706Z-ddfe257b6856`, выдан
2026-10-28T06:47:06Z. Intent лично принят CTO на
`ddfe257b68563183fc64b1b678b4cd1bf06e7aca`:
[INTENT_FROZEN_01.md](INTENT_FROZEN_01.md).
P2 находился в server_write=false/hold; окно выделено только P3.

| Источник/артефакт | Exact identity |
| --- | --- |
| CODE | `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74` |
| ART | `f899a308aed156a11e2a1013292ed68c6669959d` |
| Frozen file-manifest SHA256 | `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f` |
| Release manifest | `381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937`, 107213 bytes |
| Tar.gz | `23a3df76a29b05d8cc7ea17ff1cf0e9e360848a540f15386d26e1a85998f463c`, 80568959 bytes |
| TQA | `c0db64fe4a0204d77be0d3ab61ffe21331d9c90a` / `technical-qa/TQA_REPORT_FROZEN_01.md` |
| VQA | `0f282b89a5d58f6613153ceb385657c8fb761b1d` / `visual-qa/REPORT_FROZEN_01.md` |

Frozen P3 —76 payload files/3388537 bytes,51 masks; с собственным manifest
77/3401352. Ничего не пересобиралось/не исправлялось; предметная QA не
повторялась. Пакет соответствует exact intent, не последующему branch HEAD.
Полный versioned [RELEASE_MANIFEST.json](intent-frozen-01/RELEASE_MANIFEST.json)
побайтно соответствует доставленному.

## Guards и единственное переключение

- Fresh host/VPS resources и полный prewrite guard07:02:41UTC:
  baseline473 files/71dirs, root:root/files0644/dirs0755, symlinks нет;
  new root/backup/temp отсутствовали. Повторный полный guard непосредственно
  перед первой записью07:06:21UTC совпал; backup создан07:06:22UTC.
- Шёл один upload session63823. После capacity-сбоя модели Lead возобновил
  эту же роль; read-only проверка собственного STATE/token/progress подтвердила
  владение и продолжение прежней session. Повторной передачи/смены модели не было.
  Upload завершился07:25:42UTC, exit0, серверный SHA256/размер точные.
- Staging07:27:20UTC:550 files/79dirs,549 browser files/88602877 bytes;
  с manifest550/88710090. Полные inventory/hash/size/ownership/modes совпали.
  471 прежний browser-файл неизменён. Только карточка/счётчик2→3 в каталоге,
  плюс77 P3 files; прежние releases сохранены.
- Перед switch повторены старый baseline и exact новое дерево/архив/rollback.
  Snapshot освежён **2026-10-28T07:28:49.037213+00:00**.
- Единственный atomic switch: **2026-10-28T07:28:49.094847+00:00**,
  **09:28:49 Europe/Kyiv**. `nginx -t` до/после прошёл, выполнен только
  graceful `systemctl reload nginx`. Rollback не требовался и не выполнялся.

New root: `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`.
Live Review-snippet SHA256:
`c67b27e4b179dfe3cb803268435b7558b0c48b8ea8b1018ec709149511be1ba8`.
Root-normalized config SHA256:
`1ed5f62aafffd08ff9359fc4b615139006fc2e0e3cbf152b0363b6d0dcb7230f`.
После нормализации единственного root остальные exact bytes прежние;
auth/MIME/security/прочие vhost/services/containers/публичные ports не менялись.

## Postchecks и существенное ограничение

В07:30UTC полные новый и старый inventory/hash/size/modes/ownership повторно
совпали, nginx active. Завершены **95 публичных HTTPS requests**:

- 93 штатных auth303: каталог, P3 route, все77 новых файлов и14 старых R4D routes;
- foreign Origin403 и dotfile404;
- выбранные защитные заголовки этих ответов побайтно/по значениям прежние.

Это проверка доступности защищённых путей и прежнего auth-поведения.
**Auth303/login HTML не доказывают JavaScript MIME/body или authenticated UI.**
IAB показал обычный login, разрешённой авторизованной сессии нет. Вход,
cookies/credentials не добывались; post-auth JS MIME/body/navigation/canvas
остаются непроверенными. Пять browser modules сохранены как frozen `.js`;
global MIME settings и продукт ради smoke не менялись. Локальные независимые
QA остаются основанием предметной оценки тех же bytes.

В первом route-checker относительные catalog href не вошли в выборку;
исправлен только свой checker и отдельно выполнены14 оставшихся checks
к07:32UTC. Новые payload checks не повторялись, продукт не менялся.
Содержимое чужих карточек/продуктов и P2 QA findings не исследовалось:
старое дерево использовалось как opaque baseline, из каталога извлечены
только route href для проверки защиты/сохранности.

## Фактический rollback и серверная документация

Backup: `/opt/superflight-studio/backups/review-p3-frozen-01/`.
В нём `review.locations.conf.before`, `candidate.tar.gz`, `STATE.json`,
`PUBLISHED.json`. Before-snippet SHA256:
`d8cf0b3cd5a56241dc86562705daab81da09c648ad1aba8adcf232be2eb23104`.
Прежний root `/srv/superflight-review/releases/p2-jungle-static-candidate-03`,
manifest SHA256
`171a889a53da529d2a668da9811b3f6a9661cdc52ab54a46e254900553cfed35`.

При новом конкретном распоряжении/разрешённой необходимости rollback:
сначала проверить current P3 root и snippet hash c67b27e4…be1ba8; вернуть exact
before-snippet через объявленный
`/etc/nginx/snippets/.review-p3-frozen-01.locations.conf.tmp` и atomic replace,
`nginx -t`/graceful reload. Позднее чужое изменение не затирать; DB/сессии и
чужие services не откатывать, immutable releases не удалять.

Append-only records выполнены **07:34:21UTC**:

| Файл | SHA256 после записи |
| --- | --- |
| `/home/sf/assistant-context/vps/services/superflight-studio.md` | `f0fcd3a137ea8eee3006952764c45f322b38f68e62a7b9affe2ea8ebfdf96c59` |
| `/home/sf/assistant-context/vps/CHANGELOG.md` | `f7af707f9d0228371b7fc0fb93d4b65e61efc1dd489df527a1e4da111e08dd30` |

Final server STATE/PUBLISHED readback совпал; SHA256 обоих:
`1fcb590f6248f1aff30e992f5c3f4c637464902ff6fed20ddd647d9e156a4930`.
Это конечные собственные metadata данного исполнения; token повторно не запускать.

## Ресурсы, evidence и handoff

System-wide host перед первой записью07:05:52UTC: RAMfree10.843/31.907GiB,
CPU9%, C/D/Efree8.238/16.322/33.267GiB. Перед staging07:26:48UTC:
free10.715GiB, CPU5%, C/D/E8.229/16.322/30.488GiB. Оценка добавочного
peak≤0.5GiB; наблюдаемое суммарное использование с P2/Millionko плюс release
≤21.692GiB при этом snapshot, не гарантия чужого будущего роста.
VPS перед записью MemAvailable5077737472 bytes,4CPU/load0.62, diskfree≈30.63GB;
после checks MemAvailable5324664832 bytes, diskfree≈30.46GB.
Тяжёлые temp/cache/output — только собственный E runtime, env process-local.

[DELIVERY_EVIDENCE.json](DELIVERY_EVIDENCE.json) содержит actual phase outputs
и ресурсы без secrets/config contents. Source операции:
[execute_frozen_01.py](execute_frozen_01.py), [remote_frozen_01.py](remote_frozen_01.py).
Raw сохраняются в
`E:\R4D\perspective\p3-runtime\release-engineer\delivery-p3-frozen-01`;
исходные immutable/raw assets сохранены.

Своя IAB tab1 закрыта, все свои exec sessions завершены, servers не запускались.
Чужой Builder preview PID112732 не трогался. Новые QA/build/эксперименты,
UGH/P4–P6 и новые сессии/персонал не запускались. Policy denials не было.

**server_write=false после завершения исполнения.** Delivery handoff готов
Lead/CTO; окно/слот/token освобождает только CTO. Наличие опубликованного
частичного результата не превращается в полный visual/art PASS.
