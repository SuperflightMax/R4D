# Accepted P1 — static PUBLIC report: Lead gate

**Frozen candidate01 передан независимой QA.** Full Builder handoff `383164ff397e83a5ad47238f6ebe196688f649ff` (build source `2135851427c568038b23fded38d6cbe8b6f6b0e3`) интегрирован Lead как804f6ef/f46cc3f. Manifest4037bytes SHA256 `00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c` независимо сверён Lead;12publicfiles/2057712bytes, public tree `88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`. Accepted4b47/frozenbytes не менялись. Нет release approval/token/готового URL.

История восстановления: actual Lead turn `01a182c1-a662-7211-b88b-3d2053e7cad2` продолжил clean68ed8e6 без отката. Перед отправкой проверено отсутствие дублей. Два successful send receipts подтверждены CTO как exec-b7220e08-50d4-40ff-98c9-fb6d9d35fc9a→TQA иexec-6decc79d-73df-4e08-b01c-c39ef683a0f4→VQA; actual QA turns01a182c2-c54e-73d3-9cd6-d4629df4240e и01a182c2-cce2-7b90-bd78-b76bee5a4b44 завершились exact verdict ниже. Их первые чтения completed. Обычная path typo исправлена; новый protocol denial отдельно сохранён. Повторный start этих QA не требуется.

Основание: Max28октября12:38UTC, `Sentinel_9809efe64b3881918b49cd3b4c1237a8`, через CTO. Публикуется статический отчёт accepted P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, subtree `experiments/p1-collider-mapping/clean-repeat-01/`. P1 не перезапускается; это не третий research slot. P2 frozen04/df309 сохраняются без rebuild/reQA.

## P1 опубликован, docs/owned lock завершены; ожидается explicit CTO release

Проверенный результат: https://superflight.space/review/r4d/p1-mapping-report/ . Итоговый [Builder report](../p1-collider-mapping/accepted-static-report-01/audit/RELEASE_COMPLETE_01.md), original `eed2759a57c83356a98b1d5fd900b7ea0cb26b31`/Lead84020a6, прочитан полностью. Predecessor c64e733/Leadf11d3d5 сохраняет initial HTTP stop и отдельный successful recheck. Actual docs continuation turn `01a18325-2fd9-7ae0-8b03-6992cb75cd2c` completed/checkoutclean; Root проверил отсутствие token literal в новых Git reports. Публичные12files/2057712bytes/tree88e934ca…/frozenmanifest00eb21… неизменны; общийroot562files/90770774bytes/tree0e6c8f… и548opaqueinherited/oldroot/P2live03/config/HTTP/MIME/headers проверены. Actual bounded render1280×720/390×844 — VQAb7a24e1/Lead09d5afb, notes ниже сохранены, не fullphysics/Art/universalPASS.

Service doc append15:39:06.384449UTC:69083→72789bytes, afterSHA `2bbc4ed03767ceba52af06c4d3b37e3fb3423340bbcf16f4c3558e1d04e92efc`. CHANGELOG append15:39:08.198591UTC:289574→291345bytes, afterSHA `e19755650908ece2c668ebee72a8ff5baac149ee1785a3e8b8f6c5440a927916`. Все oldbyteprefixesexact, uid1003/gid27/mode0640 сохранены; repeatread15:40:56UTC подтвердил hashes/prefix/права/tempabsence. Own matchingnonce/inode lock снят15:39:10.230413UTC, writersidle, ownedservers/browser/execsessions нет, immutableold/new releases/upload/backup сохранены.

Root сверил exact local copies из `E:/R4D/perspective/p2-runtime/output/builder/p1-static-report-execution-01/docs-completion-01/evidence/`:

