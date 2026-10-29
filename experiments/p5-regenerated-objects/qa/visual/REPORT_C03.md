# Frozen C03 — адресная независимая визуальная QA

29 октября 2026, 01:06 UTC, Europe/Kyiv.

**C02-V01 закрыт на exact C03.** Преждевременного исчезновения сферы на
открытом полу в обычном seed4210403976/674–677 больше нет. Адресная регрессия
всей изменённой кромки не выявила нового значимого видимого дефекта.
Художественная оценка положительная **в проверенном исследовательском объёме**.
C03 — лучший проверенный текущий P5 candidate; разумно остановить доводку
ограниченной попытки и передать его на CTO review с остатками ниже.

Это не обещание правильности всех crossings/входов и не разрешение release.
Непроверенные случаи отдельно от наблюдавшихся дефектов; основания открывать
ещё один художественный проход только ради формального статуса не обнаружены.

## Exact пакет и фактическая дельта

- Consumer/index commit `af23e124cf5bd1d9de884082ffbc993448217112`, prefix `experiments/p5-regenerated-objects/builder/`.
- Producer index полностью прочитан: `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/index.json`,11618bytes,SHA-256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d`. Все29files/21675411bytes совпали до/после просмотра; app/manifest/config/P1 manifest также совпали по HTTP.
- App571012bytes,SHA-256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`, identicalC02. Staged manifest66026bytes,SHA-256 `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91`.
- Artist `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`, `experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-03.json`,89838bytes,SHA-256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0` проверен по raw Git bytes. Прочитаны `HANDOFF_MINI_03.md` и `DELTA_MINI_03.json`; полный новый polygon дополнительно прочитан в компактном виде.
- Самостоятельное deep semantic comparison source и staged manifests после исключения `near-ledge.sourceClipPx` дало равенство. В public изменены только `assets/manifest.json` и `data/preview-input.json`; все17PNG, body/shadow/receiver bindings, serpent clips, app/native/controller/deps остались прежними. Не выполнялись rebuild и продуктовые правки.
- Общие pins сохранены: P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, config SHA-256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`, projection SHA-256 `b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431`, core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`.

Preview owner до/после: Builder PID12500/session67163,
`http://127.0.0.1:55185/`, root `.../output/previews/c03/public`.
Использована собственная скрытая вкладка Codex IAB3, затем закрыта.
Listener не менялся. Original JPEG screenshots1265x712pixels, browser zoom
не менялся; CSS viewport/DPR отдельно не инструментировались.

## Наблюдаемое исправление и движение

В pause/step на670/674/675/676/677/680 сфера продолжает читаться на открытом
полу в бывшем месте исчезновения; затем её видимая часть уменьшается у
фактической кромки/соседнего предмета. Она не проваливается преждевременно
под скопированный участок paving. На676 Art+Geometry и Geometry-only
согласованы по положению и кадрированию; при Art off clips не скрывают
диагностический путь. Это наблюдение actual consumer, не вывод только из
того, что source point оказался outside нового polygon.

![C03, прежнее проблемное состояние676](E:/R4D/perspective/p5-runtime/visual-qa/evidence/c03/seed4210403976-t676-field-art.jpg)

Короткое actual realtime продолжение от660 дало moving screenshots697/717:
сфера скрывается у архитектуры и появляется ниже/снаружи правого края.
AX до этих кадров был694/714; это moving наблюдения, не frozen-пары.
Обычный LOST757 сохранён и не превращён в успешный бросок ради приёмки.
Не было новых seeds, синтетических ball poses или seed-dependent исключений.

Start во всех случаях прежний: `board01-start`, native
`(33254.863169496064,33151.81331014809)`,angle90,speed0,r16,tick5ms.

