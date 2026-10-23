# Release Engineer R4D · Q2

23 октября 2026. Заказчик: CTO `cto-r4d-01`.
Staff ID: `release-engineer-r4d-q2-01`.
Thread: `01a1690d-7f04-78c2-93cb-a2bbb9b0b4df`.
Фактический локальный turn_context подтверждает `gpt-6.1-sol`, `medium`,
cwd `D:\dev\R4D`. Новых агентов, чатов, проектов, worktree и клонов не создавал.

## Доставлено

Q2: https://superflight.space/review/r4d/q2-simple-character/

Ссылка добавлена в https://superflight.space/review/.
Обычная авторизация SuperFlight сохранена. Это принятый CTO
`stop/show with limitations`, а не художественный PASS.

- Runtime source commit: `4293fee27a8d70c6647b02b7d9194a5da7d9dded`.
- Docs-only acceptance: `b0717cf12b8da161e44a3c6dd0166cd403366ed7`.
- Immutable release: `/srv/superflight-review/releases/b0717cf12b8da161e44a3c6dd0166cd403366ed7`.
- Переключён 2026-10-23 14:13:30 UTC (17:13:30 Europe/Kiev).
- RELEASE_MANIFEST.json SHA-256:
  `d8badfe5e00b0047433ccd04820ba154a469df5415cc8e8c5a28575704e81a40`.
- Manifest: 85 903 байта, вне browser tree.
- Q2: 37 новых runtime-файлов / 1 029 084 байта.
- Всё browser tree: 193 файла / 17 216 070 байт.
- Вместе со служебным manifest: 194 файла / 17 301 973 байта.
- Предыдущие 155 файлов, включая весь Q1/baseline, сохранены побайтно.
  Единственный изменённый прежний файл — `review/index.html`: добавлена
  карточка Q2 с ограничениями и счётчик изменён с 3 на 4. Остальные байты
  каталога сохранены; серверная обратная проверка удаления этих двух изменений прошла.

## Источники и сборка

Канонический Playbook прочитан через GitHub connector на
`da128e302e44e749431d3e3822e554bd6aca7cf8`, blob
`e1d6d4744878dc2153507954f03cd768ed1d5e4e`.
В первой части работы web дал 404, connector временно отсутствовал, `gh`
не установлен: временно применён разрешённый снимок
`D:\dev\codex-staff-department\PLAYBOOK.md`. После восстановления connector
канон прочитан; дальнейшая работа опирается на канонический текст.
Общая роль Release Engineer и MODELS прочитаны через Git на Staff revision
`41f19e8de9d6f84f6e533186bda902e4f2c1c68e`.

Выполнен `git fetch origin`; `origin/main` и checkout HEAD при начале —
`b0717cf12b8da161e44a3c6dd0166cd403366ed7`.
С этой ревизии прочитаны AGENTS, COMMON, проектная роль, очередь,
требования демонстрации и acceptance в `experiments/q2-simple-character/RESULTS.md`.
Также прочитаны локальные REVIEW_HANDOFF и фактический отчёт Q1, серверные
README_RU, INDEX, PROCEDURES и services/superflight-studio.md.

**В принятом Git commit нет tracked dist.** Для публикации выполнен
`git archive 4293fee... experiments/q2-simple-character` в отдельный временный
каталог, затем `npm ci --ignore-scripts --no-audit --no-fund` и штатный
`npm run build`. Это сборка из принятых Git-объектов; случайный HEAD,
локальные исходники и существующий uncommitted dist источниками не были.
Продукт и его конфигурация не исправлялись.

Node `v24.15.0`, Vite `7.3.7`, PixiJS `8.22.0` — версии из установленной
среды и exact package-lock. Перед сборкой/публикацией независимо перечитаны
через `git show` и побайтно сверены 20 файлов: HTML, main/motion/CSS,
Vite config, package/package-lock, manifest и 12 PNG.
Их Git blob IDs, SHA-256 и размеры записаны в release manifest `q2.source_files`.

Manifest и 12 PNG опубликованы побайтно из Git. HTML, JS и CSS являются
выходом штатной Vite-сборки этих исходников и locked dependencies;
не заявляю для них совпадение с несуществующими dist Git blobs.
Каждый выходной файл имеет SHA-256 и размер в `published_files`.
Набор ограничен HTML, CSS, JS-частями runtime, manifest и 12 используемыми PNG.
Исходные atlases/source, prompts, подготовительные скрипты, QA/evidence,
логи, карты исходников, Git, credentials/cookies и пользовательские данные
в browser tree не добавлены.

Основа — скачанный live release Q1 `253ec9013f736468f9e7fad6d6bafa6f82ea2529`:
прежний manifest SHA-256
`654eaad920bc79bbc2d60266fa3ce7a6c0aa2239aab3973d0049c458cd0dbe51`
и все 156 файлов сверены перед добавлением Q2. Сборщик Imagen не менялся.

## Проверки доставки и защиты

