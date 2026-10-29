# Actual floor + separate static shadows, first prepared packet

Native material `raw/floor-material-v01.png`, SHA256
3871c713265d8b88b9e46b586e3867df02e1624c6f81bb3d5149c39c531aeb49, actual own imagegen
output exec-c991b19d-eb4c-41e2-830b-c36e6b458634. No board geometry or obstacles were
asked from this material generator. Its raw is not cropped, warped or retouched.

`prepared/floor-layer-v01.png`: actual1536-square RGBA floor from the exact accepted
floor polygon, inverse homography and mirrored-repeat material sampling in native units.
`prepared/ground-shadows-v01.png`: actual separate1536-square RGBA static shadow layer,
25 once-only own shadows, one per accepted pin. One native light vector[-0.55,+0.83],
length by family, opacity0.42; no static shadow baked into the floor material.
`prepared/floor-mask-v01.png`: actual accepted-floor alpha, for clipping dynamic ball
shadow ONLY. State1916 in the real lift1 frames showed shadow on the front slab when
unclipped. This mask must not hide the sphere body or diagnostic path.

Consumer puts these full-frame layers at source origin0/0, no crop/fitting. In flat view,
use the same accepted inverse projection as all source art. Remove ALL old diagnostic
floor/draft shadows when replacing the floor. Do not stack old and new shadows or add
another copy of the per-master suggested static shadow on top of this25-instance layer.
Geometry contours remain from actual config above the art. Art-off disables its masks.

`floor-shadow-preview-v01.png` is a STATIC ART RASTER composite, not an actual browser
simulation frame. It proves the delivered bytes can be composed and the floor shape
is fixed, not final visual quality. Visible mirror repeats form too-symmetric stone
motifs; next material correction will remove the tiling/mirror pattern without changing
this geometry or shadow layer. First prepared version remains for comparison. No PASS.
