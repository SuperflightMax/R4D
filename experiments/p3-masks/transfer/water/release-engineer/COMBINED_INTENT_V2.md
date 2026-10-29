# P3 Water + Dark — combined intent v2

29 октября 2026. **WAIT_V2_REVIEW_EXACT_CTO_TOKEN · server_write=false · token=null.**
Это единственный минимальный successor publication correction к
[immutable v1 intent](COMBINED_INTENT.md), reviewed source `fdac2e9ba909a034a4ad176d11a438a04dc78ccc`.
Публикация v1 не состоялась. Старый token `CTO-P3-WD04-20261029T142713Z-ae0b1054d192`
**закрыт CTO 2026-10-29T14:36:01Z и не применяется**; файл authorization сохранён
исторически. Окно RESERVED P3, распоряжается CTO. Нового token/authorization нет.

## Единственный source delta

[Точный diff](combined-packet-v2/V2_CHANGES.patch):
- `combined_remote_v2.py`: `http.client` импортирован как `http_client`, helper
  вызывает `http_client.HTTPSConnection`. Остальные write-logic/guards неизменны.
- `combined_execute_v2.py`: читает `combined_remote_v2.py`, пишет только будущие
  LOCAL receipts в `execution-v2`. Server paths/phases/guards не изменены.

V1 files `combined_remote.py`, `combined_execute.py`, `COMBINED_INTENT.md`,
`combined-packet/PACKET_INDEX.json` и весь v1 packet побайтно сохранены.
Old failed `execution/preflight.json` и все stop receipts оставлены на месте.
Ни remote-v2 run/phase, ни launcher-v2 не исполнялись; `execution-v2` отсутствует.
Сделан syntax check и только выделенный offline helper regression.

| New binding | Bytes / SHA256 |
|---|---|
| `combined_remote_v2.py` | 15565 / `8dc3a6a933a0a95dc627d7352772d54cc0f64afc0d91a6ff603d5f209b559ec8` |
| `combined_execute_v2.py` | 5550 / `630c8b26a4b1eda85353d6dc66751fa9e0eee3ff8bce2b50957d224c5de13667` |
| `test_combined_http_v2.py` | 6568 / `e15c5c9cb9b2f6097dcdce06e2dc3e7791caf5f0582656bec0daf4b12e7d49a8` |
| HTTP helper regression receipt | 2717 / `4f087f98f9d97f1b3d1513c1a6393ccdde615152e2d727e968363d92d44c185e` |

[PACKET_INDEX_V2.json](combined-packet-v2/PACKET_INDEX_V2.json) связывает новые
источники, этот intent, diff, test/receipt и неизменные artifact/guard refs.

## Ошибка v1 и осмысленная локальная проверка

V1 preflight начат14:31:55.7726602Z, exit1: `'function' object has no attribute
'client'`. Nested function `http` перекрыла imported module; ошибка до первого
HTTPS запроса/первой server write. [V1 RESULT](RESULT.md) и
[checkpoint](execution-2026-10-29-preflight-stop/EXECUTION_CHECKPOINT.json).
Это Python implementation error, не policy denial. Старую фазу не повторяли.

[Test](test_combined_http_v2.py) извлекает actual nested helper из AST каждого
source, сохраняя lexical binding имени, и подставляет offline HTTPSConnection.
V1 воспроизводит точный AttributeError до создания stub connection. V2 проходит
GET/headers/303normal/403Origin/404dot, собирает все7 response headers, читает
body и закрывает connection. Проверяется точное совпадение source diff с только
перечисленными replacements. [Receipt](combined-packet-v2/HTTP_HELPER_REGRESSION.json):
**PASS 2026-10-29T14:39:16.822169+00:00**. Сети/SSH/phase preflight в тесте нет.
Это не реальные HTTP postchecks и не post-auth verification.

## Неизменные release bindings

