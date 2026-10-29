# P3 Water + Dark — execution v2 STOP

29 октября 2026. **STOP_PREFLIGHT_PROTECTION_DIFFERS; server writes performed=false.**
Execution turn `01a18825-089e-7d20-8bf2-2fd705358fb9`.
Source `5bc0a42f209eb19acebce3597979fc9b12cd2f7d`; [immutable intent v2](COMBINED_INTENT_V2.md),
[packet v2](combined-packet-v2/PACKET_INDEX_V2.json).

## Authorization и первая команда

Новый token `CTO-P3-WD04-V2-20261029T144858Z-91df426327f8`, issued14:48:58Z.
Authorization SHA `5023100a4f8271594cb973db5feae97035677c8ccb467a0f41f9b86203b1c961`.
Source/intent/scope/script/launcher/archive/manifest/metadata/QA-receipt bindings
проверены и совпали. Старый v1 token CLOSED14:36:01Z не применялся, old journal сохранён.

Host14:52:25UTC: RAMfree15.042/31.907GiB, CPU13%,
C/D/E16.447/16.237/10.898GiB. Estimated added peak<=1GiB RAM/128MiB localdisk.
Только own E/process-local TEMP/TMP.

V2 `preflight` started **2026-10-29T14:52:25.7965330Z**, exec chunk `a67f53`,
session49667, completion `533fa5`, exit1.
Local failed receipt written `2026-10-29T14:52:50.841491+00:00`.
Exact error: **`STOP: prewrite protection differs`**. V2 helper уже не падает
на namespace collision; reviewed guard отверг тройку HTTP responses, ожидая
303normal/403foreignOrigin/404dotfile. Какие именно statuses пришли, неизвестно:
reviewed script при failure не возвращает/не сохраняет checks. Это не основание
приписывать 302/403/5xx, менять guard или автоматически повторять запросы.
SSH/tool policy denial не было; это runtime guard mismatch с неустановленной причиной.

`begin` и все остальные write/postcheck/document/rollback фазы **NOT_STARTED**.
beginUTC=null; первая запись не началась. Deadline15:48:58Z не использован как
разрешение обходить STOP. Ни phase replay, ни повторных HTTP запросов не было.

## После ошибки — только объявленные RO guards

[Receipt](execution-v2-2026-10-29-preflight-stop/AFTER_FAILED_PREFLIGHT_GUARD.json),
**2026-10-29T14:54:02.179563+00:00**, euid0.
Old root `/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`;
674files/88dirs/122587862bytes. Metadata SHA
`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`;
manifest `b54342562a030361fb705d63b52750018956ea3cdfea204450f48a6bbeced9c5`;
snippet `e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`.
Все exact old guards совпали. New root, backup, temp, remote archive и оба
live sibling prefixes отсутствуют.
VPS:4CPU/load0.8837890625/1.00537109375/1.08349609375;
MemAvailable5213454336bytes, diskfree30234886144bytes.
RO exec chunks `f4ac45`/`a281f2`, session65435, exit0.

Ни backup/upload/stage/lock/switch/nginx-test/reload/docs append, ни publication/
rollback не выполнялись. Docs-target before/prefix receipts не делались, потому
что document не достигнут. Source/launcher/scope/frozen/line endings не менялись.
Window/token/slot Release не закрывал, сохраняет STOP до решения CTO.

## Bound результаты сохранены

Water `water-front-edge-04`: Technical PASS / Visual PARTIAL; W-DIVIDER-01 OPEN.
Dark `dark-receiver-front-edge-04`: targeted Technical PASS / overall Visual PARTIAL.
194frozenfiles/7088324bytes, archive4495459bytes SHA
`0cee1516db37cb2ac8a38fec54214c47483f8bea755a71dbd0d04a244b3c9fbb` неизменны.
Будущие https://superflight.space/review/r4d/p3-masks-water/ и
https://superflight.space/review/r4d/p3-masks-dark/ не опубликованы этим execution.
217 postchecks не запускались; post-auth JS MIME/body/UI UNVERIFIED.
Native/build/product QA не повторялись. Jungle/foreign bytes/processes не менялись.

[Checkpoint](execution-v2-2026-10-29-preflight-stop/EXECUTION_CHECKPOINT.json) и
[evidence index](execution-v2-2026-10-29-preflight-stop/EVIDENCE_INDEX.json) содержат
raw-runtime и Git-copy hashes. Failed local receipt сохранён без overwrite.
Требуется решение Lead/CTO по точной диагностике protection mismatch; сейчас
никакой новой source correction/guard weakening/phase retry. После commit/push — idle.
