# Release Engineer R4D · Q4

23 октября 2026. Постоянный Release Engineer `release-engineer-r4d-q4-01`.
Заказчик — CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`.
Собственный thread: `01a16974-8017-7083-848c-f39a72cec9f6`.
Локальный `turn_context` подтверждает `gpt-6.1-sol`, reasoning `medium`,
cwd `D:\dev\R4D`. Subagents, новые чаты, saved projects, worktree и клоны
не создавались. Продуктовая реализация не исправлялась.

## Доставлено

**Q4: https://superflight.space/review/r4d/q4-whole-character/**

Карточка добавлена в https://superflight.space/review/.
Статус CTO — **stop/show with limitations**; исходный look сохранён частично,
художественный PASS не заявляется.

- Exact runtime source: `37e5dd276e2df964fa717cbb09bd7c8b7733a135`,
  только `experiments/q4-whole-character/`.
- Docs-only acceptance: `412030fd83e6ddfd010811d2c11e0f8ee7af7f45`.
- Immutable identity/root:
  `/srv/superflight-review/releases/412030fd83e6ddfd010811d2c11e0f8ee7af7f45`.
- Atomic switch: `2026-10-23T16:05:47.956701+00:00` — 19:05:47 Europe/Kiev.
- `RELEASE_MANIFEST.json` SHA-256:
  `ba26ac3e9749f6f53dcefabbc93a5a922020c8ad937355161ccae4697ae5a943`.
- Manifest: **109 284 байта**, вне browser tree.
- Q4: **38 новых runtime-файлов / 3 592 558 байт**.
- Всё browser tree: **261 файл / 21 525 507 байт**.
- Вместе с manifest: **262 файла / 21 634 791 байт**.
- **222 прежних файла сохранены побайтно**, включая Q1–Q3 и остальные
  материалы Review. В единственном изменённом прежнем файле
  `review/index.html` добавлена карточка Q4 и счётчик `5` → `6 демонстраций`.
  Удаление ровно этих двух изменений восстанавливает прежние байты.
  Разница размера каталога — +583 байта.

## Инструкции и происхождение

Канонический Playbook на `da128e302e44e749431d3e3822e554bd6aca7cf8`
недоступен через raw GitHub (404); применён разрешённый fallback
`D:\dev\codex-staff-department\PLAYBOOK.md`.
Общая роль и MODELS прочитаны через Git на Staff revision
`41f19e8de9d6f84f6e533186bda902e4f2c1c68e`.
Выполнен `git fetch origin`; исходные HEAD и origin/main — acceptance выше.
Прочитаны AGENTS, COMMON, проектная роль и карта ролей, очередь, требования
демо, acceptance RESULTS/STATE из origin/main, REVIEW_HANDOFF, отчёт Q3
и четыре обязательных серверных документа.

Runtime извлечён `git archive` из exact implementation commit в отдельный
TEMP-каталог без checkout/worktree. Сборка — штатные
`npm ci --ignore-scripts --no-audit --no-fund` и `npm run build` с exact lockfile.
Команды запускались из R4D через `npm --prefix` изолированного каталога.
Ни dirty checkout, ни HEAD не служили runtime source.

Побайтовая сверка с `git show` обнаружила Windows LF→CRLF при архивировании
`vite.config.js`. В изолированном входе восстановлены точные байты Git blob,
после чего сборка повторена. Финальные **21 runtime-вход** независимо сверены
с Git blobs: HTML, main/motion/CSS, Vite config, package/lock, runtime manifest,
12 parts PNG и exact whole. Их blob ID, SHA-256 и размеры — в `q4.source_files`.
SHA-256 канонического массива proof
(`json.dumps(..., ensure_ascii=False, sort_keys=True, separators=(',',':'))`, UTF-8):
`1ebe3fbad4d3ccdb11fc95e30de32a27f4e21ead7a9ad3919d980c7ef032f037`.

Публикуются только built HTML/JS/CSS, runtime `art/manifest.json`, 12 PNG
частей и built preview `assets/whole-original-CBd5YRfL.png`.
Runtime импортирует whole из `main.js`; браузер фактически запросил preview
и все 12 уникальных parts PNG. Preview побайтно равен exact source, SHA-256
`b1a83019511efa33a5d6b7380fc361f171c7b8d2bc82f49ab71b45d130620615`.
PNG и runtime manifest побайтно сохранены из Git; HTML/JS/CSS получены штатной
сборкой, их хеши и размеры находятся в `published_files`.

Набор сформирован явным allowlist: ранний manifest, prompts, masks,
неиспользуемые source/edit originals, preparation/provenance scripts,
QA/evidence/logs, source maps, dependencies/node_modules, Git и credentials
не опубликованы. Метаданные исходных путей в неизменном runtime manifest
не означают публикацию этих файлов. Сборщик Imagen не менялся.

Основа — сохранённый локальный bundle Q3; перед добавлением Q4 проверены
его manifest SHA-256 `ab76a86b38959c567239351cfedd4c5eb3afb51dcc272ec1dd65746d131de5b7`
и все 223 файла. До switch сервер независимо сверил его с фактическим прежним
live release и побайтно сравнил все прежние материалы с новым деревом.
Медленное скачивание по scp остановлено; неполная локальная копия не
использована как основа. Передача итогового архива выполнена через существующий
SSH relay; новые credentials и инфраструктура не создавались.

## Фактические проверки

- Точное локальное release-дерево: Chromium desktop 1440×1000 и mobile
  390×844 с isMobile/touch. Использован навык Playwright, отдельная сессия
  `r4d-q4-release`. Встроенный браузер недоступен (request-header policy;
  в inventory только личный Chrome); Chrome/рабочий стол Макса не трогались.
- Карточка каталога, 12 загруженных частей, exact whole 1024×1536,
  idle/low/move/jump, смена цели в воздухе и посадка в low/move, bind pose,
  оба полных маршрута с проверкой ground и числа посадок, midMove/midJump,
  пауза/шаг 1/60, reset, скорость, фоны/кости и клавиатура/удержание движения.
  Отдельные desktop/mobile результаты содержат по 15 наблюдений без JS errors,
  failed requests, HTTP 4xx ресурсов и горизонтального overflow.
  Проверены мобильный каталог с честными ограничениями и запросы ровно 12
  parts PNG + одного whole preview. Снимки desktop low и mobile idle просмотрены.
  Локальный браузер получал DENY/no-store/noindex через тестовую обёртку
  ответов без изменения байтов контента. Это smoke доставки, не новая приёмка арта.
- Первый inline-вызов CLI дал ошибку разбора; применён штатный `--filename`.
  Длинный общий сценарий разделён по устройствам для явных отдельных результатов;
  продукт при этом не менялся. Девять существующих Review/deployment tests прошли
  с `PYTHONPATH=D:\dev\Imagen`; первый deployment-запуск без этого пути
  не импортировал пакет. `git diff --check` прошёл.
- До switch сервер сверил SHA-256 архива, manifest, точное множество путей,
  все SHA-256/размеры 261 browser-файла, прежние 223 файла и минимальную
  карточку. Root:root, dirs755/files644, symlinks отсутствуют.
  Incoming переименован в новый immutable root; старые releases не менялись.
- Fresh rollback сохранён до переключения. Атомарно заменён только root
  Review snippet через `os.replace`. `nginx -t` до/после прошёл;
  выполнен только graceful `systemctl reload nginx`.
  После switch повторно проверены все файлы, пути, размеры, хеши, владельцы,
  права и защищённые конфиги.
- Итоговый Review snippet SHA-256:
  `4b12adf87231f356b99f64dc726c886c92721276e8463876878ef2893b53273b`.
  **X-Frame-Options: DENY** сохранён; SAMEORIGIN не вводился.
  Auth_request, Origin/dotfiles, no-store/noindex, nosniff, Referrer-Policy,
  GET-only, autoindex off и disable_symlinks побайтно прежние после нормализации root.
- После switch **46 публичных HTTPS-проверок**: 43 ожидаемых auth redirect303
  для каталога, Q1–Q4 и всех 38 Q4 файлов; чужой Origin403; два dotfile404.
  На 403/404 проверены DENY/no-store/noindex/nosniff/Referrer-Policy.
  У прежнего 303 эти заголовки отсутствуют — подтверждено до switch,
  поведение сохранено.
- Public browser desktop/mobile подтвердил обычный login по Q4 URL без overflow.
  **Авторизованный public canvas и ресурсные 200 не проверены:** готовой сессии
  у изолированного браузера нет. Новые сессии/credentials не создавались,
  пароль не вводился, DB не читалась/не менялась. Local browser QA и серверная
  целостность не выдаются за авторизованную public browser-проверку.
- Nginx active; portal и Imagen static running/healthy, restart count 0.
  Studio vhost hash прежний:
  `c873762568396f54496e7bdff7874b688523c9d101adbdd10b355c4c0baac5e6`;
  Imagen include:
  `bf68f12e62ac88e41d5e043cb7acc8b14ba1906c1718f5c3c7efb4d7eef25e34`.
  Portal/Imagen/GPU/DB/firewall/DNS/certificates и чужие сервисы не менялись.

## Ограничения и rollback

Каталог прямо раскрывает частичное сохранение look: фрагмент жилета
поворачивается с дальней рукой; суставы угловатые, контур частично потерян;
contact-gap до 1,521 экранного px. Синтетические скрытые продолжения,
условная кинематика и отсутствие гарантии no sliding сохраняются.
Происхождение RGBA не доказывает правильное смысловое выделение поверхности.
Ни одно неудачное состояние не скрыто. Доставка не исправляет и не отменяет
выводы принятого PoC. Физический телефон/испытание человеком не проверены.
Прежний iframe baseline Q1 ожидаемо блокируется DENY, отдельная ссылка сохранена.

Rollback/evidence:
`/opt/superflight-studio/backups/review-q4-20261023T160331Z`.
Точный rollback snippet — `review.locations.conf`; рядом STATE.json,
candidate.locations.conf и PUBLISHED.json.
Прежний root:
`/srv/superflight-review/releases/556bc12586cd5ce696b3e0f9793be1dddd50a0e0`.
Прежний snippet SHA-256:
`48707613a76e8b5910105c43e0e242459098911e0df27fc568b5e16e778a9e09`.

Перед откатом проверить live snippet по итоговому hash выше на отсутствие
чужих позднейших правок. Подготовить копию rollback snippet в том же
nginx-каталоге с root:root644, атомарно заменить только Review snippet,
выполнить `nginx -t` и graceful reload. DB/сессии не восстанавливать/удалять;
portal/Imagen и остальные сервисы не перезапускать. Старые releases сохранены.

Сырые проверки, proof/manifest, сценарии и снимки — вне Git/web:
`%TEMP%\r4d-release-q4-37e5dd2`.
Серверная запись добавлена append-only в существующие service doc и CHANGELOG.
Свой тестовый браузер закрыт, свой HTTP-server остановлен.
Автоматическая проверка отклонила команду уборки временного `source/`,
`source.tar` и неполной загрузки `bundle-partial/` с причиной `blocked by policy`.
Удаление не повторялось обходным способом; они сохранены в TEMP вне Git/web.
Это не блокер публикации.
В Git входит только этот release report; все чужие изменения сохранены.
Q5 этим Release Engineer не запускался. Фактический URL передан;
следующий опыт запускает Director.
