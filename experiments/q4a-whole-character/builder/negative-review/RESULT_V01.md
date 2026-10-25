# Negative evidence viewer — exact candidate v01

25 октября 2026. Builder `builder-r4d-q4a-01`. **VIEWER_V01_FROZEN_READY_FOR_LEAD_REVIEW_AND_QA.** Это доставка отрицательного/частичного Q4A, не animation/artistic PASS, acceptance или release. Прочитаны `EVIDENCE_VIEWER.md`, `CTO_STOP_DECISION.md`, scoped условия Concept/Asset; research package `62a3b8cfd9599cc5d71e6433784c3661c5527a5f` сохранён без изменений.

## Одна точная версия

- URL: **http://127.0.0.1:4196/review/r4d/q4a-whole-character/**.
- Immutable snapshot: `build/negative-review-v01/`, публичное дерево `review/r4d/q4a-whole-character/`.
- Build manifest SHA256: **`a8e0b3753e561b9367bb5ed6d94a7f568ee23f0781411fbd2be3527ec30be648`**.
- Source manifest SHA256: **`2f6d590e05b1bbe9cd9bb0127c662b88f2a16c89438bd420760830dc236e536f`**.
- Server: exec session5476, PID90736, own `app/negative-review/serve.mjs`, frozen mode. `SERVER_V01.json` сохраняет process/route/root. Старый сервер4194/early-v02-04 по-прежнему HTTP200, старые Review cards/URLs не менялись.

`source-manifest.json` фиксирует каждый origin/SHA256 и точное преобразование; `build-manifest.json` —35 content-файлов target route, исключает свой self hash. Внешний `SNAPSHOT_TREE_SHA256_V01.json` в зоне Builder дополнительно покрывает **всё дерево snapshot**, включая сам build manifest и root delivery metadata `SNAPSHOT.json`, без self-hash цикла. Никаких CDN/логинов/внешних обязательных ресурсов.

## Содержимое и границы

Первый экран говорит обычным русским, что глубокий присед и полный набор движений не собраны; нет художественной приёмки. Отдельно названа leg-chain feasibility. Пять цельных рисунков v01/v02/v03/correction02/v04 доступны целиком, плюс deterministic crops плеча/майки и таза/одежды; light/dark. Статусы основаны на frozen Asset catalog SHA256 `5063b713e700026d113b4e710e34cbb1cab0c28617e4901b07327eb5a6d75001` и его5 reviews, без объявления pose/art accepted по догадке. Correction01 без raw — только текстовый факт.

R1: основной final actual44 harmonic STOP low53/240/drop≈50,79, отрицательная initial iterate до ARAP sample; ранние envelope/input/owner ошибки — отдельное раскрытие. Разные R1/R2 numerical gates не выдаются за соревнование художественного результата.

R2: **только26 exact accepted arrays low0..25**, paused default; native scrub/keyboard, play/pause/restart/speed, texture/mesh, масштаб full range240 и drop/230. Нет интерполяции, новых output poses, нового solve, полного motion runtime или движения всего персонажа. Движется только явно подписанная локальная texture/mesh из raw-v04; whole остаётся неподвижным контекстом, выбор whole не меняет R1/R2.

Rejected candidate раскрывается отдельно, не входит в accepted play: λ0.152587890625 после0.15234375, σmin**0.29999830114264353<0.30**, orientation positive; не accepted26, не inversion. Точные имена/числа/hashes находятся в диагностическом слое. Незавершённый hidden shoulder corridor и отсутствие swing/joint artistic review названы явно.

## Самопроверка Builder

`INTEGRITY_CHECK_V01.json`: все10 checks true — candidate hashes, source origins, source-manifest linkage, exact5 whole copies, rest/triangles, exact26 accepted projections, отдельный rejected array, frozen catalog и44 R2 research hashes. Все35 content-файлов по HTTP200 и byte hashes совпадают. JSON projection сохраняет исходные числа без округления vertices; raster display использует обычный GPU float32, данные доступны в исходной точности.

Браузер через Playwright CLI: Chromium desktop1440×1000 и mobile390×844/360×844, также768×844; оба фона,5 source selections, загруженные whole/crops, slider End/ArrowLeft, pause, restart, автоматический stop на25, overlay/texture controls, отдельный rejected. Errors0, bad responses0, внешних запросов0. После проверки страница возвращена к light/low0/paused. Нормализованный итог `SELF_CHECK_V01.json`, raw CLI output `output/playwright/BROWSER_CHECK_FROZEN_V01.json`.

До freeze найдены/исправлены только viewer-дефекты: intrinsic canvas width в открытом rejected grid давал mobile overflow; задан shrinkable grid. Упрощена microcopy и исправлены склейки, включая «СОСТОЯНИЕ 26» и пробел при mobile скрытии `<br>`. После этого frozen browser check повторён: canvas widths337/307/715 соответствуют контейнерам, горизонтального выхода нет. Предыдущий screenshot `mobile-overflow-before.png` сохранён как история самопроверки.

Лично просмотрены финальные `desktop-light-current.png` и `r2-mobile-dark.png`: полный whole/контекст доступны, local mesh отделён от whole, rejected/порог читаются, controls не обрезаны. Screenshots текущей v01 в `output/playwright/`: desktop-light-current, mobile-light, mobile-dark, r2-dark, r2-mobile-dark. Самопроверка не присваивает verdict будущих Concept/Asset/Technical/Visual QA.

Никаких source/solver/geometry/repair изменений или deploy. Stage/commit — Lead. Всем reviewers/QA выдаётся **этот один snapshot/manifest/URL через Lead**; при нужной viewer-коррекции — новая exact версия, v01 не перезаписывать. Acceptance и отдельный release — CTO; Q2A не начинался.
