# Mini03 — C02-V01, correction of the near ledge clip

Ready for Builder consumption. This is a data-only successor to frozen mini02/C02. Only `near-ledge.sourceClipPx` changes in the manifest; it follows the actual stone front fascia across the whole near edge. The previous contour promoted open paving on both wings and above the center. This is an anatomical correction, with no seed/tick condition or local cutout around the reported ball.

## Exact artifact pins

All paths below are relative to this document. Read them at the commit containing this handoff.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `asset-manifest.mini-03.json` | 89838 | `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0` |
| `FOREGROUND_REGIONS.mini-03.json` | 15922 | `118abd360f963b6088dab47f23c56554e9d4b31ef718d91345954fa3cc97e870` |
| `DELTA_MINI_03.json` | 12713 | `0dbab3cffcc65ced429fccf0993533e43038541c0b6370559729fec6a493de3a` |
| `NEAR_LEDGE_AUTHORING.mini-03.json` | 1763 | `b7b5c921b7c1aed87651e8ad9f8b3298218dfa84f599c9aeb563b3b9b7f128f0` |

Frozen baseline: artist commit `4990463ec6eabf89aa47f58f9b59f703cbf739ba`, `asset-manifest.mini-02.json`, 83772 bytes, SHA256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331`. C02 consumer prefix: `398b0daa`.

## Contour and evidence

The immutable generated `floor-v1` is 1254 × 1254, SHA256 `24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06`. Authoring points trace its visible upper stone seam/bevel and lower structural fascia edge. Short plant-obscured spans interpolate adjacent visible stone. Raised plant tops above the seam remain in the floor layer. Lower wall, trailing roots and receiver apertures are excluded. The manual tracing uncertainty is approximately ±3 texture pixels.

`NEAR_LEDGE_AUTHORING.mini-03.json` contains all new texture-local points. `DELTA_MINI_03.json` records every old/new texture-local and source point. Conversion remains exactly `source = texture * 1536 / 1254`; the manifest polygon uses `source1536`.

Bounds `[x,y,width,height]`:

| Coordinates | Previous | New |
| --- | --- | --- |
| Texture 1254 | `[270,861,760,99]` | `[270,898,760,62]` |
| Source 1536 | `[330.7177033492823,1054.622009569378,930.9090909090908,121.26315789473688]` | `[330.7177033492823,1099.9425837320575,930.9090909090908,75.9425837320573]` |

Polygon area changes from 53666.12376090328 to 37474.54133376069 source pixels squared. The correction also restores the left stone face that the previous lower contour omitted.

Read-only C02 evidence: `E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/seed4210403976-t676-field-art-geometry.jpg`, 148340 bytes, SHA256 `607003ba03c71cb4a4db1cf6639e7687ae6993bb445d1073d85b772c98b36494`. Neighbor frames 674–676 and all their exact pins are in `DELTA_MINI_03.json`. Artist diagnostic crops and the red-old/cyan-new comparison remain under `E:/R4D/perspective/p5-runtime/asset-artist/evidence/mini03/`; they are measurement references, not replacement art.

## Verification and invariants

The approximate reported ground point `[1209,1099]` source changes from inside the old near-ledge polygon to outside the new one. Three additional open-paving points on the left, center and right are outside. Three structural-face points are inside. These checks sample the full edge and do not define a seed-specific boundary.

The manifest passes the exact Builder v2 schema from contract `8bf447629ec78a1ccb088b4ba7a784746e0aca83`. Deep semantic comparison after excluding `near-ledge.sourceClipPx` is equal. The other two foreground contours, native/source anchors, geometry, body/shadow/receiver bindings and receiver-clearance policy are unchanged. All 17 unique PNG paths, SHA256 values and byte lengths match frozen mini02; no production bitmap was generated, changed or copied. Counts remain 23 texture IDs, 64 instances, 25 pins, four receivers and three foreground regions.

Build/recheck entry point: `scripts/build-ledge-delta.ps1`. Frozen mini02 is checked before producing the successor files.

Guard052 before diagnostics: 2026-10-29T00:46:05.4724189Z; RAM free 15.917/31.907 GiB, CPU 2%, aggregate working set 19.423 GiB/404 processes; C 16.296, D 16.281, E 12.025 GiB free. Own declared peak 1 GiB RAM/0.128 GiB C/0.25 GiB E plus concurrent allowance 4 GiB RAM/2 GiB E. No new denial or global setting change.

## Remaining check

Actual rebuilt runtime motion and sphere visibility have not been tested by Artist. Builder should consume this manifest for the next candidate, then independent QA should revisit the ordinary seed 4210403976 window 674–676, the full near edge, neighboring head-mask attachments and receiver transitions. Static containment and the source overlay do not establish runtime or artistic PASS.
