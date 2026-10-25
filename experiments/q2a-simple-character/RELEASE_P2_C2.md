# Q2A P2 C2: штатный выпуск Review

25 октября 2026, Europe/Kyiv. Release Engineer `release-engineer-r4d-q5a-01`; прямой production brief CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`.

**Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE.** [Открыть Q2A](https://superflight.space/review/r4d/q2a-simple-character/), [каталог Review](https://superflight.space/review/). Добавлена одиннадцатая карточка: завершённый PoC нового простого персонажа, idle/low/walk/jump и свободные переходы, принят с ограничениями. Полнота художественного качества и универсальность метода не заявляются. После отдельного выпуска — idle, без Q7, corrections, новых публикаций или найма.

## Точная версия

Перед изменениями подтверждены HEAD=origin/main=remote main **`66baa7c80dbe55bf28746d4c2a36af6a1deca28d`**. Все заданные источники прочитаны из этого commit; `work/REVIEW_HANDOFF.md` в нём не tracked, поэтому прочитан разрешённый локальный handoff read-only. Перед VPS-изменениями полностью прочитаны серверные README_RU, INDEX, PROCEDURES и service doc.

- Accepted product source: `3c27b07d489f68b3d7d8b4c8beabd35c51402fd4`.
- Frozen snapshot tree: `0c60f912f11cae1ce5e5cf99a6a8ce8fafc70bc4`.
- Exact public package tree: `e2e60f6d3b714ef0d0409f1de36f6a870ac17bc8`.
- Источник всех 18 публичных файлов: `experiments/q2a-simple-character/release-package/route-tree/review/r4d/q2a-simple-character/` из `66baa7c…`.
- **18 файлов / 1179499 bytes**, без пересборки или редактирования. Для каждого проверены Git blob ID, размер и SHA-256; дополнительно сверены все source blobs provenance, 14 exact-copy файлов побайтно совпали с accepted source.
- Provenance SHA-256: **`61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`**. SHA-256 документа приёмки совпал с provenance: `e18018746907ee498d67eee1d5a76bd4f6bf1693473a4835456f3ea32fcab6e1`.

Публичный allowlist: index, main/motion/pose/style/art-binding, Pixi и MIT license, десять принятых PNG. Ровно этот набор проверен независимо от названий в provenance. Raw/prompts, QA logs/screenshots, maps, rejected attempts, server scripts, private provenance, credentials и локальные пути не включены. Проверены отсутствие sourceMappingURL и локальных адресов в текстовых файлах, а также 404 для четырёх исключённых private paths на точном локальном route. Четыре ранее принятые упаковочные адаптации не выполнялись повторно; готовые public bytes сохранены. **Production/package diff=none.**

## Фактическая доставка

Release id: **`66baa7c80dbe55bf28746d4c2a36af6a1deca28d`**.

Live immutable root: **`/srv/superflight-review/releases/66baa7c80dbe55bf28746d4c2a36af6a1deca28d`**.

Switch: **2026-10-25T19:51:58.192299+00:00**, **22:51:58 Europe/Kyiv**.

Перед упаковкой фактически прочитаны live snippet/root/manifest: root был `/srv/superflight-review/releases/47b637ba77681cc17ccf23757396073047430c37`, manifest содержал 396 browser-файлов. Локальная копия прежнего bundle сверена целиком с фактическим live manifest; сервер независимо сверил все прежние live bytes перед staging и после switch. Старые числа из handoff не использовались как текущее состояние.

| Материал | Размер / SHA-256 |
|---|---|
| Новый полный `RELEASE_MANIFEST.json`, вне browser tree | 231560 bytes; `e31c434f90f84ed38d2b3e3680905db95df6f07b0e58a662ef3e6b3ebc3aa491` |
| Переданный архив | `127ce70a4e819ee3894c84ce2a4e6086b9d9fffe234859bd5ff4097db05d7914` |
| Прежний live manifest | `fd83115aa2d863a7800d877dc28b49112b8e6473896005ccc4a8ba5ab8f02081` |
| Прежний Review snippet | `a1d37b0cb06fc28f442962fee3396ce2b4824c7cdf217af319b8b7c0f3c82d89` |
| Итоговый Review snippet | `72312c7b9ab7d8de10494be78fd0664bec671c7c239a82f2dacd03380f061d26` |

Новый browser tree: **414 файлов / 42270006 bytes**. **395 прежних файлов** сохранены побайтно; единственное изменение старого browser-файла — карточка Q2A и счётчик 10→11 в `review/index.html` (+924 bytes). Удаление ровно этих двух добавлений восстанавливает прежние байты каталога. Все десять прежних routes/cards, их контент и старые immutable releases сохранены. Полный manifest содержит source/package commits, source и public tree IDs, per-file Git blob/size/SHA-256 и exact provenance UTF-8 с проверяемым исходным SHA-256, вне public route.

Штатный процесс: новый immutable каталог, проверенная распаковка архива, полный manifest, свежий rollback, атомарная замена только root существующего Review snippet, `nginx -t` до/после, graceful reload. Нормализация единственного root возвращает прежние байты snippet. DENY, auth_request, Origin/dotfiles, no-store/noindex, nosniff, Referrer-Policy, GET-only, autoindex off и disable_symlinks не менялись. Portal не перезапускался.

Прежние защищённые файлы проверены SHA-256 до/после:

- Studio vhost: `c873762568396f54496e7bdff7874b688523c9d101adbdd10b355c4c0baac5e6`.
- Imagen include: `bf68f12e62ac88e41d5e043cb7acc8b14ba1906c1718f5c3c7efb4d7eef25e34`.
- Portal app: `b6ca74fd47b41f2d1d3ed10bc8c234a1d69a84ac5d1267a56a5e6e56d8bf19d0`.
- Portal Compose: `3ebfff7c5ef8092c0667dc2ffabc569a824bd6445e78c69e169e6b1fd9e7808a`.

Credentials, DB/sessions, DNS/firewall/certificates, WireGuard/routes/system proxy, containers, GPU/queue, UGH/Imagen/pult/главная и чужие сервисы не менялись. Старые releases не удалялись.

## Delivery smoke и пределы

Сервер до/после switch проверил точное множество путей, все размеры/SHA-256, отсутствие symlinks, root:root и dirs755/files644. Nginx active. Все **414 файлов** точного release-дерева сверены также через локальный HTTP.

Изолированный Chromium через Playwright, desktop **1440×1000**, mobile **390×844** с touch/isMobile: по **24 наблюдения**. Через реальные canonical controls, без восстановления debug API, пройдены обе последовательности idle→low→walk→idle→jump→idle и walk→low→jump→walk→jump→low. Для idle/walk/low команды выбраны при показанном flight; после посадки получена нужная цель. Проверены pause со стабильными временем/стадией/cursor за600ms, rewind истории и новая ветка с отсечением прежнего хвоста, оба фона и раскрытые ограничения. Candidate показан `p2_candidate_c2`; все10PNG загружены. Console errors/warnings, failed/HTTP≥400/external requests и горизонтальный overflow — **0** в обоих размерах. Desktop dark-low и mobile about-light screenshots лично просмотрены. Это delivery smoke принятого пакета, не новый предметный QA или correction.

Публичные HTTPS/auth checks — **33 PASS**: каталог, все11 routes и каждый из18 Q2A-файлов без сессии дают прежний **303** на `https://superflight.space/login?next=review`. Чужой Origin даёт **403**, два dotfile пути — **404**; DENY/no-store/noindex/nosniff/Referrer-Policy на403/404 сохранены. Прежний303 без этих headers сохранён. Desktop/mobile публичный browser показывает обычный login без overflow.

