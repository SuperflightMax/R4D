# Candidate-03 — проверка доступа после штатной публикации

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; turn `01a17ff5-ac5a-78c1-b19b-524312bbb81f`.

**Вывод: обычный HTTPS URL перенаправляет текущую IAB-сессию на login; post-auth доступ не подтверждён. Зависимая проверка UI/Pixi/HTTP modules/download остановлена.** Это ограничение доступа, а не method FAIL и не Technical/Art PASS. Публикация сама по себе не подтверждает загрузку candidate в браузере. Прежние offline-отчёты и evidence не изменены.

## Фактически наблюдавшееся

- Использован существующий Codex In-app Browser, id 2. До проверки вкладок не было; создана одна временная вкладка, выполнена **одна обычная HTTPS-навигация**.
- Запрошено: `https://superflight.space/review/r4d/p2-free-approach/?seed=1&paused=1`.
- Фактический конечный URL: `https://superflight.space/login?next=review`.
- Фактический title: **«Вход · SuperFlight»**.
- AX-состояние показало форму входа: заголовок SuperFlight, поле пароля и кнопку «Войти». Действий в форме не выполнялось.
- Для **конечной login-страницы** Navigation Timing показал `responseStatus: 200`, `redirectCount: 1`, `name: https://superflight.space/login?next=review`.
- Статус исходного redirect-ответа не захвачен; 301/302/303 не предполагается. HTTP 200 login-страницы не является HTTP-успехом candidate.

Navigation Timing прочитан разрешённым CDP `Runtime.evaluate` из уже открытого документа: только name/responseStatus/redirectCount, без нового запроса. Credentials/cookies/keys не читались, пароль не вводился, login не отправлялся. Auth/security/settings не менялись; личный Chrome не использовался. Новый policy rejection отсутствует. Временная вкладка закрыта, повторный inventory IAB пуст; активного ожидания нет.

## Версия назначения и границы доказательства

Назначение — frozen `p2-jungle-static-candidate-03`, source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`, **15 файлов / 2448161 bytes**. Ожидаемый tree SHA-256 `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`; BUILD_MANIFEST SHA-256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`. Эти пины описывают назначенный artifact: фактически отданные Review bytes в этом browser-проходе **не подтверждены**, поскольку открыт login.

Не проверены реальные status/Content-Type/CSP/importmap/resource loading всех пяти `.js`, Pixi/WebGL/canvas initialization, ошибки работающего candidate, UI random/replay/pause/+1/+10/seek/Art/Geometry/zoom, точность состояний через UI, фактический JSON DOM download и GET-only сетевое поведение. Видимые контакты 94/95/96, ball/shadow/перекрытия/корзина не наблюдались. Offline-факты [candidate-03-REPORT.md](candidate-03-REPORT.md) не выданы за эти проверки.

Ни старый Windows composite/launcher, ни отклонённый file-preview, ни иной actor/surface для обхода не использовались. Новый сервер/порт не создавался; server writes/token operations не выполнялись. Frozen tree, BUILD_MANIFEST и исходники продукта не изменены.

## Сохранённое evidence

Новый файл: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-03-access-01\EVIDENCE.json`, **2835 bytes**, SHA-256 `e830fae5c2165ecc30dcc2e43e0c2516b99b3b5bbdc5efa9d73c2ea97a904737`. Запись `2026-10-28 00:45:11 UTC`. Содержит только санитизированные наблюдения доступа, ожидаемые пины и явно непроверенную область; cookies/headers/passwords не сохранены.

Свежий замер перед браузерным пакетом: C7.701 / D16.304 / E31.385 GiB. Сохранена плановая оценка C1.525 GiB, прежний резерв10 не применялся. Собственные outputs — только E; глобальные настройки и фоновые задачи не создавались. Проверка закончена bounded access-выводом, без повторов входа и ожидания авторизации.
