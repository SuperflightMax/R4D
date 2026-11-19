# FX-01 · опубликованный UX-кандидат

**Открыть: https://superflight.space/review/r4d/fx-workshop/fx-01/**

19 ноября 2026. Ключ `FX01-D1-CUT-43b6268e-20261119T031029Z`. Прямой CUT CTO выдан после принятия конкретного D1 staging и независимого Q1R `C1_VERIFIED / FUNCTIONAL_SMOKE_PASS`. **Это доставка кандидата для просмотра, не приёмка всего FX-01.** Физический M11 и человеческий/product gate остаются открытыми.

## Source → release → HTTPS → браузер

- Runtime source: **`43b6268e924698048a4d79df1aad2512c86f08f7`**, неизменённые `index.html`, `style.css`, `app.js`. Ни пересборки, ни обёртки, ни правок runtime на этапе CUT.
- Live root: `/srv/superflight-review/releases/fx01-43b6268e-20261119T031029Z` — именно рассмотренный immutable staging из [D1](D1-STAGING.md).
- Предыдущий root `/srv/superflight-review/releases/millionko-ui02b-r3-r01-cc42352d` сохранён целиком.
- Live snippet SHA-256: `39b20c6fe05572089c1038ec95129211c8b6b2fc374c16b3baac117da04f3456`. Прежний: `b9dde1214d4aabf6b7d4469fddf5cd81ee29f8e94706b20a8fa900b92f21e983`.
- Canonical live inventory SHA-256: `b24d7b91242b33b46c458bfefa54a0a9fffe8d4615ba08cdb242b957e18f8cb9`.
- Итог: 1053 browser-файла; R4D 24 артефакта. Добавлены только 3 FX runtime-файла; 2 рассмотренные правки каталогов; 1048 остальных browser-файлов, их права/владельцы и старый manifest вне `review/` сохранены.

| Файл | Bytes | MIME HTTPS | SHA-256 exact Git ↔ staging ↔ HTTPS ↔ реально загруженный browser response |
| --- | ---: | --- | --- |
| index.html | 5387 | text/html | `b4d67713c59184e4f813f4ba89c8d3b074f60149e7be90c9a29595e83561bab5` |
| style.css | 7215 | text/css | `c7409f0d06fca2b22b8f0f6cde013529c8d20a9fe84c61b205d5212bc6bc3a3b` |
| app.js | 27932 | application/javascript | `b34abd8bfc6e6f010397da9b2372def74f005271ce1e92a8e35b5ce9b2405f6f` |

## Фактический CUT

Перед записью снова подтверждены `gpt-6.1-sol/xhigh`, cwd `D:\dev\.codex-worktrees\r4d-fx01`, ветка `fx-workshop/fx-01-ux`, чистый HEAD `6aa62d78daa13b7d6286481ea8c22ef84dbbc450`. Серверные README/INDEX/PROCEDURES совпали с прочитанными на D1, свежие public-split/service entries и preflight просмотрены. Gateway/nginx активны; контейнеры не менялись. C/D/E: 7,09 / 7,32 / 33,38 GiB, VPS около 25 GiB свободно — пороги 4/2 GiB не достигнуты.

Свежие root/hash, protected components, полный старый и новый inventory, nginx state совпали; сохранены `CUT_PRECHECK.json` и свежая копия `CUT_BEFORE.review.locations.conf`. Выполнена одна атомарная замена snippet с изменением **только root**, прежние владелец/права сохранены. nginx tests до/после PASS; **один graceful reload**, без restart. `MainPID=817381` сохранился; ExecReload 03:23:49 UTC, nginx active. [Квитанция CUT](CUT-RESULT.json) — результат 03:23:51 UTC. Ключ защищает от повторного switch/reload; незавершённый CUT требует осмотра, а чужие обновления не перетираются.

После CUT сервер ещё раз подтвердил protected hashes, весь старый root и exact staging inventory. Сохранены public-domain split, GET-only/Origin/dotfile guards и прочие directives, без восстановления старого auth_request. Portal/DB/сессии, контейнеры, GPU/WG, DNS/firewall/certificates не менялись. Rollback **не запускался**.

## Доставка проверена

**Анонимный HTTPS: 16/16 PASS**, [полные результаты](CUT-HTTP.json), 03:24:56 UTC. Проверены три runtime-файла и directory index, оба обновлённых каталога; exact bytes/size/MIME; no-store, HSTS, noindex, nosniff, Referrer-Policy и DENY. Чужой Origin и POST — 403; Markdown, checks, evidence, source map, dotfile и delivery receipts по FX-маршруту — 404. Runtime по HTTPS совпадает с C1/Q1R, а не только с наличием страницы/HTTP 200.

**Небольшой browser delivery smoke: 14 проверок PASS**, [результат с хешами реальных response bodies](CUT-BROWSER.json). Новые профиль/кеш/tmp только в `D:\dev\.codex-task-temp\r4d-fx01\builder\cut\`, существующий Headless Chromium 145.0.7632.6, CSS 1920×1080 / DPR 1. Сначала реальные ссылки глобального каталога → секция R4D; приложение открыто в новом `?test=FX01-D1-CUT-43b6268e-…`. До действий заново проверены три реально загруженных response bodies. Затем hover → применить → длина 36 → A↔B без потери черновика → закрепить → чистое сообщение → reload с восстановлением. Обычный namespace не изменён. Page/console errors 0, failed requests 0. [Скриншот опубликованного кандидата](CUT-BROWSER.png) просмотрен; это headless, не физический M11.

Полная UX-матрица при CUT не повторялась. Независимый [Q1R](../../../../work/fx-workshop/FX-01/qa/Q1-2af34679/q1r-43b6268e-report.md) остаётся основанием по C1, delivery smoke подтверждает именно путь до опубликованной версии. Личный Chrome/фокус/рабочий стол не занимались, новых установок/API/расходов не было. Свой browser закрыт; новых серверов или длительных процессов не оставлено.

## Квитанции и откат

Private backup: `/opt/superflight-studio/backups/review-fx01-43b6268e-20261119T031029Z` (0700). Там сохранены pre-CUT copy/guards, прежний и candidate snippets, полный inventory, `CUT_RESULT.json`, HTTP/browser records и `CUT_DELIVERY_VERIFIED.json`. [Копия итоговой серверной квитанции](CUT-VERIFIED.json) фиксирует 16/16 HTTPS, 14 browser checks, один reload и открытые гейты. Server service doc/CHANGELOG дополнены append-only фактическими START/CUT/delivery entries; прежние префиксы и права сохранены, retired writer не использовался.

Существующий `d1_rollback.py --rollback` в backup может вернуть **только прежний Review snippet**, если текущий candidate hash и protected/base-tree guards по-прежнему совпадают. Он не откатывает чужой более поздний выпуск и не восстанавливает DB/сессии. Без отдельного поручения rollback не запускать. Исторический staging `verify` проверяет **pre-CUT** состояние и теперь ожидаемо не соответствует live — для этой поставки authoritative факты находятся в CUT-квитанциях.

**Открыто:** настоящий физический fullscreen 1920×1080 с OS/browser scale и его скриншотом; наблюдения Макса/Славы; решение Product + Max. Публикация их не подменяет. FX-01 не объявлен принятым, FX-02+ не открыт. После commit/push продукт остаётся замороженным, Git/index возвращается CTO.
