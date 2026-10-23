# Release Engineer R4D · Q5

23 октября 2026. Постоянный Release Engineer `release-engineer-r4d-q5-01`.
Заказчик и единственный канал координации — CTO `cto-r4d-01`, thread
`01a1653d-1c24-7991-a16b-619bc964ca40`. Собственный thread:
`01a169aa-6cc2-7ed2-b8b4-b41cdea7b04c`.
Оба локальных `turn_context` подтвердили фактические `gpt-6.1-sol`, reasoning
`medium`, cwd `D:\dev\R4D`. Конфигурация текстовым поручением не подменялась.

## Доставлено

**https://superflight.space/review/r4d/q5-construction-first/**

Карточка Q5 добавлена в https://superflight.space/review/.
Accepted source и acceptance commit:
`7d10a2a1d83fbceefaf9c11d0c8c9ae6db3d6dbd`, только
`experiments/q5-construction-first/`. Решение CTO — **stop/show with limitations,
без коррекции продукта**. Исследовательский результат не объявляется
безупречным production-asset.

- Immutable identity/root:
  `/srv/superflight-review/releases/7d10a2a1d83fbceefaf9c11d0c8c9ae6db3d6dbd`.
- Atomic switch: `2026-10-23T16:58:14.806156+00:00` — 19:58:14 Europe/Kiev.
- `RELEASE_MANIFEST.json` SHA-256:
  `8404d22b8faa503bec9ddf28c8e1720b27b1b7cb279ca3ed69f4606ffc5d781a`.
- Manifest: **139 711 байт**, вне browser tree.
- Q5: **37 новых runtime-файлов / 964 665 байт**.
- Всё browser tree: **298 файлов / 22 491 011 байт**.
- Вместе с manifest: **299 файлов / 22 630 722 байта**.
- **260 прежних файлов сохранены побайтно**, включая Q1–Q4 и остальные
  материалы Review. В единственном изменённом прежнем файле
  `review/index.html` добавлены только карточка Q5 и счётчик `6` → `7`.
  Удаление ровно этих двух изменений восстанавливает прежние байты.
  Разница размера каталога: **+839 байт**.

## Источники и сборка

Прочитаны канонический Playbook Chatknows на revision
`da128e302e44e749431d3e3822e554bd6aca7cf8` через GitHub connector; общая роль
и MODELS через Git на Staff revision
`41f19e8de9d6f84f6e533186bda902e4f2c1c68e`; проектные AGENTS, COMMON,
роль, очередь, требования демо и CTO_DECISION из exact accepted commit.
Прочитаны REVIEW_HANDOFF, отчёт Q4 и четыре обязательных серверных документа.
Первой командой второго этапа выполнен `git fetch origin`; `origin/main`
совпал с accepted commit. Все исходные dirty/untracked сохранены.

Все файлы Q5 извлечены побайтно через `git show <accepted>:<path>` в отдельный
TEMP-каталог, без checkout, worktree или clone. Сборка не использовала dirty
checkout или случайный HEAD. Штатные `npm ci --ignore-scripts --no-audit
--no-fund` и `npm run build` выполнены с exact package/lock и Vite config;
Node `v24.15.0`, Vite `7.3.7`. Команды запускались из R4D с `npm --prefix`.

Candidate `output/builder/q5-c1-files.json` побайтно равен Git blob;
SHA-256 совпал с заданным:
`cc6ad2723362c7bac5e9a1f432c99fd7e06716f29b99152dde9eb00f939cccd3`.
До и после сборки сверены **40 frozen runtime и 38 provenance inputs**:
размер, SHA-256 и точные байты accepted Git blobs. Release manifest содержит
accepted commit, candidate manifest path/hash и все 78 записей с Git blob ID.

Публикуются только built HTML/JS/CSS, runtime `art/manifest.json` и 12 parts
PNG. Construction rig встроен в JS, 12 маленьких construction PNG встроены
штатным Vite как data URLs: их требует существующая кнопка «Конструкция / арт».
Отдельные blueprint sheets, prompts, промежуточные originals, preparation
scripts, provenance-документы, QA/evidence/logs, source maps, dependencies,
Git и credentials не опубликованы. Набор dist проверен явным allowlist;
изменения продукта и сборщика Imagen не выполнялись.

Основа — сохранённый bundle Q4. Его manifest hash
`ba26ac3e9749f6f53dcefabbc93a5a922020c8ad937355161ccae4697ae5a943`
и все 261 файл проверены перед копированием. Сервер перед переключением
независимо сверил эту основу с фактическим прежним live release и сравнил
все прежние материалы с новым деревом. Архив передачи SHA-256:
`5e9e543509762fa67fcaf7e6b4d775c6e326f130b000c3e14d5378b93152d6d3`.

## Фактические проверки

- Точное локальное release-дерево проверено Chromium через навык Playwright,
  отдельная сессия `r4d-q5-release`: desktop 1440×1000 и mobile 390×844,
  `isMobile`/touch. Inventory встроенного браузера вернул ошибку request-header
  policy и только личный Chrome; личный Chrome и рабочий стол Макса не трогались.
