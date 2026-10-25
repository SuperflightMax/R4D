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
