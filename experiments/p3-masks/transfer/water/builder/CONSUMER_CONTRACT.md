# Water: consumer contract P3 без изменения способа

Исходная версия: CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`, ART
`f899a308aed156a11e2a1013292ed68c6669959d`. Рецепт/полный формат:
`experiments/p3-masks/builder/ASSET_CONTRACT.md` и `README.md` в исходном commit.
Jungle frozen manifest `e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f`
сохраняется отдельно; его PARTIAL/MAP-01 и post-auth ограничения не пересматриваются.

Входы Water exact перечислены в `transfer.json` и `inputs/` этой папки.
Water = P1 board04/trial02, source 04-water-temple.jpg 1536×1536.

Artist handoff: exact commit + `experiments/p3-masks/transfer/water/asset-artist/assets.json`.
Schema `r4d-p3-assets-v1`, `sourceSize:[1536,1536]`.
Каждая occluder: `id,path,rectPx:[x,y,w,h]` и прежний `depthNativeY` либо
`depthLineNative:[[x1,y1],[x2,y2]]`. Белый RGB/alpha PNG, crop без rescale,
физическое тело без baked shadow. Ball/shadow — свои RGBA/измеренные
anchorPx/radiusPx; shadow offsetRadius/scaleRadius/alpha как в исходном формате.
Sphere uniform horizontal projected r16, liftRadius default0.65;
shadow сначала floor-plane, затем принятая projection. PRNG не расходуется.

Воротца: отдельно тело обеих опор и перемычки, проём остаётся alpha0.
Разделение на source-aligned области и прежние scalar/line поля допустимы
как новые данные существующего способа. Новой сортировки здесь нет.
Штатная физика содержит отдельные feet, без lintel collider; доступность
прохода проверяется настоящим ordinary run, не выводится из наличия картинки.
Выключение арта отключает обе passes перекрытия; actual config contours выше арта.

Water masks/асcеты не переносятся в Dark. До exact handoff показывается только
явно обозначенная диагностика; наличие движущегося контура не является art PASS.
