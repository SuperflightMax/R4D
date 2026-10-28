# P5 Technical QA — текущее состояние

29 октября 2026, Europe/Kyiv. Stage 2 открыт адресным поручением Lead; gpt-6.1-sol/xhigh подтверждён Director в переданном turn_context. Собственная ветка `codex/r4d-p5-regenerated-technical-qa-01`, base `64061757802dc60770ab156ef5672af741d65d03`.

Выполнено: независимый exact input/native/projection oracle001, четыре фиксированных seeds с exact replay и сохранением LOST. Полный результат и pins: [REPORT_SOURCE_ORACLE_001.md](REPORT_SOURCE_ORACLE_001.md). Private evidence: `E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001/checkpoint-index.json`, SHA256 `0f9de629046c84c1789aa84e7784e6b09710694dc1915a0c39539ff01460a114`.

Получен и проверен actual browser C01: consumer `0c611039246904443128b9d12084af2c5a0ae6e6`, Artist mini01 `5085be86d5b5e9bf22619254f42b95ad3dc1320e`. Результат: [REPORT_C01.md](REPORT_C01.md), pins: [C01_EVIDENCE_PINS.json](C01_EVIDENCE_PINS.json). Все22package files совпали на диске/HTTP;10PNG alpha metrics совпали;33actual snapshots сопоставлены с native. Один обычный новый UI seed3957814979 завершился LOST847 и точно повторился. Старые1922точки/seeds0–3 не пересчитывались.

Статус: ранняя actual runtime проверка C01 завершена; полный technical/artistic PASS P5 и release отсутствуют. Product не исправлялся. F-C01-01: native receiver01 tick875 корректен, но sphere остаётся у дальнего бортика; точный вклад aperture/anchor/part registration пока не изолирован.21pins/3receivers/side-rail и near-platform parts не покрыты мини-набором; полный sorting/occlusion PASS отсутствует.

Следующий вход: meaningful candidate delta/new frozen pins от Lead. Следующее действие: адресно F-C01-01 плюс новые/изменённые coverage области; затем final exact freeze QA. Завершённые матрицы без существенной причины не повторять. Публикация/серверные writes закрыты до нового CTO gate.

Особые native условия: collision event t относится к post-step state t+1; bucket event уже post-increment; timeout в пошаговом consumer требует native timeout API; корзина проверяет центр без erosion на ball.r. Это факты источника, не consumer findings.

Ресурсы source oracle: пик Node156.99 MiB, run около1.63 MB. C01 evidence около6.09MB; private index `E:/R4D/perspective/p5-runtime/technical-qa/c01/evidence-index.json`,SHA256 `b34472b1c85021f73f24f432cb856a2e7ea29df40e3adae99a7eaf01b1edaf85`. Последний guard: RAMfree16.060GiB, CPU8%, E12.120GiB. Своя IAB вкладка закрыта; свой сервер не создавался; Builder PID32108 не менялся. Новый тяжёлый шаг требует fresh aggregate RAM/CPU/CDE guard с allowance4 GiB RAM/2 GiB E. E<=4 warn/diagnose, E<=2 checkpoint STOP. Runtime/cache/evidence только собственный E/process-local. Никаких сообщений другим чатам и чтения чужих P2–P4/P6 материалов.