- На каждом размере — 17 наблюдений: idle, distinct low, locomotion, jump,
  изменение наземной цели в полёте и посадка в low/move, команды move/jump из
  промежуточной low, construction/art, bind, кости/фон, пауза/возобновление,
  шаг 1/60, reset, скорость и готовый midMove. Команды нажимались через UI;
  для воспроизводимого smoke время продвигалось существующим `__R4D.step`.
  Состояние low заметно отличается: rootY 0 → 78.16; после midMove-запроса
  текущая промежуточная поза не сбросилась. Это проверка доставки, не новая
  предметная приёмка или подтверждение субъективной плавности.
- В обоих браузерах загружены все 12 уникальных частей; ошибок JS,
  failed requests, HTTP 4xx ресурсов и горизонтального overflow нет.
  Карточка каталога проверена на все заданные ограничения и отсутствие
  overflow. Снимки desktop low и mobile idle просмотрены.
- Локальная HTTP-проверка **всех 298 browser-файлов** подтвердила их размеры
  и SHA-256 относительно release manifest. Тестовая HTTP-обёртка добавляла
  DENY/no-store/noindex без изменения контента. Исходный local reference
  `http://127.0.0.1:4185/` не изменялся; exact release проверен отдельно на 4195.
- Сервер до и после switch проверил точное множество путей, все размеры и
  SHA-256, отсутствие symlinks, root:root, dirs755/files644. Прежний Q4 release
  после switch повторно полностью сверен и остался неизменным.
- Свежий rollback создан до переключения. Атомарно заменён только root
  Review snippet через `os.replace`; `nginx -t` до/после прошёл,
  выполнен только graceful `systemctl reload nginx`.
- Live snippet SHA-256:
  `38d728805abbe74d61b5b304e7d0a6e72b2a8b57f1de7a9fc0856597a09bec01`.
  **X-Frame-Options: DENY** сохранён; SAMEORIGIN не вводился. После нормализации
  единственного root snippet побайтно прежний: auth_request, Origin/dotfiles,
  no-store/noindex, nosniff, Referrer-Policy, GET-only, autoindex off,
  disable_symlinks и прочие настройки сохранены.
- После switch прошли **46 публичных HTTPS-проверок**: 43 ожидаемых auth303
  для каталога, Q1–Q5 и всех 37 Q5 файлов; чужой Origin403; два dotfile404.
  На 403/404 проверены DENY/no-store/noindex/nosniff/Referrer-Policy.
  У прежнего303 эти заголовки отсутствуют — подтверждено до switch и сохранено.
- Public browser desktop/mobile подтвердил обычный login по Q5 URL,
  без overflow. **Авторизованный public canvas и ресурсные200 не проверены:**
  готовой сессии у изолированного браузера нет. Новые credentials/sessions
  не создавались; пароль не вводился; DB не читалась и не менялась.
- Nginx active; существующие portal и Imagen static running/healthy,
  restart count0. Studio vhost hash прежний:
  `c873762568396f54496e7bdff7874b688523c9d101adbdd10b355c4c0baac5e6`;
  Imagen include hash прежний:
  `bf68f12e62ac88e41d5e043cb7acc8b14ba1906c1718f5c3c7efb4d7eef25e34`.
  Portal/DB/firewall/DNS/certificates/GPU и чужие сервисы не менялись.

## Ограничения и rollback

Карточка явно раскрывает: генератор потребовал uniform scale/translation
к заранее заданным областям; остаточное coverage head **97.182%**, forearm
**98.042%**, foot **86.0863%**; после растра раскрыта калибровка опоры
**extent30→31**; видны суставные накладки, двойные тёмные линии и повтор
Near/Far; отрыв ближайшей подошвы наблюдался до **1.5896 экранного px**;
субъективная плавность в реальном времени не подтверждена.
Физический телефон и испытание человеком не проверены. Ни одно состояние
не скрыто; коррекция не выполнялась. Q1 iframe по-прежнему блокируется DENY.

Fresh rollback/evidence:
`/opt/superflight-studio/backups/review-q5-20261023T165743Z`.
Точный rollback snippet — `review.locations.conf`; рядом STATE.json,
candidate.locations.conf и PUBLISHED.json.
Прежний root:
`/srv/superflight-review/releases/412030fd83e6ddfd010811d2c11e0f8ee7af7f45`.
Прежний snippet SHA-256:
`4b12adf87231f356b99f64dc726c886c92721276e8463876878ef2893b53273b`.

Перед откатом проверить live snippet по итоговому hash выше на отсутствие
позднейших чужих изменений. Подготовить копию rollback snippet в том же
nginx-каталоге с root:root644, атомарно заменить только Review snippet,
выполнить `nginx -t` и graceful reload. DB/сессии не восстанавливать/удалять;
чужие сервисы не перезапускать. Старые releases сохранены.

Сырые проверки, proof/manifest, сценарии и снимки — вне Git/web:
`%TEMP%\r4d-release-q5-7d10a2a`. Серверный service doc и CHANGELOG дополнены
append-only. Свой браузер закрыт, свой HTTP-сервер остановлен; два созданных
CLI snapshot перенесены в этот TEMP-каталог. Все 39 исходных dirty/untracked
файлов проверены по SHA-256 и сохранены. Повторный `git fetch origin` перед
записью отчётного коммита подтвердил тот же accepted commit в `origin/main`.
В Git разрешён только этот отчёт/состояние. Subagents, новые
чаты, saved projects, worktree и клоны не создавались. UGH/Imagen не менялись.
Q6 не начинался. Состояние: выпуск опубликован и проверен в указанных пределах;
дальнейшие поручения — только через CTO.
