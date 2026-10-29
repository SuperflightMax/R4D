# Frozen C02 — независимая визуальная проверка

29 октября 2026, 00:40 UTC, Europe/Kyiv.

**Вердикт: полный художественный PASS не выдан.** Полный assembled набор
выглядит содержательно и согласованно; прежний C01-V01 исправлен в
проверенных входах receiver-01 и receiver-03. Однако новый обычный бросок
показал преждевременное скрытие сферы на открытом полу у правого плеча
near-ledge. Нужна адресная коррекция контура и повтор этого окна. Это
визуальный дефект C02, а не отрицательный вывод о методе P5 вообще.
Техническая QA, privacy/package и разрешение release оцениваются отдельно.

## Exact предмет проверки

- Consumer `398b0daaaad914cc67b8390a51454d21db524e7a`, prefix `experiments/p5-regenerated-objects/builder/`.
- Producer index полностью прочитан: `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/index.json`,10707bytes,SHA-256 `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389`. Все29public files/21668434bytes совпали до и после просмотра; app/manifest/config/P1 manifest дополнительно совпали по HTTP. Rebuild не выполнялся.
- App571012bytes,SHA-256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c`; staged manifest59960bytes,SHA-256 `275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491`.
- Artist source `4990463ec6eabf89aa47f58f9b59f703cbf739ba:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-02.json`,83772bytes,SHA-256 `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331` проверен по raw Git bytes. Полностью прочитан `HANDOFF_MINI_02.md`. Normalized HEAD `a5f26a57833e8671bf031a2b21c1b9f990dd3c87` указан отдельно, не подменяет source pin index.
- Полностью прочитан anchor contract `2c8551e45876396e4b8f5df7f6d6c93713f89e2c:experiments/p5-regenerated-objects/builder/contracts/RECEIVER_ANCHOR_POLICY.md`. Чаши действительно визуально подняты примерно17.8sourcepx относительно прежнего logical plane; это объявленная дельта контракта, а не отсутствие перемещения рисунка.
- Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; config SHA-256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`; projection SHA-256 `b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431`; core `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Private native source audit не повторялся.

Actual preview `http://127.0.0.1:55185/`, Builder PID21340/session26545,
root `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public`.
Owner record и listener совпали до браузера; после проверки PID тот же.
Использована собственная новая скрытая вкладка Codex IAB2, не страница Builder.
Вкладка закрыта после съёмки, listener не менялся. Zoom браузера не менялся;
штатные Whole/Field. Original JPEG screenshots1265x712pixels; CSS viewport и
DPR отдельно не измерялись. Субпиксельные визуальные допуски не заявляются.

## Наблюдения о полном наборе

В actual сцене появились все семейства и глубины: flower, leaf, frog, wood
видны по всему полю; низкие цветочные/перьевые основания и более высокие
деревянные столбики читаются как разные законченные предметы. Новые дальние
и средние ракурсы не производят заметного конфликта с плоскостью пола.
Тёплый камень, зелёный мох, красные лепестки, бирюза и древесина сохраняют
характер Jungle. Слабый рост размеров по глубине и разные footprints не
подменены одним bbox всех спрайтов. Численный max residual3.295859sourcepx
не использовался как художественное доказательство.

В Whole и Field тени у показанных семейств заметны, основания связываются с
полом. У свободно видимой сферы различимы объём и контактная тень. Крупных
matte-прямоугольников, светлой каймы, выраженного расхождения резкости или
эффекта приклеенных технических заготовок не заметил. Тени всех25 предметов
не измерялись по отдельности; это просмотр собранной сцены в обычном масштабе.
Точность отдельных контуров и редкие сочетания этим не гарантируются.

Все4 чаши статически связаны с краем площадки/канатами правдоподобно; явного
расхождения back/front или дублированного обода в этих видах нет. Повторы
одного generated receiver PNG и его aliases не объявляются новыми генерациями.
Три foreground regions также являются объявленными clips того же generated
floor, а не новыми bitmap outputs или вырезками пользовательского оригинала.

