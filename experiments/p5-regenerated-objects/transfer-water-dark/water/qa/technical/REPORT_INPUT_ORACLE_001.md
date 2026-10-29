# Water04/trial-02 — input/native oracle

2026-10-30, Independent Technical QA. Вход и настоящий native запуск подтверждены. Перенос художественного метода и визуальные перекрытия **ещё не проверены**: frozen Water candidate/URL/index в этом поручении не передан. Общий input blocker в выполненных проверках не найден.

## Точные входы и границы

Канон прочитан через read-only `git show` из `E:/R4D/perspective/p6-source.git`, revision `b1382dd4c230815a019e52e2ec4617ef705661d5`; blob карточки P5 transfer `09f33f99d771ab28b9575de1a358acc40b4d571c`. Прочитаны ORDER rev5, P2-P6-transfer, P5-regenerated-objects, COMMON и собственная роль. Общий transfer JSON прочитан целиком. Продукты/маски/результаты соседних методов не использованы.

P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, prefix `experiments/p1-collider-mapping/clean-repeat-01/`:

| Вход | Bytes | SHA256 |
| --- | ---: | --- |
| `simulation/boards/04/trial-02/config.json` | 27231 | `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| manifest рядом | 15870 | `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| `viewer/src/view-math.mjs` | 3050 | `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e` |
| `K:/Agents/R4D/Assets/perspective/04-water-temple.jpg` | 527016 | `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` |

Проверены реальные Git bytes без нормализации; JPG прочитан read-only, 1536×1536, исходник просмотрен. Water trial-01 остаётся историческим startup FAIL; он не запускался и не подставлялся.

