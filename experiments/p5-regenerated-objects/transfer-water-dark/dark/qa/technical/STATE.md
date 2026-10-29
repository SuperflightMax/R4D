# Dark — Independent Technical QA

2026-10-30. INPUT/NATIVE PREPARATION COMPLETE: Dark02/trial-01 из P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Отчёт `REPORT_INPUT_ORACLE_001.md`, точные версии и SHA в `EVIDENCE_PINS.json`. Общий input blocker в выполненных проверках не найден.

До запуска объявлены обычные seed **0, 1, 2, 3**, по одному полному bounded запуску и точному replay каждого. Все исходы и LOST сохраняются; расширение seed ради удачного результата не планируется. Настоящее ядро берётся из собственного ранее проверенного private runtime, без повторного экспорта/компиляции. Никаких изменений config, core, start, projection или PRNG.

Новые evidence: `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/input-oracle-001/`. Общий QA helper находится в `../../../water/qa/technical/prepare-oracle.mjs` и получает аргумент `dark`; новых shared product files нет. Guard и ограничение нагрузки те же, что у Water.

Пока не выдан frozen candidate, browser/art/masks/движение не проверены. Численные окна не означают визуальный PASS. Jungle C03 и его PARTIAL/UNVERIFIED сохранены; serverWrites=0, tokenGranted=false.

Факт: 0 receiver-01 tick888, 1 receiver-01 tick884, 2 LOST1812, 3 receiver-02 tick1269; все четыре exact replay совпали. 28 окон сохранены: native side/front/endpoint contacts и receiver approaches. Все actual visual checks остаются UNVERIFIED. Следующий шаг — frozen build после выдачи URL/index/commit; без него подготовка закончена, новые seed и audit loops не запускаются.
