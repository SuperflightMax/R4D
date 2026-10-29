Current local successor v2: [COMBINED_INTENT_V2.md](COMBINED_INTENT_V2.md).
**WAIT_V2_REVIEW_EXACT_CTO_TOKEN; server_write=false; token=null.**
Offline actual-helper regression PASS; no remote v2 execution. V1 stop below сохранён.

---

# P3 Water + Dark — execution checkpoint

29 октября 2026. **STOP_PREFLIGHT_SCRIPT_ERROR; server writes performed=false.**
Execution turn `01a18812-15ad-7e82-8abc-58f0ee0a03ea`.
Reviewed source commit `fdac2e9ba909a034a4ad176d11a438a04dc78ccc`;
[canonical intent](COMBINED_INTENT.md), [immutable packet](combined-packet/PACKET_INDEX.json).

## Authorization и первый запуск

CTO token `CTO-P3-WD04-20261029T142713Z-ae0b1054d192` получен отдельной
execution-командой. Авторитетный JSON остаётся по исходному coordination path;
SHA256 `264d922b47ae2e29caf0af009934b4999a2536c5cda881853bfc2bc5e458bef1`.
Все source/artifact/old-new-root/metadata bindings совпали. External authorization
разрешает serverWrite=true только bound scope; immutable intent/scope не правились.

Host snapshot 14:31:41 UTC: RAM free15.17/31.907GiB, CPU1%;
C/D/E free15.593/16.237/10.918GiB. Оценка added peak<=1GiB, localdisk<=128MiB.
Только own E runtime/process-local TEMP/TMP; глобальные настройки не менялись.

Первая фаза `preflight` начата **2026-10-29T14:31:55.7726602Z**.
Tool exec chunk `20de66`, session71992, completion chunk `3e8974`: exit1, STOP.
Точный результат: `'function' object has no attribute 'client'`.
В `combined_remote.py:79` nested `def http` перекрывает imported module `http`;
строка80 пытается прочитать `http.client`, первый вызов — строка92.
Ошибка возникла до первого HTTPS запроса/первой серверной записи. Это ordinary
Python implementation error, не policy denial. Фазу не повторяли, code/scope/
launcher/frozen bytes не меняли; альтернативный HTTP/preflight не запускали.

## RO доказательство остановки

После ошибки прочитаны только объявленные guards. Receipt
[AFTER_FAILED_PREFLIGHT_GUARD.json](execution-2026-10-29-preflight-stop/AFTER_FAILED_PREFLIGHT_GUARD.json),
**2026-10-29T14:33:29.493371+00:00**, actual euid0: old root остаётся
`/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`.
674 files/88dirs/122587862bytes; metadata
`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`;
manifest `b54342562a030361fb705d63b52750018956ea3cdfea204450f48a6bbeced9c5`;
snippet `e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`.
New root, backup, temp и оба live sibling prefixes отсутствуют.
RO guard tool chunks `6d3ef0`/`a51cd3`, session38029, exit0.

`begin` и все последующие фазы **NOT_STARTED**, beginUTC=null. Ни upload/stage/
backup/lock/nginx-test/reload/docs append, ни публикации/rollback не было.
First-write deadline15:27:13Z не использован как разрешение обходить ошибку.
CTO token/window/slot самостоятельно не закрывались и не освобождались.

## Два результата и дальнейшая граница

Water water-front-edge-04: Technical PASS / Visual PARTIAL; W-DIVIDER-01 OPEN.
Dark dark-receiver-front-edge-04: targeted Technical PASS / overall Visual PARTIAL.
194 frozen files/7088324bytes и архив4495459bytes остаются неизменны.
Будущие URL https://superflight.space/review/r4d/p3-masks-water/ и
https://superflight.space/review/r4d/p3-masks-dark/ **не опубликованы** этим запуском.
217 HTTP postchecks не запускались; post-auth JS MIME/body/UI UNVERIFIED.
Предметная QA/native/build не повторялись; Jungle/чужие процессы не менялись.

[Execution checkpoint](execution-2026-10-29-preflight-stop/EXECUTION_CHECKPOINT.json)
и [evidence hashes](execution-2026-10-29-preflight-stop/EVIDENCE_INDEX.json) сохраняют
точные receipts, raw source hashes и нормализованные Git copies. Raw runtime
receipts и failed phase record сохранены; ничего не удалено для replay.
Следующее требует решения CTO: review исправления source, новые exact hash
bindings/authorization и отдельный execution attempt. Сейчас STOP и handoff Lead.
