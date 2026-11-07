# Q3C · публикация WHOLE_DEMO

**`PUBLISHED_WHOLE_DEMO / DELIVERY_VERIFIED`**, 7 ноября 2026. Release Engineer `release-engineer-r4d-q5a-01`, по поручению CTO `cto-r4d-01`.

[Запустить WHOLE_DEMO](https://superflight.space/review/r4d/q3c-victorian-mantis/demo/) · [Landing и концепты](https://superflight.space/review/r4d/q3c-victorian-mantis/) · [Исторический первый срез](https://superflight.space/review/r4d/q3c-victorian-mantis/slice/) · [Каталог R4D](https://superflight.space/review/r4d/#skeleton).

Публичная демонстрация проходит всю историю от маячка и падения капсулы до ходьбы, раскрытия богомола, полёта мотылька, контактного захвата, рассыпания и повторной охоты. Landing и карточка обозначают `WHOLE_DEMO` как демонстрацию для показа. Финальная приёмка релиза — отдельный этап.

## Источник и сборка

Точный product/design/assets base `c5d5e8408e7a00f5ea0dbf2b14d351807249f171`. Перед началом `HEAD = origin/main = remote main` на этом commit. CTO передал результаты Builder: 26/26 тестов, build и сценарий 1× на desktop, mobile 390 и 360 прошли. Для доставки отдельно собран production Vite и проверен публичный сценарий в объёме ниже.

89 входов извлечены по Git blob в отдельный TEMP. SHA-256 списка путей, blob IDs, размеров и хешей входов указан в release manifest. Байты входов повторно сверены после сборки. Vite 7.3.7 собран по exact lockfile командами `npm ci --ignore-scripts --no-audit --no-fund` и `npm run build -- --assetsInlineLimit 1048576`. Порог инлайнинга задан на уровне команды, чтобы runtime-детали SVG вошли в скомпилированный bundle. Vite выдал предупреждение о размере основного chunk (769,79 кБ до gzip, 69,12 кБ после gzip). Сборка завершилась успешно.

Новый маршрут содержит **24 файла HTML/JS/CSS, 1 327 188 байт**. Публичный набор исключает отдельные SVG, raw source, source maps, тесты, QA/evidence, манифесты материалов, handoffs, профили, кэши и release metadata. SHA-256 архива сборки `3acf422d4f3b4f15411a3d96aa9c00bcd75edd5089a86a023012ca66f9a0eaa5`.

## Переключение Review

| Параметр | Значение |
|---|---|
| Переключение | `2026-11-07T16:30:48.848086+00:00` · 18:30:48 Europe/Kyiv |
| Live root | `/srv/superflight-review/releases/c5d5e8408e7a00f5ea0dbf2b14d351807249f171` |
| Прежний root | `/srv/superflight-review/releases/4a26f1cb789a4b41d09e7b7c9ac1905680d965b4` |
| SHA-256 live `RELEASE_MANIFEST.json` | `5f1ec00de9d14c4fed30b3c1345b65480736e3da1364eda1c4b1fd504af4a472` |
| SHA-256 прежнего manifest | `cb20b86de7381d50328c1d0006cedf9f8debf4c0b56a6415f0338e5653f25a8b` |
| SHA-256 live Review snippet | `b694e051100453d98bf8fe78b1df35265737dc9d4cb29f58ea443ce434f4cb77` |
| SHA-256 прежнего snippet | `f802efc38ad60907f0f642de34a2fa3f771fc1f6c4ed87509d6c9b3c68ba8d3c` |

Browser tree содержит **997 файлов, 157 444 748 байт**. Из 973 прежних файлов 971 сохранён побайтно с uid/gid/mode, включая `/slice/`, Q3, Q3B, три концепт-листа и общий `/review/`. Изменены только Q3C landing и карточка в `review/r4d/index.html`. На сервере до и после switch сверены пути, размеры, SHA-256, владельцы и права. Символических ссылок в browser tree нет. Новые файлы `root:root 0644`, каталоги `root:root 0755`. Подтверждены чтение новых файлов и доступ к каталогам от имени `www-data`.

В существующем nginx snippet атомарно заменена ровно одна строка `root`. `nginx -t` до и после и graceful reload прошли, nginx active. Хеши Studio vhost, Imagen include, portal app и Compose совпали до и после. Схема доступа Review сохранилась, публичные запросы прошли без cookies. Остальные службы и данные вне операций выпуска.

## Проверка доставки

- **44/44 HTTPS PASS** из серверной среды через публичный домен с проверкой TLS. 24 файла `/demo/` и семь прямых входов, включая `/slice/`, Q3 и Q3B, вернули 200 с ожидаемыми размером, SHA-256 и MIME. Проверены ссылки landing и каталога, HSTS, no-store, noindex/nofollow/noarchive, nosniff, same-origin и DENY. Чужой Origin и POST вернули 403. Одиннадцать проб закрытых путей вернули 404, включая исходники, SVG, манифесты, source map и QA.
- **2/2 публичных браузерных прогона PASS** на Chromium 1440×1000 и touch emulation 360×732. Сценарий адаптирован из `tests/stage-d-smoke.js` для публичного URL и обычного режима без заданного seed. Запуск сцены, шаг с постановкой лап, раскрытие, первый контакт, второй мотылёк и второй контакт, перезапуск и новый ввод прошли. На desktop использованы мышь и клавиатура, на mobile — touch. Контакт подтверждён для двух разных мотыльков через read-only снимок состояния. В каждом прогоне 21 HTTP-ответ приложения со статусом 200, ошибок и предупреждений консоли, сетевых сбоев и горизонтального overflow нет.
- Покрытие ограничено проверкой доставки. Физический телефон и полная независимая release QA остаются за пределами прогона.

## Откат и квитанции

Свежий backup `/opt/superflight-studio/backups/review-q3c-whole-demo-20261107T163047Z` содержит исходный и итоговый snippet, `STATE.json`, `PUBLISHED.json` и `rollback.py`. Скрипт проверяет SHA-256 активного snippet и останавливается при последующем изменении. При совпадении возвращает исходный snippet атомарно, выполняет `nginx -t` и graceful reload. Откат не запускался. Прежний immutable root сохранён для возврата.

Серверные service doc и CHANGELOG дополнены с сохранением копий исходных документов и квитанции `OPS_DOCS_APPENDED.json` в backup. Серверная HTTPS-квитанция `/tmp/r4d-q3c-whole-c5d5e840.HI7BBP/https.json`. В локальном TEMP `r4d-whole-demo-c5d5e840-sawinc3a` сохранены сборка, pin, квитанции и четыре кадра браузерной проверки. Изолированная браузерная сессия закрыта. До добавления отчёта `git status` побайтно совпал с исходным снимком 722 dirty/untracked записей. В commit выпуска входит только этот отчёт.
