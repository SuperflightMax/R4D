# Water receiver — minimal post-w04 part correction plan

Read-only role/schema/renderer review requested by Lead. W04 original baseline and evidence remain immutable. Lead reports independent TQA reproduced W04-B01: full back PNG opaque water alpha252–253 covers all535 sampled sphere points at1273/1274 while front is transparent; offsets/radius are applied. VQA independently confirmed W04-V01; arch07 showed no significant defect in its inspected baseline. Final report commits/pins are still pending; these are Lead-reported findings, not a new Builder alpha audit.

Existing schema and verifier allow `role:floor` on a receiver target. Current renderer gives rank−1e8 only to `$source` floor; a target-bound floor takes the ordinary depth formula. Therefore a manifest-only floor relabel does not currently produce a non-occluding base. `shadow` already has a low rank but is not an appropriate label for opaque bowl interior.

Concrete minimal successor:

1. Reuse each current full receiver PNG/texture registration unchanged as a target-bound `floor` base/interior instance. Keep exact target, uniform scale, logical groundAnchor/footprint center and derived optical policy.
2. Extend target-bound placement to apply the **existing floor rank−1e8** when role is floor. Keep current shadow/back/front/ball depth rules. No new role/schema/rank, world offset or native change. Verify stable equal-rank order places each base after the scene floor, below shadows/ball.
3. Artist supplies a registered back-rim/back-side-wall-only PNG: same canvas/registration, transparent interior and no duplicate front face. New receiver-back aliases retain their current declared depths and registration; existing receiver-front PNG/rule remains.
4. Capture a separately named post-w04 candidate and compare the same1273/1274/1275 cases, adjacent rim approaches and unchanged terminal hold/state/RNG. Include ArtOff/Geometry and compare unchanged camera/native/config. Other receiver entries stay unverified unless actually viewed.

This needs a small renderer implementation addition for the already declared target-bound floor role, plus new registered rim art. No baked/resampled source-frame composite is necessary. Any new rank/schema, substantial preparation or sorting principle would be an explicitly separate variant, never credited to the original method. Even this minimal successor must be reported separately from w04; preserve failure evidence and do not present successor success as original baseline success.

Dark d01 was frozen and actual-checked with the **original** receiver parts/rules first; no correction above is integrated in it. Source/runtime implementation is not changed by this plan. Actor rim delivery through Lead is the next input; no native trigger/geometry/RNG adjustment or depth tuned to individual ticks/seeds.
