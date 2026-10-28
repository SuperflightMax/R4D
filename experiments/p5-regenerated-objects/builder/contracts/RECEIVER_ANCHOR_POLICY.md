# Receiver: optical aperture и logical capture anchor

Адресное решение Lead29октября: принят вариант1 из Artist `3c2e50c7caa64b281480ba895e13cf309dcbd655:experiments/p5-regenerated-objects/asset-artist/RECEIVER_C01_DIAGNOSIS.md`. Применяется только к следующему candidate. C01 и его история не переписываются.

## Общее правило

Optical aperture point `O=[628,477]` остаётся отдельным измеренным свойством исходного receiver PNG. Logical capture anchor `A` находится ниже него на `hR` texture-local pixels:

`A = [O.x, O.y + hR]`

Для каждого неизменного native bucket center `p`:

- `W(p,r)` — source1536 ширина projected native circle с128равномерными угловыми отсчётами, exact accepted P1 project. Это тот же width rule, что consumer `circleWidth` и таблица targets.
- `sR = W(p,bucket.r) / receiver.footprintPx.width`.
- `sB = W(p,config.board.ball.r) / ball.footprintPx.width`.
- `L = ball.groundAnchorPx.y - (ball.alpha.visibleBounds.y + ball.alpha.visibleBounds.height/2)`.
- `hR = L*sB/sR`.

Ball radius берётся из exact config:r16. В текущем ball PNG L468.5px, width959px; receiver footprint width290px. Правило зависит от общих metadata и bucket geometry, **не** от seed, tick или положения шарика конкретного броска.

Новые texture aliases сохраняют raw PNG bytes, source provenance, width/depth и optical point. Их `groundAnchorPx` и `footprintPx.center` оба равны **logical A**. Optical point нельзя оставлять в footprint.center и называть его logical anchor: verifier проверяет совпадение footprint.center/groundAnchor. Дополнительные optical/policy/alias metadata schema принимает; отдельный renderer offset не требуется. Back и front одного bucket используют одинаковые A и uniform scale.

Aliases не являются новыми генерациями. Origin tool output/raw SHA/prompt сохраняются, а новое alias/binding policy происхождение объявляется отдельно в Artist manifest/BINDINGS. Прежний alpha/visible bbox не меняется из-за смены anchor.

## Числа из текущих exact ball/receiver metadata

| Bucket | hR texture px | Logical A.y | Visual cup shift source Y |
|---|---:|---:|---:|
|receiver-01|67.61658485838826|544.6165848583883|−17.806328843888608|
|receiver-02|81.36410310994435|558.3641031099444|−17.88821208755312|
|receiver-03|79.49910938997404|556.499109389974|−17.900535471480275|
|receiver-04|72.01147152317914|549.0114715231791|−17.83262468897837|

X остаётся628. Полный computed input/output — `E:/R4D/perspective/p5-runtime/builder/output/receiver-policy-001/expected-rule.json`,4036bytes,SHA256 `c10764513f0e83d008db2530acaa89f489eefd6dfe83c9d5ca132d6cee9f898f`; он использует exact frozen c01 metadata и P1, без запуска native.

Это **изменение anchor-контракта**: при неизменном logical/native/source target отображение всей чаши поднимается относительно logical plane. Нельзя выдавать его за отсутствие переноса рисунка или за старую ошибку измерения на1px. Sphere ground-anchor policy при этом не меняется, hidden offsets/sink/fade не добавляются, uniformscale receiver сохраняется.

## Приёмка следующей сборки

Artist передаёт exact aliases/policy/BINDINGS с входами/выходами и source hashes. Builder сверяет общий расчёт на всех4buckets, одинаковые back/front anchors и сохранение PNG bytes. Дальше actual pause/step/realtime на875, seed0receiver03 и обычных cases; обе независимые QA проверяют convincing entry, floor/ropes/parts, размеры и Art off. Само правило не гарантирует PASS. Native/source targets/radius/drop/config/physics и PRNG не меняются.
