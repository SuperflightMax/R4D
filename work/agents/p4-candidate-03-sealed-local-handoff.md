# P4 candidate-03 — sealed LOCAL handoff, server token отсутствует

ONE owned root: `E:\R4D\perspective\p4-runtime\release-engineer\p4-review-release-intent-03-final-01`. Root не пересоздавался/не переименовывался. Original Stage A proposal, STOP evidence/checkpoint и historical baseline сохранены; CTO selector correction записана отдельно. Source/art/Stage A bytes не менялись; Builder source не импортирован/не доставлен через эту ветку.

## Exact seal/package

- `SEAL.json` SHA256 `f961973514026324b2033d702d0b1424aa5dd1d6142c8815d22a12a44bfe485f`; покрывает130 local files, исключает только self и sidecar.
- `payload.tar`: **84 regular leaves / 10 342 400 bytes**, SHA256 `c0a910933876bbda83d362ce81245e5fb5d1c3d9c4ba6ff9ea4d1ef7bdd70a61`. USTAR, без links/PAX/absolute/traversal/duplicates.82 approved browser files + catalog + outer manifest; fixtures/markers/helpers/Markdown/evidence/history/mask additions отсутствуют.
- `execution-plan.json` SHA256 `8684f84ce4f4e02f41ecc0f3a9724c9bbd4f3098224749786e082eb9e995e7c2`.
- `APPEND_TEMPLATE.json` SHA256 `1e3a7fd0c99ee46ecb20f75d44c152fb39d1b0b6abe2716ff0759b8af483c0d3`.
- `planned-newroot-inventory.json` SHA256 `903dc9b82a7c7d20b3d11b9f63a6af2d333d0ef8760ff0b2f670dbc512fd7a98`: **645 files / 85 dirs includingroot / 100 931 804 bytes**, simple tree `6371ba2af02c14a6b5bc4a2e51708055fb3d03670af83672d9188105432e2152`.

Root manifest вне Review: published list644 исключает self, полный inventory645 включает self.561 foreign regular leaves сохраняются opaque по bytes/SHA/owners/modes/mtime; declared replacements только new catalog и new outer manifest. Old immutable root остаётся без изменений.

## Guards и границы

Свежий C05 baseline563/81/90 775 981: simple tree `e0ed126b888d68d92651212f96dc095199f5434c64c76a552a8b051490a17281`; canonical records `490c10ea85f36a857061a50775fafe4d1dcd0af72939458143efb23427f53983`. Fresh preseal recheck совпал по полным core records/raw/config/docs и8 target absence/ancestor guards; UTC/resources envelopes не comparison hashes. Raw snippet/private receipts/payload находятся только own E-runtime, в Git их нет.

CTO correction: unique anchor `/review/r4d/p3-masks/`, существующая P3 card не меняется; новый href `./r4d/p4-extracted-objects/`. Own counter numeric4→5, остальные counter label bytes/cards/order/bytes сохранены; exact inverse восстанавливает original. RAW snippet delta — единственный root literal, все остальные auth/security/header bytes неизменны.

План явно перечисляет все stage/final leaves, private outputs, phase-aware BEFORE FIRSTWRITE/UNDERLOCK/preswitch/docs guards, separate-inode clone/NOREPLACE, append-only prefix/uid/gid/mode и только owned nonce/inode cleanup. Old/new roots/upload/backups retained. Rollback только fresh PUBLIC-before при exact owned live-after и unchanged vhost/MIME/oldroot. Future privileged executor не испытывался; отсутствие token запрещает любые серверные writes.

Concurrent allowance4GiBRAM/2GiBE учтён; до сборки RAM16.070GiB/E12.330GiB свободно, дополнительный local peak≤0.25GiB и disk≈25MiB, VPS extra≤0.25GiBRAM/≈115MiBdisk. E4/2GiB guards не достигнуты. Все82 HTTP bytes/MIME/cache/headers/relative paths и actual Review-prefix smoke **UNVERIFIED**. Это bounded prototype, не Full Art/P4 closure и не inherited UI PASS.

**VPS writes0; нового single-use token нет. STOP/idle для Root/CTO review.** Пакет/backup/config/source не публиковались; этот commit содержит только отчётные документы.
