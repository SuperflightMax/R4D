# P3 Dark: применение прежнего рецепта

Baseline CODEf1aca21/ARTf899 и immutable Jungle manifest закреплены в transfer.json.
Этот каталог не меняет Jungle, его PARTIAL/MAP-01 и post-auth ограничения.
Dark accepted P1 board02/trial01/candidate01, все exact paths/SHA в transfer.json.

Перенесены: source-aligned alpha restoration поверх shadow и sphere отдельно,
scalar/line native depth, uniform projected r16/lift0.65, floor-mesh shadow,
native5ms/replay/checkpoint/ticks, independent Art/Geometry, source/flat/pan.
Новая sorting/physics не добавлялись. Board identity/filename/prefix различают
две доски. Новые masks/anchors — предусмотренные данные прежнего consumer.

1. Exact inputs извлечены prepare.mjs, их SHA совпали с accepted P1.
2. Artist публикует board-specific assets.json + PNG с прежним v1 contract.
3. `node import-artist.mjs <exact-commit>` создаёт отдельный own E snapshot;
   перед build проверяются raw hashes Artist. Source commit закрепляется.
4. Process-local TEMP/TMP — own runtime dark/temp; P3_ARTIST_ASSETS —
   путь exact Dark snapshot. После fresh RAM/CPU/C/D/E выполнить
   `node build.mjs <new-absolute-dark-runtime-directory>`.
   Existing output не перезаписывается. Native/Pixi exact compiled bytes
   переиспользуются из selected Jungle frozen bundle с hash/provenance check.
5. `node preview.mjs <exact-build-dir> <free-owned-loopback-port>`.
   Route /review/r4d/p3-masks-dark/, GET/HEAD без backend. .js browser modules.
6. Ordinary seeds объявлены до результатов; плохие исходы не отбрасываются.
   Actual seed0 pillar02/365–367, pillar04/839–841, receiver01/888 и seed2 LOST
   рассматриваются в native/Pixi. Numeric hit не доказывает painted overlap.

Исходные попытки/ограничения и любые будущие substantive method changes
фиксируются раздельно до смены метода. Пока подключена только native диагностика:
Art/Masks не проверены, вердикт переноса не объявляется. Серверная публикация
только отдельным Release по новому exact token CTO; server_write=false.
