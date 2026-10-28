# P4 current03 — повторная независимая Technical QA

**PASS порученной технической дельты. TQA-02-01 закрыт на current03.**
Прежняя остановка кадрового цикла не повторилась в восьми проверенных
start/resume/seek случаях; движение, native state/PRNG/events подтверждены.
Существенных новых технических дефектов в проверенных сценариях не найдено.
Это не полный художественный PASS, приёмка всех корзин или разрешение release.

28 октября 2026. Исполнитель technical-qa-r4d-p4-extracted-01.

## Точный target и целостность

- Candidate: `p4-full-v03-candidate-03`.
- Artifact SHA-256: `298649ec518a13e8070201e822108005a6b5081454452f50243d18f2fde2d542`.
- Builder local source: `7d2344c1a8959f73ff26af5d3aba7dd02eb0e971`.
- App SHA-256: `855fd997a3f02629e924031841d9e3759d7d7f4008b1d8af034505dd12f76ece`.
- Artist: `b7efff1e2f519812421829808e71a0d83154926d`.
- Art manifest SHA-256: `276dfdfd32f1f543ce39d72fe7e360523c6ec70387d1c44dd21acd47f9fb1a6a`.
- Native SHA-256: `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`,
  commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`.
- P1 binding: `4b47db04c7140ebf88f69b91faa0b790d46f22ec`.

До браузера прочитаны target RUN/FROZEN и handoff. Самостоятельно проверены
все111 payload files по SHA на диске и через текущий HTTP preview; фактический
root113 files включает также artifact/FROZEN. frozen=true, builderDirty=false,
source/art fields совпали с поручением. Artist manifest и README побайтно
совпали с exact Artist Git objects.

Native/config/P1 manifest/projection побайтно совпали с current02 и прежним
oracle. Все65 PNG также побайтно прежние, включая ball/body/shadow/background.
Следовательно, общий config25/16/4/1, r16/tick5ms/g980/maxspeed2000/noise2deg/
0.02/lcg32/quantize7 сохранён. В конце повторно проверены неизменность111
локальных файлов и HTTP artifact/app/native/art manifest. Номер порта сам по
себе identity не считался.

## TQA-02-01: реальные fix cases

Новая собственная вкладка, реальные кнопки; каждое значение ниже получено из
текущего UI и затем сверено полным state/PRNG/events, а не только счётчиком.

| Действие current03 | Seed | Фактическое продвижение |
| --- | --- | --- |
| Fresh load → «Продолжить» | 0 | 0→70 |
| Импорт ordinary03 checkpoint605 → Play/pause | 1842222754 | 605→685 |
| Ещё resume/pause | 1842222754 | 685→758 |
| Ещё resume/pause | 1842222754 | 758→834 |
| Точный seek824 → Play/pause | 1842222754 | 824→904 |
| «Повторить» на сохранённом seed1 | 1 | 0→73 |
| «Повторить» на сохранённом seed4 | 4 | 0→70 |
| Прежняя stalled точка1000 → Play/pause | 4 | 1000→1069 |

После паузы повторный снимок904 не изменился. Консоль всей новой вкладки:
**0 errors, 0 warnings**, повторного RangeError нет. Три consecutive resume
и seek→Play не требуют reload для продолжения.

Source inspection на точном commit подтверждает rAF-only clock/reset,
неотрицательный elapsed, сохранение fractional remainder и планирование
следующего кадра в finally. Native guard не ослаблялся: native binary прежний,
guard count/Number.isSafeInteger остаётся в current app. Изменения scene —
наблюдаемость фактических actor parameters; ball-placement изменил комментарий,
не алгоритм. Replay implementation не изменилась. Код QA не исправляла.

## Сверка и регрессия затронутых controls

Готовый oracle — `6b011256d31c4ab0e617721420a92feda65ffbfd`; baseline current02 —
`cae522158d74f12765d766c71874886ce53465cc`. Перед использованием повторно
сверены27 native files и4 prepared inputs. Нового native build/stand/seed
matrix не было. Выполнены только необходимые prefixes для реально наблюдённых
текущих тиков: seed0 до70, ordinary03 до2421, seed1 до529, seed4 до2088,
собственный прежний LOST seed386928037 до1058.

- **40 принятых UI snapshots**: строго совпали все числа state, PRNG,
  done/result, session flags, drop/tick/timeSec и полные накопленные events.
- Manual605→+1→606; same-file import→605; +10→615; тот же file→605.
- Из605 изменены Art/Geometry, source/native view, camera-follow, zoom,
  parts. Состояние осталось605. Следующий +1 дал ровно исходные606 и events.
  На текущем кадре Art-off/Geometry-on путь виден без скрытой occlusion.
- Повторная пауза точна. В собственном сохранённом LOST1058 ручной +1 не
  изменил терминальное состояние.
- Старый собственный фактически скачанный current02 export импортирован
  в03: физика/events воспроизведены; UI честно сообщил отличие версии арта.
  Новый download не выполнялся. Проверка скачивания/повреждённого import и
  отрицательного loading из02 используется как baseline, не объявляется
  вновь выполненной на03. Текущие import/same-file/controls и успешный loader
  проверены заново.

Одна объектная выдача browser evaluate округлила timeSec0.47000000000000003
до0.47. Сырой DOM text содержал точное значение. Ошибочное измерение сохранено
как transport diagnostic и заменено повторным атомарным чтением JSON-строк.
Сверка native events остаётся строгой; допуск не расширялся. Причина и обе
величины — `candidate-03/observation-transport.json`; исходная запись не удалена.

## Shadow delta: фактическое применение

Manifest03 задаёт offsetR[-0.95,0.86], halfSizeR[1.55,0.58], opacity0.65.
В реальном source render seed1842222754/t590 получены:

- radius14.611384363781175; body center[577.7912292052332,440.6627982678328];
- shadow center[563.9104140596411,453.2285888206846];
- shadow scale[0.22647645763860821,0.32594626657665693];
- rendered source alpha0.65, source visible=true, flat visible=false;
- ground/artRoot/world/stage alpha1, texture mode premultiply-alpha-on-upload.

Значения сверены независимо с common r16/P1 и новыми manifest fields. Body
position/scale и PNG прежние. На собственном текущем normal кадре1280×720,
whole-board574², zoom1/follow false, мягкое пятно видно вниз-влево от сферы;
дополнительно просмотрено увеличение. Подтверждено применение параметров,
а художественная убедительность освещения остаётся компетенцией VQA.

## Текущие кадры и границы вывода

С current03 заново сняты/просмотрены partial wood605, wood contact615/616/617
(native event616), left-1 boundary527/528/529 на seed1 (event527), receiver02
2419/2420/2421 ordinary03, receiver04 2086/2087/2088 seed4. Состояния тиков
совпали с oracle. Это новые кадры03, а не переименованные доказательства02.
Частичная видимость за wood сохранилась; явной новой регрессии в этих окнах
не увидел. Контакт скрытый телом оценивался также по actual geometry.

Receiver02/04 заканчиваются IN_BUCKET на2421/2088; сфера остаётся целиком
видимой в отверстии. Receiver01/03, partial front-rim при capture и отдельная
фаза погружения **не подтверждены**. Удачные seed для них не искались.
Полный художественный набор/все контакты и целевой Review-prefix не приняты
этим отчётом. Общий mapping не менялся, нового доказанного input-дефекта нет.

Текущий root/relative-path preview реально загрузил64 textures. Privacy scan
всех113 files не нашёл TS/maps/sourcesContent/sourceMappingURL или закрытого
операторского пути. Будущий Review mount не выдан и не проверен. Полная
сетевая изоляция не заявляется.

## Evidence и завершение

Raw: `E:\R4D\perspective\p4-runtime\technical-qa\candidate-03`.
27 файлов (около2.95 MB) индексированы с SHA в
`candidate-03/evidence-index.json`; там свежие кадры, UI records и диагностика.
Рядом с этим отчётом сохранены небольшие JSON summaries. Числовое продолжение
воспроизводит собственный `scripts/compare-candidate03.mjs` с прежним oracle.

Перед браузером RAM свободно16.66/31.91 GiB, CPU0%/24 logical,
C/D/E14.37/16.29/16.27 GiB. Одна собственная встроенная вкладка, без новых
команд/процессов сборки/серверов; при одновременной VQA оценён совокупный
дополнительный пик двух вкладок2–4 GiB RAM. Своя вкладка закрыта. E в конце16.26
GiB; пороги4/2 GiB не достигались. Новые outputs только в собственном E-runtime
и QA-области своей ветки. Builder PID/процесс/artifact не менялись.

Remote hold Builder source сохранён. Доставка этого отчёта/evidence своей
веткой не является доставкой Builder source. Следующее решение по общему P4
и художественным ограничениям остаётся у Lead/CTO с независимым VQA.
