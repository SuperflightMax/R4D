# Water P3 — Builder

## Текущий checkpoint — DELIVERED / PREVIEWS_ALREADY_ABSENT / IDLE

По завершающему сообщению Lead оба результата прошли QA, обе публичные страницы
LIVE16:40:46Z и Lead IAB smoke +10ticks PASS; все QA/read holds сняты.
Это итог Lead, новая QA/публикация Builder здесь не выполнялась.
Fresh cleanup audit16:49:16–17Z: Water PID29572/6868, oldDark PID37660/6869,
currentDark PID15752/6870 уже отсутствуют; listeners на всех трёх портах нет.
Starttime/commandline отсутствующих процессов получить нельзя. StopIssued=false:
никакой процесс не останавливался и не затрагивался; причина прежнего выхода
не установлена. Старый PID17380 не запрашивался/не трогался.
Receipt вне payload: E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\
preview-stop-receipt-20261029-final.json и .manifests.json.
Локальные manifests Water04 de1344af...ce2c6, Dark03 b3923f4c...d0307 и Dark04
d180e5a6...4ed1b неизменны. Все frozen/raw/source/evidence/папки сохранены.
Собственная ветка та же, после commit/push — idle. server_write=false.

## История — WATER_FRONT_EDGE_04_FROZEN_FOR_BOTH_INDEPENDENT_QA

### Временный original FULL A/B preview — ЗАКРЫТ ПОСЛЕ ЧТЕНИЯ

Lead/VQA явно завершили OLD6870 чтение и сняли read-hold. 11:52:26Z остановлен
ТОЛЬКО owned PID17380/session14523 после повторного exact command/root и
127.0.0.1:6870 listener proof. Owned process exited; PID17380 и listener6870
после stop отсутствуют. Old FULL bundle/raw/history сохранены, manifest b3c69767
не изменился. Water6868/PID29572 и Dark6869/PID37660 остались на прежних roots;
оба HTTP200 и local/HTTP manifest hashes de1344af...ce2c6/b3923f4c...d0307 совпали.
Ownership evidence вне payload: water/evidence/ab-full-baseline-03/
preview-stop-6870.json и current-previews-after-6870-stop.json.
Fresh11:50:13Z: RAMfree16.136/31.907GiB, CPU0%, C16.099/D16.268/E11.690GiB.
Никаких rebuild/payload edits/delete/cleanup/current-port изменений не было.
Новый Dark variant не собирался. После commit/push — idle; server_write=false.

История запуска и изолирующей привязки:

По конкретному поручению Lead запущен дополнительный owned loopback preview
УЖЕ СУЩЕСТВУЮЩЕГО immutable full-method-03, без rebuild или edits payload:
http://127.0.0.1:6870/review/r4d/p3-masks-water/,
PID17380 / exec session14523. Root:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\full-method-03.
SOURCEc73d6128970b2b022d5313b08c34cafdec9a1bc3,
ART17dc9fcdc261562acb581dd8590096819734c807, prefix
experiments/p3-masks/transfer/water/asset-artist/.
Manifest SHA256b3c697675ecd76af7848fa72367f943c1b9e4a27b325b098a9fef08135fe58d3,
manifest16695 bytes;97 payload/3470168 bytes;98 total files/3486863 bytes.
Actual board/source/ART identity, все97 local+HTTP hash/size и JS MIME совпали.
6868 corrected и6869 Dark не переключались/не останавливались; их HTTP manifest
SHA остались de1344af...ce2c6 иb3923f4c...d0307 соответственно.

Artist установил отдельный confound: early4eb→full17dc не render-equivalent,
суммарная opacity трёх arch07 masks отличается в466 source pixels из-за порядка
масштабирования/отсечения частей. Early7 кадры сохраняются как первый symptom.
Изолирующий A/B теперь именно original FULL17dc/6870 против corrected5c/6868.
Builder независимо подтвердил: все73 PNG этих двух FULL версий, app renderer,
run-model/view-math/native-core, accepted config/manifest/projection, source JPG
и Pixi совпадают побайтно. Изменены только24 arch depth records и служебные
provenance/replay-menu записи. Это identity-проверка, не новый полный QA old.

