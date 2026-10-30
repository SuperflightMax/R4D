# Dark d01 — независимая actual Visual QA

30 октября 2026, Europe/Kyiv. **Original baseline содержательно просмотрен; D01-V01 OPEN — резкое появление шара в receiver-01/02.** Верхняя часть набора даёт согласованные материалы и полезные контакты. Нижняя регистрация floor остаётся незакрытой. **Full Dark artistic/transfer PASS — false**; это ранний baseline, а не завершение работы над Dark.

## Проверенный вход

Consumer `aae514ed31720ab6d913f4bc6d63286c26992e0a`, Artist `0f70d00db096ee30f057dd65ca36a53df3f78899`. FILE_INDEX6109 bytes/SHA256 `d810ae08b53a0eaf44636df0adcb2c15eb4a0195b31db383534b4ea70af2116b`; staged manifest33628 bytes/SHA256 `18b7769115ac7d2dcba3a89869b50cc9c7824de01421201a886210a17ad3f900`. Все20 physical public files /15583746 bytes и metadata sidecar вне public самостоятельно сверены с index. Source manifest pin из handoff/index:47851 bytes/SHA256 `c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7`.

URL `http://127.0.0.1:55193/`, root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/dark/output/previews/d01/public`. Listener PID40328, node command и owner record совпали с портом/root/index. Старт со своей чистой ветки/HEAD `aeacc4184b8dc977a3f3e3c4b3683813ded040f4`. Принятый P1 board02/trial-01 из [подготовки](PREPARATION.md) сохранён; нового экспорта/компиляции ядра и старых больших аудитов не было.

Scope:8 новых Dark PNG /15 texture IDs /35 instances — skull-base01/02, pillar01–06, block01–04 (12/24 body groups), четыре receiver back/front. Отсутствующие bowls/прочие skulls/block05/06/environment не превращались в новые дефекты. Whole-sprite center-depth baseline сохранён; задняя вершина quad inferred, заявленный Artist максимальный selected depth residual3.8285source px не принят за corner PASS.

## Реальный просмотр и контакты

Собственная hidden IAB вкладка; обычные Whole/Field, без zoom/viewport override. Сохранены31 оригинальный JPEG1265×712 без crop/reencode и before/after AX. CSS/DPR отдельно не измерялись. Native UI state до/после каждого paused кадра совпал. Realtime screenshots ограничены AX состояниями до/после, не являются exact native-frame или framerate проверкой.

| Случай | Точные соседние states | Собственное визуальное наблюдение |
| --- | --- | --- |
| pillar-04 side, seed0 | 840/841/842 | Боковой контакт у основания; явного отскока от пустого места не увидел |
| pillar-02 corner, seed2 | 367/368/369 | Сфера частично перекрывается боком предмета; явного провала над открытым полом не увидел |
| pillar-02 front, seed2 | 972/973/974 | Контакт читается у переднего основания, шар остаётся видимым |
| pillar-04 corner, seed3 | 934/935/936 | Разворот у угла без заметного popping в данном окне |
| receiver-01, seed0 | 886/887/888, +1 hold888 | D01-V01; hold стабилен |
| receiver-02, seed3 | 1267/1268/1269, +1 hold1269 | D01-V01; hold стабилен |

Collision event t отражён на state t+1: смены скорости/RNG сохранены на841,368,973,935. Это соседние кадры по обе стороны контакта, не только состояния до него. Окна взяты из переданного native handoff, визуальная оценка сделана самостоятельно. Все направления граней/углов, rear vertex и достаточность whole-center sorting этим не подтверждены.

Короткие actual realtime фрагменты: seed0 AX857–888 (изображение уже888 terminal) и773–830/image810; seed2 AX981–1038/image1021; seed3 AX1234–1269/image1264. Пауза и точные состояния использовались совместно с движением; непрерывная видеозапись не выполнялась.

![Dark, pillar-02 front: seed2/state973, обычный Field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d01/17-seed2-t973-pillar02-front-field.jpg)

Светлый объёмный шар читается на тёмном полу; в Field различимо небольшое отдельное затенение под ним. Stone/red материал pillars, blocks и skulls сочетается с floor по цвету, резкости и объёму. Основания имеют читаемое затемнение/тени, явного ощущения наклеенных предметов в просмотренных кадрах не возникло. Оценка skull/block здесь относится к собранному виду; их отдельные контакты не проверены. Наличие shadow-файла или числового fit не подставлялось вместо просмотра.

## D01-V01 — исходный back/front не даёт плавного входа

**Наблюдаемый visual/order defect, приоритет следующей коррекции.** Receiver-01: seed0 на886–887 сфера не видна, на888 появляется целиком в нарисованной полости. Receiver-02: seed3 на1267–1268 не видна, на1269 появляется целиком. Оба перехода самостоятельно подтверждены в Field и Whole. Вывод основан на Dark кадрах; Water finding не использовался как доказательство.

![Receiver-02, seed3/state1268: шара не видно](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d01/25-seed3-t1268-receiver02-field.jpg)

![Receiver-02, seed3/state1269: полная сфера появилась](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d01/26-seed3-t1269-receiver02-field.jpg)

На обоих entry RNG сохраняется: receiver01/seed0 —3801544430, receiver02/seed3 —1534489277. После +1 удерживаются888/1269, более поздних физических states нет. В наблюдавшемся hold шар не погружается и не исчезает; terminal сфера находится в полости, не сидит на far rim. Передние ободы читаются, но сам переход не пройден. Настоящее частичное пересечение переднего обода этой траекторией не установлено.

Причина пока **гипотеза**: back/aperture alpha coverage или переключение порядка целой части. Manifest содержит исходные offsets back−1/front+1; точный root cause не изолирован этой VQA. Собственная новая Dark ball/cup optical policy не заменяется Water/Jungle числами и не объявляется полностью принятой по одному terminal кадру.

Artist/Builder: сохранить d01, отдельно выдать frozen correction, проверить физически закрывающие back/front области и открытый aperture на всём подходе. Затем повторить оба указанных перехода и holds в Whole/Field. Seed/tick исключения, sink/fade или подгонка native start/radius/trigger/geometry не исправляют исследуемую задачу. Эта QA product/art/config не меняла.

## Нижняя зона floor и непроверенное

Known limitation из Artist/Lead: near edge нового floor около sourceY1260 при accepted floorY1121. Это не собственный pixel measurement VQA. В assembled Art on ряд чаш частично закрывает стык; нижний каменный пояс продолжается за/под ними, поэтому успешный вид отдельных чаш не подтверждает регистрацию пола. Geometry кадр20 сохраняет положение принятой нижней границы рядом с задними стенками чаш. Проблемная зона остаётся незакрытой; framing/crop/геометрия не менялись, чтобы её скрыть. Полный floor registration PASS не присвоен.

Missing groups, environment/long-wall/near-edge clips, receiver03/04 entries, редкие пересечения и другие контакты остаются UNVERIFIED; specific mask bypass PASS не выдан. Нижняя floor correction уже заявлена Artist и требует отдельного actual successor review. Сходство материалов не отменяет D01-V01 или эту оговорку.

Все исходы ordinary seeds0–3 самостоятельно сохранены в UI:0→receiver01/888;1→receiver01/884;2→LOST1812;3→receiver02/1269. Для seed1 записан terminal, подробный подход не проверялся. Новых throws и win hunting не было, LOST сохранён. Результат Dark не наследует художественные PASS/closures Water.

## Evidence и передача

[EVIDENCE_D01.json](EVIDENCE_D01.json):73188 bytes/SHA256 **`092839ba887342966bef5df099d0292a347d14dc3a9dd81c87401994e4c319e7`**. Индекс связывает106 own runtime files /4721931 bytes,31 JPEG, AX, все четыре outcomes, identity/owner/guards. Runtime `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d01/`.

Fresh guard01:01:55Z: free RAM9.901 GiB, CPU9%, aggregate CPU6.417%, working set/private27.650/28.729 GiB; C/D/E13.886/14.623/9.363 GiB. Оценка собственного пика1 GiB RAM /0.07 GiB E с резервом4/2 GiB. Final01:13:04Z: RAM9.761 GiB, CPU4%, aggregate4.333%, working set/private27.550/28.707 GiB; C/D/E13.831/14.623/9.302 GiB. Own peak отдельно не инструментирован.

Своя вкладка закрыта; producer server и исходный d01 сохранены, Review/VPS writes0/tokenfalse. Water/Jungle не затрагивались. Рекомендация — отдельный frozen successor для D01-V01 и нижней art-registration correction с адресной регрессией рассмотренных контактов.
