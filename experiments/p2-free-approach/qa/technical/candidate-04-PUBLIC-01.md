# Candidate-04 — initial actual PUBLIC UI Technical QA

28 октября 2026. `technical-qa-r4d-p2-free-01`; actual turn **`01a18363-280e-73c3-a33b-5429354498b0`**. Собственный worktree `E:\R4D\perspective\p2-worktrees\technical-qa`, ветка `codex/r4d-p2-free-technical-qa-01`, исходный чистый HEAD `054bb5bd6a385d36ce51fe382f2526e95cdcee99`.

**В проверенных actual UI случаях блокирующего нарушения физических controls не обнаружено; есть одно P3-несоответствие текстового статуса после rewind.** Подтверждены загрузка сцены, default0.25×, реальные controls0.25/0.5/1, pause/resume, ручные шаги, seek/reset/replay и выбранные физические состояния seed1. Реальный JSON download, hidden-document/focus-loss suspension и WebGL backend **не подтверждены**. Это ограниченный UI-вывод, не Full Technical/Art/P2 PASS и не разрешение release.

## Первый actual PUBLIC шаг и идентичность

`call_5b8910bbe5b64f6ca56c7a5e9ba68dd7`: `cua.createBrowserTab("2", "https://superflight.space/review/r4d/p2-free-approach/?seed=1&paused=1", {visible:true})`. Создана только собственная временная IAB-вкладка1 с title `R4D P2 — Jungle`. Навигация200, redirectCount0; login не показан. После загрузки UI: seed1, tick0, `0.000 с симуляции`, `0,25× · разбор`, «Продолжить», art/geometry включены, zoom «По размеру». Первое сохранённое DOM-state наблюдение — **16:46:23.410Z**.

Read-only `p2QA.snapshot()` вернул `candidate=p2-jungle-static-candidate-04`, `sourceCommit=08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`, Pixi8.22.0, core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Совпали ожидаемые provenance hashes:

- compiled core `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`;
- config `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`;
- projection `9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c`;
- source image `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`.

Видны отрисованное поле, art и geometry; canvas1118×554 в исходном viewport. Performance entries показывают200 для main.js, Pixi, compiled core, controller, playback-clock, view-math, config/manifest/metadata и art manifest. `main.js` decodedBodySize15771 соответствует переданному exact04 размеру; `vendor/pixi.js`841282. Доступные warn/error и заключительные info/log/warn/error — пустые. Это подтверждает live canvas и загрузку Pixi; тип созданного WebGL renderer/context отдельно не идентифицирован.

Переданные delivery anchors: implementation `0a80b0b63c688b6f77b8f710576adf2ea5c263c1`; BUILD_MANIFEST SHA `60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7`;16 файлов/2452021bytes; tree `60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`. Index2661/SHA `df1eb312951f07ab6200bcd3aea274a13ea6c59fddb2947aa1ef34cc26540ec4`; main15771/SHA `a1cbef60ac52950f50a5123e8eef674dc8fae8d534b354a548634d47ebd32f78`. Эти SHA — **handoff Builder**, не новые собственные browser body hashes: Network event buffer оказался truncated, response bodies для независимого сравнения не получены. Новый all16/selfcheck не запускался.

## Реальные controls и физическое состояние

Все изменения делались видимыми UI controls. JS/CDP использовались для чтения DOM/metadata/diagnostic snapshot; методы `p2QA.pause/step/seek/replay/...` не вызывались.

