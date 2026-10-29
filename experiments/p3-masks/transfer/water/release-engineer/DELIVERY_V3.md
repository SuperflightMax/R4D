# P3 Water + Dark — final delivery v3

29 октября 2026. **PUBLISHED COMBINED PARTIAL; bounded public UI smoke passed.**
Release Engineer `release-engineer-r4d-p3-masks-01`, один serial writer.
Execution turn `01a18885-37e3-7290-a316-444d187b995e`; exact source
`372344f9f6198cd811daa4612256a2fd8b32597b`.

- Water LIVE: https://superflight.space/review/r4d/p3-masks-water/ .
  Technical PASS / Visual PARTIAL; W-EARLY-POP locally CLOSED, **W-DIVIDER-01 OPEN**.
- Dark LIVE: https://superflight.space/review/r4d/p3-masks-dark/ .
  Targeted Technical PASS / overall Visual PARTIAL; D-POP locally CLOSED,
  coverage/shadow limits сохранены; prior fullTQA03 остаётся ранее выполненной.

Server record status `PUBLISHED_COMBINED_PARTIAL_WITH_ACCESS_LIMITATIONS`.
Все7фаз completed once, exit0; ни code/guard correction, ни replay/fallback
во время execution. Оба старых failed attempts/tokens исторически сохранены.
Native/build/product QA/артефакты не переделывались.

## Actual UTC и authority

CTO token `CTO-P3-WD04-V3-20261029T163518Z-d69a711f4777`, issued16:35:18Z;
file SHA `1bbc9511eada2766f971c8ee7a16c3ddac5beda455786d4500e5f4c2218ce7b2`.
Python aware UTC check16:38:17.682494Z непосредственно перед begin подтвердил
first-write deadline17:35:18Z. Actual backup/firstwrite16:38:36.499234Z.

| Phase | Actual completion UTC |
|---|---|
|preflight|2026-10-29T16:38:02.556788+00:00|
|begin / backup firstwrite|2026-10-29T16:38:36.499234+00:00|
|upload|2026-10-29T16:39:25.873711+00:00|
|stage|2026-10-29T16:40:08.433286+00:00|
|before-switch snapshot refreshed|2026-10-29T16:40:46.495857+00:00|
|switch|2026-10-29T16:40:46.555575+00:00|
|postchecks|2026-10-29T16:41:37.142460+00:00|
|document|2026-10-29T16:42:54.265087+00:00|
|final RO readback|2026-10-29T16:44:58.033623+00:00|

[All terminal/server receipts and tool IDs](delivery-v3-2026-10-29/DELIVERY_EVIDENCE.json).
Fresh host beforepreflight: RAMfree15.220/31.907GiB, CPU7%,
C/D/E16.388/16.236/10.744GiB. Added estimate<=1GiB RAM/128MiB localdisk,
hostUsed+estimate17.687GiB. Beforestage RAMfree15.064GiB, E10.725GiB,
CPU7%, combined estimate17.843GiB. Fresh VPS euid0, MemAvailable~5.2GB,
4CPU/diskfree~30.2GB. Full guards before firstwrite matched. All heavy/temp
outputs own E and process-local TEMP/TMP; no global environment/settings changes.

## Bound artifacts/root/switch

[Unchanged canonical execution intent](COMBINED_INTENT_V3.md).
Scope SHA `726cb8e2e568bb4ba4a5e89ee637f323acbfc03fb093cf626c03d9efc229a564`;
remote SHA `6280d062adc4b4cf561980c8ecfd3439e1542561747219ddcd6833d8aa40add9`;
launcher SHA `3cf1852fcea0b83fa43a1a394d549cd2c263a49599319662201b5593d17bfd12`.
Archive4495459bytes /`0cee1516db37cb2ac8a38fec54214c47483f8bea755a71dbd0d04a244b3c9fbb`.
New RELEASE_MANIFEST216459bytes /
`e8a801faf58b670fd2b2cb7ba1c327d20c025593c75881915ae7d211f2fcf3f3`.

Current root `/srv/superflight-review/releases/p3-water-dark-front-edge-04`,
868files/104dirs/129749260bytes, metadata
`71419d91cc132a8d63d1be21718e0f20c72a796ff65decbaf6b4c7de796c9f65`.
Old root `/srv/superflight-review/releases/p5-jungle-regenerated-candidate-03`,
674files/88dirs/122587862bytes, metadata
`ed789cd60a3de3287f9a4456e68f9707df09d8487f2026d2111beee05e4d7a98`.
Both final full-tree guards passed. **672foreign file rows,88baseline directory
rows,77Jungle files preserved exactly**, including actual mixed uid/gid/mode.
194 frozen files/7088324bytes verified unchanged. Catalog only2PARTIALcards/6→8.

