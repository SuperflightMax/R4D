# Materials01 — происхождение и границы

25 октября 2026. Asset `asset-artist-r4d-q4a-01`. Единственный production source — `art/whole-v04/raw/whole-v04.png`, SHA256 `56947ae376af812075e42f23d2c874ef1c9f30de6f51718700f4376cfae38bb3`. Raw и R0 не менялись. Ни одного нового whole/v02 donor/kit нет.

`MATERIALS.json` перечисляет десять PNG, native1024×1536, full-canvas cropRect и индивидуальные SHA256. Девять материалов — source-extracted: RGB всех nonzero-alpha пикселей совпадают с raw, проверка `diagnostics/SOURCE_PIXEL_CHECK.json`. Селективные semantic masks/alpha получены только по v04 геометрии/цвету; hand envelopes и фактический garment boundary различаются. Ткань не принадлежит arm, кожа не принадлежит shorts cage.

Десятый `torso_head_tank` содержит исходный torso плюс только bounded hidden reconstruction. Два локальных tool outputs, оба before/prompts и отклонённая попытка сохранены; точные tool paths/SHA256, порядок вызовов и применение subset — `repairs/tank-01/PROVENANCE.md`. Tool outputs1254×1254 скопированы неизменными; только производное output02 приведено к340×340 для исходного crop origin320,220 и пересечено с заранее сохранённым hidden polygon. Внешний вид outside subset из tool не используется.

`torso_hidden_reconstruction.png` — provenance-диагностика, **не** отдельная runtime cover-layer. Conditional inner shoulder/hip/crotch/under-cuff continuation не изготовлены. Knee/ankle overlaps — дубли исходной видимой кожи, не генерация скрытой анатомии.

Процедурные вспомогательные материалы: только masks, contour trace, диагностические фоны/композиции и JSON/checks. Они не называются новым артом/восстановленными source pixels. `tools/art/early_v04_r1/prepare_repair.py` и `extract_materials.py` воспроизводят подготовку, но stable handed-off файлы не перезапускать/перезаписывать без нового поручения. Последняя ручная фиксация manifest status/ограничений после extraction не является изменением PNG.

Личный просмотр initial rest assembly и известный незаполненный shoulder corridor — `INITIAL_ASSEMBLY_REVIEW.md`. Это не MOTION_REVIEW отсутствующего after. Solver/geometry проверены Builder отдельно; материалы не присваивают себе его PASS или точное соответствие старого solve новой маске.

## Уточнение linkage до публикации

После запроса Lead проверены current trace и `CAGE_REST.semanticTrace` Builder. Изменились не только метаданные: `boundary`31 точка ручного envelope заменён44 точками фактического сливового контура, добавлен `handTraceEnvelope` с точным прежним31-точечным boundary. Canvas/waistband/nearLegOpening/farLegOpening/sideSeam/crotchSeam/owner/hidden значения не менялись. Это cleanup semantic alpha кожи под cuffs/горчичной ткани сверху; новые geometric controls или другие cuff owners не назначались.

В `history/SHORTS_TRACE_INITIAL_EXACT_RECOVERED.json` точно восстановлены исторические байты: прежний boundary из envelope, без нового ключа, прежний порядок ключей/indent2/trailing newline и Windows CRLF. Его SHA256 `c967ab5f1a635c3587fa7b56d5298529d87cd6353f57ffa1f0793f666fbcd708` совпал с входом `CAGE_REST`, значения совпали с embedded semanticTrace. Это точное восстановление **после** cleanup, не утверждение заранее существовавшей сохранённой копии. LF-вариант имел иной hash; причина теперь установлена, а не угадана.

Current stable trace SHA256 `330468ff7eba951f88efb8b4af464f3b772094a67bea9ac62124b0cc3345484a`; material manifest/PNG не менялись при аудите. Подробности — `TRACE_VERSION_AUDIT.json`. Solver FAIL относится к31-точечному историческому входу;44-точечный final trace не прогонялся. Никаких выводов о его техническом/художественном PASS/FAIL нет, новый solve автоматически не выполняется.
