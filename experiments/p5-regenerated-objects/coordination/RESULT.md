# P5 — результат регенерации элементов Jungle

## Итог фактической публикации

[Jungle · сгенерированные элементы — P5 C03](https://superflight.space/review/r4d/p5-regenerated-objects/) опубликован2026-10-29T10:38:14.602775Z. CTO принял фактическую доставку в заявленном bounded scope. Token `CTO-P5-C03-PUBLIC-20261029T095644Z-623ecdd42aef` и writewindow явно закрыты CTO2026-10-29T10:55:12Z; coordinator `tokenGranted=false`. СлотP5 закрывает CTO после чтения этого итога. Lead/Release idle, P6 закрыт.

Метод дал согласованный generated Jungle на общей принятой P1/native геометрии:25предметов,4приёмника, свой floor/ball/shadow и нужные части перекрытия. В независимых просмотренных случаях подтвердились содержательные материалы, свет, объём и читаемые тени. Полезная коррекция C02→C03 — near-ledge contour перетрассирован по всей каменной кромке: шар больше не исчезает над открытым полом. Обе QA закрыли C02-V01; native/геометрия/траектория не подгонялись. Остановка доводки обоснована исправлением наблюдавшихся значимых ошибок и адресной регрессией без нового значимого дефекта в этих cases.

Остатки: actualentry receiver02/04, всеиндивидуальныеcontacts/rail/head/rarecontour crossings и прежние coveragegaps не проверены. Общий FullArt/P5 PASS не присвоен. Delivery smoke ограничен опубликованным prefix, existingseed0 replay,+1tick иArt/Geometry; полные production/native/QAматрицы не повторялись.

Доставка:29/29HTTPfiles,21675411bytes,exactSHA/MIME/cache/securityheaders; actualUIrendered,consolewarn/error0. Обаdocs получили по908bytes через guardedO_APPEND с сохранением каждогоoldprefixbyte/uidgidmode/dev/inode. Oldroot исоседи сохранены opaque отдельнымиinode; archive/backup/old+newroots retained, ownlocknonce/dev/inodecleanup завершён. Подробные before/after/protectedguards/docprefixreceipts и retainedpaths — [FINAL_RESULT_C03.md](FINAL_RESULT_C03.md).

Exactdelivery: `680468cc0680710c8510315d4effa9e32fa18c6f:experiments/p5-regenerated-objects/release/DELIVERY_C03_TOKEN_FINAL_01_COMPLETED.md`,8359bytes/SHA256 `676f2591204f4214eebd3b0cf3fd723d0aac7663977b3d37b9a34ffa92da1f1d`. `DELIVERY_COMPLETION.json`:6118bytes/SHA256 `f640efb88d271c9e00cd618645949d874cf00b959053e0ffce3c094008b459ba`. ExactlocalC03 source остаётся `3c2105820d8dbefc971fe97fc7086f743b9b9721`; finalTQA `9b2eb998ea6aba6272097b955e0a53d97234dbd9`, finalVQA `e227f3874c19539b7d38f0b8d318a911e7db2915`.

## Сохранённый локальный итог и история

Ниже сохранён текст локального checkpoint3c210582 без изменения рецепта, попыток, источников и тогдашних ограничений; текущий delivery/token/window статус приведён выше.

Лучший локальный результат — frozen **c03**: собранный PixiJS/native стенд с заново сгенерированными препятствиями, полом, шариком, тенями и частями корзин. Доступные значимые дефекты c01/c02 исправлены и проверены в движении. Это результат ограниченной исследовательской попытки; опубликованной демкой он станет только после отдельного exact CTO review/single-use release token и проверки доставки. Server writes сейчас 0. Переход P6 этой команде не поручен.

## Что получилось

17 уникальных generated PNG дают 23 texture IDs и 64 instances: 25 obstacle bodies, 25 shadows, шарик и его тень, четыре пары back/front чаш, floor и три foreground parts. Несколько far/mid/near вариантов сохраняют семейства исходного Jungle. VQA в полной сборке увидел согласованные материалы, свет, объём, читаемые тени и опору; явного ощущения наклеенных спрайтов в просмотренных кадрах не отметил. Геометрические числа сами по себе художественным PASS не считаются.

Метод P5 соблюдён: оригинальный JPG и его вырезки использованы как референсы, production изображения сгенерированы заново. Artist сохранил 27 actual imagegen invocations, prompts/refs, raw/rejected/selected связи и измерения. P0 geometry guides служили направляющими для генерации, а не финальными примитивами. Реализации, арт, маски, кандидаты и findings P2–P4/P6 не использовались.

Основания привязаны к принятой P1 геометрии через измеренные texture-local anchors/footprints и равномерный масштаб; XY warp и изменение colliders ради пути не применялись. Максимальный измеренный body depth residual — 3.2958589851 source px. Он сохранён как остаточная погрешность, а не скрыт подгонкой физики.

Foreground использует renderer clip того же **нового generated floor**, с точными source1536 polygons и теми же bitmap bytes. Это не отдельная генерация каждой foreground части и не вырезка исходного JPG. Пробы отдельного foreground не удержали регистрацию; rejected сохранены. В c03 near-ledge contour следует верхнему шву каменной передней грани, исключая открытый пол. Serpent regions остались прежними; длинные rails не полностью разделены на части.

Для чаш объявлено единое правило optical/logical anchor: рисунок чаши поднят примерно на 17.8 source px относительно logical plane, чтобы учесть высоту видимого центра billboard sphere над её bottom anchor. Одно правило рассчитано для всех четырёх чаш; это реальное изменение арт-привязки, не заявленная ошибка измерения и не seed/tick поправка. Native/source centers, radius16 и physics не менялись. Actual entry подтверждён на receiver01/03.

## Лучшие frozen bytes

| Поле | Точная версия |
|---|---|
| Public root | `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public` |
| Inventory | 29 файлов / 21675411 bytes |
| Index вне public | 11618 bytes; SHA256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d` |
| Consumer source pin | `af23e124cf5bd1d9de884082ffbc993448217112`, prefix `experiments/p5-regenerated-objects/builder/`; код тот же, что c02 consumer398b |
| App | 571012 bytes; SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c` |
| Artist mini03 | `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-03.json`; 89838 bytes; SHA256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0` |
| Staged manifest | 66026 bytes; SHA256 `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91` |
| Private native | `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, sim-core tree `008d16a80a26bb77d562a45218b01da09b0d9ff0` |
| Accepted P1 | `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; полные config/projection/view-math hashes в index |
| Local preview | `http://127.0.0.1:55185/`, Builder PID12500/session67163/rootc03; owner проверять fresh перед использованием |

Точные build/dependency/lockfile/PNG pins, inventory и reproducible command — в producer `12e02702480ff84bf8ade352375bfb2797a6d0b0:experiments/p5-regenerated-objects/builder/HANDOFF_C03.md` и index. Пересборка при выпуске не нужна. Raw private native TS/maps, generation staging и QA evidence остаются вне public root. Release local audit `6c08ddd4db346bc70b1e65925497e23072400d59:experiments/p5-regenerated-objects/release/PREFLIGHT_C03.md` подтвердил 29/29 файлов, 27 unchanged от c02; изменены только manifest и preview-input metadata. License/PNG/privacy checks перенесены после hash identity; изменённые JSON проверены адресно. Полная криптографическая C2PA-валидация не заявляется.

## Проверки и исправления

| Версия | Материальный результат | Дефект и дальнейшая коррекция |
|---|---|---|
| c01 / mini01 | Первый реальный Pixi/native набор: четыре семейства, floor, ball/shadow, receiver; independent TQA/VQA | Visible sphere оказывалась на far rim при верном native IN_BUCKET; Field обрезал чашу. В c02 введена общая sphere-height anchor policy и расширен Field |
| c02 / mini02 | Полные 25 pins/4 receivers; реальные contacts четырёх семейств, left-2 bounce, leaf/wood overlap и foreground transitions; 100 independent native/control snapshots | Ordinary4210403976/674–676 показал false occlusion над открытым полом. Обе QA локализовали near-ledge polygon; native/P1 верны. Artist исправил всю кромку, не отдельный seed |
| c03 / mini03 | Тот же app/PNG/native; только clip data delta. Обе QA увидели шар над прежним открытым полом и сохранившиеся hide/reveal, receiver01/03 | В адресных проходах новых значимых дефектов не обнаружено. Неисследованные crossings отделены от обнаруженных дефектов |

Source oracle TQA `4e989becd94a3e25b22988ca644c608b04c4528b` проверил exact37file native export, 1922 projection points и обычную seed0–3 matrix. C02 TQA `a3fac041969bcc287ae5fbb0c25a53a71034d4ea` и VQA `c662b0badfb5e44fb5ab6a55a8152f1570d18f0f` находятся в `experiments/p5-regenerated-objects/qa/{technical,visual}/REPORT_C02.md`. C03 является адресным successor: неизменённые матрицы не выдаются за новые исполнения.

Final VQA `e227f3874c19539b7d38f0b8d318a911e7db2915:experiments/p5-regenerated-objects/qa/visual/REPORT_C03.md` закрыл C02-V01;24own JPEG и pin index сохранены. Final TQA `9b2eb998ea6aba6272097b955e0a53d97234dbd9:experiments/p5-regenerated-objects/qa/technical/REPORT_C03.md` закрыл его независимо:39snapshots,30exact cached independent trace comparisons,9lefthead scoped snapshots. Для промежуточных lefthead states independent per-tick trace не заявлен; local replay/view invariance и старый native terminal проверены отдельно. Обе QA проверяли именно index17838d и manifest13f443, а не случайный HEAD. Полные evidence pins сводятся в [рабочей карточке](STAGE2.md).

Actual runtime проверяли независимые QA в собственных браузерных вкладках: кадры до/во время/после контактов, боковой отскок, частичное и полное скрытие с появлением, вход в чаши, Art/Geometry/Whole/Field, pause/step/replay и неизменность config/state/RNG. Art off убирает и маски; диагностическая геометрия остаётся сверху. Числовая привязка и source topology не подставляются вместо просмотра.

Обычные исходы сохранены: seed0→receiver03/1956;1696420279→receiver01/875;3957814979→LOST847;3339315606→LOST1709;1858573514→LOST843;2608986051→LOST1175;4210403976→LOST757;3226456662→LOST1405. Новые seeds ради красивого результата или входов в другие чаши не искались. Native radius16, tick5ms, gravity980, maxspeed2000, noise2deg/.02, lcg32 и accepted geometry/projection прежние.

## Пределы и следующая разумная работа

Entry receiver02/04 в движении не достигнут; все25 индивидуальных контактов, все directions/center-sort flips и все rail/head crossings не просмотрены. Полные длинные rails не partitioned; coarse serpent edges и растительность сохраняют риск в непроверенных местах. Это ограничения coverage и метода текущего набора, а не доказанный новый defect в каждом таком месте. Универсального PASS перекрытиям не выдаём.

При будущем конкретном problem replay полезно проверить фактический силуэт и разделить нужную часть, сохраняя native/P1. Поиск и исправление гипотетического каждого редкого crossing не является завершённой проверкой. Текущая остановка предложена после устранения наблюдённых значимых доступных ошибок и адресной регрессии; она не объясняется исчерпанием бюджета и не доказывает предел метода. Ориентир8–12 активных часов не используется как автоматический PASS/cutoff; active wall-clock отдельно не инструментирован.

Точная оценка ограниченной попытки и допуск к публикации принадлежат CTO. До нового single-use token server writes0; существующий PUBLIC target `/review/r4d/p5-regenerated-objects/` ещё не означает, что c03 там опубликован. Модели/effort/host/global settings/env/security/credentials не менялись; новых ролей/chats/worktree/subagents и запуска P6 не было. Lead вёл координацию и документацию, не заменял Artist/Builder/QA.