- +1:0→1; +10:1→11; +100:11→111. Seek вернул94; +1 дал95. Контакт `leaf-01`: event tick94/time0.47000000000000003, observedAtTick95; RNG изменился1→1586005467.
- На паузе в95 значения0.5×,1×, artOff/geometryOff/zoom200% и восстановление art/geometry/zoom1/0.25× сохранили **весь DOM physical object**, включая rng, position, velocity, lastContact и projection fields. Повторный seek95 в конце вернул тот же object.
- «Повторить seed» с1 вернул tick0, paused, исходные RNG/position/velocity. «Повтор» запустил тот же seed1; следующая «Пауза» остановила его в73. Реальные continue/pause также использованы во всех timing windows.
- Terminal проверен отдельно ручными controls: seek1734 (`done:false`), +1→1735/LOST (`done:true`, RNG1629134493), затем +100 оставил весь physical object неизменным. Это не timing-window результат.

Старый собственный oracle `candidate-03-offline-01/EVIDENCE.json` сначала сверён с pinned SHA `0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41`. Только прочитаны сохранённые checkpoints seed1: **0/94/95/1735 совпали с actual UI state**. Новый core import, simulation, Node QA или матрица не запускались. Совпадение четырёх checkpoints не означает проверку всей траектории.

## Активные видимые timing windows

Время — настоящий browser `performance.now()`, state — DOM `#state` в том же read-only наблюдении. Между замерами выдерживался обычный wall-time интервал REPL; clock/time APIs страницы не менялись. UI/AX задержки до первого и после последнего sample не включены. На обоих концах каждого окна visibility=`visible`, hasFocus=true, done=false; намеренного переключения focus/visibility внутри этих трёх окон не было. Непрерывный per-frame trace не снимался.

| Rate | Начало→конец tick | Wall ms | Δtick | Δsimulation ms | Δsim/Δwall |
| --- | ---: | ---: | ---: | ---: | ---: |
|0.25|110→223|2246.9|113|565|0.25146|
|0.5|261→484|2233.7|223|1115|0.49917|
|1|555→1002|2229.4|447|2235|1.00251|

Короткие результаты соответствуют выбранным скоростям с frame/tick квантованием; это не FPS/performance benchmark. Synthetic/offline deltas не выдавались за wall-time.

Отдельная visibility-проба: `visibility.set(false)` скрыло представление IAB, но документ остался visible/focused; за этот интервал tick139→386. После `set(true)` наблюдался393; следующая реальная пауза —409. Следовательно, настоящий hidden-document/focus-loss переход **не был вызван** и его suspension/catch-up поведение здесь не оценено. Это не дефект pause и не медленная/ускоренная playback оценка.

## Finding PUBLIC04-UI-01 — P3, stale completion hint

Воспроизведение: seed1 → seek1734 → +1 (terminal1735/LOST) → +100 (clamped) → seek95. Основной status, JSON и actual physical state корректны: tick95,0.475s,done=false, один контакт. Но под controls остаётся **«Запуск завершён. „Сохранить повтор“ скачивает JSON всех наблюдавшихся запусков.»** Сообщение выглядит как текущий completed state после успешного rewind. Желательно обновлять completion hint при seek/reset. Физический rewind исправен; download не запускался. Доказательство: `02-final-seek95-paused.jpg`, DOM diff `call_064d39b7c6414f3da6aac1f4358adc0a`. Продукт не исправлялся.

## Export и API audit

Реальный save/download **не выполнен**. Перед единственным планируемым download проверена возможность направить его только в свой E-output: `call_a9a20c6028f54775bdb925bf02a8b992`, `cdp.send("Page.setDownloadBehavior",{behavior:"allow",downloadPath:ownEOutput})`. Точный ответ:

> This method is not supported through raw CDP. Use tab.playwright.waitForEvent("download") before triggering a download instead.

Метод не применён. Документированный high-level download даёт `path()`, без saveAs/каталога; поэтому без гарантии ownE запись кнопка «Сохранить повтор» не нажималась. Другой download route/actor/browser/server не использован. Это unsupported API boundary, не product failure. Сохранённый read-only diagnostic snapshot содержит seed/state/provenance/config hash/presentation clock/history; **он не является скачанным replay, не подтверждает полный exported config, сохранение JSON или merge/export behavior**.

