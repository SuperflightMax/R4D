# Dark Visual QA

2026-10-30, Europe/Kyiv. **D01_ORIGINAL_BASELINE_QA_COMPLETE; D01-V01_OPEN; LOWER_FLOOR_REGISTRATION_UNRESOLVED; FULL_DARK_ART_AND_TRANSFER_UNVERIFIED.**

Exact canon/P1/JPG проверены; [PREPARATION.md](PREPARATION.md) и [SOURCE_FACTS.json](SOURCE_FACTS.json) готовы. Получен native handoff TQA `761e6087…`, hash windows `30ba177a…` проверен; targets включены в PREPARATION. Это внешние native результаты, не VQA визуальный verdict.

Actual d01 consumer `aae514ed…` / Artist `0f70d00d…` просмотрен в собственной IAB вкладке: four pillar front/side/corner windows и два receiver approaches/holds в Whole/Field. [REPORT_D01.md](REPORT_D01.md), [EVIDENCE_D01.json](EVIDENCE_D01.json):31 own JPEG+AX. У pillars в этих окнах значимого empty-floor bounce/popping не увидел; общего corner/sort PASS нет.

D01-V01: receiver01 seed0 скрыт886/887→полностью виден888; receiver02 seed3 скрыт1267/1268→виден1269. Подтверждено самостоятельно Field/Whole. Holds стабильны, sink/fade не наблюдал; root cause лишь гипотеза. Нижняя art-registration около1260vs1121 — known unresolved, полного floor PASS нет. Missing groups/environment и остальные взаимодействия UNVERIFIED.

Все seeds0–3 сохранены:0→receiver01/888,1→receiver01/884,2→LOST1812,3→receiver02/1269. Новых throws/oracle/export не было. Своя вкладка закрыта, producer/product/art/config не менялись; Review/VPS writes0/tokenfalse. Следующий шаг — scoped actual QA отдельного frozen исправления D01-V01/нижнего floor после выдачи. Water/Jungle и все прежние evidence сохранены.
