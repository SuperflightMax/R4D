# P3 Water: применение прежнего рецепта

Baseline CODEf1aca21/ARTf899 и immutable Jungle manifest закреплены в transfer.json.
Этот каталог не меняет Jungle, его PARTIAL/MAP-01 и post-auth ограничения.
Water accepted P1 board04/trial02/candidate02, все exact paths/SHA в transfer.json.

Перенесены: source-aligned alpha restoration поверх shadow и sphere отдельно,
scalar/line native depth, uniform projected r16/lift0.65, floor-mesh shadow,
native5ms/replay/checkpoint/ticks, independent Art/Geometry, source/flat/pan.
Новая sorting/physics не добавлялись. Board identity/filename/prefix различают
две доски. Новые masks/anchors — предусмотренные данные прежнего consumer.

1. Exact inputs извлечены prepare.mjs, их SHA совпали с accepted P1.
2. Artist публикует board-specific assets.json + PNG с прежним v1 contract.
3. `node import-artist.mjs <exact-commit> [variantName]` создаёт отдельный own E snapshot;
   перед build проверяются raw hashes Artist. Source commit и фактический variant
   prefix закрепляются. arch-front-edge-01 выбирает self-contained variant,
   не подменяя original assets.json. Меняются только24 depth records арок.
4. Process-local TEMP/TMP — own runtime water/temp; P3_ARTIST_ASSETS —
   путь exact Water snapshot. После fresh RAM/CPU/C/D/E выполнить
   `node build.mjs <new-absolute-water-runtime-directory>`.
   Existing output не перезаписывается. Native/Pixi exact compiled bytes
   переиспользуются из selected Jungle frozen bundle с hash/provenance check.
5. `node preview.mjs <exact-build-dir> <free-owned-loopback-port>`.
   Route /review/r4d/p3-masks-water/, GET/HEAD без backend. .js browser modules.
6. Ordinary seeds объявлены до результатов; плохие исходы не отбрасываются.
   Gate07 seed1/1006–1018, обе feet/lintel/hole, frog01/105 и baskets проверяются
   actual native/Pixi. Численные crossings сами по себе не дают visual PASS.

Исходные попытки/ограничения и любые будущие substantive method changes
фиксируются раздельно до смены метода. Первый полный71-mask ART17dc сохранён
как full-method-03/source c73d612 до targeted data-коррекции. VQA ранних7 masks
подтвердила binary depth скачок arch07/1014–1015; old full не выдан за PASS.
Обычная anchor-коррекция5c9ba8c6/variants/arch-front-edge-01 применена отдельно
в front-edge-04/source5196c0bd. App/native/PNG/input не менялись. Все24 depth
records независимо сверены с передними рёбрами16 accepted feet, без seed/tick.
Сохранены actual1006–1022 при100%/200% и все5 ordinary browser outcomes.
Lead назначил full freeze тех же100 payload files до independent retest:
VQA начинает с прежнего/нового threshold, затем full matrix на тех же bytes.
W-EARLY-POP-01 открыт до независимой проверки; selfcheck не закрывает finding.
Exact bundle/manifest/evidence в STATE.md. Серверная публикация только отдельным
Release по новому exact token CTO; текущий server_write=false.