Audit первого failed call: `call_c50ec4f1fd324a30bc334f09f0dfe1c2` был inventory/documentation перед PUBLIC navigation. `read_thread` возвращает только arguments/status failed, без returned reason. Видимое после compaction сообщение — `Output exceeded the available model context and was truncated`; это сообщение доставки контекста, а не восстановленная причина выполнения. **Точная runtime причина этого одного call недоступна; policy denial или product defect из failed status не выводятся.** Последующие точные обычные ошибки: `qa04PublicVisibility is not defined` (`call_d5e4f8b0f45847d3b373748a6054aa48`), `qaBrowser is not defined` (`call_64c4790edba84980b841dc90a3ba017b`), `TypeError: document.hasFocus is not a function` у read-only DOM facade (`call_ac5cd4bbceab418ba0e2d2833c90c508`), locator no_matches для getByLabel «Скорость» (`call_ca746b8441544f26a3f27c3f769efe2e`). Они разрешены восстановлением той же собственной IAB-привязки, разрешённым read-only CDP и уже наблюдённым ID select. Полные точные причины/границы — `API_AUDIT.json`.

Нового явно возвращённого policy denial не наблюдалось. Исторические Windows/composite/file запреты не повторялись; same-target обходов через другой server/actor/browser/device/model не делалось.

## Evidence, ресурсы и завершение

Единственный новый output: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-04-public-01`. Отсутствие проверено до create; исходные checkpoint/resource receipts сохранены без перезаписи. Все дальнейшие evidence files созданы exclusively (`wx`/CreateNew).

| Файл | Bytes | SHA-256 |
| --- | ---: | --- |
|EVIDENCE.json|6654|`02195dd2d21aea381152cb17194635b551e904c67cc001ee53ef7d3934e8a2c1`|
|BROWSER_OBSERVATIONS.json|87933|`6fbfe6d691d25fb6c3b61d235d66aadb8c099d84fb93a883cfc12a83c143503b`|
|API_AUDIT.json|3553|`ea25f509fb5bef676366ed8db32030e0fde6a1f7a4404a5acfeb27999910cab3`|
|01-loaded-paused.jpg|127543|`8233877989fb9e03f761cebb4636af82ae26eef04fc5b98890e059bb5ec8d1fe`|
|02-final-seek95-paused.jpg|352490|`bebaf13a415185dc87555d693cf07ab08aad63d6d57be41560570f190e10a8ad`|
|CLEANUP.json|254|`0f3f838d4cc477e46d8f3d72e9b06ac72ac70d944ab10838403ad4031547a221`|
|INITIAL_CHECKPOINT.json|659|`568eb58abce702f7d74906e8fce9a83d049315b7ee449f501031ced64fa7c101`|
|RESOURCE_PREFLIGHT.json|709|`b7792f3d4f8345ea0436aef0999b97fc03456cfc8aa16c8d280644c74c4388f5`|

Fresh host preflight16:42:43.6503357Z: RAM free18169999360/total34259845120bytes, CPU3%; C15.381GiB/D16.295GiB/E16.332GiB free. План ownRAM1GiB/evidence50MiB; сохранён coordination C peak1.525GiB, фактический own runtime peak не измерялся. Host-wide snapshot включает текущую чужую нагрузку без исследования/изменения PID или вкладок. Совокупный evidence payload579795bytes (<1MiB). Пороги <=4GiB/<=2GiB не достигнуты в preflight.

В16:51:20.121Z собственная tab1 закрыта, viewport.reset выполнен, browser visibility восстановлена вfalse; own IAB tab list пуст. Download routing не изменён, download не создан. Android/mobile/gestures, art quality/движение/occlusion не приняты. Credentials/cookies/personal Chrome/чужие продукты/PID не исследованы; source/core/config/mapping/art/frozen/build не изменены, server/release writes0. CTO Review window и Builder lock QA не освобождал. Активное ожидание не поддерживается.
