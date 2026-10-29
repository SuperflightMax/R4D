# P3 Water + Dark — canonical combined intent v3

29 октября 2026. **WAIT_V3_FULL_REVIEW_AND_EXACT_CTO_TOKEN · server_write=false · token=null.**
Отдельная LOCAL V3 задача CTO. Ни launcher/remote phase/preflight, ни нового
GET/IAB, ни третьей write-попытки сейчас не было. Fresh local `execution-v3`
подготовлен пустым. Нужны полное чтение Lead/CTO, НОВЫЙ exact token на v3
bindings и отдельная execution-команда. Окно RESERVED P3, закрывает только CTO.

V1 token CLOSED14:36:01Z, v2 CLOSED14:58:05Z; оба файла authorization и оба
failed journals/STOP receipts сохранены. V1/v2 source/intent/index неизменны.
[Preservation proof](combined-packet-v3/PREPARATION_PROOF.json).

## Принятый prospective baseline и provenance

CTO принял **только exact context** existing `vps1-direct`, HTTPS
`superflight.space`, UA `R4D-P3-combined-delivery/1`, no cookies/auth/redirects.
Тройка strict **200/403/404**, а не200-or303:
`/review/` normal; `/review/` с Origin `https://example.invalid`;
`/review/.p3-combined-probe` normal.

Все7 headers exact: Location=null; X-Frame-Options=DENY; Cache-Control=no-store;
X-Robots-Tag=`noindex, nofollow, noarchive`; X-Content-Type-Options=nosniff;
Referrer-Policy=same-origin; Content-Type=text/html.
[Measured status/header receipt15:03](diagnosis-2026-10-29-http/HTTP_DIAGNOSTIC_RECEIPT.json),
SHA `9378d75da13dd9c0f5b1712ac6b118a5fec768ede0a4d80ea4466a1f0f99fec4`.

