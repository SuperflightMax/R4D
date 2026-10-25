# Q5A ASSEMBLY03: запись выпуска

**Актуальный статус: PUBLISHED_DELIVERY_VERIFIED_WITH_AUTH_LIMITATION.** [Открыть Q5A в Review](https://superflight.space/review/r4d/q5a-construction-first/). Выпуск состоялся после отдельного разрешения VPS-действий; подробности и границы проверок — в последнем разделе ниже. Первая запись сохранена как история остановки, её запрет и статус больше не действуют.

## Историческая запись: остановка до разрешения VPS

25 октября 2026 года, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`, по отдельному production release brief CTO `cto-r4d-01` (thread `01a1653d-1c24-7991-a16b-619bc964ca40`).

**BLOCKED_BY_VPS_ACCESS_PROHIBITION — not published.** Q5A принят CTO для PoC release; публикация остановлена после read-only проверки штатного процесса, до внешних изменений. Эта блокировка доставки не меняет приёмку продукта.

## Точная версия

| Назначение | Commit / версия |
|---|---|
| HEAD и локальный origin/main при проверке | `31ade6bb3109052c297e08013607ddd04eea866a` |
| Frozen production | `101343caa68579aacd5e6c01b94206680c364ab7` |
| Candidate | `Q5A-NELA-ASSEMBLY-03` |
| QA base | `0f032c21f555473aca7c61960a8c563d2440fc97` |
| CTO acceptance commit | `31ade6bb3109052c297e08013607ddd04eea866a` |

Приёмка: [CTO_ACCEPTANCE_ASSEMBLY03.md](CTO_ACCEPTANCE_ASSEMBLY03.md). Production, accepted dist, art, rig, motion и QA conclusions не изменялись. Production diff=none относительно acceptance commit.

## Процесс и препятствие

Из exact acceptance commit прочитаны предыдущие release reports [Q1](../../work/agents/release-engineer-r4d-q1-01.md), [Q5](../../work/agents/release-engineer-r4d-q5-01.md) и [Q6](../../work/agents/release-engineer-r4d-q6-01.md). В них штатный Review release состоит из создания нового неизменяемого серверного release-каталога с сохранением старых материалов, проверки manifest/хешей, атомарного переключения root существующего nginx Review snippet, проверки конфигурации и плавного перечитывания nginx.

Этот процесс требует записи на VPS и управления его nginx. Текущий brief прямо запрещает действия с VPS и предписывает остановиться, если штатная публикация невозможна без них. Другой разрешённый существующий механизм в прочитанных отчётах не установлен; обход, новый pipeline, сайт или инфраструктура не создавались.

## Доставка и проверки

Предполагаемый маршрут: `/review/r4d/q5a-construction-first/` в существующем Review на `superflight.space`. Это целевой адрес, а не подтверждённая опубликованная ссылка: URL этим выпуском не создан, его доступность не проверена. В предыдущих отчётах Review требует обычной авторизации SuperFlight; фактические условия доступа к Q5A не проверялись.

Сверка 26 dist-файлов с опубликованной версией, published integrity, загрузка ресурсов и delivery smoke не выполнялись: опубликованного этим выпуском кандидата нет. Desktop/mobile, controls, 1×/2× и jump при доставке не проверены. Новые QA PASS не заявляются; существующие выводы QA сохранены.

Внешняя среда не изменялась; VPS, UGH, Imagen, credentials и payments не использовались. Прежние Q1–Q6, их URL и версии не менялись. Чужие dirty/untracked и service caches не затрагивались. Новых попыток публикации после обнаружения блокировки не было.

## Следующее действие

Проект R4D переведён в **IDLE (не paused)** отдельным текущим указанием
Макса. Эта блокировка не является открытым поручением искать другой маршрут:
публикацию не повторять, инфраструктуру не менять, Q4A/Q2A не начинать без
нового прямого поручения Макса. Откат выпуска не требуется: внешних изменений
не было.

## Публикация после разрешения VPS — 25 октября 2026

CTO `cto-r4d-01` передал прямое исправление и разрешение Макса выполнить штатный защищённый Review release на существующем VPS. Новые эксперименты, Q4A/Q2A и изменения продукта не заказывались. Начальная база этого выпуска: HEAD=origin/main=remote main `df162c4b80cecf2ab0b6d7d5a50ea32c0f226374`.

Опубликован **Q5A-NELA-ASSEMBLY-03**: https://superflight.space/review/r4d/q5a-construction-first/ . Каталог: https://superflight.space/review/ . Переключение: **2026-10-25T09:22:46.449612+00:00**, 12:22:46 Europe/Kyiv.

### Версия и точность доставки

- Frozen production: `101343caa68579aacd5e6c01b94206680c364ab7`.
- QA base: `0f032c21f555473aca7c61960a8c563d2440fc97`.
- Acceptance и release id: `31ade6bb3109052c297e08013607ddd04eea866a`.
- Immutable root: `/srv/superflight-review/releases/31ade6bb3109052c297e08013607ddd04eea866a`.
- Все **26 dist-файлов / 608420 bytes** извлечены из Git objects; набор, размеры, SHA-256 и точные байты совпали между frozen production, acceptance commit и начальным main. Сборка, product wrapper и изменения accepted dist не выполнялись.
- `RELEASE_MANIFEST.json` вне browser tree: **182349 bytes**, SHA-256 `afcae9b6b7e3c8bcfa0fb170feeae139aedfc51a94783e956175849cc08603d6`. В нём каждый Q5A-файл имеет source path, Git blob ID, размер и SHA-256; сохранены сведения прежних выпусков.
- Архив передачи SHA-256: `3c7c012596a2126b67bd6706c651a5db824e30a8102951a00b732d06da2a4a0e`.
- Browser tree: **360 файлов / 24708105 bytes**. Сохранены побайтно **333 прежних файла**; единственное изменение старого browser-файла — карточка Q5A и счётчик 8→9 в `review/index.html` (+996 bytes). Удаление ровно этих двух изменений восстанавливает прежний каталог. Все старые releases и URL сохранены.

Штатный процесс: проверенная копия предыдущего bundle Q6, добавление только exact Q5A dist и карточки, серверная сверка полного множества файлов/хешей/размеров/прав, новый immutable каталог, свежий rollback, атомарное переключение только root существующего Review snippet, проверка nginx до/после и graceful reload. Нормализация единственного root восстанавливает прежний snippet побайтно. DENY, auth_request, Origin/dotfiles, no-store/noindex, nosniff, Referrer-Policy, GET-only, autoindex off и disable_symlinks сохранены.

Итоговый Review snippet SHA-256: `3819b2b1c0521471a7802c023dc00de70b70e842f671b03d6873549d657ea2c0`. Studio vhost, Imagen include, portal app/Compose проверены неизменными. Nginx active; прежние контейнеры сохранили running/healthy. Portal, DB/сессии, UGH/Imagen product, GPU/очередь, firewall, DNS и сертификаты не менялись; credentials не читались и не создавались.

### Инвентаризация принятых результатов R4D

Сопоставлены `docs/EXPERIMENT_STATUS.md`, `docs/COMPARISON.md`, итоговые RESULT/RESULTS Q1–Q6, `docs/Q1_Q6_COMPARATIVE_CONCLUSION.md`, release records и фактические карточки/файлы live Review. Первые восемь результатов уже опубликованы; повторная сборка или замена их версий не требовалась. Прежние runtime bytes подтверждены по серверному manifest, а ссылки — в каталоге и публичной auth-проверкой. Это проверка наличия/сохранности, не новый поведенческий QA каждого старого опыта.

| Принятый результат | URL | Действие этого выпуска |
|---|---|---|
| Первый PoC, GPT-5.6 Sol | https://superflight.space/review/r4d/gpt-5.6-sol/ | Подтверждён, сохранён |
| Первый PoC, GPT-6.1 Sol | https://superflight.space/review/r4d/gpt-6.1-sol/ | Подтверждён, сохранён |
| Q1 | https://superflight.space/review/r4d/q1-gpt61-continuation/ | Подтверждён, сохранён |
| Q2 | https://superflight.space/review/r4d/q2-simple-character/ | Подтверждён, сохранён |
| Q3 | https://superflight.space/review/r4d/q3-other-anatomy/ | Подтверждён, сохранён |
| Q4 | https://superflight.space/review/r4d/q4-whole-character/ | Подтверждён, сохранён |
| Q5 | https://superflight.space/review/r4d/q5-construction-first/ | Подтверждён, сохранён |
| Q6 | https://superflight.space/review/r4d/q6-single-joint/ | Подтверждён, сохранён |
| Q5A, Нэла ASSEMBLY03 | https://superflight.space/review/r4d/q5a-construction-first/ | Добавлен |

Черновики и rejected attempts заново не публиковались. Сохранённые ранее исторические сравнения Q1/Q6 не менялись. Q4A/Q2A не начинались.

### Проверка доставки и ограничения

Сервер до/после переключения сверил все 360 browser-файлов, размеры/SHA-256, точный набор путей, отсутствие symlinks, root:root и dirs755/files644. Прежний Q6 release также повторно полностью сверен. По локальному HTTP все 360 файлов точного release-дерева совпали с manifest.

Изолированный Chromium через Playwright: desktop **1440×1000**, mobile emulation **390×844** с touch/isMobile. По 11 наблюдений на размер: idle, low, walk, jump flight, наземная цель low в полёте и посадка, пауза/реальный clock/шаг, скорость, остановка в idle, 1×/2×, кости/сетка/тёмный фон. UI-команды нажимались через реальные controls; время для повторимых кадров двигалось принятым `q5a.step`. Candidate показан как `Q5A-NELA-ASSEMBLY-03`, все 17 PNG загружены, обе авторские alpha-маски активны. Ошибок JS/WebGL, failed requests, HTTP4xx/5xx ресурсов и горизонтального overflow нет; снимки desktop jump2× и mobile просмотрены. Это delivery smoke, не повторная предметная приёмка.

Через публичный HTTPS прошли **39 проверок**: каталог, все девять результатов и каждый из 26 Q5A-файлов без сессии дают прежний 303 на `https://superflight.space/login?next=review`; чужой Origin даёт 403, два dotfile пути — 404. На 403/404 сохранены защитные заголовки; прежний 303 без этих заголовков сохранён. Публичный desktop/mobile browser также подтвердил обычную страницу входа без overflow.

**Авторизованный публичный canvas и ресурсные 200 не проверены:** у встроенного и изолированного браузеров нет готовой SuperFlight-сессии. Пароль не вводился, новые сессии не создавались, личные cookies не читались и не переносились. После сообщения об отсутствии сессии CTO прямо запретил использовать личный Chrome Макса и поручил завершить выпуск по серверным, публичным auth и локальным browser-проверкам exact bytes. Личный Chrome не использовался; ранее заданный вопрос о нём не является зависимостью выпуска. Статус публикации подтверждён сервером и публичными auth-барьерами; успешный просмотр после входа не выдаётся за лично выполненный. CTO не считает это основанием откатывать проверенный выпуск. Физический телефон, иные browser engines/GPU и человеческая оценка не проверены.

Принятые CTO ограничения сохраняются: слабый contrast служебного dark badge; при 2× линия пола в полёте может выйти из кадра при целом персонаже; конечный набор проверенных команд не доказывает все непрерывные последовательности. Внутри exact dist сохранён старый служебный текст «качество движения ещё не принято»; актуальная приёмка — в CTO_ACCEPTANCE_ASSEMBLY03.md и карточке Review. Продукт ради текста не редактировался.

### Rollback и завершение

Fresh rollback/evidence: `/opt/superflight-studio/backups/review-q5a-20261025T092216Z`, файлы `review.locations.conf`, `STATE.json`, `candidate.locations.conf`, `PUBLISHED.json`, не запущенный guarded `rollback.py`. Прежний root: `/srv/superflight-review/releases/f38017f3f389fcc2e068265199f3d9111bef8af3`; прежний snippet SHA-256 `70e9eebd07483e9011ea53a781b5f6f18c81492cdf12f6db48a922c6e1b3a620`.

Перед откатом проверить отсутствие позднейших правок по итоговому snippet hash. Вернуть только сохранённый Review snippet атомарно, root:root644; проверить nginx и выполнить graceful reload. DB/сессии не восстанавливать и не удалять; старые releases и чужие службы сохранить.

Локальные manifest, scripts, proof, HTTP/browser results и screenshots: `%TEMP%/r4d-release-q5a-31ade6b`, вне Git/browser tree. Серверные service doc и CHANGELOG дополнены по штатному процессу; их предыдущие копии сохранены в rollback. Все 50 исходных dirty/untracked файлов сверены по SHA-256 и сохранены. Собственные проверочные браузеры и localhost-сервер закрыты; собственный CLI snapshot перенесён в TEMP. Чужие service caches не затронуты; в Git включаются только release record и актуальное состояние R4D. Production diff=none. После этой отдельной доставки Q4A/Q2A остаются не начатыми; дальнейшие действия — по отдельному поручению.
