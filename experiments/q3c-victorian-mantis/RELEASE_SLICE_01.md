# Q3C — выпуск первого рабочего среза

7 ноября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`, постоянная сессия; прямое поручение и GO CTO `cto-r4d-01`.

**PUBLISHED_FIRST_WORKING_SLICE / Q3C_IN_PRODUCTION — DELIVERY_VERIFIED.**

- Landing и три концепт-листа: https://superflight.space/review/r4d/q3c-victorian-mantis/
- Runnable slice: https://superflight.space/review/r4d/q3c-victorian-mantis/slice/
- Каталоги: https://superflight.space/review/ и https://superflight.space/review/r4d/#skeleton

Это публикация промежуточного конструкционного этюда, **не полный Q3C и не финальная CTO acceptance**. Landing и карточка прямо отмечают «первый рабочий срез / Q3C в производстве». Маячок → падение → контакт → люки/четыре лапы/тот же глаз → живой idle реализованы в slice. Ходьба, полное раскрытие в богомола, мотылёк, реальный захват, частицы поимки и чистовой арт ещё отсутствуют и перечислены публично. Концепт-листы задают направление, не выдаются за реализованную чистовую анимацию.

## Версии и gate

Product/art candidate: **`4a26f1cb789a4b41d09e7b7c9ac1905680d965b4`**.

Targeted Technical QA: `7a90848d35335ade54fd4b9b010c07816268c05f`, TQ-01 CLOSED, TARGETED_PASS. Targeted Visual QA: `ad849e99222ee109d32e465a86ff9113f2f58a61`, VQ-01 CLOSED, targeted PASS. Оба exact отчёта прочитаны; их границы не расширяются этим выпуском. 19/19 desktop,18/18 touch и8/8 tests/build — результаты Technical QA, не повторные испытания Release Engineer.

Прежний `c79af101d944c121d9dc6b7e203d393a45baf8e5` получил SCOPED_FAIL/HOLD и **никогда не переключался в live**. Его staging root и manifest `596c2e8c2eb8fad3a10c01e4400b73cefe3c3fafb00db63d0e5ca966d156ca26` сохранены как evidence. Начальная ошибка служебного пути в первом staging-скрипте исправлялась только в скрипте, до создания manifest и без изменения live или продукта. Новый candidate собирался в отдельном TEMP и отдельном root.

Перед delivery HEAD=origin/main=remote main=`ad849e99222ee109d32e465a86ff9113f2f58a61`. Все11 упаковочных входов (runtime/config/lock и три PNG) повторно сверены с source commit и остались неизменными через QA commits. Сборка — штатный Vite7.3.7 по exact lock из Git objects; checkout/reset/clean/stash/worktree/clone не применялись. Изменений product/art и новой correction/QA-итерации Release Engineer не делал.

## Payload и immutable release

Public payload: **22 файла / 5124498 bytes**. Это WIP landing, три exact PNG и18 built HTML/JS/CSS файлов в `slice/`. Численные runtime-данные входят только в исполняемый compiled bundle; отдельный rig JSON не публиковался. SVG, prompts, Markdown sources/handoffs, packing/preparation scripts, raw source, tests, source maps, node_modules, QA/internal evidence и private metadata отсутствуют в public allowlist. Исходный SVG и все внутренние материалы сохранены в исходных местах.

Live root: **`/srv/superflight-review/releases/4a26f1cb789a4b41d09e7b7c9ac1905680d965b4`**.

Switch UTC: **2026-11-06T23:21:12.135908+00:00**, **7 ноября 2026,01:21:12 Europe/Kyiv**.

| Материал | SHA-256 |
|---|---|
| Immutable RELEASE_MANIFEST.json | `cb20b86de7381d50328c1d0006cedf9f8debf4c0b56a6415f0338e5653f25a8b` |
| Переданный overlay archive | `d4096dcecb5bf4b73ff0c1ce20b1c7d349feda6947d67188bd96c22e74b7ac52` |
| Прежний live manifest Q3B | `2a912ac1c1ab9289db2cd35590e743495ffb61a03cf9e2addaf8a0c7c95efe56` |
| Прежний Review snippet | `b9571af6440cf8addc447506f3c37dbbd27035d6e0658306cf47a901cb75f43f` |
| Итоговый Review snippet | `f802efc38ad60907f0f642de34a2fa3f771fc1f6c4ed87509d6c9b3c68ba8d3c` |

Фактический прежний live root — `/srv/superflight-review/releases/cc05fa37d315efb592f76a04186cb4942b5b5621`,951 browser-файл. **949 прежних файлов сохранены побайтно с uid/gid/mode**; два связанных index получили только карточку WIP и счётчики22 R4D /13 skeleton. Metadata этих двух файлов также сохранена. Старые routes/cards/контент и releases не перезаписывались. Новый browser tree: **973 файла /156117736 bytes**.

Сервер до и после switch сверил точные пути, размеры, SHA-256 и metadata всего prepared tree с immutable manifest, а также все951 исходных файлов с сохранённым baseline. Symlinks отсутствуют; новые files root:root644, directories755. Manifest намеренно оставлен exact из staging, включая записанный там pending-статус; состоявшиеся QA/GO и switch отдельно закреплены в свежих STATE/PUBLISHED, без переписывания immutable manifest.

Изменён атомарно только root существующего Review nginx snippet; нормализация единственного root возвращает прежние bytes. `nginx -t` до/после и graceful reload прошли. Nginx active. Portal не перезапускался. Private auth/session механизмы и публичная схема Review не менялись.

Проверенные неизменные protected hashes:

- Studio vhost `35c0db6029d246dac31a53d1151e89fedba9dbba0ceeeb1921e779ef0307e4e8`.
- Imagen include `7ebec390109679f6f4c0a70af4e77528951470b77bd8ec9a1b141dc2764f8b1a`.
- Portal app `ea9a57d14dcc21ea60ebf495c9b8c9512a1166219d8b085965bca80ff9d4297e`.
- Portal Compose `3ebfff7c5ef8092c0667dc2ffabc569a824bd6445e78c69e169e6b1fd9e7808a`.

Пульт, portal DB/sessions, UGH, Imagen product, GPU/queue, credentials/tokens, DNS/firewall/certificates/WireGuard и другие services не затрагивались.

## Delivery checks и ограничения

**41 HTTPS-проверка PASS из серверной среды по публичному домену**, HTTP/1.1 с обычной проверкой TLS: точные per-file bytes/hash/MIME всех 22 payload files и двух index, пять прямых входов и 12 негативных probes. Проверены no-store, noindex/noarchive, DENY, nosniff, Referrer-Policy и HSTS; чужой Origin 403, dotfiles 404. Исключённые source/rig JSON/SVG/prompts/QA/handoff/package/node_modules/source-map пути дают 404. Review остаётся public 200 без cookies; auth не отключался и новый login/session не создавался. Полная квитанция: `public-http-server.json` в TEMP; серверная копия — `/tmp/q3c-slice01-public-http/public-http-curl.json`.

**Публичный browser smoke PASS по независимому прогону CTO моего exact `public-smoke.js` в свежей Playwright session:** desktop 1440×1000, touch/mobile 390×844 и 360×732. Проверены каталожные счётчики 22/13 и ссылки, WIP labels, все три декодированные PNG, fresh waiting, keyboard/touch activation, прохождение до capsule/live idle, pointer reaction, restart в чистое waiting и повторная keyboard/touch activation после restart. CTO сообщил: errors/warnings/requestfailed/external пусты, все загруженные routes/assets — 200. Девять screenshots waiting/capsule/restarted сохранены; Release Engineer лично просмотрел desktop capsule и mobile360 waiting. Это delivery smoke exact published bytes, не новый полный QA или художественная приёмка. Физический телефон и будущие стадии Q3C не проверялись.

Две первые локальные HTTP-попытки прервались таймаутами чтения; мой первый browser attempt сообщил image decode error, отдельная диагностическая попытка закрыта вместе с моей browser session. Это не выдано за продуктовый FAIL или успешный прогон. Исходные PNG локально прошли PIL verify; успешный свежий browser smoke CTO и полная серверная HTTPS/hash-проверка приведены выше. **Повторная локальная curl HTTP/1.1 сверка также завершилась: все 41 проверки PASS**, квитанция `public-http-curl.json`. Payload и nginx при диагностике не менялись. Все scripts/ошибки/квитанции сохранены вне public tree.

## Rollback и завершение

Fresh pre-switch backup/evidence: **`/opt/superflight-studio/backups/review-q3c-slice01-release-20261106T232110Z`**. Сохранены `review.locations.conf`, `candidate.locations.conf`, `STATE.json`, `PUBLISHED.json`, подготовлен не запущенный `rollback.py`. Fresh backup не подменён более ранним staging backup.

Перед rollback сверить отсутствие позднейших правок по итоговому snippet hash. Guarded script отказывается затирать более поздний Review config; возвращает атомарно только сохранённый snippet root:root644, выполняет nginx test/graceful reload. DB/sessions и immutable releases не восстанавливать и не удалять.

Рабочие source/build/overlay/proof/manifests/scripts и receipts: `%TEMP%/r4d-release-q3c-slice-4a26f1c`. Все **720** исходных чужих dirty/untracked файлов повторно сверены по SHA-256: изменённых и пропавших нет. Собственная browser session закрыта; чужие процессы и evidence не очищались. В Git включается только этот release report в разрешённой release-области. Серверные service doc и CHANGELOG дополнены append-only с сохранением прежних bytes в fresh rollback backup; проверено точное равенство «старые bytes + запись». Квитанция `OPS_DOCS_APPENDED.json` в backup и `ops-docs-appended.json` в TEMP. Lead STATE/PROJECT_STATE не переписываются Release Engineer. После этого выпуска Q3C остаётся в производстве; полный художественный PASS и завершение заказа не объявляются.