[Exact opaque catalog receipt a42e](diagnosis-2026-10-29-review-body/BODY_DIGEST_RECEIPT.json),
[immutable source commit](https://github.com/SuperflightMax/R4D/commit/a42ebe2696909ae6491d233c5b40c1656dc371ab),
response2026-10-29T15:12:00.561904+00:00, SHA of receipt
`8234e8c1a523e6d30ac162e1c99728c3f96dd02c98bc796b9229549193691d86`: normal200
body exactly OLD catalog14511bytes /
`eb57e35bcebbe4a639b92c625f23de5efb90ae2c15da8a3996ca653fb61a6885`.

Это prospective фиксация существующего доступа в этом контексте, не изменение
auth/security, не восстановление точных ответов14:52 и не универсальная
security/auth приёмка. Историческое ожидание303 было перенесено без fresh
combined HTTP baseline; прежние материалы сохраняются как история.

## Concrete successor code/scope

[Exact code diff](combined-packet-v3/V3_CODE_CHANGES.patch),
[scope-only added metadata](combined-packet-v3/SCOPE_V3_DELTA.json),
[WRITE_SCOPE_V3](combined-packet-v3/WRITE_SCOPE_V3.json). Все original scope keys
сохранены с теми же значениями; добавлены version/provenance, prospective HTTP
baseline,197 payload URL bindings/resource policy и lawful UI-smoke policy.
Original WRITE_SCOPE SHA aff5355d…959 не редактировался.

| Binding | Bytes | SHA256 |
|---|---:|---|
| Remote v3 | 24459 | `6280d062adc4b4cf561980c8ecfd3439e1542561747219ddcd6833d8aa40add9` |
| Launcher v3 | 5694 | `3cf1852fcea0b83fa43a1a394d549cd2c263a49599319662201b5593d17bfd12` |
| WRITE_SCOPE_V3 | 131765 | `726cb8e2e568bb4ba4a5e89ee637f323acbfc03fb093cf626c03d9efc229a564` |
| Actual-function regression source | 11633 | `efe2f22c4d39d894aeb117933db09e77d66ff91ec14f9d040c50022be3a803bc` |
| Offline runtime-smoke receipt | 3993 | `c0a9775bd99e565f4bac6b0d74379e34363238ccbea428d5088558327be0fb30` |
| Exact code diff | 16036 | `876e4c7ac2085a6257afec185e9b38f7dffa8794633527181141063a3e4607c9` |
| Scope delta | 62146 | `5885cd92bde6a2caf2d13a0865673f9ceb5f3a4eb3a886deec43463d5cdffc9f` |

V3 launcher читает только scope-v3/remote-v3 и пишет local receipts только
`execution-v3`; закрытые исторические tokens явно отвергает. STOP JSON теперь
сохраняет actual HTTP evidence: path/context, UTC, status,7headers, streamed
bytes/SHA/completeness. Тела не сохраняются/не выводятся. Network error
останавливает последовательность с уже выполненными и partial observations;
нет retries/phase replay/transport fallback.

Preflight и begin выполняют strict200/403/404+все7headers и OLD catalog len/SHA
**до первой записи**. Fresh host/VPS/euid0/tree/absent-target checks из прежнего
intent остаются обязательными; исторический guard их не подменяет. Future
first-write deadline проверить по новому token непосредственно перед begin.

## Postcheck — прежние217, без дополнительных HTTP

После switch normal `/review/` обязан иметь NEW catalog15762bytes /
`fd4e28b8bfb1764e9d6623009d8f21c23eb1e5df59590effc42ced55f842beeb`;
Origin403/dot404 и все7headers exact прежние. Используется тот же normal GET
из original215paths +2Origin/dot = **217**. Нет нового запроса ради digest/MIME.

197 new/catalog/alias responses сопоставляются с exact approved payload hash/
length; сюда входят194 frozen files,2 sibling aliases/index и catalog.
10 JS modules проверяются на фактические bytes/SHA и JavaScript MIME
`application/javascript` либо `text/javascript` (charset не меняет base type).
HTML200 с чужим hash или access response303/401/403 = честное UNVERIFIED,
никогда JS/scene success. Exact JS bytes с неверным MIME = MIME limitation.
Другой non-HTML200 с неверным payload либо unexpected status, включая404 на
known new payload, = STOP с фактами. Normal catalog при любом body mismatch
= STOP независимо от MIME.

18 old routes получают observations в тех же217; для них нет выдуманного
auth303 baseline. Их old bytes/metadata строго защищены full-tree guard.
Outcome/doc append записывает actual status counts/payload/module results,
без hardcoded auth303 claims. Старый release manifest/history не правится.

Разрешённый CTO **future** lawful IAB short smoke двух sibling prefixes —
после нового token/switch, отдельная bounded UI evidence без полной native/QA
матрицы и без login/cookie/transport/access bypass. Недоступность или HTML/login
не засчитывается сценой. Сейчас IAB не запускался; UI/post-auth claims UNVERIFIED.

## Docs append proof и сохранённый write-set

Перед document append opaque snapshots ровно двух прежних targets:
`/home/sf/assistant-context/vps/services/superflight-studio.md`,
`/home/sf/assistant-context/vps/CHANGELOG.md`: inode/uid/gid/mode/bytes/SHA.
Original duplicate-token guard `auth['token'].encode() not in p.read_bytes()`
сохранён для обоих targets **до обоих snapshots**; prefix proof его не заменяет.
Before receipts сохраняются в own declared STATE/PUBLISHED до append.
После каждого append — SHA первых oldNbytes и прежние inode/uid/gid/mode;
любое расхождение STOP с opaque metadata evidence. Тела docs не выводятся.
Новых server paths/permissions/locks не добавлено. Если новый CTO token
дополнительно требует внешний RO receipt, выполнить его в exact scope.

Stage/switch/rollback/tree и foreign metadata guards AST-identical v2;
upload write logic unchanged. Guarded rollback только own-current-root/snippet
и bound before; поздние foreign edits не перезаписываются. New root
`/srv/superflight-review/releases/p3-water-dark-front-edge-04`; backup
`/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04`; root-only
atomic snippet switch/nginx-t/graceful reload и прочие exact paths прежние.
Никаких auth/global MIME/services/ports/credentials/process изменений.

## Immutable artifacts и verdicts

Archive4495459bytes SHA
`0cee1516db37cb2ac8a38fec54214c47483f8bea755a71dbd0d04a244b3c9fbb`;
RELEASE_MANIFEST216459bytes SHA
`e8a801faf58b670fd2b2cb7ba1c327d20c025593c75881915ae7d211f2fcf3f3`.
194frozenfiles/7088324bytes,196regular+18dirs=214tar members неизменны.
Fullnew868files/104dirs/129749260bytes, metadata
`71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65`.
Old baseline674files/88dirs/122587862bytes, metadata
`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`.
672foreign files/mixed ownership,88baseline directories и77Jungle hashes
сохраняются; catalog только две PARTIAL cards/counter6→8.

Water `water-front-edge-04`: Technical PASS / Visual PARTIAL; W-DIVIDER-01 OPEN.
Dark `dark-receiver-front-edge-04`: targeted Technical PASS / overall Visual PARTIAL,
coverage/shadow limits; prior fullTQA03 ранее выполнена. Все source/art/assets/
QA/recipe refs — unchanged [BOARD_PUBLICATIONS](combined-packet/BOARD_PUBLICATIONS.json).
Будущие protected URLs `/review/r4d/p3-masks-water/` и `/review/r4d/p3-masks-dark/`
этой LOCAL задачей не публиковались. Ни native/product QA, ни rebuild/frozen edits.

## Offline verification и остановка

[Reproducible actual-function test](test_combined_http_v3.py),
[offline runtime-smoke receipt](combined-packet-v3/HTTP_RUNTIME_REGRESSION_V3.json):
**PASS2026-10-29T15:33:57.133559+00:00**,13focused HTTP cases, плюс local opaque
append/prefix proof и AST-identity/order original duplicate-token guard. Реальные imported functions и реальные opaque local catalog/
module fixtures; connection полностью offline stub. Приняты exactold/new200/hash/
headers; отвергнуты303/wrongbody/Origin/dot/header/Location. HTML/denial не
засчитаны JS; altered prefix/inode rejected. Нет сети/SSH/phase run.
[Actual launcher wrapper syntax proof](combined-packet-v3/LAUNCHER_WRAPPER_SYNTAX.json)
проверяет сгенерированный код только compile; auth object пустой, token/file не создан.

Fresh prep resources15:21:16UTC: RAMfree14.429/31.907GiB, CPU4%,
C/D/E16.420/16.236/10.810GiB. Local added estimate<=128MiB RAM/2MiB disk.
Все own E/process-local TEMP/TMP; E<=4GiB diagnose,<=2GiB checkpoint/stop.
Future execution estimate<=1GiB/128MiB требует нового fresh snapshot.
Cleanup не было; old/raw/archive/journals сохранены.
[PACKET_INDEX_V3](combined-packet-v3/PACKET_INDEX_V3.json) связывает все hashes.
После same-branch commit/push/handoff — полностью idle до review/newtoken/отдельной команды.
