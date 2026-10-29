# Water P3 — Builder

## Текущий checkpoint — EARLY_7_MASKS_HOLD_FOR_VQA

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
