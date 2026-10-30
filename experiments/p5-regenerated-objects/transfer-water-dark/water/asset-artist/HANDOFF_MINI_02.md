# Water mini02 — wider partial set and all receivers

Consume `asset-manifest.mini-02.json`: **40316 bytes**, SHA256 **`6948fdd7fccc60612183a2a8f9d6ce88f78ecd137931297c8fca556b3c19169a`**. Compatible with exact Builder contract `5d40b82ac6b2b69f7077bb9bfe58c7560fbf783e`; schema, exact target IDs, texture pins and groundAnchor/footprint.center equality pass. Mini01 remains frozen at commit094301dda9a43e7b4970af9d9af20982a38fb221 with its original manifest/PNG pins.

Eight unique PNG,14textureIDs,27instances: floor/ball/separate shadows, all seven pillars, farfrog01 and four receiver back/front pairs. Only eight of21obstacle art groups are covered; the other five frogs and eight arch assemblies remain explicitly partial. No environment foreground clip yet; long walls/near edges are required continuing work.

Old five PNG remain at immutable `E:/R4D/perspective/p5-runtime/asset-artist/transfer-water-dark/water/selected/mini-set-01/`. New three files are in sibling `mini-set-02/`:

| PNG | Bytes | SHA256 |
| --- | ---: | --- |
| frog-mid-v4.png | 1382638 | `f718f84fb020356c13a2753aa9449d5713f90366559dc6c4d1bb24f97fd07ddb` |
| receiver-v1.png | 1547434 | `4bf235f8981fcb7c3ca3029c2e59a8594e9af28d7de534a56e1ab841a9549843` |
| receiver-front-v1.png | 923732 | `aaaac1a65b694873281326fcfb71fef13b1bdf3f6cea4ac06d3315f93a7bf098` |

`SELECTED.mini-02.json` contains all exact absolute paths and alias relations. Eight receiver texture IDs reuse two PNG, not eight new generations. All final pixels are unchanged native imagegen outputs. Prompts, raw and meaningful rejected/correction attempts are preserved; no original cutout or Jungle PNG is substituted.

`BINDINGS.mini-02.json`:11663bytes/SHA`5e0980199194f6f574c533450317c4f414742a6ce79157021918837995a09c6f`. Measured contour-proxy depth residuals: pillars -0.914..+2.200sourcepx; farfrog01 -3.919sourcepx. The contour fits are approximations of painted supports, not recovered camera geometry. No XYwarp, native movement, target offset or geometry change.

`RECEIVER_ANCHOR_POLICY.mini-02.json`:6308bytes/SHA`a9756c0bc381ed4aefe19bdde2c335a746e2d5467a21557f73c75ab8e2f08312`. New sphere optical center[625,624],contact[625,1147],L523,diameter1052. New cup optical openingO[627,500],authored capture proxy230x120 inside the visible water region. Exact128-sample Water projection gives hR58.4579610725/59.7149517742/58.7574460031/55.4715710195texturepx. Both groundAnchor and footprint.center are[627,500+hR],O remains separate. Explicit visual cup shifts -18.6671473073/-18.6442061606/-18.6299228800/-18.6514849680sourceY. Independent projected bucket widths match Builder targets with delta0. Jungle17.8px is not reused.

Native front edit retained1254square framing. Lower contour samples at textureY700/800/900/1000/1100 differ from back/full by at most3texturepx; pixel identity is not claimed. Cup optical measurement uncertainty is about5texturepx. Approaches, rim overlaps and terminal appearance of every receiver still require actual rebuilt native/Pixi QA; there is no fake post-IN_BUCKET sinking, fading, seed offset or trigger change.

Next priority from Lead: whole corrected gate baseline for arch07, ordinary seed1,states998–1031; then registered/improved parts. Current native whole gate and separate left/right/lintel candidates are preserved. Left/lintel edits changed canvas, so they are not declared registered/ready. A limited measured whole-sprite baseline will be handed off separately before any substantial method variant. No height/lintel collider is invented.

No actual mini02 runtime inspection by Artist yet. W01 scoped TQA/VQA observations were reported by Lead; its Field start-ball clipping finding belongs to Builder framing and does not request changing these art bytes. Jungle RESULT/PARTIAL/UNVERIFIED, native/core/config/projection/PRNG and sorting baseline remain unchanged. Public/Review/server writes0,tokenGranted=false.
