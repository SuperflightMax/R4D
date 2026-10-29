# Artist compatibility review: exact consumer frames

Integration02 source38282825, exact inspection sheet and state1916 were personally
viewed. Lift0 caused the lower sphere silhouette to lie on the front slab and hid most
of its own shadow. Explicit sprite V02 liftRadiusFactor1 was issued in3899da2; old
candidate remains unchanged. Native state/r16/projection and PNG were not changed.

Current source93963cdb, exact `lift-comparison.png` SHA256
68bbc01f0bd97871e27f11d46ab396aa06c36079479dd7701756a6e963b186bc and `inspection-v02.png`
SHA25644cb125b36bffc723671a6323a5dcda90ed57d0189c17402320335ed66975d08 were personally viewed.
Lift1 improves the near-edge support: the sphere's bottom now meets the projected
floor point instead of extending onto the front face. Keep lift1. Keep raw ball and r16.
A concrete remaining issue is the shadow landing on the vertical front slab/empty gap
when its offset crosses the floor boundary at state1916. It needs the exact FLOOR MASK,
not a changed native trajectory. FLOOR_PACKET_V01 includes a separate actual mask for
clipping ONLY dynamic ground shadow, never the sphere body. At receiver mouths outside
the floor the ground-shadow layer is absent; basket interior art supplies its own shading.
Opacity0.42 remains until normal-scale actual textured-floor inspection. Large crops do
not prove shadow readability on the485px user view. Missing obstacle/receiver occluders
remain open; lift does not solve their overlap.

Integration03 source2df0a0e9, states571/572/573: wood01 lower rim is anchored, but its
visible height111.65px is too elongated for the intended wooden obstacle family. Material,
volume and upper-right light are suitable. New actual wood V02 in0c3a6b7 predicts95.15px
with updated measured raw anchor633/1050 and rx262/ry123. Do not multiply old v01 eight
times as an accepted final choice. Retest one v02 at unchanged physical registration.

This is an artist review of exact real-browser frame files, not a live human usability
trial or a full independent dynamic QA PASS. The floor material/shadows are next real
layers; static raster previews of those layers are labelled as such, not browser frames.
