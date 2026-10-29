# Integration-03 UI fix01: адресная повторная проверка P2

Исправление live Tick input подтверждено на exact candidate `93963cdb1157afc517469f3c08b581455c7d1697`, URL `http://127.0.0.1:41769/`. Прежний P2 из baseline не воспроизвёлся в выданном сценарии. Это закрывает замечание для этих новых bytes; старые baseline/02/03 и их отчёты не переписывались. Полный native аудит и художественная приёмка не повторялись.

## Exact bytes и границы

40 files /6983315bytes. Inventory-file SHA-256 `eaffd874d5eae1d0881199253fb7a706601b829b2d64d4d23a700e6ccd2f0046`; все files независимо совпали с public frozen snapshot и live URL. Verbatim LF inventory сохранён в frozen-inventory.json. Consumer SHA-256 `7248b00992254b93f20eaf48b1d10a16719c1de9d7ee8dabe9e4438c6e1d53e5`.

Native bundle остаётся `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`; config/manifest — accepted P1 `dd5c519c…`/`7784dc0a…`, r16 и исходный start прежние. Controller source hash прежний `355591297e3a7ba7a1e775101785338956547261b5430de1d29b43f9357d108b`. Source hashes проверены по exact Git source, private runtime/oracle Builder не читались.

Новый SPRITE_PACKET_V02 из Artist exact `3899da2bc3fbaa9973bbc88dd823d58f958e7d60`: 6798bytes, UTF8/LF без BOM, SHA-256 `49766ad720b73ce4d92276917e7b394d6b552e078cdd0c0afe0b924c2650a680`. Source Git identity совпадает с объявленной использованной V02 input identity. Прежние V01 LF/CRLF hashes и отдельная baseline inventory correction сохраняются в предыдущих отчётах; новые bytes к ним не приравниваются.

## Реальный UI сценарий в IAB

Первый обычный «Новый бросок» дал seed `1608012128`. Дополнительный seed не выбирался, исход не отбрасывался.

1. Движение активно. После ввода95 live state был93; поле показывало95.
2. Пока выполнен screenshot и следующий readback, live state вырос до116, пауза оставалась false, поле по-прежнему95. Значит animation redraw действительно произошёл и не перезаписал ввод.
3. Реальная кнопка «Перейти» выбрала **state95**, поле95, paused=true. Screenshot paused95.png.
4. На паузе введён94 → «Перейти»: state94. Реальные +1 и +1 дали95 и96, поля синхронизировались с выбранным состоянием.
5. «Повторить seed» вернул тот же seed и original unquantized state0. Повторный seek95 дал в точности первоначальный state95: pos/vel, rngU32, tick, nearMissBucketIds и done совпали.

Все9 наблюдённых snapshots, включая live93/116, сравнены с самостоятельно рассчитанным коротким native oracle для этого seed. Нужен был только prefix0..116 (117states); нового полного native прогона не было. Полные9 actual snapshots и действия — actual-ui.json, вычисленный результат — check.json. Короткий oracle остаётся только в own E runtime.

Source подтверждает причину исправления: draw больше не присваивает value полям Tick/Seed на каждом animation frame. Явные navigation handlers вызывают syncChosenState; seek сначала читает выбранный target. QA продукт не исправлял.

## Ограниченная сверка renderer V02

На обычном common seed0 проверены только states95 и1916, по ранее подготовленному собственному oracle. Новый lift задан явно `liftRadiusFactor:1`; прежнего explicit visualLiftPx0 в V02 нет.

| Tick | Радиус / фактический lift | Actual sphere centre | Нижняя точка |
|---:|---:|---|---|
| 95 | 14.282009525822616px | 769.9703127263558, 353.007071755419 | равна P(native centre) |
| 1916 | 17.623217777858144px | 817.1193246163476, 1093.9755083979505 | равна P(native centre) |

Нижняя точка сферы совпала с принятой проекцией без численного расхождения в этих probes. Физический native centre при этом не менялся. Raw sphere/shadow PNG и sphere anchor прежние.

Actual ground shadow properties полностью совпали с собственной прежней integration02 capture на этих же состояниях: canvas1774×887, meshScale1/1, radius22/22, offset[-6,10], opacity.42, та же первая Float32 mesh vertex. Lift не перенёс ground shadow. Для остальных mesh properties используется ранее проверенная неизменная mapping logic; нового полного shadow audit не заявляется.

У единственного actual wood-01 сохранены layer/PNG hash/native base/radius/rect/anchor metadata относительно frozen integration03 adapter. Actual Sprite position и dimensions соответствуют тому же rect. Это проверка неизменности стыковки, а не новая оценка ellipse/силуэта, света или occlusion. Остальные24 объекта диагностические; финального художественного/motion PASS нет.

## Доставка и ограничения

QA изменения только в своей experiments/p6-geometry-first-art/qa области. Candidate images/config/projection/frozen bytes не менялись. Новые JSON записаны явно LF/UTF8; byte fixes старого inventory не смешаны с этим frozen candidate.

Неподдерживаемая Page.setDownloadBehavior не повторялась и не переносилась. Кнопочное скачивание replay остаётся отдельно непроверенным; повтор seed и snapshots не засчитываются за тест скачивания. Import и полный native audit остаются фактами ранее проверенного baseline, без нового неподтверждённого заявления.

Проверочный script: qa/check-ui-fix.mjs OWN_E_RUNTIME. Screenshots реального IAB и их SHA-256 — screenshots.json. Старые отчёты сохраняют фактические результаты прежних frozen версий.