Release `p3-water-dark-front-edge-04`; [WRITE_SCOPE v1](combined-packet/WRITE_SCOPE.json)
SHA `aff5355dcb376ab1edef8d45455c391bb5b1099f77a7ee07240f6efe11097959`.
Archive4495459bytes SHA `0cee1516db37cb2ac8a38fec54214c47483f8bea755a71dbd0d04a244b3c9fbb`.
RELEASE_MANIFEST216459bytes SHA `e8a801faf58b670fd2b2cb7ba1c327d20c025593c75881915ae7d211f2fcf3f3`.
V1 packet index SHA `ae0b1054d192d05d78c91579239c942ded90682df8777ef6bf166ad0df782ecd`.
194 frozen files/7088324bytes,196 regular overlay files +18directories =214tar members.
Archive/scope/manifests/frozen bytes не пересобирались и повторно не генерировались.

Water `water-front-edge-04`: Technical PASS / Visual PARTIAL; W-DIVIDER-01 OPEN.
Dark `dark-receiver-front-edge-04`: targeted Technical PASS / overall Visual PARTIAL.
Все independent source/art/assets/QA/recipe refs — прежние
[BOARD_PUBLICATIONS](combined-packet/BOARD_PUBLICATIONS.json). Public оба PARTIAL.
Будущие URL https://superflight.space/review/r4d/p3-masks-water/ и
https://superflight.space/review/r4d/p3-masks-dark/ не опубликованы этим запуском.
Post-auth JS MIME/body/UI UNVERIFIED; product QA/native/build не повторяются.

## Сохранённый RO stop guard и server write-set

[Guard reference](combined-packet-v2/STOP_GUARD_REFERENCE.json),
**2026-10-29T14:33:29.493371+00:00**, euid0: old root
`/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`,
674files/88dirs/122587862bytes; metadata
`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`,
manifest `b54342562a030361fb705d63b52750018956ea3cdfea204450f48a6bbeced9c5`,
snippet `e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`.
New root/backup/temp/live sibling prefixes absent. Remote archive absent,
поскольку лежит внутри доказанно отсутствующего backup parent; это derived
absence по тому же guard, а не новый audit. V2 не выполнял remote calls.

Future new root `/srv/superflight-review/releases/p3-water-dark-front-edge-04`,
backup `/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04`,
temp `/etc/nginx/snippets/.review-p3-water-dark-front-edge-04.locations.conf.tmp`.
New snippet950bytes SHA `f7948d10efb040e83c15d86df26866aed9a5a90eb53bf85c7fd0206c05d1200e`.
Fullnew868files/104dirs/129749260bytes, metadata
`71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65`.
672 foreign files/88baseline dir rows с actual metadata и77 Jungle hashes
сохраняются; catalog только2PARTIALcards/counter6→8. Все exact paths/guards,
root-only atomic switch/nginx-t/graceful reload, scoped docs append и guarded
rollback — прежний reviewed v1 intent/scope. Auth/globalMIME/services/ports/
credentials/foreign processes не изменяются.

## Следующая граница

После полного чтения Lead/CTO необходимы **новый exact token на v2 script/launcher
hashes и отдельная execution-команда**. До этого server_write=false, token=null.
Новая execution должна заново проверить fresh host/VPS resources, actual euid0,
полный baseline/targets до begin; никакой старый preflight/guard не подменяет это.
Непосредственно до future document — RO opaque stat/size/SHA двух docs targets;
после append — старые byte-prefix SHA и inode/uid/gid/mode. Требование CTO
сохраняется отдельно от неизменной write-logic; docs contents не раскрывать.
217 unauth HTTP checks не доказывают post-auth JS MIME/body/UI. No bypass.

Local resources14:38:28UTC: RAMfree15.167/31.907GiB, CPU4%,
C/D/E15.567/16.237/10.910GiB; added estimate<=64MiB RAM/1MiB disk.
[Resource receipt](combined-packet-v2/HOST_RESOURCES.json). Всё own E/process-local
TEMP/TMP. E<=4GiB diagnosis,<=2 checkpoint/stop. Cleanup не выполнялся.
После commit/push и exact handoff — полностью idle. Window/token/slot закрывает CTO.
