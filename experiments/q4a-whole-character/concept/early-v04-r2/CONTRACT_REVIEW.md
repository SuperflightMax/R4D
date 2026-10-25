# R2: личная сверка точного solver contract

25 октября 2026. `concept-artist-r4d-q4a-01`.
Полностью прочитан [R2_SOLVER_CONTRACT.md](../../builder/early-v04-r2/R2_SOLVER_CONTRACT.md), включая preflight02 и обязательный CTO read-only gate. Сверено со своими неизменными [R2_REVIEW_CONDITIONS.md](R2_REVIEW_CONDITIONS.md).

Лично проверены SHA256 файлов:

- Contract: **`d5f1a71601f62034cead5051ea5d68353aae7ac4276681a3a8dd25b6cd6b2415`**.
- Связанный [R2_HASHES.json](../../builder/early-v04-r2/R2_HASHES.json): **`c02ada675af95499a5d91b9e5d0b3e799dbb5a1f71ec9618cbbf4e0791f6d7e8`**.

Оба совпадают с точной версией, переданной Lead. Это моя проверка двух файлов и смысла договора; проверку всех 44 hashes, synthetic/code/аналитических производных независимо не повторял и не выдаю за свою техническую приёмку.

**CONCEPT_R2_CONTRACT_AGREED. Явно согласую эту точную версию договора в пределах художественного смысла distortion stop и условий будущего after. Существенных противоречий с моими условиями нет. Это не art PASS, не source PASS и не разрешение actual solve.**

## Точная область применения limits

Принимаю заранее зафиксированные границы каждого triangle: area ratio `[0.20,3.0]`, `σmin≥0.30`, `σmax≤2.0`, `condition≤6.0`, pin error `≤1e−8 raw px` при дополнительном strict orientation `d>1e−4`.

Понимаю и согласую различие состояний:

- Во всех входящих в objective/принимаемых optimizer iterates сохраняется finite positive geometry с `d>1e−4`.
- Полный distortion gate применяется **после convergence всего μ schedule**, до принятия каждого homotopy state, и повторяется на каждом exact output. Состояние с нарушением таблицы не принимается как завершённый шаг или пригодная поза.
- Отдельные line-search trials и промежуточные μ стадии — transient optimizer states; полный distortion gate им не навязывается. Их нарушения/метрики отдельно журналируются, rejected trials не становятся accepted geometry или изображением «успешного» low. Это согласованное численное различие, не художественное разрешение показывать transient collapse как готовый результат.

Эти limits отсекают сильные искажения, но всё ещё допускают сжатие направления до 30% и двукратное растяжение. Даже проходящий их результат может терять живой объём и швы; последующий личный художественный gate необходим.

## Frozen задача и остановка

Договор сохраняет один заявленный nonlinear continuation test, прежние rest/targets/material/coverage/leg geometry/energy, все 241 exact outputs и full drop230/back110. Homotopy substeps не подменяют отсутствующий endpoint. Partial output, fail/stall, collapse, budget stop или implementation exception не получают PASS. После witness нельзя менять числа/метод/anchors/topology ради продолжения; даже доказанный bug требует audit и прямого решения CTO.

Прежние раскрытые исключения двух partial cell corners не названы идеальной RGBA coverage. Их перенос как известного frozen факта не превращаю в подтверждение безупречного будущего изображения. Самостоятельную оценку видимой ткани/кожи выполняю только по реальному after.

## Gate до actual и после него

После публикации договора/manifest **обязателен отдельный положительный read-only gate CTO**, затем отдельный старт Lead по согласованному commit/manifest. Мой ack не заменяет ни его, ни старт; actual/code/synthetic мной не запускались.

Только полный technical PASS открывает предусмотренный один bounded diagonal tank/axilla corridor cycle и создание одного immutable after. Он не разрешает новый whole, hip/crotch/cuff covers или свободную доводку. После появления лично проверю тот же exact after neutral, shoulder swing ±25°, full low и переходы на light/dark с raw рядом: живые shoulder/axilla и hip/glute/thigh, цельные швы/подолы без collapse/лоскутов/чужой ткани, фактическую опору и отсутствие видимого растяжения.

Художественный результат остаётся отдельным совместным gate Concept/Asset, допускающим FAIL внутри numerical limits. До exact after художественное движение не проверено. Старые условия/reviews и материалы не менял, новых материалов/repair/parts/rig/runtime не изготавливал. Full motion/QA/candidate/release/Q2A этим согласием не открываются; stage/commit — Lead.
