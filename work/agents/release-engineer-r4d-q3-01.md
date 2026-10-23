# Release Engineer R4D · Q3

23 октября 2026. Staff ID: `release-engineer-r4d-q3-01`.
Прямой заказчик: CTO `cto-r4d-01`, thread
`01a1653d-1c24-7991-a16b-619bc964ca40`.
Собственный thread: `01a16944-46fb-7e50-b04f-d1cc4bf87de7`.
Локальный `turn_context` подтверждает `gpt-6.1-sol`, reasoning `medium`,
cwd `D:\dev\R4D`. Subagents, чаты, saved projects, worktree и клоны не создавались.

## Доставлено

**Q3: https://superflight.space/review/r4d/q3-other-anatomy/**

Ссылка с основным ограничением добавлена в https://superflight.space/review/.
Это принятый CTO `stop/show with limitations`; художественный PASS не заявляется.

- Exact runtime source: `62b23cdc1b62a6bc612846fb202862d5f4901560`,
  только `experiments/q3-other-anatomy/`.
- Docs-only acceptance: `556bc12586cd5ce696b3e0f9793be1dddd50a0e0`.
- Immutable release identity/root:
  `/srv/superflight-review/releases/556bc12586cd5ce696b3e0f9793be1dddd50a0e0`.
- Переключено `2026-10-23T15:07:40.113894+00:00` (18:07:40 Europe/Kiev).
- `RELEASE_MANIFEST.json` SHA-256:
  `ab76a86b38959c567239351cfedd4c5eb3afb51dcc272ec1dd65746d131de5b7`.
- Manifest: 95 608 байт, вне browser tree.
- Q3: **30 новых runtime-файлов / 715 816 байт**.
- Всё browser tree: **223 файла / 17 932 366 байт**.
- Вместе со служебным manifest: **224 файла / 18 027 974 байта**.
- **192 прежних файла сохранены побайтно**, включая весь Q1/Q2 и остальные
  материалы. Единственный изменённый прежний файл — `review/index.html`:
  добавлена карточка Q3 и счётчик `4 демонстрации` → `5 демонстраций`.
  Обратная проверка удаления только этих двух изменений дала исходные байты.

## Инструкции, источники и доказательство происхождения

Канонический Playbook прочитан через GitHub connector на
`da128e302e44e749431d3e3822e554bd6aca7cf8`, blob
`e1d6d4744878dc2153507954f03cd768ed1d5e4e`; fallback не применялся.
Общая роль и MODELS прочитаны через Git на Staff revision
`41f19e8de9d6f84f6e533186bda902e4f2c1c68e`.
Выполнен `git fetch origin`; HEAD и origin/main при начале совпадали с
`556bc12586cd5ce696b3e0f9793be1dddd50a0e0`.
На этой ревизии прочитаны AGENTS, COMMON, проектная роль, очередь,
требования демонстрации, RESULTS и STATE Q3. Прочитаны REVIEW_HANDOFF,
фактический выпуск Q2 и обязательные четыре серверных документа.

Runtime получен `git archive` из exact commit в отдельный временный каталог,
без checkout/worktree. В принятом commit нет dist. Выполнены штатные
`npm ci --ignore-scripts --no-audit --no-fund` и `npm run build` с exact lockfile.
Изолированный каталог сборки использовался как рабочий каталог команды npm;
проектный cwd сессии оставался R4D. Продукт, его конфигурация и dirty checkout
не использовались как изменяемый источник и не исправлялись.

Перед упаковкой 13 входов независимо перечитаны через `git show` и побайтно
сверены с архивом: HTML, main/motion/CSS, Vite config, package/package-lock,
runtime manifest и пять уникальных используемых PNG (11 attachment).
Для каждого сохранены Git blob ID, SHA-256 и размер в `q3.source_files`
release manifest. SHA-256 канонического массива proof
(`json.dumps(..., ensure_ascii=False, sort_keys=True, separators=(',',':'))`, UTF-8):
`796400913da0fa27e4c23c192b1b2547c85ec608055b7215029ffc9440400861`.

PNG и runtime manifest опубликованы побайтно из Git. HTML/JS/CSS — результат
штатной Vite-сборки этих исходников и locked dependencies; совпадение с
несуществующими Git dist blobs не заявляется. SHA-256 и размеры каждого
публикуемого файла находятся в `published_files`. Manifest содержит историю
предыдущих выпусков и отдельный раздел Q3; inherited source metadata не
обозначает повторную сборку старых материалов.

За основу скачан live Q2 release `b0717cf12b8da161e44a3c6dd0166cd403366ed7`;
его manifest SHA-256
`d8badfe5e00b0047433ccd04820ba154a469df5415cc8e8c5a28575704e81a40`
и все 193 прежних browser-файла сверены до добавления Q3.
Публикуемый набор ограничен built HTML/JS/CSS, runtime manifest и пятью PNG.
Prompts, source images, preparation scripts, QA/evidence, logs, source maps,
dependencies/node_modules, Git metadata, cookies, credentials и пользовательские
данные в browser tree не добавлены. Упоминания исходных путей в неизменном
runtime manifest не являются публикацией самих исходных изображений.
Сборщик Imagen не менялся.

## Проверено

- Точное подготовленное локальное immutable дерево: desktop 1440×1000 и
  mobile 390×844 с isMobile/touch в изолированных Chromium-контекстах.
  Встроенный браузер оказался недоступен: доступен только личный Chrome Max
  с ошибкой request-header policy. Личный браузер и рабочий стол не использованы;
  применён навык Playwright и отдельная сессия `r4d-q3-release`.
