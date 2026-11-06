# Q3B — публикация Фонарного механика

6 ноября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`, та же постоянная сессия; отдельное поручение публикации принятого Q3B. **PUBLISHED — DELIVERY_VERIFIED.**

URL: https://superflight.space/review/r4d/q3b-transforming-crab/ . Карточка: https://superflight.space/review/r4d/#skeleton . Общий каталог: https://superflight.space/review/ .

## Источники и версия

Перед действием HEAD=origin/main=remote main=`cc05fa37d315efb592f76a04186cb4942b5b5621`, cwd `D:\dev\R4D`, local host. Фактические model/reasoning инструментами хода не подтверждены; текстовое назначение не выдано за изменение настроек.

Полностью прочитаны: Chatknows PLAYBOOK revision `595c2bf27e9f1d5ef93a9802745a666fa15e48f1`, blob `d3066526699a9a21fb8e8e5806958fbd105c8cf2` через GitHub connector (без fallback); Staff `e9dfa0e32226e3f72de1f75e5c77a43d5ebfd9b3` roles/release-engineer.md, MODELS.md, docs/WORK_ORDER.md; R4D `cc05fa37…` AGENTS.md, roles/README.md, COMMON.md, release-engineer.md, Q3B ACCEPTANCE.md и HANDOFF.md. Также прочитаны штатные handoff/build-инструкции и фактическая конфигурация Review. Checkout/reset/clone/worktree не выполнялись.

- CTO acceptance: `d1743af807b134e1a7617fc727bbe7573e532489`.
- Independent review package: `552421fad46fe1872a9a33dc3782f24148082e3a`.
- Frozen runtime/art: `916c872f43bc7205ab64c101fc0edfee8670541a`.
- Pin SHA-256: `74d752ec88d8141528b4ce051bd267cf17195c73034fede1d3008021fabfd964`.
- Все21 закреплённых входов извлечены из exact Git objects и совпали с frozen runtime и pin; после build повторно сверены. Исходники/арт/механика и QA conclusions не менялись.

Проверенный старый общий Imagen builder `8168671bc0b4d90a6de4d88ffcc908189a3f022d` поддерживает только первоначальные PoC и не содержит Q3B. Он не запускался для регенерации старых материалов и не изменялся. Применён существующий процесс предыдущих R4D releases: штатный builder самого Q3B (`npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, exact lockfile, Vite7.3.7) в отдельном TEMP из pinned Git inputs и минимальная надстройка над фактическим live root. Не создавались новый pipeline, сайт или сервис. Это явно описанный способ упаковки, не утверждение, что старый общий builder уже поддерживает Q3B.

Публичный Q3B dist — **37 файлов / 724918 bytes**: built HTML/JS/CSS и runtime manifest/12 PNG. Source maps, package/node_modules/Git, raw/prompts, QA/evidence/logs и private credentials в route не включены. Source proof и полный per-file SHA-256/size/Git blob записаны в release manifest вне browser tree.

## Release и сохранность

Live root: `/srv/superflight-review/releases/cc05fa37d315efb592f76a04186cb4942b5b5621`.

Switch UTC: **2026-11-06T12:00:41.579709+00:00**, **14:00:41 Europe/Kyiv**.

RELEASE_MANIFEST.json SHA-256: **`2a912ac1c1ab9289db2cd35590e743495ffb61a03cf9e2addaf8a0c7c95efe56`**.

Итоговый snippet SHA-256: `b9571af6440cf8addc447506f3c37dbbd27035d6e0658306cf47a901cb75f43f`.