| Receipt | Bytes | SHA256 |
| --- | ---: | --- |
| PUBLIC_RENDER_RECEIPT.json |13529|`153627c79885af794b6b7f69886e03f4271713efd48ea709f1e0d5a2ca9fbdd7`|
| DOCS_RESULT.json |15879|`824aa9ba9bfc7d34726b4f13850d8e1d34778d06bcb82e19414d034cdb4b162e`|
| FINAL_ACTUAL_STATE.json |1598|`8429e5aebc7d48275a7dc6a2815d5a2459850ee6395d836e97febf8abd8dfb03`|

FINAL_ACTUAL_STATE15:40:56UTC:serverWrites=false, windowReleased=false, ownedlock/stage/snippet/docstemp absence, aftersnippet289c2…exact. Private server evidence остаётся `/opt/superflight-studio/backups/review-p1-static-report-01/`. Phase FINAL_DELIVERY_COMPLETE_LOCK_RELEASED_WINDOW_HELD: источник заверил только ownlockcompletion, **окно/token освобождает исключительно CTO отдельным сообщением**. Root передаёт actualfinalhandoff, новогоtokenнепросит. P2frozen04/df309/obsoleteintents/P4неизменны; новыйP2intent только послеexplicitCTOrelease и новойactualPUBLICбазы, безrebuild/reQA04.

## История: actual PUBLIC VQA и docs completion handoff

VQA actual turn01a18313-2339-7113-93ab-3dffc35ee86b completed, report original `b7a24e1882aceca035af01981d460685b963aece`/Lead09d5afb: [PUBLIC view](qa/visual/P1_STATIC_REPORT_PUBLIC_VIEW_01.md), BOUNDED_PUBLIC_RENDER_PASS_WITH_NOTES. Desktop1280×720/narrow390×844 фактически просмотрены, CSS/10inlineJPG/captions/10fullJPG/backlinks/P1card/count4 наблюдены, persistent pageoverflow/обрезки в measuredstates не обнаружены. Lead полностью прочитал report, посмотрел actualdesktop intro/mobileintro/stationaryJungle screenshots и сверил JSON181811bytes SHA `a52d60a8110b101acf5f273a607396daaf86ce8b0c63e858602ca505a99fb61a`. CTO и DotMax отдельно подтвердили этот bounded verdict и существующее разрешение завершения.

Notes сохраняются без hotfix: «слева/справа» неточно при verticalmobilepairs, captionsясны; physicalAndroid/другиеengines/physics/Art/universalPASS не заявлены. Один rawmobileframe blankarea не воспроизвёлся stationaryнаsame scrollY5908, оба кадра сохранены, причина неизвестна. Supplemental fullPage capture вернул только Unable to capture screenshot, policyreasonнеустановлен, не повторялся/не заменялся; actual28viewport/JPGscreenshots существуют. NewPUBLICpolicydenialнет; viewportreset finalactual1280×720/ownTabclosed/VQAclean.

Перед docs continuation freshreadBuilderlatest01a18313-d8e6-7db0-912b-d3b4c3ff810a completed подтвердил AWAIT_ROOT_VQA_DOCS_PENDING_LOCK_HELD, VQAresult ещё не получен и DOCS_RESULT отсутствует. Первый Root orchestration JS не распарсился до любого send/инструмента; после повторной проверки сделан ровно один рабочий successful send с VQAreport. Он разрешает только phase-aware ownstate/locknonce/inode/live-root/config/docs guards, private renderreceipt, bound append-onlyservice+CHANGELOG, finalchecks и cleanup matchingownedlock/temp. Никаких повторныхupload/switch/reload/rollback/hotfix/rebuild/newtoken. Token/windowпо-прежнемуheldдоexplicitCTOrelease. Actualfinaldocs/lock/writersidle ещё ожидаются.

## История: serving проверен, PUBLIC VQA назначен

Builder actual switch15:08:16.715563UTC; after-snippet SHA289c2de9aa8c535a7755d94d4e69b4368ae82ea154c148449eec9d98467e2bd8. Первая JPG HTTP status/bytes проверка сразу послеreload не прошла (exec-ce4864df-b232-483d-a7d1-5026241a056d exit1/AssertionError); операция остановлена, повторныхupload/switch/hotfix нет. Причина этого первого ответа не доказана и не объявляется race. Неудачный факт сохранён в private operational evidence.