По явному сообщению Lead независимый VQA full17dc↔5c A/B подтвердил локальное
исправление W-EARLY-POP-01 и равенство parstates/73PNG. Formal full Water QA
ещё идёт; это не полный PASS. VQA закрыла свою old вкладку, сервер не трогала.
Все frozen bytes неизменны. Read-hold6870 снят; stop выполнен с proof выше.
Fresh system-wide перед стартом11:18:09Z: RAMfree16.645/31.907GiB, CPU0%,
C17.035/D16.275/E11.763GiB. Port6870 был свободен; bind exclusive127.0.0.1.
Дополнительный idle Node preview оценён <0.1GiB RAM и несколькими KiB evidence.
Audit: собственный runtime water/evidence/ab-full-baseline-03/{identity.json,
http-verification.json,preview-ownership.json}. server_write=false.

### Полный corrected candidate и сохранённый selfcheck

Lead прямо изменил порядок: оформить full frozen candidate сейчас; VQA начнёт
полный Water-проход со сравнительного retest старых1014–1016 и новых1020–1022,
затем остальная матрица на ТЕХ ЖЕ bytes. Dark QA не прерывается.
Имя water-front-edge-04, immutable bundle front-edge-04 ниже. Никакой новой
сборки/перепаковки после freeze не было. При seal все100 файлов ещё раз
побайтно сверены с существующим manifest; hash/size/counts ниже неизменны.
Freeze record вне payload:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\candidates\water-front-edge-04.freeze.json.

W-EARLY-POP-01: по сообщению Lead независимый full A/B VQA подтвердил локальное
исправление; formal full Water QA продолжается. Selfcheck не выдаётся за QA PASS.
Формальная исходная VQA:26295340cafa78ea8bffe09e8005badda220d731,
experiments/p3-masks/transfer/water/visual-qa/early-art-02/REPORT.md.
Нового установленного существенного selfcheck-дефекта для front-edge-04 нет.
Это кандидат для TQA/VQA, не full artistic/method PASS. Все first-method/early
результаты и плохие runs сохранены. Source/ART/native/P1/provenance ниже.

Оба preview держать на named frozen bytes до явного завершения QA чтения:
Water6868 PID29572/session61378; Dark6869 PID37660/session87426.
Собственные браузерные вкладки после handoff закрываются; серверы остаются.
Новых продуктовых задач и server/release действий не начинать. server_write=false.

## Проверенная сборка и selfcheck — FRONT_EDGE_04

Source5196c0bd4981992c4e3d9678438aed1aa1c0d84c,
ART5c9ba8c640b344094e0ada7c4ed6c9ec076550e5, exact selected prefix
experiments/p3-masks/transfer/water/asset-artist/variants/arch-front-edge-01/.
assets.json SHA2564a5bc16f69146fe26a3e3893fcf3c1c8e5b943400bc65d5215cb41d58efeece6.
Все74 raw consumer bytes проверены против Git/hashes/extracted packet;
внешний Artist manifest7f260deb...3454 также совпал. Все73 PNG, ball/shadow
параметры и остальные47 occluders побайтно/структурно прежние; только24 arch
depth records изменены. Правило — midpoint near/front edge принятой feet.
Renderer app.js SHA760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6
не изменился, как и native/config/source/projection. Tooling только явно
выбирает named variant и сохраняет фактический prefix/variant в provenance.

Named immutable retest bundle:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\front-edge-04.
100 payload files/3561039 bytes; file-manifest.json SHA256
de1344afcb197115b76cb4006ead3d96e7b2581a1a299df1100d7a552d2ce2c6.
Owned URL http://127.0.0.1:6868/review/r4d/p3-masks-water/,
PID29572 / exec session61378. Early02 процесс17640 остановлен только после
command/root/port proof и явного снятия Lead read hold; старые bytes не тронуты.
Dark6869 остаётся frozen full-method-03; не переключать его.

Все100 local/HTTP bytes/size/MIME и exact native replay пяти seeds проходят.
Ordinary browser seed1 вновь прошёл от старта до LOST1196. Сохранены34 actual
Pixi full screenshots seed1/1006–1022 при100% и200%, с видимыми seed/tick и
variant source; raw capture-log в water/evidence/browser-front04/.
Ключевые1014–1016 и1020–1022 просмотрены: прежнего скачка1014→1015 и заметного
скачка на новом1021 selfcheck не выявил. Это ограниченное наблюдение, НЕ VQA PASS.
Read-only source-alpha estimate на всех1197 настоящих native states нашёл
единственную смену arch07 predicate на1021, residual sphere overlap0.000017
доли (~0.0017%). Это лишь численный контроль переноса threshold, не Pixi-proof.
Его воспроизводимый script/data — water/evidence/depth-scan/. Никаких PNG edits.

