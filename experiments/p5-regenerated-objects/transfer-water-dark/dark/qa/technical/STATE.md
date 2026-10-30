# Dark — Independent Technical QA

2026-10-30. INPUT/NATIVE PREPARATION COMPLETE: Dark02/trial-01 из P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Отчёт `REPORT_INPUT_ORACLE_001.md`, точные версии и SHA в `EVIDENCE_PINS.json`. Общий input blocker в выполненных проверках не найден.

До запуска объявлены обычные seed **0, 1, 2, 3**, по одному полному bounded запуску и точному replay каждого. Все исходы и LOST сохраняются; расширение seed ради удачного результата не планируется. Настоящее ядро берётся из собственного ранее проверенного private runtime, без повторного экспорта/компиляции. Никаких изменений config, core, start, projection или PRNG.

Новые evidence: `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/input-oracle-001/`. Общий QA helper находится в `../../../water/qa/technical/prepare-oracle.mjs` и получает аргумент `dark`; новых shared product files нет. Guard и ограничение нагрузки те же, что у Water.

На момент завершения prep candidate ещё не был выдан; численные окна сами по себе не означают визуальный PASS. Actual d01 scope указан ниже. Jungle C03 и его PARTIAL/UNVERIFIED сохранены; serverWrites=0, tokenGranted=false.

Факт prep: 0 receiver-01 tick888, 1 receiver-01 tick884, 2 LOST1812, 3 receiver-02 tick1269; все четыре exact replay совпали. 28 окон сохранены: native side/front/endpoint contacts и receiver approaches.

D01 FIRST ACTUAL QA COMPLETE (2026-10-30): consumer `aae514ed31720ab6d913f4bc6d63286c26992e0a`, Artist `0f70d00db096ee30f057dd65ca36a53df3f78899`. 20 disk/HTTP files exact;44 sampled browser state/config/RNG/events и loaded art manifest exact. Все4 terminal outcomes сохранены. Control/view/replay smoke пройден;4 заданных pillar face/corner тройки просмотрены, motion для side/front/pillar02 corner. PARTIAL visual: OPEN `D01-TQA-V01` independently observed abrupt whole-sphere reveal за внутренней rear wall receivers01/02, при корректных offsets; это не Water water-over-open-plane finding и не native trigger bug. Known lower floor registration1260vs1121 остаётся у Artist; не скрыта кадром/кропом/геометрией. Receiver03/04/front rims/missing groups/environment/masks/rare contours UNVERIFIED. `REPORT_D01.md` и `D01_EVIDENCE_PINS.json`; browser закрыт, producer/d01 не изменены, новых oracle runs нет. Следующий полезный QA — отдельный successor с исправленным floor/уточнёнными parts; original d01 сохранить.