Разрешённый отдельный read-only recheck15:10:44UTC подтвердил all12PublicChecksPassed=true:12HTTP200/exactbytesSHA/MIME/headers, catalog/P2/full562inventory/548preserved/oldroot/nginx-t/active. Root и CTO лично сверили `E:/R4D/perspective/p2-runtime/output/builder/p1-static-report-execution-01/POST_DELIVERY_RECHECK.json`,19032bytes SHA256 `e46d0fed438a0a975438035a0ae31b5858212c2930d874c4f4c4f2b21617e181`. Это delivery byte/status checks, не page render PASS.

После fresh проверки отсутствия public-view turn Lead отправил ровно одно read-only HTTPS поручение existing VQA; successful receipt. Actual новый VQA turn `01a18313-2339-7113-93ab-3dffc35ee86b` inProgress, первый browsercontrol call_8f9febf6e15e4beea9fde4900abe9452 completed; фактический rendered scope/verdict ещё ожидается. Старый filedenial не повторяется/не обходится, staticPASS не подменяет actualview. Builder phase `AWAIT_ROOT_VQA_DOCS_PENDING_LOCK_HELD`: docs не append до реального VQAотчёта; own lock held, окно освобождает толькоCTO. Новый URL готовым не объявлен. P2frozen04/df309/P4 неизменны.

## История: CTO gate и один execution handoff

CTO лично reviewed exact ed33072/оба QA/intent/plan/template/sealed/Root119checks и выдал один single-use token в2026-10-28T14:53:26Z. Literal token хранится только в private operational communication/evidence, в Git и reportpage не записывается. Второй token для этого шага не запрашивать. Все immutable bindings и полный declared write-set из EXECUTION_PLAN сохранены; CTO отдельно освобождает окно после actual delivery/postchecks/docs/render/owned-lock completion.

Actual новый Lead turn `01a18303-ff95-7ea3-8e86-29c71bd14ac0`: confirmed cleaned330729ff416982b4797ac1515050265c398c84, intent/plan/sealed hashes повторно совпали. Fresh read_thread показал latest Builder prep01a182d8-3df4-7001-81b7-e91d39117e88 completed и отсутствие execution-turn. Сделан ровно один successful execution send (isError=false) тому же Builder/ReleaseEngineer. Его actual new turn `01a18305-98b9-70a3-9dc3-732d515f4079` inProgress; первый полный fresh guard exec-12f082cb-897e-4737-89b2-6351b42f6e63 completed/exit0, pass=true в15:03:09–15:03:10UTC, serverWrite=false на тот receipt; SHA256 `2f0184edc3184846d608e31da6259f55d25a1c6f431bed27ab842400b1f04c9e`. Raw docs/config/root/files/dirs/catalog/P2/8targets совпали; перед первым write и далее phase-aware guards повторяются. Actual switch пока не подтверждён. Новых staff/worktree/model/effort/device нет, P4 не будили.

Разрешение не утверждает switch/HTTP/render PASS. Перед ПЕРВОЙ записью, включаяlock, обязательны fresh host+VPS resources/совокупныйpeak и полные raw PUBLIC guards/docs/vhost/MIME/root/catalog/P2body/files+dirs/hash/modes/owners/8absenttargets/ancestors; любой drift или unowned target → STOP к CTO без silentadaptation/записи. Затем phase-aware guards под lock и перед staging/rename/switch/docs, fresh PUBLIC rollback snapshot. Token не освобождается самим switch или Lead. VQA назначается адресно только после actual serving exactbytes; localfiledenial не обходится. P2frozen04/df309 и UGH не трогать.