## C01-V01 и C01-V02 — адресная переоценка

Seed1696420279, states874/875, Whole и Field: сфера читается внутри тёмной
полости receiver01; прежнего положения на дальнем ободе не вижу. Короткое
actual realtime продолжение от830 дало moving screenshot867 и terminal875
с тем же убедительным положением. AX до первого moving screenshot был864;
эти разные тики честно разделены в evidence.

![Исправленный receiver01 на875](E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/seed1696420279-t875-field-art.jpg)

Seed0,1955/1956 и подход1919/1930/1945: сфера скрывается у переднего края,
затем появляется над полостью и на1956 читается внутри receiver03.
**C01-V01 закрыт для этих двух наблюдавшихся входов**, не автоматически для
любой траектории или receiver02/04.

Field теперь включает полость и передний обод всех чаш. Именно мешавший
проверке crop C01-V02 устранён; крайние декоративные кончики местами тесно
прилегают к canvas, но нужный зрительный вход доступен. Art/Geometry на676
сохраняют видимый масштаб/камеру; при Art off геометрия и круг шарика доступны,
невидимые clips не скрывают проверочный путь.

## Actual движение и сохранённые cases

Start во всех replay неизменён: `board01-start`, native
`(33254.863169496064,33151.81331014809)`,angle90,speed0,r16,tick5ms;
меняется только seed. Collision event t → state t+1, bucket tick уже state tick.

| Seed | Фактически просмотрено | Ограниченный вывод |
| --- | --- | --- |
|1696420279|834/835/836 changed flower07;854near-ledge;874/875Whole+Field;short realtime867→875|Боковой контакт изменённого flower07 без крупного отскока от пустоты; край/receiver01, прежний дефект исправлен |
|0|88/94/95/96/110leaf01;475/476/477left-2+geometry;1919/1930/1945/1955/1956receiver03|Сфера прячется за дальним leaf и возвращается; касание длинного левого ограждения не дало явного прохода насквозь в узком окне. Центральный near-ledge и receiver03 убедительны |
|3339315606, сохранённый прежний обычный LOST|1570/1590/1600/1610/1620|Реальный проход возле левой serpent part и затем near-ledge. Крупного скачка слоя в этом окне не увидел. Не повторял terminal1709 ради статуса |
|3957814979, переданный обычный LOST|730/780/820/847+terminal data|Переход через край и пропуск чаш; actual LOST847 сохранён как граница native броска, не объявлен дефектом лишь из-за проигрыша |
|4210403976, первый новый UI бросок|moving start44;650/670/674/675/676/680/690/705;terminal757|Выявил C02-V01. Сохранён LOST757, не отбрасывался |
|3226456662, второй новый UI бросок|moving start45;terminal1405+data|LOST1405 сохранён. Только эти два новых seed; поиска выигрышей/подменённых состояний не было |

Для новых бросков начальные moving AX ticks37/39 отличаются от screenshots44/45.
Terminal и выбранные дальнейшие окна получены actual pause/seek; это не
непрерывное видео всего броска. Для navigation новых foreground окон только
уже обычных0/169 использованы hash-pinned traces C01 при неизменной физике;
видимый вывод сделан по собственным C02 кадрам. Source oracle1922точки,
matrix0–3 и законченные C01 матрицы не повторялись.

## C02-V01 — near-ledge скрывает сферу раньше видимого края

**Содержательный дефект partial occlusion; художественный PASS исключён до
адресной коррекции/обоснованного ограничения.** Seed4210403976, states
670→674/675/676, Field art; сравнение676 art+geometry/geometry-only.
Сфера сначала обрезается до небольшой полоски, затем исчезает на открытом
освещённом полу слева от видимой правой serpent морды, до убедительного
ухода за фактический край/предмет. Геометрический круг продолжает показывать
её положение. Это заметная потеря непрерывности движения, не просто факт
наличия coarse contours в metadata.

