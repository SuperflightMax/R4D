# Water Visual QA

2026-10-30, Europe/Kyiv. **W05_SCOPED_QA_COMPLETE; W04-V01_CLOSED_SCOPED; W01-V01_CLOSED_RETAINED; FRONT_HIDE_UNVERIFIED; FULL_WATER_ART_AND_TRANSFER_UNVERIFIED.**

Exact canon/P1/JPG проверены; [PREPARATION.md](PREPARATION.md) и [SOURCE_FACTS.json](SOURCE_FACTS.json) готовы. Floor v1 SHA256 `37e1603fe031b18e9ae8d325f65b2c138612d15f49d6948ce0b27c9b35c3456c` просмотрен отдельно: [EARLY_FLOOR_V1.md](EARLY_FLOOR_V1.md).

Получен native case handoff TQA `761e6087…`, hash windows `31a339e8…` проверен; targets включены в PREPARATION. Это внешние native результаты, не собственные VQA seed outcomes или просмотр движения.

Actual w01 consumer `41349b8d…` / Artist `094301dd…` просмотрен в собственной IAB вкладке: Whole/Field, pillar-03 front/side states и sampled realtime. [REPORT_W01.md](REPORT_W01.md), [EVIDENCE_W01.json](EVIDENCE_W01.json): 24 own JPEG + AX, exact identity pins и исходы. Исторический W01-V01 — небольшой верхний clip стартового шара в Field. Sidecar path уточнён Lead; это handoff correction, не packaging defect.

На framing-only w02 consumer `f06ed5d7…` W01-V01 закрыт: полный шар в Field0/Whole0/Field0 return/Field100, paused native state/RNG сохранены. [REPORT_W02_CLOSURE.md](REPORT_W02_CLOSURE.md), [EVIDENCE_W02_CLOSURE.json](EVIDENCE_W02_CLOSURE.json): 4 новых JPEG + AX; old w01 evidence сохранены. Остальные художественные выводы этим не расширены.

Обычные новые seeds сохранены:2190599127→LOST1496,1370738139→LOST1139. Replay seed0→LOST1326,seed2→receiver02/1275. Receiver/gate/environment art отсутствует, его художественные взаимодействия UNVERIFIED; pillar04 contact и partial hide/reveal также не подтверждены.

Actual w04 consumer `48763f47…` / Artist `54108560…` просмотрен: [REPORT_W04.md](REPORT_W04.md), [EVIDENCE_W04.json](EVIDENCE_W04.json),22 own JPEG+AX. Arch07: оба contact windows и partial reveal просмотрены, значимого провала в данном проходе не увидел; shadow/support PARTIAL, общего gate PASS нет. W04-V01: receiver02 невидим на1273/1274 и резко появляется на1275, подтверждено Field/Whole. Terminal +1 остаётся1275, без наблюдавшегося sink/fade. Root cause лишь гипотеза; исправление не проверено.

Новых throws/oracle не было: replay1→LOST1196,2→receiver02/1275. Другие контакты/чаши/environment остаются UNVERIFIED. Собственная вкладка закрыта, producer server/product не менялись; server writes0/tokenfalse. Следующее действие — scoped QA отдельного frozen исправления W04-V01/следующих parts после выдачи. Dark ведётся отдельно. Frozen Jungle и все прежние evidence сохранены.

Actual w05 consumer `ce110a38…` / Artist `9647869d…`: [REPORT_W05.md](REPORT_W05.md), [EVIDENCE_W05.json](EVIDENCE_W05.json),24 own JPEG+AX. W04-V01 CLOSED for seed2/receiver02 saved repro: visible1272/1273/1274/1275+stable hold; earlier natural back-wall concealment/partial reveal retained. Miss seed1/receiver03 remains LOST1196. Own1118–1120 show no noticeable jump; supplemental retained TQA1131 shows full sphere over painted front wall, already forward of logical footprint. This is NOTE / front-hide UNVERIFIED, no new established sorting defect or volume PASS.9 native reference comparisons and3 same-tick TQA front states equal; Field envelope X−.319326/+.336235px,Y unchanged,fixed across cases. ArtOff,gate1019,start0 regressions checked only. No fullWaterArtPass; old baseline/evidence and limitations preserved, own tab closed.
