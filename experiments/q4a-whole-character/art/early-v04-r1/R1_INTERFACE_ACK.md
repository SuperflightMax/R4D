# R1 — интерфейс материалов Asset

25 октября 2026. Прочитан `builder/early-v04-r1/R1_INTERFACE.md`. Принимаю native canvas1024×1536, full-canvas RGBA PNG с `cropRect:[0,0,1024,1536]`, manifest `MATERIALS.json`, раздельный owner/provenance. Цвет alpha0 не материал. Приняты новые source-оценки pelvis/hip/knee/ankle и shoulder pivot(434,330), elbow≈(617,500), wrist≈(827,582): для минимального whole arm-chain swing они соответствуют прочитанному объёму raw, существенного расхождения не вижу. Joint geometry/solve/runtime остаются Builder.

Передам только torso/head/tank, far arm, near arm-chain, цельную shorts texture с traced waistband/cuffs/side/crotch, по две source-derived thigh/shin/shoe. Rigid-leg промежутки сначала исследуются на исходном минимальном перекрытии, новые скрытые кожи/hip patches автоматически не изготавливаются. Для source mask trace используются только v04 контуры. Точный shoulder hidden subset, before и prompt будут сохранены до локального вызова. Если раскрытие потребует нового continuation — сначала факт/место/owner, сверка Builder.

Границы/швы будут в raw coordinates, не будущие anchors v02 и не параллельные garment panels. Hip texture остаётся одна для согласованной cage. Мой материал не предопределяет технический PASS; exact-after review позже.