Дополнительный bounded selfcheck завершён. Все пять заранее объявленных seeds
реально завершились в browser:0 LOST1326,1 LOST1196,2 receiver02/1275,
3675989190 LOST934,2939425288 LOST984. Ни один плохой исход не отброшен.
Полный downloaded browser checkpoint seed3675989190/t934 структурно совпал
с native replay вплоть до config/rng/state; evidence large-seed-browser-replay-check.json.
Actual соседние кадры: seed0 pillar05/469,pillar03/585,arch04/697,frog05/996,
right4/1038,near-divider3/1122,arch08/1147; seed2 arch03 right-foot350/685,
left-foot893,near-divider1/1082,arch07/1105,left5/1165 и receiver02/1275.
По каждому contact сохранены соседние ±1, нижний receiver кадр не обрезан.
Также frog01/104–106, отдельный uint32 seed2939425288/left3/701–703.
Art-off/geometry/source/flat сохраняют seed0/t106. Own native import1021
показал точное воспроизведение. Actual Dark JSON отвергнут с сохранением
Water seed2939425288/t703; после этого own1021 import очистил ожидаемую ошибку.
Это bounded coverage; все71 masks со всех сторон и все четыре receiver в
движении не заявлены проверенными. Общая2D плоскость/высота исходника не менялась.

Отдельный retest record: собственный runtime water/candidates/front-edge-04.retest.json.
Manifest17208 bytes;100 payload/3561039 bytes, всего101 files/3578247 bytes.
Owner command/root/listener logs — evidence/browser-front04/preview-ownership.json;
10:48:42Z PID29572/127.0.0.1:6868. Совокупный собственный transfer runtime тогда
Water31.18MiB/Dark12.04MiB. Renderer/native/source/inputs всё ещё прежние.

Следующее по актуальному решению Lead: обе independent full QA, с comparative
retest первым шагом VQA Water; отдельная тень/новый threshold остаются в scope.
Selfcheck не подменяет независимый вердикт. Frozen bytes/preview удерживать.
Первый полный original17dc и early02 сохранены. Новый sort/physics отсутствует.
Snapshot перед сборкой10:33:44Z: RAMfree16.087GiB, CPU12%,
C16.209/D16.277/E11.871GiB. server_write=false.

## История — FULL_FIRST_METHOD_PRESERVED / TARGETED_DATA_REPAIR_PENDING

Первое полное применение исходного метода сохранено отдельно:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\full-method-03.
Source c73d6128970b2b022d5313b08c34cafdec9a1bc3,
ART17dc9fcdc261562acb581dd8590096819734c807,71 masks.
Все74 потребляемых raw files/PNG независимо сверены с hashes.json Artist.
assets.json SHA256e93e5cfb6fbfa3c4ca9e5c2eadbc46b628713e952fe033fa216e00598e2a849d.
97 payload files/3470168 bytes; file-manifest.json SHA256
b3c697675ecd76af7848fa72367f943c1b9e4a27b325b098a9fef08135fe58d3.
Offline hash/native exact replay/cross-board rejection проходят. Этот полный
original-method набор пока не публиковался в preview и не заявлен QA/PASS.

Lead сообщил: независимая VQA завершила чтение early02 и закрыла свою вкладку;
read hold6868 снят. Immutable early02/manifest/evidence сохраняются.
6868 пока по-прежнему early02, owned PID17640/session89871. Переключать только
с явным named/hash handoff следующей версии. VQA независимо воспроизвела
скачок1014/1015 при пересечении34755.12349268705 сразу тремя arch07 meshes.
Следующий шаг Artist через Lead — обычная целевая коррекция depth/anchor данных,
отдельный новый вариант. Новую сортировку/физику Builder не внедряет.
Исходный полный71-mask результат17dc уже сохранён до такой коррекции.
Не тратить полный QA цикл на заведомо прежний скачок до targeted доводки.

Actual own browser Water checkpoint seed1/t106 успешно импортирован обратно
с точным воспроизведением core. Dark продолжен независимо и уже frozen для QA.
Свежий snapshot10:22:53Z: RAMfree16.742/31.907GiB, CPU7%,
C16.229/D16.278/E11.880GiB. server_write=false. Jungle не менялся.

## История — EARLY_7_MASKS_HOLD_FOR_VQA (hold позднее снят)

