# Water w04 — scoped actual Technical QA

2026-10-30, Europe/Kyiv. **Sampled native/control checks пройдены; visual результат PARTIAL.** Независимо подтверждён открытый дефект `W04-TQA-V01`: receiver-02 почти полностью скрывает шар своей нарисованной водой до смены порядка в1275. Проход arch-07 с двумя касаниями и partial hide/reveal показан на исходном whole-sprite baseline. Это не Water/P5 full PASS.

Consumer `48763f47d1e21e32334df3427209181a5a6114de`, Artist `541085603e01e23b076fe33ff3c9991822c0bce2`; URL `http://127.0.0.1:55192/`. Frozen root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w04/public`. Own HEAD при старте `b16653cfecc5ecd8f94cf41fbe2d5c0f353dba76`, чистая собственная ветка. Listener127.0.0.1:55192/PID37932 совпал с producer owner record; процесс не изменён.

## Точные входы и повторное использование

FILE_INDEX6632 bytes/SHA256 `c1c983dbddaaf556c5000dc9463df262fdc38444b2826a5883a2800b78b70554`. Все21 public-файл совпали по bytes/SHA физически и через HTTP200. Source manifest44339 bytes/SHA `50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f`, staged30754 bytes/SHA `e982264b077f4b55ebc0b3f53f4bceffbdb96cc1cd383eefd5831dfab1baf6d5`. Source/staged instances совпадают;9 unique PNG/15 texture IDs/30 instances. Все6 supporting records проверены из точного Artist commit, включая ARCH_BASELINE, ground proxy и RECEIVER_ANCHOR_POLICY. Metadata sidecars вне public; их HTTP-выдача не проверялась и не требовалась.

14 public-файлов, включая config/P1/targets/deps и5 прежних PNG, совпадают с w01. Native controller blob в обоих consumer commits одинаков: `5f2e1ea73ee3bfda9319fcb7d3489633585fc584`. Поэтому использованы собственные prep traces `761e6087c902fe5ea941b90b5ce4d72383a0d755` и prior actual QA `b16653c`; экспорт/компиляция ядра, Jungle matrix и старые40 browser snapshots не повторялись. Accepted Water04/trial-02 config SHA `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`, P1 manifest SHA `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`; core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`. Физика/геометрия/проекция/старт/PRNG не менялись.

Все **37 новых actual snapshots** совпали с cached oracle по полному state/RNG/config/event prefix; загруженный в browser art manifest также совпал с frozen staged. Это выборочные наблюдения, не сравнение каждого live тика.10 пар подтвердили одинаковое native state при Art/Geometry/framing, восстановлении вида и terminal hold; framing domain неизменен на всех snapshots. +1, seek, Replay и Pause/Continue использованы реально. Geometry выше арта; ArtOff удаляет подключённые изображения. SourceClip parts отсутствуют: mask-specific bypass не получает PASS.

LOST не отбрасывались: на w04 сохранён seed1 LOST1196 и seed2 IN_BUCKET receiver-02/1275. Полная обычная серия prep/w01 сохраняется:0 LOST1326,1 LOST1196,2 receiver02/1275,3 LOST589. Terminals0/3 на w04 повторно не проверялись. Новых seed или native oracle runs нет.

## W04-TQA-V01 — painted water закрывает шар до entry

**Repro:** Seed2 → Replay → seek1273 → ArtOn/GeometryOff → +1 до1274 → +1 до1275. На1273/1274 шара в открытой нарисованной воде не видно; на1275 он появляется. Проверены также1272, Geometry/ArtOff на1274, real-time1250→1273 и продолжение1274→1275. После +1 на terminal state остаётся1275, физического1276 нет. Native coordinates, RNG1581479664, events и result во всех этих точках совпадают с oracle. Sinking/fade или дополнительного post-terminal движения нет.

Offsets −1/+1 **уже присутствуют** и в source, и в staged. Target radius/depthRadius=30.6373122765; centerY=35187.0899121873. Exact consumer formula даёт back=35156.4525999107, front=35217.7272244638. Значение35156.4526 не равно centerY: это center−radius. Гипотеза о пропущенном offset/radius mapping не подтверждается и снята также уточнением Lead.

| State | Native ball Y | Относительно back | Что видно |
| ---: | ---: | --- | --- |
| 1273 | 35149.9855180 | ниже в painter order | Шар практически скрыт водой back raster |
| 1274 | 35154.3192034 | ниже back | То же |
| 1275 | 35158.6773888 | выше back | Шар появляется в воде, IN_BUCKET |

