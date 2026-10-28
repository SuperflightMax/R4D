# P5 Technical QA — текущее состояние

29 октября 2026, Europe/Kyiv. Stage 2 открыт адресным поручением Lead; gpt-6.1-sol/xhigh подтверждён Director в переданном turn_context. Собственная ветка `codex/r4d-p5-regenerated-technical-qa-01`, base `64061757802dc60770ab156ef5672af741d65d03`.

Выполнено: независимый exact input/native/projection oracle001, четыре фиксированных seeds с exact replay и сохранением LOST. Полный результат и pins: [REPORT_SOURCE_ORACLE_001.md](REPORT_SOURCE_ORACLE_001.md). Private evidence: `E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001/checkpoint-index.json`, SHA256 `0f9de629046c84c1789aa84e7784e6b09710694dc1915a0c39539ff01460a114`.

Статус: первоначальная подготовка завершена; ожидается адресный handoff реального generated consumer. Браузерная/визуальная проверка P5 ещё не проводилась, QA PASS и release отсутствуют. Product не исправлялся. Native matrix без существенной причины не повторять.

Следующий вход: точные consumer/asset manifest/build/dep pins, schema и localhost ownership/URL/root от Lead. Следующее действие: ранняя actual runtime проверка mini-set с точными контактными окнами; после итогового freeze — адресная проверка exact candidate. Публикация/серверные writes закрыты до отдельного gate.

Особые native условия: collision event t относится к post-step state t+1; bucket event уже post-increment; timeout в пошаговом consumer требует native timeout API; корзина проверяет центр без erosion на ball.r. Это факты источника, не consumer findings.

Ресурсы oracle: пик Node156.99 MiB, run около1.63 MB, последняя E12.198 GiB. Live QA server/browser/process отсутствуют. Новый тяжёлый шаг требует fresh aggregate RAM/CPU/CDE guard с allowance4 GiB RAM/2 GiB E. E<=4 warn/diagnose, E<=2 checkpoint STOP. Runtime/cache/evidence только собственный E/process-local. Никаких сообщений другим чатам и чтения чужих P2–P4/P6 материалов.
