# Явная foreground part из того же generated floor

Адресное разрешение Lead для следующего P5 candidate, получено29октября. Это optional расширение schema `r4d.p5.assets/1`; c01/mini01 не меняются. Основной метод P5 — заново generated отдельные obstacles/ball/receivers/floor. Исходная Jungle вырезка сюда не подставляется.

## Что передаёт Artist

В `textures` остаётся тот же exact generated floor PNG, его полный SHA/bytes/size/alpha/provenance. В `instances` уже есть его `role: "floor"`. Новый foreground instance **повторно использует тот же textureId** и содержит:

- `targetId: "$source"`, `role: "foreground"`, `parentId`: exact id существующего floor instance, `depthOffsetRadii: 0` и понятный `depthReason`.
- `sourceClipPx.coordinateSpace: "source1536"`.
- `sourceClipPx.polygon`: минимум3точки `[x,y]` вsource1536, в порядке обхода простого замкнутого контура. Последнюю первую точку повторять не требуется. Не texture-local1254 и не viewport pixels.
- `sourceClipPx.provenance.method: "scene-region-from-generated-floor"`; `sourceTextureId` равен instance.textureId, `sourceSha256` равен exact floor PNG SHA256, `note` объясняет выбранную часть и её происхождение от generated floor.
- `sourceClipPx.limitations`: явно заявленные ограничения контура у платформы/канатов/корзин. Полный floor генеративный provenance наследуется через textureId; новый imagegen invocation или bitmap edit для clip не выдумывается.

Точные точки предоставляет Artist по своему immutable floor. Builder не выбирает production contour из предположений. Если нужно несколько несвязных кусочков, это несколько явно объявленных foreground instances с тем же floor parent/texture и отдельными контурами; новая система слоёв не требуется.

Формат одного instance показан в `source-clip.instance.example.json`. Это только явно помеченный fragment: прямоугольник и нулевой SHA иллюстративны, не production contour и не renderable handoff. Artist заменяет их exact измерениями/пином, использует реальные textureId и parent floor instanceId и убирает `exampleOnly`.

Область должна описывать именно near ledge/объявленную часть архитектуры. Нельзя закрыть весь нижний фон, receiver openings или все basket sprites сплошной безусловной плоскостью. Контур и ограничения видны в manifest и QA данных; проверка ненулевой площади сама по себе не доказывает семантически правильное перекрытие. Его смысл и partial occlusion проверяются в следующей реальной сборке независимыми QA.

## Потребление

Пол uniform1254→1536 (либо другой exact square→1536) отрисовывается без crop/warp. Foreground part — второй Sprite **тех же texture bytes**, в том же положении/масштабе `$source`, с Graphics polygon mask вsource1536. Это ограничение видимой области, не новые пиксели, не inpaint и не новая привязка.

Sprite и mask находятся внутри одного child Container под `art`. Верхний foreground порядок действует только внутри объявленной области. «Арт» выключает весь этот tree вместе с mask; actual config geometry остаётся отдельным верхним sibling. `src/controller.mjs`, native/config/projection/PRNG/trajectory не затрагиваются.

Verifier сверяет floor parent, generated source, texture ID/SHA, coordinate space и границы0..1536, наличие polygon/limitations и нетривиальную площадь. Polygon и его source pin выводятся в диагностике. Self-intersection/точное положение границ и видимое движение не объявляются доказанными по этой числовой проверке.

Подготовлены только schema/validator/renderer source. Actual Artist contour/pins ещё не переданы, новая сборка/preview/QA не выполнялись. Принятую c01 root/listener нельзя заменять. Следующий candidate получит отдельные source/manifest/build hashes и адресную проверку Art off/Geometry/partial occlusion на тех же native seeds/ticks.
