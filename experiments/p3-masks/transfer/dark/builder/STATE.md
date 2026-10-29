# Dark P3 — Builder

## Текущий checkpoint — DELIVERED / PREVIEWS_ALREADY_ABSENT / IDLE

Lead сообщил завершение обеих QA, LIVE обеих страниц16:40:46Z, свой IAB smoke
+10ticks PASS и освобождение всех read holds. Это результат Lead, не новая
проверка/публикация Builder. Текущая операция только own-preview retirement.
Fresh audit16:49:16–17Z: PID37660/6869 oldDark03 и PID15752/6870 currentDark04
уже отсутствуют; Water PID29572/6868 также отсутствует, listeners трёх портов нет.
Starttime/commandline недоступны вследствие отсутствия процессов; ownership
для нового stop не заявляется. StopIssued=false, процессы не затрагивались;
причина их прежнего завершения не установлена. PID17380 не проверялся/не трогался.
Receipt: E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\
preview-stop-receipt-20261029-final.json и .manifests.json, вне frozen payload.
Все три local manifest SHA прежние: Dark03 b3923f4c...d0307, Dark04 d180e5a6...4ed1b,
Water04 de1344af...ce2c6. Все frozen/raw/source/evidence/папки сохранены.
Новых product/QA/build/candidate действий нет. После commit/push — idle;
server_write=false. Model/thread settings не изменялись.

## История — DARK_RECEIVER_FRONT_EDGE_04_FROZEN_FOR_TARGETED_QA

29 октября2026. Один immutable candidate dark-receiver-front-edge-04:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\receiver-front-edge-04.
SOURCE d7eac5d7d76127e3138480f1f16eaf28aac0f15a,
ART e5d3e1f44c112e483ff2a23fbd169cb119390865, exact prefix
experiments/p3-masks/transfer/dark/asset-artist/variants/receiver-front-edge-01/.
assets.json18591 bytes/SHA256
2b02dcde6c07266b67285700040e4ae0342f06fb760ae6ed0cf1fdcdc9b6cbad.
Полностью прочитаны README/ANCHOR_CHANGES/DERIVATION/contract/provenance,
VQA03 REPORT2d40b3f31341bbf57fd2df76aa6637a3f1a303e8. Все76 Artist packet files
независимо совпали с exact Git/extracted bytes/внешним manifest
f5036ba0863766eb0ba00d47f383a910355b526d51d7ec20bc77ecfbd042c5f7.

Freeze manifest SHA256
d180e5a63bb1dec7c510507fc2ce990e7cb10927b337a19c4bb9effc67e4ed1b,
15737 bytes;92 payload files/3494340 bytes;93 total files/3510077 bytes.
Все92 local/HTTP hash/size и JS MIME совпали; curated public allowlist проходит.
Authoring Python/diagnostic packet/private TS/maps/keys/source paths не включены.
Full freeze record вне payload:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\candidates\dark-receiver-front-edge-04.freeze.json.
New URL http://127.0.0.1:6870/review/r4d/p3-masks-dark/,
owned PID15752 / exec session31501. Это НОВЫЙ Dark процесс/root, не прежний
закрытый OLD Water6870/PID17380. Держать bytes/server до явного read-complete.

Ровно12 depthLineNative четырёх receivers изменены. Все62 PNG,60 rect/alpha,
48 nonreceiver records, ball/shadow/top-level metadata и renderer неизменны.
App SHA760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6.
Core/config/manifest/projection/source/Pixi совпадают с03 побайтно; compiled
af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa переиспользован,
native не компилировался. Независимая деривация12 lines из4 существующих P3
front-полигонов и accepted sourceToNative совпала, без seed/tick/radius inputs.
Это data-only correction в прежнем depthAt/clamp, без новой сортировки/физики.

По уточнению CTO scope АДРЕСНЫЙ. Ранее выполнены: bounded TechnicalPASS03
b327ae601a4962dd5826abfbfdeefaf77c090a55, native/controls/negative/import03.
VQA03 2d40b3f3 дала D-POP-01 FAIL, а не Visual PASS. Эти матрицы автоматически
не повторялись. Build копирует exact14 pinned checkpoints по replay-sources.json:
5 predeclared +3 ordinary VQA outcomes и6 frames. Ни одного native replay при
packaging. Все исходы/плохие runs сохранены в новом replay menu, не отбирались.
verify-static.mjs применяется вместо прежнего полного native verify.mjs.

