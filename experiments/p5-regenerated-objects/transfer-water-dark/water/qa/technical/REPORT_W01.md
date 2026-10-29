# Water w01 — scoped actual Technical QA

2026-10-30, Europe/Kyiv. **Проверенный технический scope пройден; visual scope частичный.** На настоящем Pixi consumer подтверждены выбранные состояния/события настоящего ядра, точные UI-действия и рассмотренные контакты pillar-03. Нового воспроизводимого дефекта в этом subset не найдено. Это не Water/P5 full PASS: w01 содержит только floor, ball/ball-shadow и pillar-03/04 с тенями.

## Frozen bytes и условия

Consumer `41349b8d8ae61ceb69e288301af7c080e2b006b5`, Artist `094301dda9a43e7b4970af9d9af20982a38fb221`. Root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w01/public`, actual URL `http://localhost:55188/`. Builder listener127.0.0.1:55188/PID38664 не изменён и не остановлен. Свой IAB tab создан в фоне и закрыт после QA; viewport не переопределялся. Проверяемый продукт и физические входы не редактировались.

FILE_INDEX:4851 bytes/SHA `b65666c1c942d71763115f05744358ef45463f0fa528a4da0e9f0b8b3d912c4e`. Все17 перечисленных public файлов проверены по физическим bytes/SHA и по HTTP200 с теми же bytes/SHA. Source Artist manifest из точного Git commit:13990 bytes/SHA `7d551ff2eebfeef6f23674c140836f010ed16b6da11b42822af708f92c292981`; staged manifest10228 bytes/SHA `bf468e44bf8bacbab8d810a1a86a57228515abc2c665397b45e8b2ea80313fe2`. Пять PNG и семь instances; SHA, groundAnchor и footprint metadata соответствуют source manifest.