Builder actual intent turn `01a182d8-3df4-7001-81b7-e91d39117e88` completed; source handoff `f0c172f415731bdf1c2f31f9ff8769570eaa8ab9` интегрирован Lead какe8d20e7. Builder checkout clean/остановлен, server_write=false. Новый runtime `E:/R4D/perspective/p2-runtime/output/p1-static-report-release-intent-01` создан в свободном namespace; source/candidate01 не менялись.

Lead прочитал полный [intent handoff](../p1-collider-mapping/accepted-static-report-01/audit/RELEASE_INTENT_01_HANDOFF.md), RELEASE_INTENT, EXECUTION_PLAN, документационный append template и actual PUBLIC before/after snippets. Новый отдельный read-only checker прошёл119 проверок без извлечения архива: exact14regular tar entries/bytes/modes/owners,12frozen P1 bytes,562planned records/81dirs/90770774bytes,548inherited unchanged,561published manifest rows безself, catalog ровно2замены с exact inverse, snippet только1root literal, Git-exact report pins и сохранённый PAGE_RENDER_NOT_OBSERVED. Foreign products обрабатывались только как metadata/opaque bytes.

| Артефакт | Bytes | SHA256 |
| --- | ---: | --- |
| RELEASE_INTENT.json |10595|`760c6ed76c1ff97a9f33223b1c8f7a1b86973e6efb1284c08ab51e1e27d6b4ba`|
| Delta archive |2191360|`b66db602929b95bb0d3f8a5a22e90f90a38d14ca7bbe93ca8702cc0a9dd3858f`|
| EXECUTION_PLAN.md |14614|`66fc6c0ef90c1d1783ba86716aaeeb0aeaa5d635d0e5e568304ae05335a0eaf1`|
| Root REVIEW.json |9086|`bb48742e688be68c4fa90660a969778f01ea6d962f68d8924cb947520393712a`|

Root checker `E:/R4D/perspective/p2-runtime/output/lead-freeze/check-p1-public-intent-01.py`; receipt `E:/R4D/perspective/p2-runtime/output/lead-freeze/p1-public-intent-01-REVIEW.json`. Статус receipt LOCAL_PACKET_VERIFIED_AWAIT_CTO_GATE, не server authorization. Fresh common resource sample Lead14:26:45UTC:freeRAM15.986GiB/CPU4%, C15.538/D16.309/E16.451GiB; checker лёгкий и завершилсяexit0.

Baseline read14:15:32–34UTC: root `/srv/superflight-review/releases/p3-jungle-masks-frozen-01`,550files/88710090bytes, raw PUBLIC snippet948SHA d264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598. Newroot `/srv/superflight-review/releases/p1-mapping-report-candidate-01`,562files tree `0e6c8f857cf60a77f7383580a87b243c2204e127095c26512fbefeec020a65b7`, manifest109438SHA bfe6bcc0224a0161a232ddf5dde08fa9b2bdc2d7fab4c942c9b6fd140f10ba94. After snippet953SHA289c2de9aa8c535a7755d94d4e69b4368ae82ea154c148449eec9d98467e2bd8; сохраняет все PUBLIC/security bytes кромеroot. Rollback толькок exactfreshPUBLIC before, никакой oldprotected auth. Vhost/globalMIME/credentials не изменять.

**Решение:** exact packet готов к review/gate CTO и новому single token. До получения token нет remote lock/mkdir/upload/staging/backup/docs/snippet/reload/rollback. Перед любым future write — новые raw guards/docs/inventory/targets/resource checks; drift остановит этот intent. Доставка тем же Builder ReleaseEngineer. После разрешённого switch — actual PUBLICHTTP status/bytes/MIME/headers и отдельный actual desktop/mobile view; PAGE_RENDER_NOT_OBSERVED до него не снимать, URL заранее не объявлять. P2frozen04/df309 не пересобирать/не паковать до завершенияP1 и освобожденияtoken.

## История: решение Lead после двух фактических verdict

