# Accepted P1 — static PUBLIC report: Lead gate

**Frozen candidate01 передан независимой QA.** Full Builder handoff `383164ff397e83a5ad47238f6ebe196688f649ff` (build source `2135851427c568038b23fded38d6cbe8b6f6b0e3`) интегрирован Lead как804f6ef/f46cc3f. Manifest4037bytes SHA256 `00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c` независимо сверён Lead;12publicfiles/2057712bytes, public tree `88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7`. Accepted4b47/frozenbytes не менялись. Нет release approval/token/готового URL.

После нового capacity restore actual Lead turn `01a182c1-a662-7211-b88b-3d2053e7cad2`, входной cleanHEAD68ed8e6 сохранён без отката. Повторная read_thread проверка подтвердила отсутствие ранее начатых P1staticQA. Lead сделал ровно два успешных адресных send (isError=false): TQA actual newturn `01a182c2-c54e-73d3-9cd6-d4629df4240e`, VQA `01a182c2-cce2-7b90-bd78-b76bee5a4b44`. Первый TQA exec-e26a6d85-ac04-43a8-9830-eb6776d87592 completed; первый VQA exec-98c03cd9-682e-4244-8193-65fefbb30c04 completed/exit0. Следующий VQA read/preflight d536...exit1 ещё разбирается владельцем; обычный CSS/content path pointer передан, policy-denial не установлен. Оба QA фактически active, verdict ожидается. Повторных start/Builder/Artist wake не требуется.

Основание: Max28октября12:38UTC, `Sentinel_9809efe64b3881918b49cd3b4c1237a8`, через CTO. Публикуется статический отчёт accepted P1 exact `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, subtree `experiments/p1-collider-mapping/clean-repeat-01/`. P1 не перезапускается; это не третий research slot. P2 frozen04/df309 сохраняются без rebuild/reQA.

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

VQA сообщила о просмотре всех10JPG: Git-exact accepted inputs, figure IDs/captions/full-file refs согласованы;03final jaguar supports,04trial02/start и две Research whole-source figures различимы. Итоговый подписанный report ещё ожидается. Обычный VQAreadexit1 — неверный путь style.css вместоreport.css; path/content audit prefix исправлены, это не policy denial.

Новый конкретный browser denial: `cua_repl.js`, call `call_abc1dd4797314b4f99b8273827bb843b`, `cua.createBrowserTab("iab", "file:///E:/R4D/perspective/p2-runtime/output/p1-static-report-candidate-01/public/review/r4d/p1-mapping-report/index.html", {visible:false})`. Причина по receipt владельца: `file:` запрещён, допустимыHTTP/HTTPS. Операция остановлена, без другогоactor/browser/server обхода. Это protocol restriction, автоматический approval-review rejection не установлен. Whole QA не остановлена. Page render/desktop/mobile/overflow/browser link execution не наблюдались; никакого fullrenderPASS. Будущий обычный actual PUBLICHTTP page view после разрешённого release — отдельный post-publication check, не обход local-file operation.

TQA отдельно сверяет local CSS/JPG/anchors и два root-relative возврата `/review/`; не заявлять, что буквально все ссылки строго относительные. Новых симуляций/сборок/serverwrites не было. CTO уведомлён об actualturns/первых completed действиях и точной новой границе просмотра.

## Gate отдельной публикации

1. Frozen named candidate с exact source commit, whitelist файлов, bytes/SHA/tree. PUBLIC payload только HTML/CSS/figures и явно безопасная необходимая metadata; no JS/core/TS/maps/private logs/full source tree.
2. Existing TQA: происхождение из exact4b47, полнота whitelist, refs, receipts/privacy. Existing VQA: actual figure↔caption↔text, выбранные ревизии, framing и читаемость. Без новой physicsQA/seeds/imagegen. Offline figure review не объявлять actual page/browser PASS.
3. Fresh actual PUBLIC root/catalog/snippet/auth/docs/files/modes baseline, opaque preservation foreign publication bytes, точный catalog delta и absent route. Old protected intents01/02/templates/rollback не использовать.
4. Отдельный exact PUBLIC release intent/write-set/rollback → Lead review → новый single CTO token → тот же Builder ReleaseEngineer. Никаких shared writes до token.
5. После actual release: unauthenticated page/images HTTP200, MIME/refs/bytes, реальный view/text check и честные ограничения. Только после этого выдавать URL. После освобождения P1token — новый PUBLIC intent P2candidate04 против обновлённой базы.

Наблюдения Lead: actual resumed turn `01a1829b-1678-7c81-a99c-3664bcf99c88`, Builder `01a1829b-0da3-7913-bbdb-3bd738d0c0f7`; новый PUBLIC/P1 priority checkpoint `d5c4533` pushed. IAB фактически открыл публичный `/review/` без login; в perspective разделе3карточки, P1static пока нет. Resource sample13:12:58UTC:17.441/31.907GiB free RAM, CPU10%, C14.755/D16.316/E16.991GiB free. Это датированный замер; перед тяжёлым шагом нужен свежий общий sample. Правило4/2GiB, старые denied launcher/file-preview операции и границы UGH/чужих продуктов сохраняются.
