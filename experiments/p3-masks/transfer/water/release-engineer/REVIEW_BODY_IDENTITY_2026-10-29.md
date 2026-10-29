# P3 Water + Dark — one-GET Review body identity

29 октября 2026. **RO_BODY_IDENTITY_MATCH_ONLY; server_write=false.**
Оба execution tokens CLOSED14:36:01Z/14:58:05Z; окно RESERVED P3.
Отдельное прямое CTO RO разрешение, без launcher/preflight/phases/token reuse.

## Единственный запрос и сравнение

Existing `vps1-direct / sudo -n -- python3 -B -`, HTTPS `superflight.space`,
UA `R4D-P3-combined-delivery/1`; ровно **один GET `/review/`**.
Без cookies/auth/new headers/redirect follow/retry/другого route или transport.

- Request UTC: **2026-10-29T15:12:00.471853+00:00**.
- Response UTC: **2026-10-29T15:12:00.561904+00:00**; HTTP **200**.
- Streaming completed UTC:2026-10-29T15:12:00.562401+00:00.
- Body length: **14511 bytes**.
- Body SHA256: **`eb57e35bcebbe4a639b92c625f23de5efb90ae2c15da8a3996ca653fb61a6885`**.
- Known old catalog14511bytes/тот же SHA: **size AND SHA MATCH**.

Тело обработано потоково SHA256/length блоками<=65536bytes и отброшено,
не выводилось и не сохранялось. Known old catalog binding взят из уже
зафиксированного immutable combined intent/scope, без чтения catalog body.

Все7 headers сохранены в [exact receipt](diagnosis-2026-10-29-review-body/BODY_DIGEST_RECEIPT.json):
Location=null; X-Frame-Options=DENY; Cache-Control=no-store;
X-Robots-Tag=noindex,nofollow,noarchive; X-Content-Type-Options=nosniff;
Referrer-Policy=same-origin; Content-Type=text/html.
Tool exec chunk `bf8ec6`, session55408, completion `a1a2eb`, exit0.
[Request start](diagnosis-2026-10-29-review-body/REQUEST_STARTED.json) содержит
UTC отдельной команды15:11:42.203875Z и request-code SHA.

## Строгая граница вывода

Совпадение доказывает идентичность текущего опубликованного контента с известным
old catalog **только для данного response/context**. Это не ретроактивный ответ
preflight14:52 и не универсальная security/auth приёмка. Post-auth JS MIME/body/UI
UNVERIFIED. Статус200 не принят автоматически как новый допустимый guard.

Source v1/v2, guards, intent/index, archive/frozen/native/QA, failed receipts и
оба исторических authorization файла не менялись. Ни VPS writes, ни новый
source v3/token/wrapper/write attempt. Никаких logs/privateconfigs/keys/body dumps.

[Provenance](diagnosis-2026-10-29-review-body/PROVENANCE.json) и
[evidence index](diagnosis-2026-10-29-review-body/EVIDENCE_INDEX.json) связывают
точный инструмент, контекст, UTC и raw-runtime/Git-copy hashes.
После same-branch commit/push — idle до конкретного решения CTO.
