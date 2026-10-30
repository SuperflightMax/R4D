# Water mini05: семейства, gates, cast shadow и первый foreground pass

Manifest `asset-manifest.mini-05-expansion.json`:125833 bytes/SHA256 `b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27`. Отдельный successor mini04/w05. Все прежние19 textures/34instances и receiver policy сохранены семантически exact. Prerequisite Builder code eedd183a2652a8b9a2dce60118c0f32c8755d3b7. Original w04/d01/Jungle не изменены.

13 unique PNG/22texture IDs/84instances; все21 obstacle art groups и29 physical targets представлены. Из новых bitmap ровно3:

- frog-mid-v6:1194673bytes/SHAa0d0d4a7ae0d79719b94120834249a7161509f4bfa14d097b649022bf42ba34a,дляfrog02/03; ground ellipse978x399.996648,anchor[626,867.921256].
- frog-near-v7:1497691bytes/SHA81954b3b33a69cbc24c9cc259a59881100d66b38d685a9d1b96df7f5107d2aac,дляfrog04/05/06; ellipse1074x472.42049,anchor[627,889.965597]. Дляfrog06 residual≈−5.09sourcepx не скрыт и не лечится native/XY warp; actual contact требуется.
- lintel-shadow-v1:294672bytes/SHA9773b722949601b438a85076aca750bc703e4bf99dc5750e7ea0f55df96d3a96,отдельная cast lobe на каждой из8 arches. Caster proxy950x190,anchor[627,580] из generation brief; painted alpha>=16 bbox[89,652,1015,164] не выдан за footprint. MaxAlpha172,opaque0,измеренная сила выше brief90..130. Две foot-contact shadows на каждой арке остаются, без новых foot spots в cast sprite; реальное сочетание/extent/свет пока PARTIAL.

Все3 selected лежат в `E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/selected/mini-set-05/`,native C originals/raw/prompts/refs/rejects сохранены. Geometry guides — только refs, не final art. Ground rear half у frogs inferred, uncertainty±6texturepx. Различия support pose получены native imagegen, не деформацией готовых PNG.

Тот же whole-gate arch-mid-v2 добавлен на оставшиеся7 assemblies, у каждой2 shadows по exact foot targets и отдельный новый lintel cast. У arch07 прежние instances/registration unchanged; w04 actual seed1 subset не превращён в PASS остальных7. Aggregate loops остаются только регистрацией, без lintel/height collider. Все13 новых body bindings с residual/uncertainty в `BINDINGS.mini-05.json`. Приоритет actual cases arch03/04 при наличии на обычных прогонах, исходный arch07 и near frogs.

Foreground11 sourceClip regions того же floor-v1 SHA37e1603f…456c:inside-facing long-wall caps/near terminal faces и3 island front faces. Это0 новых PNG/aliases,без original cutouts. Каждый exact parent=floor/texture=floor-v1,target=$source,role=foreground,depth0,source1536 через uniform1536/1254. Лево/право трассированы отдельно. Diagnostic overlay просмотрен;18 выбранных water/paving/void probes свободны,9 stone probes закрыты; proper segment self-intersections0,vertices вrawframe. Это не полный contour/dynamic PASS. Boundary±3rawpx; outer far columns/arch legs/мелкие bevel/foam ещё не полностью покрыты/проверены. Маски должны оставаться под Art,Geometry выше.

Проверены schema,все PNG bytes/SHA,IDs/targets/parents и неизменность старых instances/textures. Recovery после capacity error: ownHEAD9647869d проверен, все5 завершённых новых Water/Dark generations найдены по real files; повторных generation retries не было. Последний guard RAM9.326GiB,C/D/E13.716/14.610/9.076GiB,CPU3%,aggregateWS28.285GiB;свой1RAM/.25E и allowance4RAM/2E выдержаны.

Actual расширенный stage Artist не запускал: whole/field/readability, shadows,near body contacts, foreground crossings/ArtOff и все rare silhouettes требуют Builder+independent QA. Lead сообщил положительный w05 receiver subset,formal closure не присваиваем сами. Никаких изменений core/config/geometry/projection/native/radii/trigger/PRNG/sort principle,seed/tick offsets или fake sinking. serverWrites=0,tokenGranted=false.
