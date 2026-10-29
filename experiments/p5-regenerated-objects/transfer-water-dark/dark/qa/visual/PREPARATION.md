# Dark — независимая Visual QA: подготовка

30 октября 2026, Europe/Kyiv. Выполнена ограниченная read-only подготовка исходника и принятого P1. Нового Dark art/candidate в этом проходе не получено. Контакты, перекрытия и повторяемость метода **UNVERIFIED**.

## Версии и выполненная работа

Канон полностью прочитан из read-only `E:/R4D/perspective/p6-source.git` на `b1382dd4c230815a019e52e2ec4617ef705661d5`: P5-transfer-water-dark (blob `09f33f99d771ab28b9575de1a358acc40b4d571c` проверен raw show/hash-object), ORDER rev5, P2-P6-transfer, P5-regenerated-objects, COMMON и собственная роль visual-qa. Общий input — `E:/R4D/perspective/coordination/p4-p5-transfer-common-inputs-2026-10-29.json`.

Принятый P1 — `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, board02 **trial-01**. Config 19508 bytes/SHA256 `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`; manifest 13939 bytes/SHA256 `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81`. Exact config/manifest/common view-math извлечены как raw Git bytes только в собственный Dark runtime и сверены по размерам/SHA256.

Оригинал `K:/Agents/R4D/Assets/perspective/02-dark-temple.jpg`: **1536×1536**, 536988 bytes, SHA256 `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a`. Размер измерен по JPEG SOF, исходник просмотрен без изменений. Матрицы, counts и ориентиры — [SOURCE_FACTS.json](SOURCE_FACTS.json).

![Исходный Dark — только референс](K:/Agents/R4D/Assets/perspective/02-dark-temple.jpg)

## Рецепт и референс

Прочитан собственный Jungle RESULT `df0d95f40e60991632c885f0bc53d32497a090e7`; исходный consumer `af23e124cf5bd1d9de884082ffbc993448217112`, art `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`, VQA `e227f3874c19539b7d38f0b8d318a911e7db2915`. Проверяется тот же принцип: новые generated floor/objects/ball/shadows/части чаш в языке Dark, измеренные основания и texture anchors с равномерным масштабом, нужные части перекрытия, неизменённые P1/native. Части нового generated floor допустимы с provenance; исходные JPG crops — референсы. Jungle PNG не заменяют новый набор. Существенная смена подготовки/сортировки требует сохранённой исходной попытки и отдельного варианта.

Dark узнаётся по тёмному каменному полу с красными прожилками, светлым резным граням камня, красным вставкам, чашам и головам. На исходнике отчётливо различаются верхние, передние и боковые поверхности, тёмные полости, падающие тени. При новой сборке важны читаемость шарика и отдельной тени на тёмном полу, сохранение объёма светлых деталей и опора тяжёлых предметов. Свет и резкость должны объединять предметы и пол; конкретный новый угол света по этому просмотру не назначался.

Config содержит 6 bowl-base и 6 skull-base pins, 6 pillar и 6 block footprints по четыре сегмента, 22 внешних/разделительных сегмента, 4 receivers и один старт: pins=12, segments=70. Старт source `(768,293)`, ground horizontal diameter r16 там ≈27.747 source px. Это координатные ориентиры, не размер нарисованной сферы/CSS и не доказательство реального контакта.

Native остаётся 2D; skull и bowl основания приближены кругами, углы pillar/block — четырьмя сегментами. Совпадение сложного верхнего силуэта с кругом не предполагается. Receiver trigger — strict center distance, без z, sink и whole-silhouette containment. Принятие входа не означает индивидуального тестирования drops/корзин Максом.

## Короткий QA чеклист

- После первого Water прохода получить отдельный Dark exact candidate index/hash, URL и owner; закрепить его собственные art/config/projection/native bytes. Результат Water не засчитывать за Dark.
- На assembled Whole/Field в обычном масштабе проверить свет, резкость, объём, читаемые object/ball shadows и опору. Тёмная полоса или наличие shadow PNG сами по себе этого не подтверждают.
- Обычные новые seeds и все исходы, включая LOST, сохранять; достигнутые сложные случаи повторять без фильтрации. Смотреть движение и точные соседние состояния до/при/после контакта и смены порядка, проверив семантику event tick/state.
- На pillar/block различить контакт с передней/боковой гранью и угол, частичное скрытие с появлением. Шар не должен отскакивать от видимого пустого места или исчезать над открытым полом. У bowl/skull отличать принятое круглое основание от декоративного верхнего силуэта; input mismatch документировать отдельно.
- Проверить значимые пересечения длинных ограждений и передней кромки, а также подход/front rim/полость каждого достигнутого receiver и удержанный terminal IN_BUCKET. Новое physical state после остановки ядра не выдумывать. Непроверенные углы, rails и недостигнутые cups обозначать по именам; их исправность не предполагать.
- Art off убирает и маски, Geometry рисуется из actual config поверх арта. Replay, pause/step и вид сохраняют native state. Проверить новый ball/cup optical anchor, не переносить численный Jungle offset автоматически.
- Common input bug передавать Lead/CTO конкретным replay через собственный отчёт; не корректировать colliders под арт. Незатронутая работа продолжается. Наблюдение, preference и гипотезу причины держать отдельно.

## Полученный native case handoff

Lead передал независимые случаи TQA `761e6087c902fe5ea941b90b5ce4d72383a0d755`; seeds 0–3 объявлены до запуска, исходы сохранены. Это native targets, **не просмотр Dark арта и не VQA PASS**. Новые oracle не запускались.

| Seed | Случай | Native states для actual candidate |
| --- | --- | --- |
| 0 | pillar-04 side | 840/841/842 |
| 2 | pillar-02 front | 972/973/974 |
| 2 | pillar-02 corner | 367/368/369 |
| 3 | pillar-04 corner | 934/935/936 |
| 0 | receiver-01 entry | 886/887/888 |
| 3 | receiver-02 entry | 1267/1268/1269 |

Raw `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/case-windows-001/windows.json`: 86572 bytes, SHA256 **`30ba177a71f07d4eb873550cf14f80be6f95a0f17f3a8ac0438e7655d276a976`**, независимо сверён. Exact copy — собственный `dark/inputs/native-case-windows-001.json` в runtime. Все окна пока визуально UNVERIFIED; получение записано в append-only EVENTS.jsonl.

## Состояние и ограничения

Остатки Jungle receiver02/04, длинных rails/поднятой растительности и некоторых пересечений сохранены; художественный PASS задним числом не присвоен. Здесь нет нового Dark изображения, browser/native/simulation run или actual motion evidence. Первый Water candidate имеет приоритет входа; затем проводится самостоятельная Dark QA.

Prep guard 2026-10-29T23:23:59.7735194Z: free RAM 10.604 GiB, CPU 4%, aggregate CPU 5.542%, aggregate working set/private 26.509/27.590 GiB; C/D/E free 14.672/14.651/9.764 GiB. Оценка собственного пика ≤0.5 GiB RAM / ≤0.03 GiB E; другим зарезервированы 4/2 GiB. Новый тяжёлый этап требует свежего guard. Новых servers, публикации и server writes нет.
