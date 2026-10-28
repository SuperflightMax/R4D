# Candidate-05 — actual PUBLIC delta Technical QA

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; actual turn **`01a183ed-f333-7b90-96dd-037c97b1f292`**. Первый completed assigned action: прочитаны current computer-use skill, свой worktree/branch/clean HEAD **`74e4a77d1e8fc982d62bfc0cb02237103b2a6f19`**, fresh aggregate resources и absence нового output. Использован тот же `E:\R4D\perspective\p2-worktrees\technical-qa`, branch `codex/r4d-p2-free-technical-qa-01`, прежний IAB2; новых actors/worktrees/browser backends не создавалось.

**В ограниченном actual PUBLIC05 delta-проходе новых actionable findings не обнаружено.** В сохранённых viewport frames94/95/96 при200% black не воспроизвёлся, dimensions и physical state стабильны в проверенных paused view-only samples. Completion hint clears/restores подтверждены actual UI. Это **не общий blackfix/Full Technical/Art/P2 PASS**; C04 raw black200 остаётся действительным прежним наблюдением, причина здесь не диагностируется.

**SURFACE RELEASED:19:18:01.434UTC /21:18:01.434 Europe/Kyiv.** До закрытия p2QA read-only snapshot подтвердил paused=true/tick37; viewport.reset выполнен, prior visibility=false восстановлена, закрыта только собственная временная tab2. `CLEANUP.json` записан после close. После release к браузеру не возвращался; VQA/Builder/CTO не будил. Освобождена QA surface, а не CTO window/Builder lock.

## Первый actual PUBLIC05 шаг и identity

`call_61d933d8d03d422c856a139992374a3f`: создана собственная временная вкладка2 на **`https://superflight.space/review/r4d/p2-free-approach/?seed=1&paused=1`**, visible=true. CUA documentation обновлена перед первым browser действием. После загрузки — реальное поле/controls, seed1/tick0/0.25×/paused, art+geometry, Fit; screenshot01. Navigation200/redirectCount0, login отсутствует.

`call_57c982b11b3c42de8a3df888a8cd4715`: read-only `p2QA.snapshot()` вернул **candidate `p2-jungle-static-candidate-05` /source `0367d46211ed170c8840cf702b5ea1cc05f6e430`**. Performance entry main.js:200/decodedBodySize16809. Первая сохранённая state observation —19:14:40.063UTC (21:14:40.063 Kyiv). Raw initial/final snapshots,25 DOM/state/view samples и warn/error logs сохранены; warn/error список пуст. GPU/SDK/backend investigation не проводилась.

Owner delivery proof **атрибутирован Builder/Lead**, не повторён: frozen16files/2453059bytes/tree **`19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec`**; manifest **`aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b`**; main16809/SHA **`9e71e579cbf9a0e20a51eb2109801d94bfdb1714876718f2727fa4d55d53e87b`**. Switch19:02:30.622116UTC; all16 firstHTTP19:02:34.797534UTC; POSTCHECKS23637bytes/SHA **`546c5ca9026eb0fb56c3986112ceccfb83880313be4efc3126b80dfaebd4ec18`**. Собственные actual page/provenance/scene observations отделены от этого all16 byte/hash proof. Live body SHA/full network matrix не переснимались. Prior independent static/model QA — commit74e4a77 и evidence `52438e74014edf96c3d8a62dc9e0eeff9a254536b02c65d601570614cfa93eb0`; он не использован как actual browser verdict.

## Paused94/95/96, zoom и один viewport cycle

Только реальные UI controls: известный seed1; «Показать94»; zoom200%; +1→95; один temporary viewport cycle; +1→96; zoom Fit. Для scene screenshots применён обычный Control+Home на существующей UI-кнопке; это scroll, без DOM/runtime scroll patches. Не использовались p2QA.pause/step/seek/setZoom/finish/export/save, injected events или time patches. Прочитаны DOM `#state`, status, pause label, save hint и реальные stage/canvas/view dimensions через прежний read-only CDP метод. Read-only p2QA.snapshot вызван только для identity/final paused proof.

| Actual case | Viewport | Stage outer W×H | Canvas buffer | Paused state |
| --- | --- | --- | --- | --- |
|94 Fit до zoom|1280×720|1120×556.390625|1118×554|94/RNG1|
|94/95/96 zoom200, repeated samples|1280×720|1120×556.390625|1118×1108|tick/RNG неизменны внутри каждого paused case|
|95 zoom200, viewport A/B|1000×800|953×618|1232×1232|95/RNG1586005467|
|95 zoom200, viewport restored|1280×720|1120×556.390625|1118×1108|95/RNG1586005467|
|96 возврат Fit, A/B|1280×720|1120×556.390625|1118×554|96/RNG1586005467|

Все3 samples в94,7 samples в95 (включая поздний rewind того же95) и4 samples в96 сохранили **полный DOM physical object**: tick/RNG/position/velocity/result/contact/source-point/radius/occludedBy. Только явные +1/seek/start изменяли физическое состояние. Изменение screen position stage при UI scroll не смешано с размером его внешней рамки. Вновь полученные frames02–07 показывают отрисованные видимые части scene, не чёрный buffer.