- Переход с карточки каталога, idle/low/move/jump, смена low в полёте и
  посадка в low, оба полных маршрута с проверкой итоговых ground и числа
  посадок, midMove/midJump, клавиши/удержание движения и смена move в полёте,
  пауза и шаг 1/60, reset, скорость, три фона и кости. 11 частей загрузились;
  JS page errors, failed requests, HTTP 4xx ресурсов и горизонтального overflow нет.
  Снимки desktop low и mobile idle лично просмотрены. Локальные HTTP-ответы
  в тестовом браузере получали прежние DENY/no-store/noindex без изменения
  байтов контента. Это проверка доставки, не новая художественная приёмка.
- Девять существующих Review/deployment tests прошли. Первый запуск шести
  bundle tests не нашёл пакет `review`; повтор с `PYTHONPATH=D:\dev\Imagen`
  прошёл без правки тестов/продукта. Три deployment tests прошли отдельно.
- До switch сервер проверил SHA-256 архива, manifest, все 223 browser-файла,
  размеры, полное множество путей, прежнее дерево и минимальное изменение
  каталога. Права root:root, каталоги 755, файлы 644, symlinks отсутствуют.
  После проверок incoming переименован в новую immutable identity.
- Fresh rollback сохранён до switch. Review snippet заменён атомарно через
  `os.replace`, отличается только root. `nginx -t` прошёл до switch и после
  замены, выполнен только graceful `systemctl reload nginx`.
  После switch повторно проверены все пути, SHA-256, размеры, права и владельцы
  всего release, а также неизменность защищённых конфигов.
- Итоговый snippet SHA-256:
  `48707613a76e8b5910105c43e0e242459098911e0df27fc568b5e16e778a9e09`.
  `X-Frame-Options: DENY`, auth_request, Origin/dotfiles, no-store/noindex,
  nosniff, Referrer-Policy, GET-only, autoindex off и disable_symlinks сохранены.
  SAMEORIGIN не вводился.
- 37 публичных HTTPS-проверок после switch: каталог, Q1/Q2/Q3 и все 30
  файлов Q3 без сессии дали ожидаемый 303 на прежний login (34 проверки);
  чужой Origin — 403; `.git/config` и `.env` — 404. На 403/404 подтверждены
  DENY, no-store, noindex, nosniff и Referrer-Policy. У прежнего 303 этих
  заголовков нет — это подтверждено и до switch, поведение не менялось.
  В первом HTTP-сценарии ожидался относительный Location; фактически nginx
  возвращает абсолютный URL того же login. Исправлено только ожидание проверки.
- Public browser desktop/mobile подтвердил страницу входа по Q3 URL без
  overflow. **Авторизованный public canvas и ресурсные 200 не проверены:**
  у изолированного браузера нет готовой сессии. Credentials/сессии не создавались,
  пароль не вводился, DB не читалась/не менялась. Серверная целостность и local
  browser QA не выдаются за авторизованную публичную браузерную проверку.
- nginx active, portal и Imagen static running/healthy, restart count 0.
  Studio vhost SHA-256 прежний:
  `c873762568396f54496e7bdff7874b688523c9d101adbdd10b355c4c0baac5e6`;
  Imagen include:
  `bf68f12e62ac88e41d5e043cb7acc8b14ba1906c1718f5c3c7efb4d7eef25e34`.
  Portal/Imagen/GPU/DB/firewall/DNS/certificates и чужие сервисы не менялись.

## Ограничения и откат

Принятые ограничения сохранены: в low дальняя цепь скрыта корпусом, колено
выступает над правым краем, связь третьей ноги читается хуже. Повторяющиеся
детали и сегментированные втулки, фиксированный ракурс, ручная кинематика и
условный перенос массы остаются. Физический горизонтальный якорь стоп
отсутствует; отсутствие любого скольжения не подтверждено. Универсальный
авториг/повторяемость для других анатомий не проверялись. Агентский просмотр
не является испытанием человеком или физическим телефоном. Прежний iframe
baseline Q1 блокируется DENY; отдельная ссылка сохранена.

Rollback/evidence:
`/opt/superflight-studio/backups/review-q3-20261023T150610Z`.
Точный rollback snippet — `review.locations.conf` в этом каталоге;
рядом STATE.json, candidate.locations.conf и PUBLISHED.json.
Прежний root:
`/srv/superflight-review/releases/b0717cf12b8da161e44a3c6dd0166cd403366ed7`.
Прежний snippet SHA-256:
`23b6cfbcffd77fce166c101ee565cca814d13642cd2f9449dac21a360a014ab0`.

Перед откатом сверить отсутствие новых чужих изменений по итоговому hash
live snippet. Подготовить копию rollback snippet в том же nginx-каталоге,
root:root 644, атомарно заменить только Review snippet, `nginx -t`, graceful
reload. DB/сессии не восстанавливать/удалять, portal/Imagen и другие службы
не перезапускать. Старые immutable releases не редактировались и не удалялись.

Сырые проверки, manifest, proof, сценарии и снимки сохранены вне Git/web:
`%TEMP%\r4d-release-q3-62b23cd`. Серверный release record добавлен в существующие
service doc и CHANGELOG. В Git входит только этот release report;
чужие JOURNAL, CTO state, REVIEW_HANDOFF, `.playwright-cli/`, `work/q3-local/`
и `work/requests/` сохранены.

Свой проверочный браузер закрыт, свой HTTP-server остановлен. Автоматическая
проверка отклонила удаление временного `source/` и `source.tar` с причиной
`blocked by policy`; они оставлены в указанном TEMP-каталоге вне Git/web.
Удаление не повторялось обходным способом. Это не blocker публикации.

Q4 не запускался. Director может запускать его по фактическому public URL Q3 выше.
