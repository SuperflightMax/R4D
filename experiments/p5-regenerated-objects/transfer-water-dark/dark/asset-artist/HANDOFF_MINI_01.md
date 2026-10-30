# Dark mini01 — first partial native/Pixi integration set

Manifest `asset-manifest.mini-01.json`: **47851bytes**, SHA256 **`c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7`**. Exact Builder contract5d40b82ac6b2b69f7077bb9bfe58c7560fbf783e,accepted P1 board02/trial01. Schema,target IDs,all PNG pins and groundAnchor/footprint.center consistency pass. Status remains partial; actual rebuilt runtime/QA has not been inspected by Artist.

Eight unique PNG/15textureIDs/35instances. Selected12of24obstacle groups: skull-base01/02,pillar01–06,block01–04. Four receiver back/front pairs. Bowl family,remaining skulls,nearblock05/06 and environment clips remain work. Closest-profile selection uses measured support depth residual, not seed or path filtering. All missing geometry remains diagnostic in the first prototype.

Selected directory: `E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/dark/selected/mini-set-01/`. Exact absolute file paths and alias relations are in `SELECTED.mini-01.json`.

| PNG | Bytes | SHA256 |
| --- | ---: | --- |
| floor-v2.png | 2795277 | `99b5afe65b62abbbaaf76a782ed7c82a98e4b4a143db230371bb358df5cc8c74` |
| ball-v1.png | 1913632 | `e125d94419ad73c2c67461546f704b974021866b21085d32a50b51274da2ac46` |
| shadow-v1.png | 442688 | `671762679e504e278f52903d335a9ad44f28f8bd245dc1a4206c96acb0668d61` |
| skull-mid-v1.png | 2252858 | `908dadc778a9b6c7989009444bbb835b3ac2a07d1e306db3a29dbca8e7eaf144` |
| pillar-mid-v1.png | 1308841 | `cee6d591ba931e77a66801b717230325345cfea43ae2273e59bcc1712ce0ba0d` |
| block-mid-v1.png | 1846030 | `87b76e1d8b13ae320ba5a23d8a964a858d94a303f0f0d29282dd17a593d608a4` |
| receiver-v1.png | 2393751 | `bf3f2fa5143bf6180dcf44f80e711bb97094e2eefdf24c1b0dab6f6d5bd13a6b` |
| receiver-front-v1.png | 1521694 | `27396c82ed4d2cd0bc8ce8e046a02da92890e59e3dbfeba68823aadc561e3d71` |

All final pixels are new unchanged native imagegen output; no original cutout or Jungle/Water PNG is substituted. Two shadow texture IDs reuse one new Dark shadow PNG; eight receiver IDs reuse two new Dark receiver PNG. These aliases are not extra generations. Ten native outputs and meaningful failures/corrections,real prompts,raw/native links and exact copy records are preserved. C originals stay while active; verified E copies preserve timestamps and ordinary attributes.

Known floor limitation: floorv2 successfully removed duplicated red receiver facades, but its visible near edge still appears aroundsourceY1260 rather than accepted floorY1121. This is an unfinished lower-zone art-registration correction. The plate is supplied to unblock upper-field/body compatibility checking; full floor registration/near-receiver appearance is unverified. Do not change physical geometry or framing to conceal it. Preserve this first result before the next native floor correction.

`BINDINGS.mini-01.json`:32049bytes/SHA`2656769fcd0a1f0ebb9df156ad484d959a24ef61a4e210e6f930f2be87191b0a`. Pillar/block bases use two measured visible lower alpha>=128 contact edges and an inferred rear parallelogram vertex. Ratios0.4138031975/0.6873251072,edge fit RMS approximately0.30–3.02texturepx;rear-plane uncertainty12texturepx remains explicit. Skull uses a round-base contour fit,ratio0.4831237601. Maximum selected source-depth residual3.8284845741px. Corner orientation/partial face occlusion still requires actual motion; a depth fit is not a corner PASS. Bowlv1 ratio0.4275417457 is too shallow for accepted0.5204..6289 and is excluded pending correction.

`RECEIVER_ANCHOR_POLICY.mini-01.json`:5303bytes/SHA`0d1b8ce3d9ff1bc4093252c13585339076a1b7ea8a3b4829dc27152f4bfbbf3b`. New ball visible bbox[91,79,1073,1089],visual center[627.5,623.5],contact[627.5,1168],L544.5. New optical cup pointO[627.5,440],authored capture region330x223 inside the opening. Independent128-sample projected bucket widths match targets with delta0. Derived common-policy visual cup shifts are -18.9333414010/-18.8598523350/-18.8781584157/-18.9668974106sourceY. These are calculated from new Dark art/projection; no Jungle/Water shift constant is reused. Back/front both use logicalA=[627.5,440+hR] as groundAnchor and footprint.center,with O separate.

Both receiver PNG are1254square; sampled lower contours differ by at most4texturepx. `records/receiver-registration.mini-01.json` retains all rows;pixel identity is not claimed. All real approaches,rim overlaps and terminal appearance remain unverified. No fake sinking/fade or native trigger/start adjustment.

Builder/QA next: actual ordinary-seed native/Pixi motion,ArtOff/Geometry above art,pause/replay/exact ticks; front/side/corner overlap on block/pillar,far skull contacts,normal-scale shadow readability and receiver approaches. Native/core/config/projection/PRNG stay unchanged. Source sprite/parts/generated-floor-clip recipe remains the Jungle baseline; no new sorting principle,server/Review write or public delivery token. Next Artist work: lower-floor correction,bowl and depth variants,environment occluders;continue Water gates/walls/near edges against actual QA.