В95/200/default viewport разнесённые samples A→C охватили **29769.5ms** настоящего browser elapsed time, без fake deltas/clock changes. Raw frames03 и04 — **170430bytes, byte-identical SHA `94564a106a061f43d6e02e215c766c7c9c65990583c6d4d832f0c44ba18e3ac0`**. Между samples viewport/buffer оставались1280×720/1118×1108. Это sparse frame/state observations, **не непрерывная запись/FPS/stress suite**. Невидимые при200% части canvas и межкадровые события не исследованы; общего отсутствия любых будущих black frames из этого не следует.

Сохранённый own oracle03 JSON сначала сверён с SHA **`0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41`**. Actual states seed1 в0/94/95/96/1735 точно совпали с прежними checkpoints. В94 RNG1; в95/96 RNG1586005467, контакт leaf-01 event94/observed95. Только прочитаны saved data: core/controller imports, offline/native/seed/RNG/rates/physics matrices не запускались. UI seek/step выполняли обычные browser physical controls, что не объявляется полной physical regression.

## Completion lifecycle и ordinary sanity

Реальный UI lifecycle: seek1734→+1→1735/LOST, затем seek95, explicit seed1 reset0, снова seek1734→+1→1735, затем **прямой terminal→reset0**. В обоих terminal состояниях показано «Запуск завершён…»; при rewind95 и обоих reset0 восстановлен исходный replay-help. Terminal physical objects двух циклов совпали; reset0 вернул полный исходный physical object. Frames08/09 отдельно фиксируют terminal hint и его очистку при95. **PUBLIC04-UI-01 в этом actual05 случае не воспроизвёлся.**

Короткий обычный same-seed «Повтор»→pause→resume→pause: actual state samples15(active)→20(paused)→35(active)→37(paused), без смены скорости/default0.25. Последние два paused physical objects равны; final read-only snapshot позднее перед close тоже37/paused=true. AX и последующие live state samples снимаются в разные моменты, поэтому active ticks могут различаться; timing/FPS verdict не делался.

Download/error owner ветки **live не проверены**: save не нажимался, download setup не вызывался, ошибок не наблюдалось и искусственно не создавалось. Их сохранность остаётся только прежним code/model74e4 evidence, не actual coverage. Видимость IAB использована для показа/восстановления presentation; hidden-document suspension probe не выполнялся. Unsupported download/visibility-probe/fullPage операции и прежние Windows/composite/file denials не повторялись. Все12 CUA calls completed; новый policy denial/ordinary technical failure не получен. Полные calls/arguments/statuses — API_AUDIT.json.

## Evidence, ресурсы и границы

Новый output **`E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-05-public-01`**: absence-before-create, no overwrite/renumber/oldraw changes.10 JPEG — новые неизменённые viewport captures (`fullPage:false`), без crop/resize/postprocessing. Paths/hash/bytes всех15 input files находятся в EVIDENCE; вместе с summary16files/**1446928bytes** (<2MiB).

| Evidence | Bytes | SHA-256 |
| --- | ---: | --- |
|EVIDENCE.json|17994|`c2126ecf1c5e0e053b97a61320faaedd081ef4848d43fdb9d05d5a4128ebbc7f`|
|BROWSER_OBSERVATIONS.json|103330|`5ed6764d1873f3da0b55e0a369508dc5ff4fcc8246522307a3a4b58dd5e3dd7d`|
|API_AUDIT.json|13309|`511334768dd5e1d510b748ee9b171ecb4ce91ab057bc6559ebddca5b71c60a63`|
|CLEANUP.json|395|`ad11dba2722057a94a60f8985900645dbef20ce7e9758375876ee82386756e41`|
|03-paused95-zoom200-frameA.jpg и04-paused95-zoom200-frameB.jpg, каждый|170430|`94564a106a061f43d6e02e215c766c7c9c65990583c6d4d832f0c44ba18e3ac0`|
|05-paused95-zoom200-viewport1000x800.jpg|153949|`77d15ccc0c510b8bc5550423eb3d5dac003dd0c482ee5ff8251f9e1b5e969858`|
|08-terminal1735-hint.jpg|82365|`1218e7effe4fc3efbcd6312f5bb4dfbe90c1fa5f7744f4057f7c7b2c7057a5fd`|
|09-rewind95-hint-cleared.jpg|81651|`2631ff76b90cb0f772ef6dd924bcbb6baa34ab4bdd2e197992100dec4625d165`|

Fresh aggregate19:13:24.423466UTC: RAM free18324996096/34259845120bytes, CPU1%; C15.097GiB/D16.289GiB/E16.233GiB. Plan ownRAM1GiB/evidence50MiB; retained coordination C peak1.525GiB. Actual process peak и чужие future peaks не измерялись; чужие PID/processes/tabs/products не читались. Пороги4/2GiB не достигнуты. Explicit evidence/output только собственный E; новых browser процессов через launcher/CLI не запускалось, чужие процессы не завершались.

Продукт/source/frozen/config/core/art/C04 failures не изменены; credentials/cookies/personal Chrome/P4 не исследованы; server/release writes0, operational token не нужен/не использован. Browser surface release — `call_dfb265db0db14e7fa1132a4071de481e`; после неё только saved JSON/hash/report/Git работа. **Остаточные ограничения:** один desktop IAB/seed1, sparse visible frames; без GPU/backend diagnosis, реального download/error ownership, visibility suspension, physicalAndroid/gestures/fine occlusion/shadow/Art acceptance. Нет Full Technical/Art/P2 closure; active waiting не поддерживается.
