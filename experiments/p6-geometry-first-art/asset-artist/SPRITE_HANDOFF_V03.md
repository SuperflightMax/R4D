# Trial sprite metadata v03

Independent VQA of actual lift1 confirmed better near-edge support but weak ball-shadow
readability on the ordinary485px view. Apply requested opacity0.60 instead of0.42;
measured raw alphaMax231 then yields peak about0.544. This is a specific useful visual
correction; do not change raw texture, radius22, offset[-6,10], r16 or liftRadiusFactor1.
No new ball/shadow generation. Frozen V02 and old outputs stay untouched.

Clip this ground shadow ONLY to actual `components-v01/prepared/floor-mask-v01.png`,
1536-square, SHA256ec7e2202d5817bace18d69c0c87745c796c904bd267c8446d2c306b86686d4b9.
Artist saw the unclipped offset shadow on the vertical front slab in exact state1916
comparison; there is no ground surface in the empty gap. Never apply that mask to the
ball body or the diagnostic path. Art-off disables the art shadow/mask together.

Static obstacle shadows remain the separately delivered25-instance ground layer from
FLOOR_PACKET_V01. They replace old contradictory draft shadows once; do not add another
copy from per-master suggestions. Ball opacity0.60 does not silently rewrite the static
layer's0.42. The full actual scene needs ordinary-scale readability and overlap checks.
V03 JSON is explicitly UTF8/LF/no BOM; hash the named Git/input bytes separately if any
future checkout changes EOL. No simulation rerun is claimed by this metadata-only edit.
