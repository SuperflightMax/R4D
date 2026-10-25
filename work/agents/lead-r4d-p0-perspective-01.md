# Lead P0 perspective — рабочее состояние

Обновлено: 25 октября 2026, Europe/Kyiv.

## Канон и границы

- Заказ: `orders/perspective/ORDER.md` и `orders/perspective/P0-perspective.md` из R4D `e5892fbea71fbbfeb9f22e6a18f0f788cf9a1449`.
- Вход: `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg`, только чтение.
- Только P0: без физики, коллайдеров, шарика, `sim-core` и P1–P6.
- Главный `D:\dev\R4D` не менять. Каждый сотрудник работает только в назначенном worktree.
- После публикации P0 очередь останавливается до явной приёмки Макса.

## Минимальный план зависимостей

1. Researcher (`codex/r4d-p0-perspective-research-01`) выпускает research v0.1: формальный эталон, числовые правила, признаки сравнения и честные допуски.
2. Concept Artist (`codex/r4d-p0-perspective-concept-01`) выпускает concept v0.1: художественные инварианты, признаки законченной доски и ограничения для постановки генератору.
3. Visual QA (`codex/r4d-p0-perspective-visual-qa-01`) до просмотра результата фиксирует независимый rubric v0.1.
4. Builder (`codex/r4d-p0-perspective-builder-01`) принимает только exact commits Researcher и Concept Artist, фиксирует их SHA и собирает эталон перспективы v1 с воспроизводимым визуальным шаблоном.
5. Asset Artist (`codex/r4d-p0-perspective-asset-01`) после exact Builder v1 и Concept v0.1 делает диагностическую генерацию d1 по одной зафиксированной редакции, сохраняя реальные входы, запрос, генератор, настройки, проверки и исправления.
6. Visual QA проверяет Builder v1 и d1 по заранее зафиксированному rubric; продукт не исправляет.
7. После checkpoint и исправлений Asset Artist делает четыре независимые законченные доски по одному принятому эталону. Builder собирает точный кандидат; QA проверяет комплект.
8. Release Engineer (`codex/r4d-p0-perspective-release-01`) заранее сверяет маршрут read-only, а после принятого CTO candidate commit публикует отдельную страницу `/review/r4d/p0-perspective/` и возвращает точную ссылку/версию.
9. Lead передаёт CTO exact commits, решения, остаточные дефекты и ссылку. После публикации — обязательный стоп.

## Ближайший checkpoint

Ориентир — примерно два часа активной работы. Нужны вместе:

- research v0.1 и concept v0.1;
- rubric v0.1, объявленный до просмотра результата;
- интеграционный Builder commit с эталоном перспективы v1 и воспроизводимым шаблоном;
- Asset d1 с полной фактической provenance;
- Visual QA verdict по v1/d1;
- готовность маршрута публикации без самой публикации.

Точный checkpoint формируется только из названных commit SHA. Незакоммиченный материал, сообщение «готово» и состояние чужого worktree версией не считаются.

## Стартовое фактическое состояние

- Researcher, Concept Artist, Builder и Release Engineer работают.
- Asset Artist завершил подготовительный разбор и ждёт exact commits эталона/шаблона; вход подтвердил как 1536×1536, SHA-256 `F5CFA2BBE8E4B49ECBC0F4C7A0CEE99842B182B56AE495979153B8FC9FF86E32`.
- Visual QA получил поручение зафиксировать rubric v0.1 до кандидатов; после этого ждёт exact Builder v1 и Asset d1.
- Всем шести сотрудникам доставлены адресные гейты и формат ближайшей передачи.

## Полученные версии и решения

