# Water w04 — actual baseline Visual QA

30 октября 2026, Europe/Kyiv. **Baseline сохранён и самостоятельно просмотрен. W04-V01 OPEN: резкое появление шара в receiver-02.** У arch-07 в заданном проходе с двумя касаниями значимого исчезновения над открытым полом не увидел. Это ограниченный вывод, **Full Water artistic/transfer PASS — false**.

## Exact candidate и условия

Consumer `48763f47d1e21e32334df3427209181a5a6114de`; Artist `541085603e01e23b076fe33ff3c9991822c0bce2`. FILE_INDEX 6632 bytes/SHA256 `c1c983dbddaaf556c5000dc9463df262fdc38444b2826a5883a2800b78b70554`; staged manifest30754 bytes/SHA256 `e982264b077f4b55ebc0b3f53f4bceffbdb96cc1cd383eefd5831dfab1baf6d5`. Все21 physical public files /11823570 bytes сверены по index. Sidecar index.json вне public также совпал с объявленным hash. Source manifest pin из handoff/index:44339 bytes/SHA256 `50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f`.

Actual URL `http://127.0.0.1:55192/`, root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w04/public`. Listener PID37932 проверен read-only по порту, node command и root. Вход со своей чистой ветки/HEAD `9cd09281e27404a526fe25b387a23d34467024d5`.

Scope:9 PNG /15 texture IDs /30 instances —7 pillars, frog-01, whole arch-07 с двумя support shadows,4 receiver back/front. Пять frogs, семь arches и environment clips отсутствуют. Архе оставлен исходный whole-sprite center-depth способ. Artist сообщает target123×25 source px, rendered footprint depth18.592, residual−6.408 и ground-anchor uncertainty±2.936 px; rear edge inferred. Эти числа не выдаются за самостоятельный VQA замер или recovered3D. Native feet, 2D collapse и отсутствие lintel-height collider сохранены.

Собственная hidden IAB вкладка, обычные Whole/Field, Art on; контуры включались лишь отдельно на receiver state1274. JPEG1265×712 сохранены без crop/reencode; zoom/viewport не менялись, CSS/DPR отдельно не измерялись. Точные paused кадры имеют одинаковый native UI state до/после. Realtime кадры ограничены AX состояниями по обе стороны захвата, без claims о точном физическом state картинки или частоте кадров.

## Arch-07 — наблюдавшийся проход

Seed1: Whole/Field998; Field1009,1012/1013/1014,1018/1019/1020,1031; Whole1019. Actual realtime фрагменты: AX1010–1063/image1043 и AX977–1024/image1007. Это проход с касаниями: event1012→state1013 у правой опоры, event1018→state1019 у левой; развороты скорости/RNG видны в сохранённых UI states. Свободным пролётом он не называется.

На998 шар не виден за рисунком арки; на1009 появляется часть сферы в просвете, на1012–1020 сфера читается между опорами, на1031 она полностью перед аркой. В этих соседних состояниях не увидел заметного popping на опорах или исчезновения над открытым полом. Опоры, перемычка и void различимы; светлый камень сочетается с окружением. Падающую тень перемычки отдельно уверенно не различаю: shadow/support оценка арки остаётся PARTIAL. Наличие двух shadow instances само по себе не стало PASS.

![Arch-07, seed1/state1019, Field: сфера в проёме](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w04/08-seed1-t1019-field.jpg)

Это не подтверждение всех задних/боковых направлений и не доказательство достаточности одной center-depth сортировки. Непроверенные поверхности, глубина арки и другие crossings остаются UNVERIFIED. До сравнения с будущими improved parts исходные w04 bytes/кадры сохраняются.

## W04-V01 — receiver-02: скрытие перед входом и резкое появление

**Самостоятельно наблюдаемый visual/order defect, приоритет следующей коррекции.** Seed2, Field1273 и1274: шара не видно. На следующем state1275 он появляется целиком внутри нарисованной чаши. Whole1274/1275 показывает тот же эффект. На1250 и sampled realtime/image1263 сфера также не читается; точное начало этого скрытия не искалось. Geometry1274 показывает ground disk внутри нарисованной полости, но основное доказательство — фактические art кадры и соседний переход.

![Receiver-02, seed2/state1274: шар не виден](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w04/15-seed2-t1274-field.jpg)

![Receiver-02, seed2/state1275: полная сфера появилась](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w04/16-seed2-t1275-field.jpg)

На1274 nativeY35154.3192034, на1275 —35158.6773888; RNG1581479664 одинаков. Native outcome на1275 —IN_BUCKET/receiver-02. После +1 state остался1275, изображение шара стабильно; погружения/fade в наблюдавшемся hold не увидел. Физического1276 нет. В terminal сфера находится внутри painted aperture, а не на far rim; front rim виден. Художественный вход всё равно не пройден из-за резкого появления. Реальное частичное пересечение именно переднего обода этой траекторией не подтверждено.

**Причина пока гипотеза.** Эффект согласуется с переданным Builder предположением о пересечении back-sprite depth≈35156.4526. Manifest задаёт receiver02 back offset−1/front+1. VQA самостоятельно подтвердила эффект, но не изолировала root cause между alpha coverage/back aperture и переключением порядка. Producer B01 не подставлялся вместо просмотра.

Для Artist/Builder: проверить, какие видимые части back должны закрывать сферу, а какие оставлять aperture открытой, и как они сортируются на всём подходе. Сохранить w04 как baseline; коррекцию выдать отдельным frozen successor и повторить1273/1274/1275/hold в Whole/Field. Не исправлять это seed/tick исключением, sink/fade или изменением native geometry/start/trigger. Коррекция не выполнялась этой QA и пока не проверена.

## Покрытие и evidence

Новых throws не было. Сохранены actual replay outcomes: seed1→LOST1196, seed2→receiver-02/1275. Новый общий native oracle/export и Jungle matrix не запускались. Новые pillars/frog просмотрены в сборке по виду, отдельные их контакты здесь UNVERIFIED. Прочие receiver entries/missed approaches, rare crossings и отсутствующие environment clips не проверены; mask-specific bypass PASS не выдан. W01-V01 остаётся закрытым на w02, старый framing closure не повторялся. Dark не затрагивался.

[EVIDENCE_W04.json](EVIDENCE_W04.json):49966 bytes/SHA256 **`018abcae1ff69b365700009973b52e6c4c1c0b754a153094f7dfb217fbc53078`**. Индекс:76 own runtime files /3483553 bytes,22 исходных JPEG, before/after AX, terminal records и identity/guards. Runtime `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w04/`.

Fresh guard00:33:19Z: free RAM10.326 GiB, CPU7%, aggregate CPU6.75%, working set/private26.730/28.066 GiB; C/D/E14.196/14.640/9.540 GiB. Оценка собственного пика1 GiB RAM /0.05 GiB E с резервом4/2 GiB. Final snapshot00:45:17Z: RAM9.928 GiB, CPU0%, aggregate6.583%, working set/private27.454/28.710 GiB; C/D/E13.912/14.623/9.465 GiB. Фактический own peak не инструментирован.

Своя вкладка закрыта; producer server, product/art/config не менялись. Новых server writes/release token нет. Jungle/w01/w02/w03/w04 сохранены. Рекомендация — исправить W04-V01 отдельным successor и продолжить подготовку/проверку parts, сохраняя указанные ограничения.
