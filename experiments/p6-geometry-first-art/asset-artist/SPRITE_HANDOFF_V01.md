# Actual sphere + shadow packet v01

`SPRITE_PACKET_V01.json` — machine consumer contract with hashes, canvas, actual alpha
bounds at1/16/128, center, visible radius, anchor, projection rule and opacity.
`raw/ball-v01.png` and `raw/ball-shadow-v01.png` are actual independent P6 native imagegen
outputs, byte-identical to preserved C originals. No generation reroll of ball.

Ball:1254-square, centre(626,636.5), visible radius428px at alpha>=128; opaque circular
body has real volume, upper-right highlight and no baked ground shadow. Physical r16
scales through the accepted projection, never through full1254 canvas extent.

Shadow:1774x887 (actual native aspect), circular content centred(885.5,442), radius312px
at alpha>=16. Simple olive dark falloff; actual alphaMax231, so packet opacity0.42 gives
peak about0.38. Project its ground patch, radius22 native, offset(-6,+10) native, through
the accepted matrix. Do not squash an already projected sprite twice.

Low-alpha specks reach the raw canvas boundaries; measured alpha1 bounds are recorded,
not hidden. They do not define visible radius. Optional render alpha threshold16/255
suppresses that faint fringe without overwriting raw. Final small-scale appearance and
ordering need assembled QA; this handoff claims usable assets/registration metadata,
not scene PASS or finished obstacle occlusions.

Native C source files remain active and are not deleted. Copy manifests preserve exact
SHA256/bytes/timestamps. Whole-board trials and failures are separate evidence.