Code f3b7ce8d94b0a9173c48d7ca6defb3837a10ed03.
Artist4eb4001d8036048f716d9e7ab45bb560f3840cf6, exact assets.json SHA256
6bda5c72cacf24a32555b720f42b72c335c180fca88525d809614d8b5bec3d7d.
Все10 потребляемых raw files/PNG независимо сверены с hashes.json Artist.
7 masks: frog-01, обе body и lintel arch-01/arch-07. Ball/shadow — exact reuse
выбранного собственного ART, это явно записано в Artist provenance.

Неизменяемый ранний артефакт:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water\early-art-02.
Manifest SHA2564221b9606f95304bde0862c74235e534573a7f1cfdada8c4b109320965f8ebcf.
Owned preview http://127.0.0.1:6868/review/r4d/p3-masks-water/,
PID17640 / exec session89871. Старый diagnostic PID35432 корректно остановлен
после подтверждения command/root/port ownership. Diagnostic-01 сохранён отдельно.
Lead передал early02 независимой VQA: держать именно эти bytes/URL, НЕ переключать
этот preview до подтверждения Lead об окончании чтения. Full candidate отдельно.

Actual Pixi/browser seed1 прошёл до LOST1196. Сохранены13 соседних кадров
arch07 ticks1006–1018 в масштабе200% и тот же ряд в нормальном100%, плюс
frog01/104–106. Evidence: own runtime water/evidence/browser-early02/.
Проём/маски физически взаимодействуют с raster sphere; это не static montage.
Frog actual partial около105 есть. На arch07 native depth threshold в1015
снимает occlusion: оценка по alpha/raw masks в1014~0.347, в1015 active0 при
body-overlap~0.232. Это конкретный inherited scalar/line transition для
независимой диагностики, не готовый defect/PASS. PNG alpha measurement и
source/native samples — water/evidence/native-early02/. Метод не менялся.

Первый art-frame записан09:49:09Z, через21.9min после actual start turn;
это elapsed до первого видимого арта, не обещание завершения всей доски.
Browser Water JSON download имеет board-specific имя; его import в Dark
отклонён, Dark seed/tick не изменились. Вся первая native replay matrix точна,
seed1/2 parity с закреплённым P1 подтверждена; все пять outcomes сохранены.

Пока полный Artist packet готовится: готовить новые версии отдельно, держать
early02 для VQA. New replay frames для следующего build добавлены как данные
(seed1/1006/1014/104), текущие served bytes не перезаписаны. server_write=false.
Последний собственный snapshot RAMfree16.027/31.907GiB, CPU0%/24logical,
C16.245/D16.280/E11.915GiB. Это история; перед следующим тяжёлым шагом обновить.

## История начальной подготовки

29 октября 2026. Actual start turn `01a186fc-2c6b-7f21-8c77-dadb83058f22`.
Поручение переноса от Lead по прямому старту Max; четыре карточки прочитаны
полностью на c6603f0f327350172df44687a4d4ead19e0e5e6b. Порядок переноса сейчас
уточнён прямым решением, предмет/инварианты карточек сохраняются.
Входной HEAD6de20083954a3a41e5a39b3ae70f9753a012bd0c, прежняя ветка, дерево чистое.

Статус INPUTS_VERIFIED / CONSUMER_PREPARED. Exact paths/hashes — transfer.json;
готовые exact Git bytes — inputs/. Water board04/trial02/candidate02.
Полностью сохранён baseline CODEf1aca21 / ARTf899 и Jungle frozen manifest.
CONSUMER_CONTRACT.md передаёт прежнюю alpha/scalar/line схему без новой сортировки.
Runtime только E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\water.
Source/assets/config/logs/candidates и будущий порт отдельны от Dark.
Native package tree008d16a80a26bb77d562a45218b01da09b0d9ff0 подтверждён.

До вычисления результатов объявлены seeds0/1/2/3675989190/2939425288.
Копирование исходного consumer изменило только source JPG/подпись и board
identity checkpoint/имени download. DepthAt/рендер/физические функции прежние.
Native/browser движение пока не проверялось; art PASS не заявлен.
Следующее: адаптированная упаковка/provenance и native diagnostic build,
затем actual local Water browser и ранний exact Artist packet.
Ориентир первого видимого checkpoint45–75 активных минут уточняется по факту.

Последний собственный system-wide snapshot: RAM free16.589/31.907GiB,
CPU1%/24logical, C16.343/D16.280/E11.942GiB. Это история, не резерв.
Перед тяжёлой операцией повторить; E<=4GiB diagnosis, <=2 safe checkpoint/stop.
server_write=false. Новых ролей/веток/worktrees нет; Jungle/UGH/чужие проекты
не меняются. До нового exact token upload/staging/lock/service actions запрещены.