Config27231 bytes/SHA `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`, P1 manifest15870 bytes/SHA `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` совпали с собственным oracle `761e6087c902fe5ea941b90b5ce4d72383a0d755`. Accepted Water04/trial-02; core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`; r16/tick5ms/quantize7/g980/maxspeed2000/noise2deg/0.02/lcg32 сохранены. Dependency pins: Pixi8.17.1, esbuild0.25.12; runtime metadata и consumer source показывают Pixi Application. Новый независимый запуск/экспорт/компиляция ядра не выполнялись; браузер сравнивался с уже сохранёнными traces0–3.

**Handoff correction, не product finding.** Первый handoff называл `public/index.json`. Один HTTP GET `/index.json` дал404; это сохранено в frozen-verification и раннем commentary. Lead уточнил: правильный sidecar находится вне public, рядом с FILE_INDEX; HTTP delivery не требуется. Физический `.../w01/index.json`:12125 bytes/SHA `6b30fdf4f76d665c8d9aeb2c9d9b6d9e0398da3caa2326fa462a8ca37e7d4ce1` подтверждён. Причина404 — неверный путь в handoff, не consumer/native/packaging defect. Повторного GET и исправления frozen файлов не было; clarification сохранён отдельно.

## Actual state и управление

Сохранены **40 actual browser snapshots**. Для каждого полное native state, RNG, config с соответствующим seed и event prefix сравнены с собственными traces: совпадение точное. Это40 выбранных наблюдений, не сравнение каждого тика live consumer. Никакого расхода RNG от проверенных view действий не обнаружено. Read-only CDP использовался для чтения `__P5__`; все действия выполнялись настоящими UI controls.

| Действие / seed | Наблюдение |
| --- | --- |
| +1 и +10 | Seed0:0→1→11, точное совпадение oracle |
| Exact seek | Проверены промежуточные contact ticks, обратный seek и seek3200; последний останавливается на реальном terminal tick |
| Replay | Seed0 reset в0 и повтор state586 совпали с первым state586 и oracle; seeds1/2/3 выбраны через поле Seed + «Повтор» |
| Pause/Continue | Actual движение575→644, затем две независимые записи паузы644 идентичны; просмотрено движение445→515 у бокового контакта |
| Art/Geometry/framing | 10 явных пар одинаковых native states, включая RNG; config проверен отдельно для всех40 snapshots |
| Geometry над art | Контуры реальной принятой геометрии видны поверх floor, pillar bases и ball; отдельное выключение Geometry работает |
| ArtOff / both off | ArtOff убрал floor/pillars/sphere/shadows, геометрия осталась; both off дал пустую сцену |
| Terminal +1 | IN_BUCKET1275 не продвинулся после +1, state/RNG не изменились |
| Browser errors | Захваченный список error/warn пуст |

Обычные заранее объявленные seed0–3, без отбора/новых seed:0 LOST1326;1 LOST1196;2 IN_BUCKET receiver-02 tick1275;3 LOST589. Все terminal states/RNG/events/config совпали. Кнопка «Новый бросок» со случайным новым seed и файловая загрузка «Сохранить повтор» в этом ограниченном проходе не проверялись; replay record читался прямо из actual consumer.

В w01 нет `sourceClip` parts. Успех ArtOff здесь подтверждает отключение подключённых изображений, но **не доказывает** будущий mask-specific bypass. Пауза/seek snapshots точны; running screenshot снимается после чтения state и может показывать более поздний tick. Такие кадры отмечены `motion-*` и не выдаются за атомарную пару JSON/image.

## Supported artwork: что просмотрено

| Target / случай | Seed и exact ticks | Вывод в рассмотренном случае |
| --- | --- | --- |
| pillar-03 front, edge03 event585 | Seed0:585/586/587; дополнительно584 и583; actual motion575→644 | Сфера подходит к передней видимой опоре и отскакивает, остаётся перед ней; пустого места вместо опоры или ошибочного исчезновения в этих кадрах не видно |
| pillar-03 side, edge04 event457 | Seed2:457/458/459; actual motion445→515 | Боковой отскок расположен у левого видимого основания, состояние/RNG меняются на штатном шаге458; заметной подмены контакта артом не найдено |
| pillar-03 near upper silhouette | Seed0:165/180 и real-time165→terminal | Это просмотр подхода, а не доказанный проход за столбом; substantial overlap сзади не установлен |
| pillar-04 | Общий whole/field кадр, seeds0–3 | Статическая привязка/масштаб просмотрены; контакт и скрытие UNVERIFIED: ни контакта, ни sampled silhouette intersection в этих traces нет |
| receiver-02 terminal | Seed2:1274→1275, затем +1 | Native trigger работает, но visual entry/front rim UNVERIFIED: receiver art отсутствует |

Для исходной регистрации использован accepted target centroid. У обоих столбов target footprint79×28 source px, uniform scale0.1112676056; authored depth после uniform scale27.90676, delta−0.09324px. Source renderer задаёт одинаковые scaleX/Y; в просмотренном кадре основания близки к контурам, заметной растяжки/оторванного основания не видно. Это не пиксельное совпадение faceted silhouette с четырёхугольником. Отдельные компактные тени под столбами и у шарика видны в field framing; на whole они слабее и малы. Полноту направленной cast-shadow/light consistency всей доски этот subset не подтверждает.

Generated floor положен равномерно1254→1536, без XY warp и смены projection. В whole виден полный plate, в field — игровой фрагмент; контуры не съезжают при Art/Geometry переключениях. У supported bases floor выглядит опорной поверхностью. Контуры приёмников сейчас лежат над нижней водой: это ожидаемая незавершённость нового floor/receiver/environment набора, не visual entry PASS и не повод менять accepted config.

Для выбора доступного overlap дополнительно прочитаны alpha128 нового sphere/pillar и **только cached traces0–3**:535 внутренних точек sphere на candidate states. Proxy нашёл front overlap pillar-03 у seed0 ticks544–612 (максимум583), слабый side overlap seed2 state458, и не нашёл substantial behind overlap либо overlap pillar-04. Это средство выбрать кадры, не самостоятельный visual verdict. Вслед за ним actual state583/geometry overlay просмотрены в браузере. Ранние имена файлов `*-behind-*` обозначают предпринятый просмотр области, а не подтверждённое скрытие. Восстановление невидимой части шара/переключение порядка за столбом остаётся UNVERIFIED.

## Открытое и evidence

19 отсутствующих object groups, все4 receivers, arches/feet/lintel/opening art и environment/rail/foreground parts не получают visual PASS. Arch-07 остаётся diagnostic geometry; численный проход prep не стал rendered gate case. Редкие углы, скрытие сзади и masks проверяются после появления соответствующих частей; отдельная охота за удачными seed не запускалась. Новых исправлений consumer/art/config этот отчёт не вносит. Следующий полезный QA — frozen candidate с новыми arch/receiver/foreground parts, сохраняя w01 для сравнения исходного способа.

Runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w01/`:40 snapshots,23 screenshots, comparisons, frozen-byte check, logs и clarification. Evidence index11580 bytes/SHA `44073053d4967fd3c35d15ee258b6d5b1a7c05995fa1a852bc5e439610c87a9d`,73 файла/6782483 bytes; source refs и screenshot hashes — `W01_EVIDENCE_PINS.json`. Представительный нормальный paused frame: `screenshots/s0-t583-front-silhouette.png`; registration overlay — `s0-t583-registered.png`. Full-page capture также сохранён, но вывод контактов основан на обычных viewport screenshots и exact paused states.

Fresh guard до браузера: free RAM≈10.65GiB, C/D/E≈14.55/14.65/9.69GiB, CPU1%; после≈10.23GiB, C/D/E≈14.04/14.65/9.68GiB, CPU3%. Оценка своего browser/runtime RAM1GiB/E0.05GiB + allowance соседям4GiB/2GiB выдержана. Затраты на диске6.78MB; STOP/denial не возникали. Browser закрыт; producer listener не тронут. `serverWrites=0`, `tokenGranted=false`; Jungle/w00/d00/w01 preserved, Dark prep не изменён. Этот отчёт не является release/privacy/publication approval.
