# Water mini01 — early compatibility subset

Ready for the first Builder native/Pixi candidate. Manifest: `asset-manifest.mini-01.json`, **13990 bytes**, SHA256 **`7d551ff2eebfeef6f23674c140836f010ed16b6da11b42822af708f92c292981`**. Contract and computed targets are exact Builder `5d40b82ac6b2b69f7077bb9bfe58c7560fbf783e`; all five Water and Dark contract pins were materialized byte-for-byte and verified. Water uses accepted P1 board04/trial02 exclusively.

Five selected PNG, seven instances: the new floor, new sphere, separate sphere shadow, separate obstacle shadow and one pillar master at pillar03/04. Other obstacles/receivers/environment parts remain explicitly absent. They need visible diagnostic geometry; this subset is not full coverage or artistic PASS.

Selected directory: `E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/selected/mini-set-01/`. Each name below has `.png`; all exact absolute paths and raw/native links are in `SELECTED.mini-01.json`.

| PNG | Bytes | SHA256 |
| --- | ---: | --- |
| floor-v1 | 2477216 | `37e1603fe031b18e9ae8d325f65b2c138612d15f49d6948ce0b27c9b35c3456c` |
| ball-v1 | 1370021 | `2cfee97a7bf2542a0a4226ee893ecfa7a7a1f7352505ce74d8b8c48bae1bb301` |
| ball-shadow-v1 | 546326 | `0d9fc682e32a2ce5255682e489a6b17c9c451f95a0b16c23325e19239fed251c` |
| obstacle-shadow-v2 | 343656 | `8d7171a661c095dc4b9cef5297ff07fdc9f2b2cf14f072886d02e8944cc85bc2` |
| pillar-mid-v1 | 1040337 | `0265ff9669166fbe216da0393c6552e054d66ef0587feb206a56c06e4cbcde92` |

All are unchanged native imagegen outputs. Original reference JPG and crops are not final cutouts. C originals are retained while active; E copies preserve bytes, timestamps and ordinary attributes. Prompts001–008, raw provenance and significant rejected outputs are retained. The selected subset uses no Jungle PNG.

Pillar ground anchor `[627,982.1392629208134]`, measured contour footprint `710 × 250.8075881350121` texture pixels. Lower alpha>=128 ellipse fit is a support proxy on the faceted base, not recovered camera geometry. At pillar03/04 the source depth residual is `-0.09324019342998469` px using one uniform scale. Exact native vertices/centroids and source bindings are in `BINDINGS.mini-01.json`; neither config nor projection changes.

The new sphere visible bbox is `[99,101,1052,1046]` at alpha>=16. Optical center `[625,624]` and lower-edge contact `[625,1147]` are measured in the half-open bbox convention, approximately ±3 texture pixels. New lift `L=523` texture pixels is recorded for the future cup calculation. It is not the Jungle cup shift. Shadows are separate RGBA and have zero opaque pixels; their normal-scale appearance remains subject to actual QA. Native faint alpha residue outside visible contours is retained.

The exact Water schema passes; every target ID resolves and every selected PNG SHA/byte count matches. No actual rebuilt motion or independent QA on this subset has been performed by Artist. Builder/VQA should first check floor/source registration, ball support and size, pillar03/04 normal-scale shadows and side/corner overlaps, keeping ordinary seeds and exact adjacent ticks.

Continuing work: elevated frog correction; arch feet/lintel/opening with accepted proportions and explicit parts; new receiver/back/front with optical policy recalculated from the new ball; the near edges and long side-wall occluding regions from this generated floor; remaining Water depth coverage, then independently generated Dark assets. Frogv1 is too frontal; archv1 has overly broad feet and a narrow void; shadowv1 contains stray border bands. All three are excluded, preserved and recorded rather than cleaned up or silently substituted.

This is the existing sprite/parts/generated-floor-clip method from Jungle consumer `af23e124cf5bd1d9de884082ffbc993448217112`, art `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`, RESULT `df0d95f40e60991632c885f0bc53d32497a090e7`. Jungle PARTIAL/UNVERIFIED remains unchanged. No new sorting principle, geometry/PRNG/core change, public demo delivery or Review/server write. `tokenGranted=false`.
