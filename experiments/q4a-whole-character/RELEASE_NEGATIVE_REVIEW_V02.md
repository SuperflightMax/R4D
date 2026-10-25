# Q4A: выпуск negative-review-v02 в Review

25 октября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`, заказчик CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`. Отдельное production поручение разрешает штатную публикацию принятого evidence viewer и предписывает после неё idle без Q2A.

**PUBLISHED_DELIVERY_VERIFIED_WITH_AUTH_LIMITATION.** [Открыть Q4A](https://superflight.space/review/r4d/q4a-whole-character/), [каталог Review](https://superflight.space/review/). Десятая карточка честно обозначает отрицательный/частичный результат; приёмка касается достоверного показа evidence, а не полноценной анимации, source/art/motion PASS или общей невозможности метода.

## Точная версия и состав

Перед изменениями HEAD=origin/main=remote main подтверждены как **`47b637ba77681cc17ccf23757396073047430c37`**. Это единственный source/acceptance commit выпуска; [приёмка CTO](ACCEPTANCE_NEGATIVE_REVIEW_V02.md) прочитана из него.

- Единственный production tree: `experiments/q4a-whole-character/build/negative-review-v02/review/r4d/q4a-whole-character/`.
- Exact snapshot `negative-review-v02`: `files=35`, `acceptedOutputs=26`, `rejectedIsSeparate=true`, `interpolation=false`, `sourceWholeCount=5`.
- **36 route-tree файлов / 16380565 bytes**, включая build manifest; его список покрывает остальные 35 файлов и намеренно не хеширует себя.
- Build manifest SHA-256: **`c403b92bd4da73c072e20dac6d6fcc5bdb29222d92c6e7524f7757c5865133c8`**.
- Source manifest SHA-256: **`51737944bd88908185cae36c529049ce05935b9d06a5b08cf66298106db88e6c`**.
- Все 36 файлов извлечены побайтно из exact Git objects, сверены по source commit/blob ID/size/SHA-256. Все 35 записей build manifest и output hashes source manifest совпали. Viewer, изображения, данные, отчёты и QA conclusions не редактировались; сборка не выполнялась. **Production diff=none.**

## Доставка и сохранность

Release id: **`47b637ba77681cc17ccf23757396073047430c37`**.

Immutable root: **`/srv/superflight-review/releases/47b637ba77681cc17ccf23757396073047430c37`**.

Переключение: **2026-10-25T16:01:34.634673+00:00**, 19:01:34 Europe/Kyiv. Старый root `/srv/superflight-review/releases/31ade6bb3109052c297e08013607ddd04eea866a` сохранён.

| Материал | Размер / SHA-256 |
|---|---|
| Полный `RELEASE_MANIFEST.json`, вне browser tree | 205912 bytes; `fd83115aa2d863a7800d877dc28b49112b8e6473896005ccc4a8ba5ab8f02081` |
| Архив передачи | `70440533f4a800e02934cc01b7f7d531096a5346d70047253b4fd3e5570ca151` |
| Прежний Q5A release manifest | `afcae9b6b7e3c8bcfa0fb170feeae139aedfc51a94783e956175849cc08603d6` |
| Итоговый Review snippet | `a1d37b0cb06fc28f442962fee3396ce2b4824c7cdf217af319b8b7c0f3c82d89` |

Новый browser tree: **396 файлов / 41089583 bytes**. Основа — проверенный предыдущий Q5A bundle из 360 файлов. **359 прежних файлов сохранены побайтно**, включая все девять прежних routes, Q5A и UGH. В единственном изменённом старом browser-файле `review/index.html` добавлены только карточка Q4A и счётчик 9→10 (+913 bytes). Удаление этих двух изменений восстанавливает прежние байты каталога. Старые immutable releases не менялись и не удалялись.

Применён существующий процесс: проверка прежнего manifest, добавление exact route без сборки, полный release manifest, безопасная распаковка в новый каталог, сверка путей/хешей/прав, свежий rollback, атомарная замена только root в существующем Review nginx snippet, `nginx -t` до/после и graceful reload. После нормализации единственного root snippet побайтно равен прежнему: DENY, auth_request, Origin/dotfiles, no-store/noindex, nosniff, Referrer-Policy, GET-only, autoindex off и disable_symlinks сохранены.

Studio vhost, Imagen include и portal app/Compose проверены по SHA-256 неизменными. Главный сайт, пульт, UGH/Imagen product, DB/sessions, GPU/queue, WireGuard, DNS, firewall, certificates и контейнеры не менялись. Новых credentials, платежей, сервисов или публичных портов нет.

## Проверка доставки

До и после переключения сервер сверил точное множество **396 browser-файлов**, размеры/SHA-256, отсутствие symlinks, root:root и dirs755/files644. Прежний Q5A release повторно полностью сверен. Все 396 файлов точного локального release-дерева также совпали с manifest по HTTP.

Изолированный Chromium через ранее прочитанный навык Playwright: desktop **1440×1000** и mobile **390×844**, touch/isMobile. По **14 наблюдений на размер**: исходно остановленный viewer, все пять whole-источников и их shoulder/hip контекст, slider low0/low25, play до автоматической остановки на low25, restart, ручная пауза, отдельный rejected canvas, light/dark, mesh/texture controls. Диагностическое состояние подтвердило acceptedCount26, rejectedInPlayback=false, interpolation=false; новых поз или solve не выполнялось. Все действия через controls; это delivery smoke exact опубликованных байтов, не новая исследовательская приёмка. Desktop accepted25 и mobile rejected-dark screenshots лично просмотрены.

JS errors, failed requests, HTTP4xx/5xx ресурсов, внешние запросы и горизонтальный overflow — **0** в обоих размерах. Карточек R4D в каталоге ровно 10.

Через публичный HTTPS прошли **50 проверок**: каталог, все десять routes и каждый из 36 Q4A-файлов без сессии дают прежний **303** на `https://superflight.space/login?next=review`. Чужой Origin — **403**, два dotfile пути — **404**. На 403/404 сохранены DENY/no-store/noindex/nosniff/Referrer-Policy; прежний 303 без этих security headers сохранён. Публичный browser desktop/mobile подтверждает обычный вход без overflow.

**Limitation:** post-auth публичный canvas и ресурсные 200 не проверены из-за отсутствия готовой авторизованной сессии встроенного/изолированного браузера. Личный Chrome Макса не использовался; cookies/пароли не читались и не переносились, новый login/session не создавался. По прямому brief CTO это не блокирует выпуск. Физический телефон и другие browser engines не проверены.

Принятый **VQA-N01** сохранён: общая строка «Показ остановлен» остаётся во время play при корректной локальной подписи, кнопке и индексе. Это non-blocking note CTO, не повод редактировать accepted v02. Исследовательский статус остаётся **RESEARCH_CLOSED_NEGATIVE_PARTIAL**: 26 состояний low0…25 из241, последний drop23.9583px из230; rejected witness отдельно, полного low230 и idle/low/walk/jump runtime нет. Полная художественная приёмка и невозможность метода не заявляются.

## Rollback и завершение

Fresh rollback/evidence: **`/opt/superflight-studio/backups/review-q4a-20261025T160111Z`**. Сохранены `review.locations.conf`, `STATE.json`, `candidate.locations.conf`, `PUBLISHED.json`; подготовлен не запускавшийся guarded `rollback.py`. Прежний snippet SHA-256: `3819b2b1c0521471a7802c023dc00de70b70e842f671b03d6873549d657ea2c0`.

Перед rollback проверить отсутствие позднейших изменений по итоговому snippet hash; атомарно вернуть только сохранённый Review snippet root:root644, проверить nginx и выполнить graceful reload. Скрипт отказывается перезаписывать более поздние правки. Session DB не восстанавливать и не удалять; immutable releases и чужие службы сохранить.

Локальные manifests, scripts, proof, HTTP/browser results и screenshots — `%TEMP%/r4d-release-q4a-47b637b`, вне Git/browser tree. Серверные service doc/CHANGELOG дополнены по существующему процессу с сохранением предыдущих копий в rollback. Все **50 исходных dirty/untracked файлов** сверены по SHA-256 и сохранены; чужие service caches не тронуты. Свой браузер и localhost-сервер закрыты, собственный CLI snapshot перенесён в TEMP. В Git включены только release record и необходимые state/docs. После отдельного выпуска **R4D IDLE**, Q2A, новое исследование и corrections не начинались.
