# Проверка frozen geometry draft v01

Проверен только геометрический вход обязательной whole-image пробы. Блокирующего расхождения draft с принятой геометрией не обнаружено. Это не оценка imagegen результата, consumer, движения или художественный PASS.

Кандидат Builder: `bdf470e5beb468266184cc2ea0c997191d9907b3`, `experiments/p6-geometry-first-art/builder/`. Из своего E: Git прочитаны exact objects; все 16 файлов извлечены в собственный QA runtime (5383460 bytes). Builder worktree/runtime не изменялись. Скрипты Builder прочитаны, но для расчётов QA не запускались.

| Проверка | Наблюдение |
|---|---|
| Actual edit target geometry-draft.png | 1536×1536; SHA-256 `bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532` |
| Другие frozen artifacts | registration/draft-overlay/reference-overlay/geometry.json совпали с пятью hash из handoff; точные значения в draft-v01-check.json |
| Config/manifest/projection/view-math/P0 recipe | Побайтно совпали с независимо извлечёнными разрешёнными Git inputs |
| Матрицы | nativeToSource/sourceToNative равны accepted P1; замены или подгонки не обнаружено |
| Состав и native metadata | Все 25 pins в исходном порядке, 16 segments, 1 start, 4 buckets совпали с config |
| Основания и контуры | 128 точек на каждом pin/bucket/start footprint; все 3916 проверенных points совпали с независимым вычислением (максимум 0 px) |
| Пол | Все 14 вершин соответствуют accepted playableFloorNativePolygon, включая неровные боковые границы |
| Round-trip | Максимум 1.626953582672133e-11 native units |
| Raster registration | Независимые projected probes обнаруживают ожидаемые цвета PNG; в отдельных местах подписи перекрывают контуры, минимальная видимость 96/128=75% |
| Обратный вид | Построен независимо из frozen geometry-draft.png, просмотрен: draft-v01-inverse-floor.png, 1024×1536, SHA-256 `8a287dce959a935d309cc3b447c8c07fd0011950eeaeac041535793827ec418b` |

Визуально просмотрены exact draft-overlay.png и reference-overlay.png, затем независимый inverse-floor. Основания остаются на своих местах, полноразмерная плоскость сохраняет принятую форму. Обратное преобразование выпрямляет пол: направляющие объёмы в нём искажаются и не выдаются за восстановленный 3D вид сверху. Круги корзин задают native capture regions, а не полный видимый силуэт корзины. Принятый промежуток между полом и корзинами сохранён.

Ограничение диагностического PNG: его ID/text штрихи закрывают часть cyan/green outlines. Это объясняет отсутствующие цветовые probes в draft-v01-check.json и не является измеренным сдвигом оснований. Для дальнейшего сравнения whole-image результата использовать также независимый слой registration-overlay.svg без названий, либо контуры из registration-landmarks.json. Не трактовать 75% видимости подписи как 75% геометрического совпадения: машинные 3916 points совпали полностью, а raster probe имеет отдельную ограниченную задачу.

Наблюдение для Artist/VQA: иллюстративные тени draft направлены вниз-вправо; на исходном художественном ориентире основные тени объектов читаются вниз-влево. Расположение теней не фиксируется как игровая геометрия. При цельной дорисовке нужно проверить фактическое согласование света и теней с выбранным стилем. Это не причина менять config/projection или самостоятельно переделывать draft силами QA.

Передача Builder/VQA через Lead: независимая подготовка доставлена commit `49719d407fe1a9408911d49ba819ac6a02022a0a`. Контракт `qa/state-contract.json`, SHA-256 `e5fbd99b88f5585c998ee41c45de3beb7ea1c359754fcebe4c4d068c16c55a84`; normal seeds 0/1/2 без отбора; event tick94 означает переход state94→95, следующий кадр state96. Seed0 входит в receiver-03 на tick1956; seeds1/2 дают LOST на ticks1735/1290. Полные эталоны остаются в собственном private QA runtime, raw private TS/maps в public Git отсутствуют.

Следующий вход: frozen whole-image output/provenance и затем exact frozen consumer/build. До их получения не проверены настоящий import в consumer, его states/PRNG/replay, UI controls, собранные перекрытия, шарик и художественная цельность. Кандидат продукта QA не исправлял.