Фактическая прежняя основа — `/srv/superflight-review/releases/p6-local-partial-01`: **914 browser-файлов**, не старые числа из октябрьского handoff. Новый browser tree — **951 файл / 150992424 bytes**. **912 прежних файлов** сохранены побайтно вместе с uid/gid/mode, включая mixed ownership; изменены только `review/index.html` (связанные счётчики20→21 и11→12) и `review/r4d/index.html` (новая карточка Q3B и связанные11→12). Остальные карточки, контент, ссылки и старые immutable releases не менялись. Полные старые/новые пути, размеры, хеши и metadata сверены сервером до/после switch. Symlinks не обнаружены. Новые runtime files root:root644, directories755; права чужих файлов не нормализовались.

Свежий rollback/evidence: `/opt/superflight-studio/backups/review-q3b-20261106T115922Z`. Сохранены исходный Review snippet, STATE.json и PUBLISHED.json. Прежний snippet SHA-256: `58a22d86c5d6650c978964ecfb11f38f384f338c77a224de0e94ef6d4965e5c9`.

Переключён атомарно только root существующего snippet. После нормализации root новые bytes равны прежним. `nginx -t` до/после прошёл, выполнен только graceful reload; nginx active. Rollback: перед действием сверить отсутствие позднейших правок по итоговому snippet hash, атомарно вернуть сохранённый snippet root:root644, `nginx -t`, graceful reload. Не восстанавливать session DB и не удалять releases.

Studio vhost, Imagen include, portal app/Compose SHA-256 сверены до/после неизменными (точные значения в STATE/PUBLISHED). UGH, /imagen/, пульт, portal DB/sessions, GPU/queue, credentials, DNS/firewall/certificates/WireGuard и чужие сервисы не менялись.

## Фактическая проверка доставки

Локальный exact dist и реальный публичный HTTPS viewer проверены изолированным Chromium через навык Playwright: **desktop1440×1000 и mobile390×844**, по12 наблюдений в каждом размере. Три формы, прямые/обратные трансформации, движение вперёд/назад, stop/low, jump с выбором work до посадки, auto-show и отмена ручной командой, pause/step, светлый фон; исходный тёмный фон просмотрен до переключения. Подтверждены `q3b-full-art-v2`,23 attachments; ошибок JS/HTTP, failed/external requests и горизонтального overflow нет. UI-команды настоящие; runtime step использован для повторимых кадров. Это delivery smoke, не новый предметный QA. Снимки desktop/mobile просмотрены.

**42 HTTPS проверки PASS:** все37 Q3B-файлов и оба каталога вернули200 с точными SHA-256/размерами; JS отдаётся с JavaScript MIME. Проверены DENY/no-store/noindex. Чужой Origin403, два dotfile404. Прямые URL index.html, JS/CSS, manifest и PNG доступны без перехода через каталог. Текущее Review уже **публичное**: auth_request отсутствовал в исходном live snippet;200 без cookies — существующее состояние, а не отключение защиты этим выпуском. Приватные auth/session механизмы портала сохранены, cookies/tokens не читались, login/session не создавались. Старый ожидаемый303 из октябрьских отчётов не применялся к изменившейся площадке.

TQ-01 явно указан в публичной карточке: около1,79px краткого перекрытия lowerRear принято CTO без коррекции. Отсутствие всех микропересечений, физическая устойчивость, универсальность и человеческая/физическая мобильная приёмка не заявляются. Публичная проверка не меняет приёмку CTO.

## Завершение

Все719 исходных dirty/untracked файлов сверены по SHA-256 и сохранены. Чужие evidence/profile/temp, в том числе ранее оставленные после auto-review rejection, не очищались и не обходились другой обёрткой. Общий сервер CTO4186 не тронут. Созданы только собственные localhost4199 и изолированная browser session; по завершении они остановлены, файлы evidence/build/temp сохраняются без удаления согласно brief. Локальные proof, source/build, manifests, scripts и HTTP/browser receipts: `%TEMP%/r4d-release-q3b-cc05fa3`, вне Git/web. В commit входит только этот release report; новых людей/чатов/QA/corrections/исследований не создавалось. Серверные service doc/CHANGELOG дополнены по существующему ops-процессу.