**Limitation:** post-auth публичный canvas и ресурсные200 не проверены — готовой безопасной авторизованной сессии нет. По brief CTO это не блокирует delivery. Личный Chrome не использовался, cookies/tokens/пароли не читались и не переносились; login и новые сессии не создавались. Физические телефоны, другие движки и широкий аудит worker targets не проверены. Отсутствие внешних запросов относится к наблюдаемому browser context; публичный набор modules/assets локален.

Принятые CTO ограничения стопы (49,201185° toe-contact и61,257567° свободной стопы; разные условия), колена/шорт/складок, плеча/дальней стороны и субпиксельного пересечения не исправлялись и не объявляются исчезнувшими. Исследовательская приёмка остаётся [CTO_ACCEPTANCE_P2_C2.md](CTO_ACCEPTANCE_P2_C2.md).

## Rollback и завершение

Fresh rollback/evidence: **`/opt/superflight-studio/backups/review-q2a-20261025T195129Z`**, сохранены `review.locations.conf`, `STATE.json`, `candidate.locations.conf`, `PUBLISHED.json`; подготовлен не запущенный guarded `rollback.py`. Прежний root: `/srv/superflight-review/releases/47b637ba77681cc17ccf23757396073047430c37`.

Перед откатом сверить итоговый snippet hash на отсутствие позднейших правок. Атомарно вернуть только сохранённый Review snippet root:root644, проверить nginx и выполнить graceful reload. Guarded script отказывается затирать позднейшие изменения. Session DB не восстанавливать/удалять, releases и чужие службы сохранять.

Локальные proof/manifests/scripts/HTTP/browser results/screenshots: `%TEMP%/r4d-release-q2a-66baa7c`, вне Git/browser tree. Серверные service doc/CHANGELOG дополнены по существующему процессу, их предыдущие копии сохранены в fresh rollback. Свои браузер и localhost4199 закрыты, собственный CLI snapshot перенесён в TEMP; чужие серверы, включая package preview4340, не тронуты. Все **50 исходных dirty/untracked файлов** сверены по SHA-256 и сохранены, чужие caches не менялись. В Git включаются только этот report и узкие PROJECT_STATE, ANIMATION_QUEUE_A_STATE, architect/START_HERE. **Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE** означает завершённую доставку всех трёх пунктов Queue A с сохранением их разных результатов; нового исследования, сравнительного эксперимента, Q7, коррекции, найма или публикации этим выпуском не запускается.
