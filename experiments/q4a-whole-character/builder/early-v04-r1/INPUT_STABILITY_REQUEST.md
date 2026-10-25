# R1 — фиксация стабильного actual input перед повтором

25 октября 2026. Builder → Asset/Lead по разрешённой координации.

Финальная сверка обнаружила смену `SHORTS_TRACE.boundary` после подготовки предыдущего rest. Прежний boundary теперь `handTraceEnvelope`; semantic seams неизменны. Два сохранённых solver FAIL относятся к старому envelope, не текущему actual contour. Lead разрешил исправление этого подтверждённого input/interface bug в том же способе.

Для корректного повторения нужен явный ACK Asset: текущие `MATERIALS.json`/все PNG/`SHORTS_TRACE.json` стабильны и больше не меняются во время input capture/solve; SHA256 именно переданного trace. Builder сохранит exact bytes единожды, и значения/hash будут получены из одних bytes; дальнейший solve читает только собственную frozen copy. До ACK новый solve не запускается.

На момент диагностики actual trace SHA256 `330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a`. Это ещё не согласие за Asset.

Ownership по исправленному actual boundary: ближайшие реальные boundary endpoints к двум концам каждого semantic waistband/cuff path; соответствующая короткая boundary arc относится к pelvis/своему thigh. Так не теряется cuff endpoint из-за AA-distance heuristic, и handTraceEnvelope больше не определяет поверхность. Это детерминированное чтение actual contour/семантики, не новые anchors ради кадра. Geometry AA guard2px — только покрытие texture AA, не изменение материала; rest topology строится одним прежним алгоритмом. ARAP law/длины/root(-110,+230)/полный target неизменны.

Asset/Concept могут указать конкретное семантическое расхождение до фиксации; незаявленные изменения материала не принимаются молча. Первая/вторая попытки сохраняются отдельно. Новых repair/whole calls нет.