Независимо прочитаны exact PNG pixels по принятой uniform registration: в1273 центр сферы попадает в back texture `(573.70,428.22)`, RGBA`[0,123,132,253]`; в1274 —`(585.41,436.56)`, `[2,130,138,253]`. Это бирюзовая вода, не каменный передний обод. Все535 sampled внутренних точек сферы накрыты back alpha252–253, у front те же535 точек имеют alpha0. Другие receiver parts в этом месте не дают такого закрытия. В1275 меняется относительный depth, поэтому та же water raster оказывается под шаром. Source PNG отдельно просмотрены: back содержит **всю чашу с водой**, front — передний корпус с прозрачной aperture.

Классификация: **ограничение подготовки частей/общей глубины full back raster в baseline**, не ошибка native trigger или скрытая подгонка config. Совпадение depth crossing с terminal tick не является специальным условием IN_BUCKET: positionSprite использует обычный nativeY. Optical policy по новым измерениям523/1052/230 проверена для всех4 aliases; back/front anchors совпадают, receiver02 logical anchorY559.7149517742 и общий visual cup shift−18.6442sourcepx. Эта политика регистрации сама по себе не разделяет воду и solid rim по глубине.

Практический следующий шаг в отдельном successor — разделить рисуемую поверхность воды/внутренность и закрывающий задний борт, затем повторить тот же approach. Геометрию/trigger/seed под рисунок не менять. Ремонт не выполнялся; w04 исходный baseline сохранён. Direct Pixi zIndex read попытка не дала измерения; численные depths выше рассчитаны по exact frozen code/inputs и согласуются с actual сменой видимости. Это ограничение измерения явно сохранено в `qa-tooling-note.json`, а не выдано за прямое чтение объекта.

## Arch-07 и доступные дополнительные случаи

Seed1: сохранены exact1012/1013/1014 для right-foot event1012 и1018/1019/1020 для left-foot event1018, а также998/1008/1015/1031. Native/RNG меняются на post-step1013/1019. Реально просмотрен fragment998→1031: шар частично закрывается непрозрачной перемычкой, раскрывается в прозрачном проёме, касается обеих внутренних сторон и выходит на открытый пол. В перечисленных кадрах полного исчезновения над открытым полом после выхода не обнаружено. Это **проход с касаниями**, не свободный пролёт.

Whole arch baseline: target123×25sourcepx, rendered footprint depth18.591885, residual−6.408115px, provisional anchor uncertainty±2.936px; задняя кромка выведена приближённо. Порядок меняется около assembly centerY34755.1235 между1014/1015. Отдельные posts/lintel не selected; их улучшенная подготовка не подменяла baseline. Прозрачный void подтверждён actual кадрами и alpha query; общий PASS всех ракурсов/высоты/редких контуров не присвоен. P1 остаётся плоской навигацией с двумя foot loops, без lintel/height collider.

Дополнительно seed0 frog-01:105/106/107, видимый шар у левой стороны нового frog; sampled state/RNG/native contact корректны, грубого пустого места вместо силуэта не найдено. Новый pillar-05:469/470/471 native контакт подтверждён; в этих кадрах шар закрыт body, поэтому отдельный **видимый** контакт/все грани не получают PASS. Остальные новые pillars просмотрены статически, полноценная матрица граней не повторялась. Receiver01/03/04 entries и все front-rim silhouette contacts остаются UNVERIFIED; в выбранном receiver02 entry front raster над сферой прозрачен, это не проверка касания переднего обода. Missing5 frogs/7 arches/environment foreground clips и маски не объявлены ненужными или исправными.

## Evidence и сохранность

Runtime `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w04/`:37 snapshots,27 screenshots, alpha/depth analysis, optical-policy check, comparisons и records. Index13215 bytes/SHA `6911d40f5efefe8da99e6f1e47c7438c15ce783e4d46506f1e25a4f07190bdfe`,83 файла/8928707 bytes. Все ссылки/SHA в `W04_EVIDENCE_PINS.json`. Нормальные paused screenshots — `s2-t1273-cup.png`, `s2-t1274-cup.png`, `s2-t1275-entry.png`, `s1-t1008-gate-partial-reveal.png`, `s1-t1013-gate-right-contact.png`. Running image снимается позже state read и не объявляется атомарной парой с JSON.

Попытка временного debugger чтения вызвала QA timeout/reset и неудачное frame expression чтение. Breakpoint снят, debugger resumed/disabled, UI восстановлен; продукт не исправлялся. Восстановленный numeric index slider уточнён по новой AX tree. Это tooling failure, не consumer finding. Browser error/warn capture пуст. Свой tab закрыт. Guard до browser: RAM≈10.28GiB, C/D/E≈14.30/14.64/9.54GiB, CPU18%; после≈10.19GiB и13.91/14.62/9.46GiB, CPU0%. Оценка своего RAM1GiB/E0.1GiB + резерв соседям4/2GiB выдержана; runtime evidence≈8.93MB. STOP/denial не возникали. Producer process и frozen/public не изменены; Jungle/w00–w04 и Dark prep сохранены. `serverWrites=0`, `tokenGranted=false`; release/privacy approval не выдавался.
