# Sprite metadata correction v02 after actual frames

Decision: replace explicit lift0 with `liftRadiusFactor:1` for the next separately frozen
consumer candidate. Do NOT keep `visualLiftPx:0` in the new adapter: explicit pixel lift
would override the requested factor. Actual sprite centre = P(native centre) minus one
visible screen radius in Y. Sprite uniform scale, r16, native states, projection, raw
PNG, opacity1 and the entire shadow contract are unchanged. No new image generation.

I personally inspected the exact integration-02 sheet and untouched1536-square state1916
JPEG after checking local bytes against frozen Git `38282825c2688e010612e35b6a807e027fb0b90a`.
At near edge, lift0 places the sphere's lower half on the vertical front slab; the simple
shadow is mostly hidden by the ball, making floor support weak. Lift1 puts its lower
visible point on the projected ground anchor, with the offset shadow next to that point.
This is an explicit2.5D art convention, not recovered vertical camera or native z.

The sheet's contact states94/95/96 lack obstacle art occluders; sphere over the draft cap
therefore does NOT prove correct overlap, and lift alone cannot fix missing masks.
Next consumer should preserve the same states0/94/95/96/1916/1956 for comparison, including
receiver mouth and cast-shadow readability. This metadata change requires actual new
frames before any artistic acceptance. Keep frozen integration-02 and its bytes intact.

## Source identity correction

V01 actual authorized working CRLF packet:5521 bytes,
SHA256 `d23452ebeaa45725175fbc5d915420df0f2c60f13205eeffd3599622069640cb`.
V01 exact Git LF blob at1adf57c:5302 bytes,
SHA256 `5ef0efec3633755935fa260a13f0e4e218da16e1479b54c4caee7d3b0d32bb6c`.
They are equal after CRLF->LF and as parsed JSON, as directly checked by Lead/Builder.
The earlier reported hash named the working copy, not the Git LF blob. PNG hashes match
both sources. No old prompt/raw/log renormalization or old runtime replacement is made.
V02 JSON is written explicitly UTF8 without BOM with LF throughout; report its named
actual bytes and exact Git bytes separately if a future checkout transforms EOL.
