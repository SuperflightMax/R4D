# P5 Water w06 — local import and independent QA registration 004

Water w06 зарегистрирован как **current candidate, baseline=false**; original w04 сохранён. State `MATERIAL_IMPORTED_QA_REGISTERED_ONLY`. Новый current/final package и выбор Dark не создавались.

Own host WIN-36E9FF9EJM0, branch `codex/r4d-p5-regenerated-release-engineer-01`; start HEAD `c5d380979cbf0eebe5b883b8285f614d78f28921`, clean/WIP0. Guard до import03:31:34.884Z: RAMfree8.870GiB, CPU12%, aggregate3.25%, aggregateWS28.755GiB, C/D/E13.496/14.596/8.832GiB. Own estimate0.5GiBRAM/.04GiBE плюс reserve4GiBRAM/2GiBE. After03:36:14.230Z: RAM8.744GiB, CPU4%, aggregate6.875%, WS28.865GiB, C/D/E13.496/14.596/8.805GiB. Peak отдельно не инструментирован; пороги выдержаны.

Consumer `b8a070ab60e97aee3f71018ff614c2cf21c8f10f`, Artist `189fe2e7f4264270f60b4a2ebe247d0d49b3c72e`. Source/staged/FILE_INDEX pins физически сверены. Import existing helper выполнил exact whitelist25files/15318372bytes/13PNG, проверил source manifest,9supporting Git records, producer index, common inputs/active Water04-trial02 P1/config и повторно сверил source после copy.13 private material sidecars/199062bytes вне public. Inventory22IDs/84instances,21/21bodygroups/29targets/4cups/11FGclips не объявлен художественным PASS.

Оба отчёта прочитаны полностью из exact Git commits: TQA `c23361cfd4a5591b4bc209190b3338ab5e4e276b` / `water/qa/technical/REPORT_W06.md`; VQA `15d94c6363c0cd889c34aa07554f6f55bfa7c70b` / `water/qa/visual/REPORT_W06.md`, в P5 transfer prefix. Оба содержат exact candidate FILE_INDEX SHA/consumer/artist. Raw texts скопированы byte-for-byte, refs/text hashes проверены. Completed Builder handoff `9d741f4d718a8d623ae4d1d51caa938ca4e96a66:experiments/p5-regenerated-objects/transfer-water-dark/water/builder/HANDOFF_W06.md` прочитан/сохранён exact; ранний b6b9ec89 не выдан за completed sanity.

Сохранён scoped verdict: actual COMPLETE / visual PARTIAL; нового значимого defect в проверенных случаях не установлено. По независимым reports: TQA101exact snapshots/96captures; VQA89JPEG/178AX/22actual motion intervals/6FGregions. W04 saved receiver-pop scoped closure retained в w06. Front-hide, light/support/full contours, frog03/06 и gate01/02/05/06 contacts,5FGregions/rare contours остаются UNVERIFIED. FullWater/P5PASS=false. Эти QA здесь не повторялись и не расширялись.

В helper добавлена отдельная `register-qa` без build. Она повторно использует существующие `resolve_versions`/exact ref checks, требует явный original baseline и обе QA, pin-ит material/baseline receipts, складывает4private files/38420bytes и отдельный read-only QA receipt. Occupied registration не заменяется; material receipt остаётся неизменным. QA descriptor использует тот же board/id/qa contract для будущего явного versions entry. Наличие регистрации не выбирает package/final и не присваивает PASS.

Own runtime `E:/R4D/perspective/p5-runtime/release-engineer/transfer-water-dark`.

| Relative artifact | Bytes | SHA256 |
|---|---:|---|
| material/water/w06/RECEIPT.json | 11178 | 231cf6c9f66afd30f368ef397107c3ec09f27f8afbd9992d26a733007e62c69e |
| material/water/w06/private/FILE_INDEX.json | 8432 | 9ba0caf153b7528d551cd6da9ed8b6ccb90ab2ad4e96aba558eeb6b5c0ef5108 |
| material/water/w06/private/artist-manifest.source.json | 125833 | b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27 |
| material/water/w06/private/producer-index.json | 18054 | 19c47de8c085fa093d0e6a9c360bb7c5c73493057ab0a5408ded06805d7f0246 |
| material/water/w06/public/assets/manifest.json | 103822 | 44fa6b45ac8f513b9231e16eb2db0dbece54c9255d549b0d8a7d24ad99f39a0c |
| qa/water/w06/RECEIPT.json | 2161 | 4fabfc5e3376cd8c1d9b6a9b0f5b84c59d776c1b4cd0e1bf3df49ea45cad5b03 |
| qa/water/w06/private/builder-handoff.md | 8571 | 0a97ee6e0a66f3730062933b920abf4a5c0b1e800e8ffa7aff8fa6bb2a9318ab |
| qa/water/w06/private/qa-descriptor.json | 1106 | 8c2f245047fc3bc1439b4a5dc45f8d5121e80f64677b43797352434975c39612 |
| qa/water/w06/private/technical.md | 10448 | 604dc0539aada6e19cd92749b4c00708ca3eee11bc5356f9b93036776d97a86e |
| qa/water/w06/private/visual.md | 18295 | e8525113729df6b7a3ee86b5548ee1c9d14fe5271bfd60fb4c1653aa61f220f3 |

Machine handoff `output/HANDOFF_004.json` и source `EVIDENCE_PINS_004.json`: 9701bytes/SHA256 `f387f8044324cfb691e4a95db28fc1db8c3dff5bb33059e3efec4965c2e43223`. Содержит все private/source/old-preservation/resource pins. Usage в README.md; commands import/register-qa выполнены успешно, physical readback/QA Git equality/readonly checks пройдены.

Оба prior build public trees/receipts и w04/d01 receipts exact; readonly сохранён. Builds остаются только `water-w04-dark-pending` и `baselines-water-w04-dark-d01`. Новых current/final packages0; d01 не выбран current final. Новый Dark/full stage и bound current Lead handoff ещё не переданы. TokenGranted=false, Review/VPSwrites0, FullWater/P5PASS=false.

Server/browser/HTTP/SSH/Review/VPS/file:// и старые publish scripts не запускались; producer PID33028/55196/root не менялись. P1/native/dependencies не материализовались/не пересобирались. Только собственные E source/runtime/TEMP/TMP/cache/output; globals/security/credentials/CODEX_HOME не менялись. Другим ролям сообщений нет. New denial/ordinary failure0; исходные материалы и исторические отчёты сохранены.