**TARGETED_STATIC_QA_COMPLETE; разрешена только подготовка нового LOCAL PUBLIC intent.** [TQA report](qa/technical/P1_STATIC_REPORT_CANDIDATE_01.md), original `054bb5bd6a385d36ce51fe382f2526e95cdcee99`, Lead55b1635, полностью прочитан. Нет blocking defects в проверенной static-области:12files/all hashes/both trees/10Git blobs/selected versions/31refs и обратимый catalog draft согласованы. Evidence21615bytes SHA `36787ee737913bde70b9140dc55261eed26e0b02250790926262c826437a01ff` независимо сверён Lead. TQA явно ограничила550-record PUBLIC snapshot датой13:25 и не заявила независимый raw snippet auth analysis, liveHTTP или page rendering.

Вместе с VQA3c5a27e/Lead50befe6 это подтверждает whitelist/provenance и image↔caption↔text. Lead прочитал actual HTML/CSS, accepted method/revision docs, content provenance и draft card: границы принятого mapping, условной камеры/опор, whole-source/native-floor и drops/buckets согласованы. Дефектов, требующих менять frozen candidate01, не установлено. Обе QA сохраняют PAGE_RENDER_NOT_OBSERVED, не fullTechnical/physics/pagePASS; точный file-protocol denial ниже остаётся обязательной границей.

Повторный read_thread подтвердил, что Builder latest383 turncompleted и нового intentturn нет. Lead сделал один успешный адресный send тому же Builder для свежего read-only ACTUAL PUBLIC baseline/docs и одного LOCAL intent `p1-static-report-release-intent-01`, только если путь свободен. Новых build/accepted inventory/QA/imagegen/localpreview/физики не поручено. Frozen12files/manifest не менять, archive whitelist и catalog delta строго выделить, чужие published bytes сохранить opaque. Любые remote mkdir/upload/staging/lock/backup/docs/snippet/reload/rollback запрещены до нового exact Lead/CTO gate и singleCTOtoken. Старые protected templates/intents/rollback непригодны. После actual разрешённого release — отдельные PUBLICHTTP page/images/bytes и actual view/layout/link checks; URL выдаётся после них.

## Прочитанные accepted inputs

Lead прочитал Research checkpoints01–04, support revision03, start revision04, сохранённые numeric-check/revision-check и coordination selected-input table через `git show` exact4b47. Новые исследовательские расчёты/симуляции не запускались.

| Доска | Выбранная ревизия | Что не перепутать в тексте и figures |
| --- | --- | --- |
|Jungle|research01 / trial01|25 условных круглых опор; листва, головы и цветы не восстановлены как объёмы|
|DarkTemple|research01 / trial01|24 видимых объекта:12 кругов +12 четырёхсегментных loops; скрытые rear corners условны|
|SunTemple|research02 / trial02|21 объект:14 кругов +7 шестисегментных jaguar loops; ранние21circles не финальная ревизия|
|WaterTemple|research02 / trial02|21 видимый объект,29 primitives:6 кругов +23 loops; отдельные ноги8арок, start source[712,280]|

Численная обратимость H не доказывает правильную метрическую камеру. Оценки камеры условны; например, SunTemple fitted seams RMS≈13.7/14.3px. Forward/inverse, whole-source и playable-floor domains различать. Inverse-floor выпрямляет плоскость; стоящий/возвышающийся арт искажается и не становится настоящим top-down 3D view. У Water уровни воды/острова/каналы/мосты/ступени сведены к одной плоскости; высота прохода арок не восстановлена. Receiver/drop data не превращаются в отдельно принятую физику/качество движения. Приёмка mapping не означает универсальный рецепт для любых изображений.

Builder сообщил, что accepted Viewer final figures04 относятся к trial02; новые схемы не нужны. Это сообщение владельца, exact copied bytes/provenance и correspondence ещё подлежат targeted QA.

## Фактические границы текущей QA

