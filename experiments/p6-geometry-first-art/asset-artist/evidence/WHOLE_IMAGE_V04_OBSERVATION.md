# Whole-image diagnostic v04: draft as only visual input

Tool output `exec-9d1f2564-666e-4b52-89b4-4079071a53a2`.
Actual referenced_image_paths contains EXACTLY ONE path:
`E:\R4D\perspective\p6-runtime\asset-artist\inputs\builder-draft-v01\geometry-draft.png`.
Jungle and prior renders were NOT passed visually. Style is text only in saved prompt
`whole-board-draft-only-v04.txt`, SHA256 `4796700df8eecccd119ecd8418e60b53d40f10af13a68ed0e1f10d5a2890ca04`.
Numeric source anchors from frozen geometry.json are named JSON x/y, using decimal points.

Raw1254-square SHA256 `24b2840d119cc96a3fe4986a98403457ea24fea6b2798d16c31701e411769c9a`.
E byte copy verified; raw preserved, C source retained. Only uniform full-frame1536 scale
performed; exact registration overlay saved. No fitting, crop or local warp.

## Personally observed actual result

One complete coherent illustrated board,25 obstacles and4 small hanging baskets. The
visual style follows the textual palette/material description with changed details.
Far edge still rises above accepted y300. Far/middle bases are displaced, near bases
also remain off accepted footprints. Physical-facing boundaries do not match the fixed
segments. Capture mouths are more closely centred than v01: small baskets surround the
four capture areas instead of putting every capture area on a broad front rim. Exact
per-mouth containment remains for independent QA; no complete geometry PASS.

Removing all competing style images therefore did NOT cure the systematic global and
per-object drift in this invocation. This does not prove native imagegen can never
retain a draft; it limits this particular control/style hypothesis. Repeating stronger
text alone currently offers no new concrete mechanism. Continue the separately stored
component variant while retaining all whole-image first/best/failures.

## Correction to earlier local summary

Independent VQA `facc6ed2fe95f3556ddec48f29de7165a6e752c0` found that v02 improved ALL4
capture mouths as well as lower bases. My earlier whole-summary's blanket statement
that all v02 captures remained on front rims was too broad; that defect was established
for v01. The mutable conclusion is corrected; original raw/overlays remain untouched.