- Локально проверено точное подготовленное immutable browser tree:
  desktop 1440×1000 и mobile 390×844 с `isMobile`/touch. В изолированных
  Chromium-контекстах пройдены карточка каталога, idle/low/move/jump,
  выбор low в полёте и посадка в него, пауза и шаг 1/60, оба маршрута,
  midMove/midJump, фон и кости. 12 PNG загружены; горизонтального overflow,
  page errors, failed requests и HTTP 4xx ресурсов нет. Снимки desktop/mobile
  просмотрены. Для локального HTTP в браузерных ответах выставлены прежние
  DENY/no-store/noindex без изменения байтов контента.
- Девять существующих тестов Review/deployment прошли. Первый запуск unittest
  упал из-за импортируемости каталога; исправлен только способ загрузки тестов.
- До switch сервер проверил архив, exact manifest hash, все 193 файла,
  размеры, полный набор путей, сохранность прежнего tree и единственное
  изменение каталога. Затем новый каталог переименован в immutable identity.
  Старые releases не редактировались и не удалялись.
- Права сохранены: каталоги `root:root 755`, файлы `root:root 644`.
- Fresh rollback сохранён до switch. Review snippet заменён атомарным
  `os.replace`, отличается от прежнего **только root**. `nginx -t` прошёл
  до switch и после замены; выполнен только graceful `systemctl reload nginx`.
  После switch повторно сверены все 193 файла, manifest и защищённые конфиги.
- Итоговый snippet SHA-256:
  `23b6cfbcffd77fce166c101ee565cca814d13642cd2f9449dac21a360a014ab0`.
  `X-Frame-Options: DENY`, auth_request, Origin/dotfiles, no-store/noindex,
  GET-only, autoindex off и disable_symlinks сохранены. SAMEORIGIN не вводился.
- 43 публичные HTTPS-проверки после switch: каталог, Q1, Q2 и каждый из
  37 файлов Q2 без сессии дали 303 на `/login?next=review` (40 проверок).
  Чужой Origin дал 403; `.git/config` и `.env` — 404. На этих 403/404
  подтверждены DENY, no-store, noindex, nosniff и прежний Referrer-Policy.
  Прежний 303 redirect сам этих заголовков не содержит; это наблюдалось
  и до switch и не изменялось ради выпуска.
- Public browser 1440×1000 и 390×844 подтвердил страницу входа на Q2 URL.
  Авторизованный public canvas и ресурсные 200 **не проверены**: отдельной
  готовой авторизованной сессии у проверочного браузера нет. Пароль не вводился,
  новые сессии/credentials не создавались. Локальный просмотр и серверная
  целостность не выдаются за проверку авторизованного пользовательского браузера.
- nginx active. Portal и Imagen static running/healthy, restart count 0.
  Studio vhost SHA-256 остался
  `c873762568396f54496e7bdff7874b688523c9d101adbdd10b355c4c0baac5e6`;
  Imagen snippet —
  `bf68f12e62ac88e41d5e043cb7acc8b14ba1906c1718f5c3c7efb4d7eef25e34`.
  Portal/Imagen/GPU/DB/firewall/DNS/certificates и чужие сервисы не менялись.

## Ограничения и откат

Сохранены принятые V1: ступень таза/бедра в глубокой low pose; TQ-01:
краткий зазор опоры, измеренный на c1 до 1.394 экранного px (полный c2 цикл
здесь не перемерялся). Сегментированные суставы, неоднозначная дальняя кисть,
жёсткие дуги рук и кукольность шага/посадки не исправлялись.
Это не повтор художественной приёмки и не проверка физического телефона.
Прежний iframe baseline Q1 остаётся заблокирован DENY; отдельная ссылка сохранена.

Rollback/evidence:
`/opt/superflight-studio/backups/review-q2-20261023T141228Z`.
Точный rollback snippet: `review.locations.conf` в этой папке.
Содержит прежний root
`/srv/superflight-review/releases/253ec9013f736468f9e7fad6d6bafa6f82ea2529`,
SHA-256 snippet
`2f087ab4c4862b5ea9e8755844659c0b59d25041dda89c6a96684d14ee647464`.
Рядом сохранены STATE.json, candidate.locations.conf и PUBLISHED.json.

Перед откатом проверить отсутствие новых чужих изменений: live snippet должен
совпадать с итоговым hash этого выпуска. Подготовить копию прежнего snippet
с `root:root 644` в том же `/etc/nginx/snippets`, атомарно заменить только
`review.locations.conf`, выполнить `sudo nginx -t` и graceful reload nginx.
DB/сессии не восстанавливать; portal/Imagen и остальные службы не перезапускать.
Оба immutable releases сохранены.

Сырые хеши, локальный manifest, сценарии и снимки находятся вне Git/web в
`%TEMP%\r4d-release-q2-4293fee`. Передача по SSH была нестабильной:
timeouts не привели к переключению непроверенного дерева; успешная доставка
завершилась полной сверкой. Локальный проверочный браузер и preview закрываются
после проверок. Чужие JOURNAL, CTO state, REVIEW_HANDOFF, `.playwright-cli/`
и `work/requests/` в мой commit не включаются.

Q3 не запускал. Director может опираться на фактический public URL выше.
