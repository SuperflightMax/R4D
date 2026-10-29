# P3 Water + Dark — bounded RO HTTP diagnosis

29 октября 2026. **RO_DIAGNOSIS_COMPLETE_NO_EXECUTION; server_write=false.**
Оба tokens CLOSED: v1 14:36:01Z, v2 14:58:05Z. Окно RESERVED P3, управляет CTO.
Никаких begin/write/phases/source v3/token generation.

## Что было baseline

[Own Jungle delivery evidence](../../../release/DELIVERY_EVIDENCE.json) содержит
реально измеренные `begin.beforeHttp` 303/403/404, associated backup UTC
**2026-10-28T07:06:22.133763+00:00**. Контекст: UA
`R4D-P3-delivery-smoke/1`, paths `/review/` normal/foreign Origin и
`/review/.r4d-p3-probe`. Это исторический Jungle baseline, не fresh combined HTTP baseline.

Combined probe/audit/seal29.10 измеряли root/snippet/tree metadata, но не сохраняли
HTTP path/status responses. V1 preflight упал до HTTP на namespace collision.
V2 preflight14:52 выполнил3 запроса и вернул только generic protection mismatch;
конкретные статусы не сохранены. Actual-helper regression был offline со stub
statuses и не является измерением сервера.

В combined guard я перенёс историческое ожидание303/403/404 без свежего измерения
этого HTTP контекста. Поэтому корректная классификация — hardcoded assumption
для combined, опирающееся на другой исторический context; **security drift не установлен**.

## Один отдельно разрешённый новый замер

Последнее прямое CTO steering заменило logs-only задачу одним bounded набором3GET.
Exact combined statuses в own existing receipts отсутствовали, поэтому выполнен
**один** набор через existing `vps1-direct / sudo -n -- python3 -B -`.
Host `superflight.space`; UA `R4D-P3-combined-delivery/1`. Без cookies/auth,
redirect follow, новых routes/headers, launcher/phases/closed token. Body
читался блоками и отбрасывался; не выводился и не сохранялся.

| Response UTC | Request | Status |
|---|---|---|
|2026-10-29T15:03:07.556435+00:00|`/review/` normal|200|
|2026-10-29T15:03:07.606565+00:00|`/review/`, Origin `https://example.invalid`|403|
|2026-10-29T15:03:07.658040+00:00|`/review/.p3-combined-probe` normal|404|

Все7 headers в [exact receipt](diagnosis-2026-10-29-http/HTTP_DIAGNOSTIC_RECEIPT.json).
У всех3: Location=null, X-Frame-Options=DENY, Cache-Control=no-store,
X-Robots-Tag=noindex,nofollow,noarchive; X-Content-Type-Options=nosniff,
Referrer-Policy=same-origin, Content-Type=text/html.
Tool exec chunk `206af3`, session12210, completion `9cfa93`, exit0.
SSH command/HTTP request-code SHA и startUTC — [REQUEST_STARTED](diagnosis-2026-10-29-http/REQUEST_STARTED.json).

## Ограничения и точка остановки

Это **новый замер15:03**, не восстановление ответов14:52 и не доказательство,
что именно normal200 вызвал прежний STOP. Тела не исследованы, поэтому нельзя
сказать, был ли200 catalog/login/другаяHTML, или объявить authentication/security
исправными либо сломанными. 200 не принят как разрешение ослабить guard.
Post-auth JS MIME/body/UI UNVERIFIED.

Own local-source поиск не обнаружил известного access-log path. До remote log
lookup CTO заменил scope; nginx logs/procFD/privateconfigs/servicebook body/keys
не читались. Ни повторных diagnostic GET, ни phase replay. Исходники v1/v2,
intent/index, guards, archive/frozen/native/QA и все failed receipts сохранены.

[Provenance](diagnosis-2026-10-29-http/PROVENANCE.json) различает historical
measured evidence, combined assumption, offline test и новый bounded observation.
[Evidence index](diagnosis-2026-10-29-http/EVIDENCE_INDEX.json) связывает raw-runtime
и Git-copy hashes. Никакой новой correction/authorization не создано.
После same-branch commit/push — idle; дальнейшее решение только CTO.
