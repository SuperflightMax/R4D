# Floor correction v02: actual registered layers

Use `FLOOR_PACKET_V02.json` and `prepared/floor-layer-v02.png` for the next actual scene.
Native portrait material v02 was sampled ONCE at uniform native units per texel through
the exact accepted inverse homography. Mirrored/repeated tile motifs in first prepared
v01 are removed. This is a new component material rendering, not local fitting of a
whole-image board. Raw material and first prepared prototype remain available.

Exact1536-floor alpha is verified against frozen floor-mask-v01 pixel by pixel. Mask
SHA256ec7e2202d5817bace18d69c0c87745c796c904bd267c8446d2c306b86686d4b9 is unchanged.
The25-instance ground-shadows-v01 layer is also byte-identical, SHA256
53a655743b838308a91e9d9ab0ce52bfb85478250f0a0876f5ef532262d2e2c3.
It is separate from floor: draw floor, this shadow layer ONCE, then body/front-rear art.
Do not keep old draft shadows or add a second per-master static-shadow set.

Floor-layer-v02 SHA256e8964a4a7c8895d4cb6a186eaded419ae277bc6c408292ca841cb7bcdf6f537f.
The floor-shadow-preview-v02 is a static ART raster, not an actual browser/simulation
frame. It has no obstacles, boundary art or receiver parts yet. Check material scale,
grounding and shadows at ordinary viewer size after actual assembly. No scene PASS.

Dynamic ball shadow follows SPRITE_PACKET_V03: opacity0.60, same raw/radius22/offset,
lift1. Clip only that shadow using the unchanged exact floor mask; never clip the ball.
