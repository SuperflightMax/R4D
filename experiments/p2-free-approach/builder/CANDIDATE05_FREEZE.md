# C05 · узкий source/freeze checkpoint

**LOCAL_FROZEN_AWAIT_INDEPENDENT_LIMITED_REVIEW**. Actual turn
`01a18393-6d58-7001-8b25-a45c2fbfff86`. Первый completed read: собственные
cwd/branch/HEAD/status и host resources, clean2cf9b6521cb2485a91ace37b44925b2a11fdc7b2,
candidate05 absent. Тот же E-worktree/branch/роль/chat/model/reasoning/device,
новых людей/сессий/worktrees нет. Source commit ниже сделан clean ДО freeze.

## Exact pins

- Implementation = actual build/source commit:
  **0367d46211ed170c8840cf702b5ea1cc05f6e430**.
- Artifact: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-05`;
  browser tree `bundle/review/r4d/p2-free-approach/`, **16files /2453059bytes**.
- BUILD_MANIFEST **9013bytes**, SHA256
  **aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b**.
- Tree SHA256 **19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec**;
  rule `SHA256(JSON.stringify(sorted per-file records)+LF)`, full16 file/size/hash
  records, emission receipts и privacy scan находятся в BUILD_MANIFEST.
- Public main16809bytes/SHA
  `9e71e579cbf9a0e20a51eb2109801d94bfdb1714876718f2727fa4d55d53e87b`.
  Art manifest13262/SHAab0fdde99d491aad40e01983f3dd18ec6afc24044abd442b9deffda28e6e1f4b;
  metadata863/SHA64c72b1cb001137fb0808a00837a0b54841a712a648589e58c806c27322162ee.
  Только эти три bundle files отличаются от C04; два JSON — только provenance.

## Что изменено

`src/main.mjs`: fit читает стабильный border box stage за вычетом borders,
а не меняющиеся от canvas scrollbars clientWidth/Height. Resize только при
реально других backing-buffer dimensions. UI zoom/ResizeObserver/QA zoom
используют один fit с explicit redraw. CSS, HTML и default0.25 не изменены.

Completion hint синхронизируется с done при render, поэтому leaving terminal
через seek/start/reset очищает только completion-owned текст. Отдельные owners
download/error сохраняют свои сообщения; возврат в terminal снова показывает
completion. Actual save serialization/контролы/record/clock/physics не менялись.

Tooling: optional `--reuse-artifact` копирует hash-verified frozen04 compiled
core/Pixi/license вместо повторного bundler/native build; происхождение явно
записано `core.reusedFrom`, `rebundled:false`. Source/build pin не подменён C04.
`check-static --package-only` явно исключает core/controller import и seed runs,
пишет отдельный PACKAGE_STATIC_CHECK; прежний full STATIC_CHECK не объявлен
выполненным. Default full checker branch сохранён, в этом task не запускался.

## Проверки и unchanged

**9 узких model/source checks passed**: actual fit/status functions в isolated
VM со scroll-container model/15px gutters; C04 negative control воспроизводит
1103×1078↔1108×1108; C05 buffers стабилизируются на desktop/narrow при1/1.5/2
и resize, no-op observer events не resize, redraw общий. Modeled paused state
не меняется, advance/seek/reset traps не вызываются. Hint terminal→nonterminal→
terminal и сохранность download/error прошли; wiring в render/save/error сверено.

Package-only static checks passed: exact16files/bytes/tree, source-emission
receipts, route-relative references, PNG/config data, privacy scan13text files,
no TS/maps/private source/leaked localpaths/symlinks. Scanner positive controls/
pinned SDK exact-span exception/tampered SDK rejection passed. Ни Pixi/GPU,
ни core/controller/clock/seed/physics suite не выполнялись.

Source render drawing body идентичен C04 кроме hint sync. Protected source
blobs/controls/config/projection/art/clock/controller checked unchanged. Artifact
13files byte-identical: both PNG, JPG, config, accepted manifest/view-math,
compiledcore, controller, playbackclock, index, CSS, Pixi/license. Art JSON
различается только provenance candidate/consumerGitBlob, metadata — только
candidate/sourceCommit. Геометрия/r16/PRNG/anchors/size/height/gestures untouched.

Compiled core SHA `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`;
native tree pin `008d16a80a26bb77d562a45218b01da09b0d9ff0` attributed exact C04,
без нового native checkout/run. Config SHA
`dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`;
projection9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c;
Pixi a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef.
C04manifest60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7
и все C04/raw failures/artifacts/intents/releases сохранены.

## Evidence/resources/предел

Own E output: `E:\R4D\perspective\p2-runtime\output\builder\candidate05-local-checks-01`.

| Receipt | bytes | SHA256 |
|---|---:|---|
| UI_MODEL_CHECK.json |1518|5b8985898e48efc225a9096a3d21b1ff9b2f722e4b3a4fcf73e2675fcf1353bd|
| PACKAGE_STATIC_CHECK.json |1394|b45e11838290b03be2ae53990257dac085c937aa6a45b1e69fdbbc9f16ef2472|
| C04_C05_DELTA.json |1555|7aa01c5ef1dbf21252fe1b0b0a962d1b29d42f2ffd8336e3f8030ba91e842152|
| BUILD_RESOURCE_PREFLIGHT.json |678|02c29bd56d01194122a8193b4edd94f17d083bc30c06ed5fb79a0fb700c54378|

Fresh before build17:48:09UTC: RAM31.907GiB/free16.684GiB/CPU9%; C/D/E>4GiB.
Own RAM budget0.5GiB/E64MiB + concurrent allowance P4/Millionko4GiB RAM/2GiB E;
aggregate planned19.723GiB. Это allowance, не измеренный будущий foreign peak.
4/2GiB rule соблюдено, own E process-local TEMP/TMP, Node compile cache disabled;
dependency install/native rebundle/чужие PID/files/processes не трогались.

**Actual PUBLIC05 zoom200/GPU/black-frame fix НЕ доказан.** Устраняется найденный
layout feedback risk, но исходная causal black-frame причина остаётся inference.
Offline/model факты не подменяют runtime QA/Art/Full Technical/P2 PASS.
Residual risk: реальные scrollbar/border rounding и renderer timing требуют
будущего адресного actual PUBLIC05 факта. Расширенного SDK/device исследования
не было. Source/freeze/check scope завершён; локальная оставшаяся работа0,
дальше Lead назначает existing TQA limited code/artifact regression отдельно.
Мы TQA/VQA/Artist не будим. Нового release intent/baseline/SSH/server writes/
browser/file preview/localserver/renderer workaround нет. C04 token закрыт,
нового serving token нет. После commit/push остановка для Lead, без active wait.
