# Dark Visual QA

2026-10-30, Europe/Kyiv. **D02_FLOOR_SCOPED_QA_COMPLETE; FLOOR_PARTIAL_IMPROVEMENT; D02-V01_OPEN; D01-V01_OPEN; FULL_DARK_ART_AND_TRANSFER_UNVERIFIED.**

Exact canon/P1/JPG проверены; [PREPARATION.md](PREPARATION.md) и [SOURCE_FACTS.json](SOURCE_FACTS.json) готовы. Получен native handoff TQA `761e6087…`, hash windows `30ba177a…` проверен; targets включены в PREPARATION. Это внешние native результаты, не VQA визуальный verdict.

Actual d01 consumer `aae514ed…` / Artist `0f70d00d…` просмотрен в собственной IAB вкладке: four pillar front/side/corner windows и два receiver approaches/holds в Whole/Field. [REPORT_D01.md](REPORT_D01.md), [EVIDENCE_D01.json](EVIDENCE_D01.json):31 own JPEG+AX. У pillars в этих окнах значимого empty-floor bounce/popping не увидел; общего corner/sort PASS нет.

D01-V01: receiver01 seed0 скрыт886/887→полностью виден888; receiver02 seed3 скрыт1267/1268→виден1269. Подтверждено самостоятельно Field/Whole. Holds стабильны, sink/fade не наблюдал; root cause лишь гипотеза. Нижняя art-registration около1260vs1121 — known unresolved, полного floor PASS нет. Missing groups/environment и остальные взаимодействия UNVERIFIED.

Все seeds0–3 сохранены:0→receiver01/888,1→receiver01/884,2→LOST1812,3→receiver02/1269. Новых throws/oracle/export не было. Своя вкладка закрыта, producer/product/art/config не менялись; Review/VPS writes0/tokenfalse. Следующий шаг — scoped actual QA отдельного frozen исправления D01-V01/нижнего floor после выдачи. Water/Jungle и все прежние evidence сохранены.

Actual floor-only d02 consumer `ce110a38…` / Artist `9647869d…`: [REPORT_D02.md](REPORT_D02.md), [EVIDENCE_D02.json](EVIDENCE_D02.json),5 own JPEG+AX paired with frozen d01. Lower edge position improved in actual Geometry/normal view; D02-V01 OPEN — dark gaps under cap between adjacent cups. Full floor registration remains PARTIAL.34 nonfloor actors/14 descriptors retained exactly; Field domain and5 compared native state/RNG windows match d01. Narrow pillar368/972/973 regression has no significant new observed defect. D01-V01 remains OPEN; entries were not rerun. No full floor/art/transfer PASS. Own tab closed; old evidence preserved.