Новый actual browser selfcheck: seed3858699109, contiguous2010–2019 и2044–2047
при100%/200%,28 full raw JPEG; соседние входы receiver01 seed0/880,884,887,888,
receiver02 seed1551806092/965,968,970,971 и receiver03 seed3238915631/1430,1434,1435.
Терминал target LOST2083 подтверждён в UI. Всего40 адресных raw JPEG, не полный
повтор живых серий. Четыре actual downloaded checkpoints2012/2044/2045/2046
совпали с сохранёнными native states; весь checkpoint2012 совпал с VQA03.
Отдельный shadow offset/ordering подтверждён:2044 оба ON,2045 shadow OFF/ball ON,
2046 оба OFF. На новых threshold шар виден за границей JPG; тень там на тёмном
фоне малоконтрастна, её универсальное качество не сертифицировано.
На просмотренных ключевых100%/200% кадрах прежний2011→2012 скачок и заметный
новый threshold скачок selfcheck не воспроизвёл. D-POP-01 ОТКРЫТ до независимого
retest. Нового установленного существенного дефекта нет; общий Visual PASS нет.

Evidence: own runtime dark/evidence/receiver-front04/, включая packet-byte-
verification.json,independent-derivation.json,selected-checkpoints-and-shadow.json,
preview-ownership.json и browser/{D-POP-capture-log,near-entry-capture-log}.json.
Собственная IAB tab3 закрыта. Old Dark03/6869 PID37660/session87426 и Water04/6868
PID29572/session61378 сохранены; оба HTTP200 с прежними manifests b3923f4c...d0307
иde1344af...ce2c6. Old bundle/raw/report и вся история не менялись.

Перед build12:13:22Z system RAMfree16.319GiB/CPU1%, C16.096/D16.263/E11.653GiB.
После адресной работы12:21:57Z RAMfree15.024GiB/CPU1%, C16.075/D16.252/E11.624GiB;
это system-wide, не измеренный собственный peak. Third Node RSS51.59MiB;
новые собственные bundle+snapshot+evidence9.508MiB, ниже64MiB ориентира.
Дальше обе независимые targeted QA на тех же bytes; никаких дополнительных
вариантов/серверных действий без поручения. server_write=false. Jungle неизменён.

## История — FULL_METHOD_03_FROZEN_FOR_INDEPENDENT_QA

Именованный кандидат dark-full-method-03, source
c73d6128970b2b022d5313b08c34cafdec9a1bc3, ART
17dc9fcdc261562acb581dd8590096819734c807. Все63 потребляемых raw files
независимо сверены с hashes.json Artist;60 masks. assets.json SHA256
ef5eb34be622f5ce6356d6fa51d7902c334a1f1f3c95acce225d7340928bbc29.
Первое полное применение прежнего scalar/line метода сохранено без новой сортировки.

Immutable bundle:
E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\full-method-03.
file-manifest.json SHA256
b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307.
87 payload files/3383383 bytes, плюс внешний по отношению к списку manifest.
Точные manifest bytes и итоговые counts — отдельный freeze record
dark/candidates/dark-full-method-03.freeze.json в собственном runtime.
Preview http://127.0.0.1:6869/review/r4d/p3-masks-dark/,
owned PID37660 / exec session87426. Diagnostic PID16512 остановлен только
после доказательства собственного command/root/port. Diagnostic-01 сохранён.
Этот named bundle не перезаписывать и не переключать QA preview незаметно.

Все87 hash/size и HTTP bytes/MIME проверены; native replay точен на всех пяти
заранее объявленных seeds. В actual Pixi browser ordinary seed0 прошёл
до receiver01/888, seed2 до LOST1812. Плохой исход сохранён. Сохранены actual
pillar02/360,364–368,372, pillar04/832,836,839–841,844,848 и entry860,880,888.
Увеличенный нижний кадр включает целиком opening/rim приёмника, а не обрезает
его viewport. Art-off/geometry, source/flat и zoom/pan сохраняют seed2/t896.
Реальный browser download/import seed2/t896 после перехода897 восстановил
896 и показал точное совпадение состояния с core. Ранее Water JSON отвергнут
на Dark; positive own import диагностического Dark также прошёл.
Evidence: dark/evidence/browser-full03/. Результаты — selfcheck, НЕ full QA/PASS.