![Точка скрывшейся сферы на676](E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/seed4210403976-t676-field-art-geometry-stable.jpg)

Соседние original screenshots `seed4210403976-t670-field-art.jpg`,
`...-t674-field-art.jpg`, `...-t675-field-art.jpg`, `...-t676-field-art.jpg`;
exact hashes/bytes и AX pairs в [EVIDENCE_C02.json](EVIDENCE_C02.json).

Первичная гипотеза уточнена после native/UI location: **правое плечо
near-ledge polygon захватывает лишний открытый пол**. Первоначальная версия
в commentary подозревала serpent clip, но текущая точка outside обоих
serpent polygons. На676 actual native pos `(33655.2520125,34671.4639905)`,
done=false; source ground примерно `(1209.324,1098.809)`, proxy центра
visible bounds сферы `(1209.324,1081.647)`, horizontal diameter35.132sourcepx.
Обе опорные точки inside near-ledge и outside serpent regions. Это помогает
локализовать причину; proxy центра и point-in-polygon сами по себе не
доказывают визуальное качество и не заменяют кадры. Ошибка общего P1 этим
не доказана, native geometry/config менять оснований нет.

**Полезная коррекция Artist/Builder:** узко перетрассировать правую верхнюю
границу near-ledge по реальному закрывающему силуэту края/мха generated floor,
убрав из foreground открытый участок пола. При необходимости разделить край
и отдельные выступающие детали, сохранив exact source registration. Не
раздувать соседний serpent polygon, не переносить шарик/коллайдер и не
маскировать симптом fade/sink. Проверяемый продукт VQA не исправляла.

Следующий candidate получает адресный повтор670/674/675/676/680 этого seed,
Art/Geometry; затем проверку того же изменённого края на0/1919–1945,
169/854 и левом3339315606/1590–1620, чтобы не потерять уже правдоподобные
перекрытия. Новая полная физическая/source matrix для такой дельты не нужна.

## Остатки и evidence

Непроверено: видимый вход receiver02/04 (обычные наблюдавшиеся случаи туда
не попали); все возможные длинные rail crossings; полные перекрытия каждого
семейства во всех направлениях; редкие moss/feather крайние пересечения;
исключительные timeout/UI download; privacy/package/release. Две удачные
полости и одна удачная центральная кромка не дают PASS всем4чашам/всем clips.
Отрицательные native исходы сохранены и не подменены красивыми.

[EVIDENCE_C02.json](EVIDENCE_C02.json):56460bytes,SHA-256
`700bdd1901e80975bab8262f93fa54a2c3fb115ee1b4cbfc280ff38581b7ec66`.
111own evidence files/7550811bytes, включая50original JPEG screenshots,
AX pairs, raw displayed terminal data, guard/ownership/integrity и clip
diagnosis. Тяжёлые bytes только
`E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02/`; в Git только отчёт,
state/events, metadata и собственный indexer. Private native TS/maps не
публиковались. Case metadata сохраняет pins/start/seed/tick/framing/MIME,
moving/frozen различены; точные viewport screenshot dimensions записаны.

Guard00:28:55UTC: RAMtotal31.907/free16.195GiB,systemCPU5%,aggregateCPU5.375%,
aggregateWS19.303/private19.553GiB,403процесса; C/D/Efree17.069/16.281/12.056GiB.
WS может повторно учитывать shared pages. Own peak estimate2GiBRAM/.2GiBE,
allowance4GiBRAM/2GiBE сохранён; peak отдельно не измерялся. E00:37free12.030GiB.

Все shell-команды из own E worktree, branch прежняя; UI C: — service stub.
TEMP/TMP/output только own E/process-local. Модель/effort/host/global settings,
чужие worktree/PIDs/devices не менялись; личный Chrome/desktop не использовался.
Новых ролей/чатов/подагентов, rebuild, продуктовых исправлений и общения с
другими чатами не было. C02 exact bytes неизменны. Denial/ordinary failure в
этом проходе не было. Deploy/Review writes0; CTO release gate закрыт.