Root-only snippet950bytes SHA
`f7948d10efb040e83c15d86df26866aed9a5a90eb53bf85c7fd0206c05d1200e`;
normalized config unchanged
`a6b469d123e41d2e7ab51c37120c0d8b1d1595107e0e437319a08a561ece945f`.
nginx-t before/after and graceful reload succeeded; nginx active. Temp absent.
No auth/globalMIME/services/ports/credentials/security/foreign-process changes.

## Actual HTTP/payload/JS and separate Lead UI

Exactly **217postchecks**:215×200, Origin403, dotfile404; seven bound protection
headers exact. Normal catalog body NEW15762bytes /
`fd4e28b8bfb1764e9d6623009d8f21c23eb1e5df59590effc42ced55f842beeb`.
**197/197approved payload URL bindings matched,10/10JS modules actual MIME/body
verified, limited resources0.** Full per-response UTC/status/7headers/streamed
length/SHA without bodies in [PUBLISHED readback](delivery-v3-2026-10-29/PUBLISHED_READBACK.json).
Old18routes observed200 within same215; no retroactive auth303 claim.
No extra HTTP requests during final RO guard.

[Separate Lead PUBLIC_UI_SMOKE](delivery-v3-2026-10-29/LEAD_PUBLIC_UI_SMOKE.md)
fully read by Release; source SHA
`4cd6d76f9e0ce64a498df6cc9c01262a1a84688f0778709c93db25f554e9986b`.
Lead used existing lawful IAB after switch: Water scene71/source5196 and Dark
scene60/sourced7ea actually loaded; screenshots/AX/canvas viewed, seed0 tick0→10
with UI +10ticks,0.050s,paused works on both. Tabs1/2 deliverable.
Release did not duplicate browser smoke. No login/cookies/auth injection/newprofile.
This is bounded public UI evidence in that context, **not universal auth/security
acceptance or new visual/native QA**. Explicit post-auth verification remains
false; public JS/short public UI evidence are reported separately.

## Two-doc append-only proof

Original duplicate-token guard executed before both snapshots. For serviceDoc:
85029→87360bytes, inode2922368; before/prefix SHA
`052f8d7cc660cf21eee0613e1006f83eb306880fc40c3b0fb86e3429b2357b27`,
after SHA `cd06c3e0b11174dca162131181bc5b57131bb26338c672857aeac95f7a7c07d0`.
For CHANGELOG:299916→302247bytes, inode2884515; before/prefix SHA
`415a20f3971826d3e623735035a157f47dce5672be9fa8b9312c15ffc8e39428`,
after SHA `1470259976c2047a507feb952d7a8cca3813a40582568cec2ec66ad191cb6b9d`.
Both uid1003/gid27/mode0640 unchanged; exact original Nbyte prefixes preserved.
[Opaque proofs](delivery-v3-2026-10-29/document.json),
[final reread](delivery-v3-2026-10-29/FINAL_RO_DELIVERY_GUARD.json); docs bodies not exposed.

PUBLISHED SHA `8bdcaf51ae46d73be24935b64358c589ea9ff8aa9935e92526447d6067531e3b`
read back exactly; STATE byte-equal PUBLISHED.

## Rollback/retention/handoff

Rollback not performed. Exact bound before retained at
`/opt/superflight-studio/backups/review-p3-water-dark-front-edge-04/review.locations.conf.before`,
refreshed16:40:46.495857Z;957bytes SHA
`e2a466db57830bddb9003361028f99c132504ed3e12a632918898cd6c2a51224`.
Restore only if current root/snippet still this owned P3 release; never overwrite
later foreign edits. Old/new roots, backup/archive/raw/frozen/failed journals
retained; no cleanup.

[EVIDENCE_INDEX](delivery-v3-2026-10-29/EVIDENCE_INDEX.json) binds all raw-runtime
and normalized Git-copy hashes. All seven phases completed once, no error/denial.
After same-branch commit/push Release is idle, no active server writer/preview.
**Token/window/P3slot not closed or released by Engineer; CTO alone closes them
after reviewing this factual delivery handoff.**
