# HO-TP-01 · адресная доставка frozen v004 / art v002

19 ноября 2026. **`PUBLISHED / DELIVERY_VERIFIED_WITH_OBSERVATIONS / HOLD`**. Release Engineer `release-engineer-r4d-q5a-01`.

[Открыть версионную страницу](https://superflight.space/review/r4d/ho-tp-01/v004-art-v002-0c1d63db/).

Переключение выполнено `2026-11-19T17:35:16.173032+00:00`, 19:35:16 Europe/Kyiv. Runtime v004 и art v002 перенесены четырьмя точными файлами. Авторский статус **ART PARTIAL** и риск тонкого верхнего стыка миски сохранены. Человеческая художественная приёмка ожидается.

Точная выдача CTO Game Art — `ca3d23e2a28dc4829f322bbec3745881eedd52fc`, `RELEASE_TASK.md` и `release/PUBLICATION_INPUTS_v004.json`. Авторизация Max `Sentinel_bfdad3e8e484819185d89b0f936e496f`. SHA-256 входного списка совпал с `12a501618996ae642b729fee3ea5b7797f80fe377dab254ff7220e66af4c9638`.

Фактические параметры текущего хода подтверждены локальными метаданными — `gpt-6.1-sol / high`, cwd `D:\dev\R4D`. На входе HEAD и origin/main указывали на commit выдачи. Принятый локальный отчёт закреплён в `0c1d63db159e7ae40102251aa66d2f9b1d63ad61`, frozen code — `9200c8b2c5c18c3b6e4c6f333e1ccca847af98e6`.

## Входные файлы совпали

Проверены байты четырёх разрешённых файлов в указанном CTO каталоге `K:\Agents\R4D\Review\HO-TP-01\runtime\`. Сумма **5 054 349 байт**. SHA-256 списка frozen QA inputs совпал с `bf0c0d7c8b0d255a3bb46cce0feb0688dbc91913907d1fc9e3139b47869fd690`; четыре хеша соответствуют закреплённым входам.

| Файл | Байты | SHA-256 |
|---|---:|---|
| index.html | 1805 | `cb0ec323fc584e6162b3741a764a896ece59b779272df4a639f6974a647b8dc9` |
| style.css | 1518 | `66314d5fff3f426f6ceb2cf74853f86c5664831e9335fde5c0390590324a7f8e` |
| app.js | 9995 | `5e1fea2fc167863e8bcf38d11e73888574e220f567e74c1153aef3f8e17adc32` |
| assets.js | 5041031 | `1ba6c8d6cfb7639e9eea3d6fad83f811b2648d6b47f9deddd124b76d4da8554c` |

## История первого HOLD и уточнение процедуры

Прочитаны work/REVIEW_HANDOFF.md, последний применимый отчёт ART-2D, текущие README_RU, INDEX, PROCEDURES и service doc на VPS. Фактический root из nginx snippet — `/srv/superflight-review/releases/fx01-43b6268e-20261119T031029Z`. Nginx active, `nginx -t` PASS, свободно около 25 ГБ.

SHA-256 текущего `RELEASE_MANIFEST.json` — `c4c225d3bb83bcb53a3d41e739daba847d9920fbb67d9dfe7e4264515e8febc7`. Внутри manifest поле `release` указывает на `cc42352dbdc996eb0e03de7cd145144fba633b6a`, операция — `millionko-ui02b-r3-r01-cc42352d-20261119T021730Z`.

Полная read-only инвентаризация browser tree обнаружила **1053 фактических файла и 1050 записей published_files**. Отсутствующих файлов из manifest нет. В manifest не перечислены три существующих файла:

- `review/r4d/fx-workshop/fx-01/app.js`
- `review/r4d/fx-workshop/fx-01/index.html`
- `review/r4d/fx-workshop/fx-01/style.css`

Существовавшие `review/index.html` и `review/r4d/index.html` отличались от соответствующих записей manifest. У остальных перечисленных файлов совпали пути, размеры, SHA-256, uid/gid/mode. Символьных ссылок при обходе browser tree не обнаружено. Первоначально Release Engineer остановил доставку и написал об обязательном решении владельца Review. Это была осторожная интерпретация исполнителя. Прямого серверного правила об обязательном STOP/согласовании владельца при таком расхождении в прочитанной процедуре не найдено. Policy/tool rejection не было.

До выпуска leaf `/review/r4d/ho-tp-01/v004-art-v002-0c1d63db/` дал анонимный HTTPS 404. Существующих путей `review/r4d/ho-tp-01*` в releases и видимого активного процесса одноимённой доставки не найдено.

В `PROCEDURES.md`, раздел Default Workflow, требуется инспекция фактического live-состояния. В service doc, раздел Production domain split, выпуску Review разрешена смена только immutable root в стабильном snippet. После уточнения CTO явно поручил RESUME с полным фактическим baseline. Старый manifest сохранился с исходными байтами, его расхождение явно описано в новом manifest. Сверка старого manifest как PASS не объявлялась.

## Фактический выпуск и сохранность

| Параметр | Значение |
|---|---|
| Новый root | `/srv/superflight-review/releases/ho-tp-01-v004-art-v002-0c1d63db` |
| SHA-256 нового manifest | `d13f10d1af8097ce5516aa5b30cbf6c3894ec974793efdaca8bc814647ca1874` |
| SHA-256 фактического baseline | `e74a080eefa7b103e9382372d4f72be796aba7fc8532bb6427ecb5656dcc055e` |
| Прежний root | `/srv/superflight-review/releases/fx01-43b6268e-20261119T031029Z` |
| SHA-256 прежнего snippet | `39b20c6fe05572089c1038ec95129211c8b6b2fc374c16b3baac117da04f3456` |
| SHA-256 нового snippet | `95fe849321a9ed5ba2c33173cf90f93efebc2e8043e79e9bd33081da1e6b9681` |

Новый browser tree содержит 1057 файлов, 194 175 713 байт. Все 1053 прежних файла и прежние каталоги совпали с фактическим baseline по байтам, uid/gid/mode до и после switch. Оба index, FX и прежние releases сохранены. Новые файлы `root:root 0644`, два новых каталога `root:root 0755`, доступ `www-data` проверен. Полная инвентаризация исключила symlinks. Все девять protected конфигураций сохранили хеши.

Использована существующая блокировка `superflight-domain-split.lock` с отказом при занятости. Непосредственно до switch повторены guards root/snippet/полного фактического baseline, предыдущего manifest и protected hashes. Атомарно заменена одна строка Review root. `nginx -t` до и после, graceful reload и nginx active прошли. Другие конфигурации и способ доступа сохранились.

## Внешняя доставка и клики

В новой headless Chromium 145.0.7632.6 с viewport 1920×1080, DPR 1, проверен настоящий HTTPS URL. Страница и четыре ресурса вернули анонимный 200 без Cookie/Authorization. Декодированные HTTP body размеры и SHA-256 всех четырёх файлов совпали с frozen inputs и серверными байтами. MIME — text/html, text/css и application/javascript. Сохранены HSTS, no-store, noindex/nofollow/noarchive, nosniff, same-origin и DENY.

Реальными mouse/button-кликами выполнены хлеб → миска, явный reset, миска → хлеб. Оба пути завершились `both_removed` без активной анимации. Reset вернул `both` и увеличил номер прогона. SHA-256 конечного RGBA Canvas в обоих порядках одинаков — `28a8782d5bfaeb712357c8025301f4f18ad83f55c0955ebf640ae32317831a01`. Видимая оговорка о шве и read-only ART PARTIAL checkpoint подтверждены.

Стенд после успешных обязательных проверок ошибочно отнёс предупреждение Chromium о скорости повторного `getImageData` к ошибкам и завершился с ненулевым кодом. Исходная квитанция сохранена, отдельно записана оценка `DELIVERY_VERIFIED_WITH_OBSERVATIONS`. Это диагностическое предупреждение readback. Дополнительно браузер получил 404 для `/favicon.ico` за пределами четырёх файлов. Runtime и конфигурация при этих наблюдениях не менялись. Ошибок выполнения приложения и отказов его четырёх запросов не зафиксировано. Браузер закрыт. Плавность/FPS, физическое устройство и новая художественная QA этим delivery smoke не проверялись.

## Откат и материалы

Свежий backup `/opt/superflight-studio/backups/review-ho-tp01-20261119T173513Z` содержит прежний и новый snippet, полный factual baseline, `STATE.json`, `PUBLISHED.json` и `rollback.py`. Guarded script проверяет активный snippet hash перед атомарным возвратом прежнего root и nginx test/graceful reload. При позднейшем изменении snippet он отказывается выполнять откат. Скрипт не запускался.

Серверные service doc и CHANGELOG дополнены append-only с резервными копиями прежних байтов и квитанцией `OPS_DOCS_APPENDED.json`. Сырые baseline, inputs, scripts, browser receipt, отдельная оценка предупреждения и остальные квитанции сохранены локально в `K:\Agents\R4D\Review\HO-TP-01\release\delivery-20261119T173223Z\`. Лёгкая выжимка находится в `release/DELIVERY_RESULT_v004.json`. Самостоятельных commit/push нет, их выполняет CTO. Продуктовые файлы и прежние отчёты сохранены.

Художественный статус frozen v004/art v002 сохраняется **ART PARTIAL**, с риском тонкого верхнего стыка миски. Технический PASS локального результата и независимый QA относятся к своим проверенным условиям. Человеческая художественная приёмка ожидается.

**HOLD после доставки.**
