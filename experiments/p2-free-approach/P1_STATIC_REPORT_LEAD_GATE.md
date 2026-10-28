# Accepted P1 — static PUBLIC report: Lead gate

Статус: candidate и targeted QA ожидаются. Не release approval и не готовый URL.

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

## Gate отдельной публикации

1. Frozen named candidate с exact source commit, whitelist файлов, bytes/SHA/tree. PUBLIC payload только HTML/CSS/figures и явно безопасная необходимая metadata; no JS/core/TS/maps/private logs/full source tree.
2. Existing TQA: происхождение из exact4b47, полнота whitelist, refs, receipts/privacy. Existing VQA: actual figure↔caption↔text, выбранные ревизии, framing и читаемость. Без новой physicsQA/seeds/imagegen. Offline figure review не объявлять actual page/browser PASS.
3. Fresh actual PUBLIC root/catalog/snippet/auth/docs/files/modes baseline, opaque preservation foreign publication bytes, точный catalog delta и absent route. Old protected intents01/02/templates/rollback не использовать.
4. Отдельный exact PUBLIC release intent/write-set/rollback → Lead review → новый single CTO token → тот же Builder ReleaseEngineer. Никаких shared writes до token.
5. После actual release: unauthenticated page/images HTTP200, MIME/refs/bytes, реальный view/text check и честные ограничения. Только после этого выдавать URL. После освобождения P1token — новый PUBLIC intent P2candidate04 против обновлённой базы.

Наблюдения Lead: actual resumed turn `01a1829b-1678-7c81-a99c-3664bcf99c88`, Builder `01a1829b-0da3-7913-bbdb-3bd738d0c0f7`; новый PUBLIC/P1 priority checkpoint `d5c4533` pushed. IAB фактически открыл публичный `/review/` без login; в perspective разделе3карточки, P1static пока нет. Resource sample13:12:58UTC:17.441/31.907GiB free RAM, CPU10%, C14.755/D16.316/E16.991GiB free. Это датированный замер; перед тяжёлым шагом нужен свежий общий sample. Правило4/2GiB, старые denied launcher/file-preview операции и границы UGH/чужих продуктов сохраняются.
