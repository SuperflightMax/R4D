# Water — Independent Technical QA

2026-10-30. INPUT/NATIVE PREPARATION COMPLETE: Water04/trial-02 из P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Отчёт `REPORT_INPUT_ORACLE_001.md`, точные версии и SHA в `EVIDENCE_PINS.json`. Общий input blocker в выполненных проверках не найден.

До запуска объявлены обычные seed **0, 1, 2, 3**, по одному полному bounded запуску и точному replay каждого. Все исходы и LOST сохраняются; расширение seed ради удачного результата не планируется. Настоящее ядро берётся из собственного ранее проверенного private runtime, без повторного экспорта/компиляции. Никаких изменений config, core, start, projection или PRNG.

Новые evidence: `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/input-oracle-001/`. Перед работой guard C/D/E, RAM/CPU; резерв соседям 4 GiB RAM и 2 GiB E. Оценка собственной нагрузки: 0.25 GiB RAM, 0.03 GiB E.

Пока не выдан frozen candidate, browser/art/masks/движение не проверены. Численные окна не означают визуальный PASS. Jungle C03 и его PARTIAL/UNVERIFIED сохранены; serverWrites=0, tokenGranted=false.

Факт: 0 LOST1326, 1 LOST1196, 2 receiver-02 tick1275, 3 LOST589; все четыре exact replay совпали. 33 окна сохранены. Ключевой случай: seed1 arch-07 ground-opening ticks1009–1020 с касаниями внутренних опор; source lintel/height и visible masks остаются UNVERIFIED. Следующий полезный шаг требует первого frozen Water candidate URL/index/commit; пустые ожидания и новые seed не запускаются.
