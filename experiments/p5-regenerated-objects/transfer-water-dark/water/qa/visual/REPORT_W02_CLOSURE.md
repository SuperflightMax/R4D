# Water w02 — closure W01-V01

30 октября 2026, Europe/Kyiv. **W01-V01 CLOSED в проверенном scope.** В actual consumer стартовый шар целиком виден в Field/state0 и Whole/state0; после возврата Field/state0 и на Field/state100 обрезки нет. Native state/RNG в paused проверках сохранились. **Full Water artistic PASS остаётся false.**

Кандидат: consumer `f06ed5d7f87dc3e51323881d3ce8380ead65ea18`, прежний Artist `094301dda9a43e7b4970af9d9af20982a38fb221`. FILE_INDEX: 4851 bytes/SHA256 `1a8945190e064be5fedfaa80c30a1aa9f24db048d2bef407546c53246697cdcb`. Все 17 physical public files сверены; только app.js отличается от w01: 570867 bytes/SHA256 `0571bbdaa541fa8d5ad617c686118d69b4ba7dacca746652dc99f8489cc248c2`. Остальные 16 файлов, включая PNG/manifest/config, совпали. Старые [w01 report](REPORT_W01.md) и [evidence](EVIDENCE_W01.json) сохранены; их SHA256 повторно сверены.

Просмотр: собственная hidden IAB вкладка на `http://localhost:55190/`, normal Whole/Field, Art on/Geometry off. Listener PID17036 проверен по порту и preview root w02. Сохранены четыре оригинальных JPEG1265×712 и before/after AX; paused state до/после каждого кадра совпал. Zoom/viewport не менялись, CSS/DPR отдельно не измерялись.

| Кадр | Результат |
| --- | --- |
| 01 Field/seed0/state0 | Полный силуэт шара внутри рамки |
| 02 Whole/seed0/state0 | Полный шар; state/position/velocity/RNG идентичны кадру01 |
| 03 возврат Field/seed0/state0 | Полный шар; тот же native state/RNG |
| 04 Field/seed0/state100 | Полный шар; state совпал с сохранённым w01 state100 |

RNG во всех четырёх кадрах — 0. Field domain в AX одинаков на state0 и100, minY `249.72811384258958`; он включает заявленные ball bounds у старта. Видимые положения floor/pillars в Field сохраняются. Это подтверждает closure исходной обрезки в данном просмотре; покадровый пересчёт камеры не использовался для проверки.

![w02: полный стартовый шар, Field/seed0/state0](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w02/01-seed0-t0-field.jpg)

[EVIDENCE_W02_CLOSURE.json](EVIDENCE_W02_CLOSURE.json): 10858 bytes/SHA256 **`6c283cbf6f9b6cda427d79bcc5ea4f277026eb422983d735d2b1b3159a4c0146`**; 19 runtime files /532146 bytes, 4 JPEG. Runtime: `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w02/`.

Начальный HEAD `a67aec7bfe2a3a95c127b6ede7a2f4a3c9637589`, своя ветка чистая. Fresh guard00:06:50Z: free RAM10.364 GiB, CPU0%, aggregate CPU5.667%, working set/private26.805/28.025 GiB; C/D/E free14.911/14.640/9.645 GiB. Оценка пика1 GiB RAM /0.02 GiB E с резервом4/2 GiB. В guard сохранена также ошибка JS обвязки после успешного shell inspection exit0; проверка не перезапускалась, состояние продукта не затронуто.

Только closure W01-V01: новых throws/oracle/native export, контактов и большой QA матрицы не было. Отсутствующий арт и прежние UNVERIFIED остаются; mini02/w03 не проверялся. Своя вкладка закрыта, producer server не менялся; product/config/art writes0, server writes0/tokenfalse. Следующий этап — отдельная actual art QA после выдачи следующего кандидата.