Повторно использован собственный ранее проверенный runtime настоящего ядра `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Проверены SHA/размеры 26 cached executable JS по прежнему inventory; новые экспорт, компиляция и Jungle matrix не выполнялись. Приватный исходный TS и карты не публикуются.

## Проверенный запуск

`validateConfig=[]`; counts: 6 pins, 106 segments, 4 buckets, 1 drop. Неизменные r16/bounce0.9; tick5ms/quantize7; g980/maxspeed2000/noise2deg/0.02/wallBounce1; lcg32. Старт `(33192.751665295094,33184.49424667716)`, angle90°, speed0, в проекции `(712,280)`. Минимальный начальный зазор до принятого коллайдера — 12.779332 native units (`far`), начального пересечения не найдено.

Seed 0–3 объявлены до запуска в STATE и `declaration.json`. На каждый — полный запуск и exact replay, всего 8 новых запусков этой доски, без win hunt:

| Seed | Terminal tick | Исход | Native contacts |
| ---: | ---: | --- | ---: |
| 0 | 1326 | LOST | 10 |
| 1 | 1196 | LOST | 9 |
| 2 | 1275 | IN_BUCKET receiver-02 | 15 |
| 3 | 589 | LOST | 4 |

Все полные state traces и event arrays первого запуска и replay совпали; config/world start не изменились. Все четыре position traces различаются. При speed0 начальная позиция не расходится: первый расход PRNG — state106 при frog-01, первое различие позиций seed1/2/3 относительно 0 — state107. Это штатное поведение ядра. 17560 сохранённых численных компонентов конечны; после tick0 соответствуют quantize7; ticks непрерывны.

227 точек новой геометрии и углов изображения: roundtrip native error ≤1.03e-11, отличие от accepted view-math — 0; ошибка углов ≤3.64e-12 source px. Все 117 native primitives единожды покрыты idMapping. Дополнительно проверены по 16 точек каждой из четырёх trigger circles: roundtrip ≤1.03e-11. Размер ground footprint r16: старт ≈28.33×11.16 source px, у receivers ≈37.41–37.49×19.45–19.54. Это плоский след, не размер видимого объёмного шарика.

## Реальные окна для frozen candidate

Collision event tick `t` относится к состоянию после шага `t+1`; сохранены состояния `t/t+1/t+2`, не условный кадр с тем же event tick. В `case-windows-001/windows.json` — 33 окна с exact states, source centers и motion ranges; все контакты также сохранены отдельно в input oracle.

| Проверка | Seed | Exact states / диапазон | Что уже установлено |
| --- | ---: | --- | --- |
| Внутренний проход arch-07 | 1 | 1008, 1009, 1014, 1020, 1021; движение 998–1031 | Ground disk пересекает всю полосу опор; внутренние касания event1012/1018. Минимальный clearance ≈0 с погрешностью 4.1e-8; это проход с касаниями, не свободный пролёт |
| Угол опоры arch-03-right-foot edge02 | 2 | 350/351/352 | Реальный endpoint contact |
| Лицевая сторона arch-03-right-foot edge03 | 3 | 348/349/350 | Реальный contact передней стороны |
| Опора arch-04-right-foot edge01 | 0 | 697/698/699 | Контакт около внутреннего угла опоры; видимый силуэт и перемычка ещё не проверены |
| Receiver-02 entry | 2 | 1273/1274/1275 | Строгий native center trigger; terminal1275, более позднего физического состояния нет |
| Receiver-03 missed approach | 1 | 1114/1115/1116 | Минимальная дистанция 60.9035 при r31.1366; это approach, не вход |
| Receiver-02 missed approach | 0 | 1244/1245/1246 | Минимальная дистанция 80.1744 при r30.6373 |

Восемь межопорных зазоров на трёх y-сечениях имеют ширину 52.01–61.44 native units при диаметре32. Это проверка геометрической доступности в выбранных сечениях; в объявленных seed только arch-07 дал полный проход. Остальные арки не объявляются недоступными вообще. Вода/острова/ступени — одна плоскость; lintel/height/water-edge colliders отсутствуют по общему входу. Проекция центра под перемычкой сама по себе не доказывает корректное скрытие объёмного шарика.

Receiver semantics: центр строго внутри r; радиус шарика не вычитается, высоты и погружения нет. Найденный receiver-02 entry подтверждает trigger, но не front-rim rendering. Входы receiver01/03/04 в серии не достигнуты; не получают PASS. Для silhouette intersections, Art-off mask bypass, pause/step/framing/replay invariance и фактического движения требуется первый frozen consumer. Охота за другими seed не выполнялась.

## Сохранность и продолжение

Runtime: `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/`. Точные pins, seeds, contacts и артефакты с SHA находятся в `EVIDENCE_PINS.json`; полные traces остаются здесь в собственном runtime. `summary.json` SHA `406d21360250ab5596e700b39a3820d95ce33bb076ede9e7e198c08d4906dc69`; windows SHA `31a339e874a0c48f0a4ccc644cfbcdc5c612169022851971997482239903a744`. Перепроверены размеры/хеши всех 22 файлов input index и case index. Около 0.84 MB input evidence; peak RSS <66 MiB. Перед запуском C/D/E free ≈15.12/14.65/9.78 GiB, free RAM10.98 GiB, CPU6%; после E9.776 GiB. Резерв соседям 4 GiB RAM/2 GiB E выдержан. Чужие процессы/серверы не тронуты.

Jungle result `df0d95f40e60991632c885f0bc53d32497a090e7`, recipe consumer `af23e124cf5bd1d9de884082ffbc993448217112`, Artist `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966` сохранены; receiver02/04, rails/raised plants/rare contours не переименованы в PASS. Новые ассеты не оценивались. serverWrites=0, tokenGranted=false. Следующее действие — независимая проверка первого frozen Water candidate по его точному URL/index/commit, с этими трассами и просмотром соседних состояний/движения.

Воспроизведение подготовки: из собственной worktree `D:/nodejs/node.exe experiments/p5-regenerated-objects/transfer-water-dark/water/qa/technical/prepare-oracle.mjs water input-oracle-NNN` с новым индексом. Анализ уже сохранённых traces: `select-case-windows.mjs water case-windows-NNN`. Повторять native runs до кандидата без нового вопроса не требуется.