| Обычный replay | Реально просмотренные paused states | Результат адресной регрессии |
| --- | --- | --- |
|4210403976|670,674,675,676,677,680;757terminal|C02-V01 устранён; новое существенное исчезновение в проверенном окне не обнаружено |
|0|1919,1930,1945,1956|В центре сохраняется partial→hide→reveal у near-ledge; полость receiver03 на1956 остаётся убедительной |
|1696420279|854,864,875Field;875Whole|Сфера проходит левую часть края без преждевременного исчезновения на полу; на875 видна внутри receiver01. C01-V01 не вернулся |
|3339315606|1590,1600,1610,1620,1630|Возле left head/стыка кромки сфера сначала видна, затем частично скрыта у камня, далее появляется над чашей. Крупного скачка слоя/пропажи на открытом полу в окне не вижу |

Проверка охватила правое плечо, центр и левую часть **изменённой** кромки с
реальными траекториями. Общая source/projection/native oracle, matrix0–3 и
неизменённая C02 style matrix не повторялись. Независимое мнение основано на
собственных кадрах, producer selfcheck не использовался вместо просмотра.

## Полный Jungle и разумная точка остановки

Полные исходные наблюдения о25предметах/4семействах, материалах, ракурсах,
свете/резкости/объёме, читаемых тенях и опоре на пол остаются в
`c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/REPORT_C02.md`.
Их предметные ограничения сохранены. Байтовое/semantic сравнение подтверждает,
что C03 не заменил этот арт или привязки; финальный Whole875 также не показал
нового разрыва цельности. Большой повтор неизменённой художественной матрицы
не добавил бы полезной информации к этой clip-only проверке.

Оставшийся **наблюдавшийся значимый** blocker C02 был именно near-ledge.
Он устранён без подгонки native geometry, размеров сферы или её траектории.
В просмотренных регрессиях нового значимого дефекта нет. Поэтому предлагаю
считать художественную доводку этой ограниченной исследовательской попытки
завершённой на C03 и передать best reasonable result CTO. Это рекомендация
VQA, не самостоятельная публикация, закрытие всего заказа или начало P6.

**Честные остатки:** actual visible entry receiver02/04 не достигнут и не
подставлялся; не просмотрены все возможные long-rail/head crossings и мелкие
moss/feather пересечения. Поднятые растения над stone seam не выделены
отдельным передним слоем; точность их редких перекрытий не доказана. Эти
границы не скрываются и не объявляются уже обнаруженными дефектами C03.
Нет нового подтверждённого дефекта P1. Technical QA, privacy/package и новый
CTO release review/token остаются отдельными воротами.

## Evidence и ресурсы

[EVIDENCE_C03.json](EVIDENCE_C03.json):31002bytes,SHA-256
`275ba4b0f3f2443f8bb62cd49eadd0646b53860e59535b5f064704868ba076f7`.
52own files/3535801bytes, включая24original JPEG screenshots, AX pairs,
guard/ownership, FRAMES и integrity/delta record. Тяжёлые bytes только
`E:/R4D/perspective/p5-runtime/visual-qa/evidence/c03/`; в Git metadata и отчёт.
Exact seed/tick/framing/MIME/viewport и отличия moving AX/screenshot ticks
записаны. C01/C02 evidence и отчёты не переписывались.

Guard01:02:16UTC: RAMtotal31.907/free15.342GiB,systemCPU15%,aggregateCPU16.583%,
aggregateWS19.968/private20.291GiB,385процессов; C/D/Efree16.288/16.281/11.999GiB.
WS может повторно считать shared pages. Own peak estimate2GiBRAM/.1GiBE,
concurrent allowance4GiBRAM/2GiBE; peak отдельно не измерялся. Eпосле11.985GiB.

Все shell-команды own E worktree, TEMP/TMP/output process-local own E.
UI C: остаётся service stub. Модель/effort/host/global settings, чужие
worktree/PIDs/devices не менялись, личный Chrome/desktop не использовались.
Own IAB3 закрыта, own server не запускался. Product edits/rebuild/new roles/
subagents/общение с другими чатами отсутствуют. Denial/ordinary failures нет.
Deploy/Review writes0; release gate закрыт.