P1 4b47db04c7140ebf88f69b91faa0b790d46f22ec, Dark02/trial01/candidate01;
core5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023, package tree
008d16a80a26bb77d562a45218b01da09b0d9ff0, compiled native SHA256
af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa.
Config/source/projection SHA полностью в transfer.json/build.json/freeze record.
Private TS/maps отсутствуют. Следующий шаг: обе независимые QA через Lead,
не дожидаясь Water. Остались ручные границы/освещение и непроверенные переходы
binary scalar/line у прочих faces/corners; не подменять их собственным PASS.

Свежий system-wide snapshot10:22:53Z: RAMfree16.742/31.907GiB, CPU7%,
C16.229/D16.278/E11.880GiB. server_write=false. Jungle неизменён.

## История — DIAGNOSTIC_NATIVE_BROWSER_READY

Source f3b7ce8d94b0a9173c48d7ca6defb3837a10ed03.
Runtime E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\diagnostic-01.
Manifest SHA2561b0ffc61245b5e008b7131e91912f926e62a096db3164b34943d16cc7f635e16.
Owned preview http://127.0.0.1:6869/review/r4d/p3-masks-dark/,
PID16512 / exec session87378. Своя IAB tab2, не смешивать с Water tab1/port6868.

Native exact replay/конечные checkpoints проверены на всех пяти заранее
объявленных seeds; seed1/2 parity с exact P1 совпала. Browser seed0 реально
прошёл от tick0 до receiver01/t888 с actual-config незалитыми contours.
Water checkpoint импортирован через реальный file chooser и отклонён;
Dark seed0/t888 остались прежними. Art/мasks ещё не подключены: диагностический
контур не является художественным шаром/проверенным переносом.
Evidence own runtime dark/evidence/browser-diagnostic-01/;
native checkpoints seed0/365–367 и839–841 — dark/evidence/native-01/.

Следующее: exact Artist Dark packet, именованная отдельная art версия,
actual pillar02/365–367, pillar04/839–841 и entry888. В следующем build
replay catalog содержит эти frames и seed2/896 из сохранённого LOST run;
diagnostic-01 immutable bytes не меняются. Алгоритм scalar/line прежний.
Движение с артом/угловые перекрытия пока НЕ проверены. Full QA/PASS не заявлены.

Непересекаемые Water/Dark source/runtime/ports сохранены, Jungle baseline
не изменён. server_write=false. Свежесть ресурсов перед тяжёлым шагом обязательна.

## История начальной подготовки

29 октября 2026. Actual start turn `01a186fc-2c6b-7f21-8c77-dadb83058f22`.
Поручение переноса от Lead по прямому старту Max; четыре карточки прочитаны
полностью на c6603f0f327350172df44687a4d4ead19e0e5e6b. Порядок переноса сейчас
уточнён прямым решением, предмет/инварианты карточек сохраняются.
Входной HEAD6de20083954a3a41e5a39b3ae70f9753a012bd0c, прежняя ветка, дерево чистое.

Статус INPUTS_VERIFIED / CONSUMER_PREPARED. Exact paths/hashes — transfer.json;
готовые exact Git bytes — inputs/. Dark board02/trial01/candidate01.
Полностью сохранён baseline CODEf1aca21 / ARTf899 и Jungle frozen manifest.
CONSUMER_CONTRACT.md передаёт прежнюю alpha/scalar/line схему без новой сортировки.
Runtime только E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark.
Source/assets/config/logs/candidates и будущий порт отдельны от Water.
Native package tree008d16a80a26bb77d562a45218b01da09b0d9ff0 подтверждён.

До вычисления результатов объявлены seeds0/1/2/1189667321/1551806092.
Копирование исходного consumer изменило только source JPG/подпись и board
identity checkpoint/имени download. DepthAt/рендер/физические функции прежние.
Native/browser движение пока не проверялось; art PASS не заявлен.
Следующее: адаптированная упаковка/provenance и native diagnostic build,
затем actual local Dark browser и ранний exact Artist packet.

Последний собственный system-wide snapshot: RAM free16.589/31.907GiB,
CPU1%/24logical, C16.343/D16.280/E11.942GiB. Это история, не резерв.
Перед тяжёлой операцией повторить; E<=4GiB diagnosis, <=2 safe checkpoint/stop.
server_write=false. Новых ролей/веток/worktrees нет; Jungle/UGH/чужие проекты
не меняются. До нового exact token upload/staging/lock/service actions запрещены.