- Lead dependency plan: `72464d892a4dd4fee6de3a81723139dfee9dcac8`, опубликован в `origin/codex/r4d-p0-perspective-lead-01`.
- Visual QA rubric v0.1: `21150e583311e8688146a27fa48aaa8c41c8aaa8`, `experiments/p0-perspective/qa/visual/RUBRIC_V0.1.md`. Зафиксирован до просмотра кандидатов; PASS не заявлен, продукт не менялся.
- Research v0.1: `627a9feb33cc6fdc8e63738ada13577752b9bf4a`, четыре файла в `experiments/p0-perspective/research/`. Выбран измеримый 2.5D-эталон: трапеция плоскости и независимый более слабый scale-by-depth; строгая гомография оставлена диагностикой, не объявлена восстановленной камерой.
- Concept v0.1: `d38139573648f097bd04e1c833ffff9be467ff71`, пять файлов в `experiments/p0-perspective/concept/`. Содержит художественные инварианты, структуру основного/корректирующего задания и визуальный шаблон; числовая геометрия намеренно оставлена эталону Researcher.
- Compatibility review: версии Research и Concept совместимы, но наблюдательная трапеция concept PNG отличается от числового Research quad. Решение: формальный эталон всегда приоритетен; concept PNG не используется вторым геометрическим control, а его guide-слои заменяются точной Research геометрией либо исключаются из art input.
- Builder v1: `91716e4c488bdb118fc04c03dab7794f4dad6cbe`, одиннадцать файлов в `experiments/p0-perspective/builder/`. Включает детерминированный `formal-reference-v1.svg`, диагностическое сравнение, метрики без aggregate score, статическую галерею и скрипты сборки/проверки/preview. Зафиксированы входные SHA `21150e58…`, `d3813957…`, `627a9feb…`; `npm run check` и браузерная проверка прошли.
- Cross-worktree check выявил ложный stale из-за CRLF checkout против LF Node output. Builder исправил только детерминизм/политику EOL в `0cc217d120597e1ec9f26cb2caa79e54d59386ba`; geometry и generated content не менялись. На свежем baseline с пятью cherry-picks `npm run check` прошёл до build, дерево осталось чистым.
- Asset diagnostic d1: `2db5dffdbcd0fecaee7ffa209ea3ebe8c775cd2f`, `experiments/p0-perspective/asset-artist/d1/`. Единственная неизменённая генерация 1254×1254, SHA-256 `05990a70ed85ee893d484545c2f5aa0ec0f5277b2db0331bfacc6ae3b63393b5`, с полным prompt/provenance. Четыре финальные доски не запускались.
- Visual QA d1: `fdc25db3e97dcd0c48d998b720cfb7c4ef4c8cec`, `experiments/p0-perspective/qa/visual/REPORT_D1.md`. Решение `TARGETED_CORRECTION_BEFORE_FINAL_SERIES`: provenance, эталон и художественная законченность PASS; поле требует коррекции, drums/S(z) FAIL. Финальная серия остаётся закрыта до одного corrected diagnostic с тем же formal reference и без новой камеры.
- Concept corrective brief c1: `b060203bfb3920dc3f11299c211836360bcc5cba`, тот же formal reference/камера и точные locks углов, seams, rows и drum scales.
- Asset corrected diagnostic c1: `6452515fff9f7cb90b619cbe632b62b9573d668b`, output SHA-256 `f6993beb13dc3af5f3901e3f0868fc42f921d95ffadc1bebe3812d652e6fe4f7`. Выполнена ровно одна correction, без crop/stretch/retouch и третьей генерации.
- Visual QA c1: `ac2c5f639cb49f05b074b54a6501cdedd02d6883`, `experiments/p0-perspective/qa/visual/REPORT_C1.md`. Решение `STOP_ESCALATE_CONTROL_TRANSFER_OPTIONS`: поле заметно улучшилось, основания/объёмы и художественное качество в целом PASS, но row anchors и uniform drum master + S(z) повторно FAIL; появились вторичные leaked control markers.
- Release route: отдельная страница `https://superflight.space/review/r4d/p0-perspective/` внутри существующего Review. Новая инфраструктура, права и credentials не нужны. Публикация заблокирована до accepted 40-символьного candidate commit, frozen self-contained route tree, allowlist/manifest и данных карточки. До этого Release Engineer ничего не публикует.
- Четыре финальные доски закрыты до решения CTO о control-передаче. Не запущенные варианты: deterministic layered composition с одним art master; structural img2img с edge/depth/segmentation control; precomposed exact raster control с masked/local finish.

## Решение CTO после c1

CTO выбрал deterministic layered composition: в текущем доступном `image_gen` нет hard mask, edge/depth control-strength или другого интерфейса, достаточного для доказуемых вариантов structural img2img / masked finish. Третья single-shot генерация запрещена.

Открыт только один diagnostic L1:

1. Builder фиксирует contract v2 до новых изображений: frame, exact quad/seams, q→pixels, anchors `.338/.453/.567/.681`, один RGBA master со scales `.939/.978/1.018/1.058`, z-order/occlusion, contact shadows, отсутствие markers, машинная проверка и воспроизводимая сборка.
2. Concept Artist фиксирует art-integration brief для законченного component-based результата.
3. После обоих exact commits Asset Artist создаёт одну independent finished environment/floor plate без встроенного семейства и один clean RGBA art master.
4. Builder программно собирает L1, сохраняет components/manifest/hashes/command/numeric report; глобальная перерисовка после композиции запрещена.
5. Visual QA применяет неизменный rubric `21150e58…` к geometry, identity, grounding, art cohesion и leakage.
6. Только PASS обязательной геометрии и художественной законченности возвращается CTO для решения о четырёх досках. При FAIL — stop/evidence, L2 не открывается.

Финальная серия, публикация и P1 остаются закрыты.