VQA завершила [точный report](qa/visual/P1_STATIC_REPORT_CANDIDATE_01.md), original `3c5a27ed9fe18e79860491182fe4091738d7d424`, Lead50befe6. Все10JPG лично просмотрены: Git-exact accepted inputs, figure IDs/captions/full-file refs согласованы;03final jaguar supports,04trial02/start и две Research whole-source figures различимы. Итог — соответствие10фигур/подписей/текста подтверждено в доступном объёме, PAGE_RENDER_NOT_OBSERVED. Lead прочитал полный report и сверил новые evidence: FIGURE_CHECKS.json10559bytes SHA `d8266c1aaca0b471ef72d69f20a72e896e36a00a18e3e677249cb1a494543733`, LOCAL_PREVIEW_LIMITATION.json2836bytes SHA `621446c036306a36664bc2a46dd592230a5103796f2e30f5984d1a501d366b3e`. Обычный VQAreadexit1 — неверный путь style.css вместоreport.css; path/content audit prefix исправлены, это не policy denial. TQA verdict пока ожидается.

Новый конкретный browser denial: `cua_repl.js`, call `call_abc1dd4797314b4f99b8273827bb843b`, `cua.createBrowserTab("iab", "file:///E:/R4D/perspective/p2-runtime/output/p1-static-report-candidate-01/public/review/r4d/p1-mapping-report/index.html", {visible:false})`. Причина по receipt владельца: `file:` запрещён, допустимыHTTP/HTTPS. Операция остановлена, без другогоactor/browser/server обхода. Это protocol restriction, автоматический approval-review rejection не установлен. Whole QA не остановлена. Page render/desktop/mobile/overflow/browser link execution не наблюдались; никакого fullrenderPASS. Будущий обычный actual PUBLICHTTP page view после разрешённого release — отдельный post-publication check, не обход local-file operation.

TQA отдельно сверяет local CSS/JPG/anchors и два root-relative возврата `/review/`; не заявлять, что буквально все ссылки строго относительные. Новых симуляций/сборок/serverwrites не было. CTO уведомлён об actualturns/первых completed действиях и точной новой границе просмотра.

## Gate отдельной публикации

1. Frozen named candidate с exact source commit, whitelist файлов, bytes/SHA/tree. PUBLIC payload только HTML/CSS/figures и явно безопасная необходимая metadata; no JS/core/TS/maps/private logs/full source tree.
2. Existing TQA: происхождение из exact4b47, полнота whitelist, refs, receipts/privacy. Existing VQA: actual figure↔caption↔text, выбранные ревизии, framing и читаемость. Без новой physicsQA/seeds/imagegen. Offline figure review не объявлять actual page/browser PASS.
3. Fresh actual PUBLIC root/catalog/snippet/auth/docs/files/modes baseline, opaque preservation foreign publication bytes, точный catalog delta и absent route. Old protected intents01/02/templates/rollback не использовать.
4. Отдельный exact PUBLIC release intent/write-set/rollback → Lead review → новый single CTO token → тот же Builder ReleaseEngineer. Никаких shared writes до token.
5. После actual release: unauthenticated page/images HTTP200, MIME/refs/bytes, реальный view/text check и честные ограничения. Только после этого выдавать URL. После освобождения P1token — новый PUBLIC intent P2candidate04 против обновлённой базы.

Наблюдения Lead: actual resumed turn `01a1829b-1678-7c81-a99c-3664bcf99c88`, Builder `01a1829b-0da3-7913-bbdb-3bd738d0c0f7`; новый PUBLIC/P1 priority checkpoint `d5c4533` pushed. IAB фактически открыл публичный `/review/` без login; в perspective разделе3карточки, P1static пока нет. Resource sample13:12:58UTC:17.441/31.907GiB free RAM, CPU10%, C14.755/D16.316/E16.991GiB free. Это датированный замер; перед тяжёлым шагом нужен свежий общий sample. Правило4/2GiB, старые denied launcher/file-preview операции и границы UGH/чужих продуктов сохраняются.
