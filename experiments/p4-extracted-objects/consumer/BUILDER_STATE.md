# Builder P4 — состояние продолжения

Stage 2 разрешён отдельным поручением Lead 28.10.2026. Роль действует только
в назначенной ветке `codex/r4d-p4-extracted-builder-01`. Модель/reasoning не
перенастраивались. Подтверждение Director `gpt-6.1-sol/xhigh` получено через Lead,
сам runtime эти параметры роли не раскрывает.

Первая версия consumer готова к раннему стыку. Все назначенные exact входы
проверены; original JPG hash совпал, native HEAD точный и clean. Pixi 8.22.0 MIT.
Dependencies/staging/output только в собственном runtime.

Сборка integration-01, сцена `http://127.0.0.1:4394/`, server запущен Builder.
Пока нет artwork: исходник + диагностический слой, явная надпись об этом.
Это не frozen QA candidate и не визуальный PASS.

Проверки native: шесть сохранённых до прогона обычных seeds:
3664362688, 2817903407, 1842222754, 102375664, 2964851399, 3838689635.
Все trace hashes разные, результат/тики совпали с native runUntilDone.
Третий завершился IN_BUCKET receiver-02; остальные LOST. Это результаты ядра,
не выборка для художественного PASS. Все runs сохранены, неудачные не отброшены.
Seek и checkpoint roundtrip, PRNG/events и атомарное отклонение испорченного
checkpoint проверены. Evidence — runtime/evidence, native-validation.json и
ordinary-*.checkpoint.json.

UI самопроверка во встроенной изолированной вкладке: +1 = tick1/0.005s,
+N(10) = tick11/0.055s; seek145 = 0.725s. Art-off, geometry toggle,
source/native и zoom не изменили paused state/PRNG. Random дал seed2709884210,
запуск двигался. Сохранены source/native PNG в runtime/evidence.
UI file-flow export/import остаётся непроверенным; native roundtrip прошёл.

Стыковка: ART_INTEGRATION.md — proposal v1. Вопрос Artist через Lead:
нужен exact commit/path manifest, PNG двух типов (flower-01/wood-01), очищенный
фон и receiver-01 с достаточными частями. Реальные alpha/anchors/depth/shadows
без PNG ещё не подтверждены. Чужие checkout и artwork не редактировались.

Новых диагностированных дефектов общего маппинга пока нет. Наблюдаемые LOST
сами по себе не доказывают ошибку маппинга. Config/геометрия/PRNG не подгонялись.

Последний ресурсный срез: RAM свободно 16.30/31.91 GiB, CPU 13%,
C 14.88 / D 16.31 / E 16.68 GiB свободно. Собственный небольшой bundle ~0.62 MiB;
следующая сборка ожидаемо <0.2 GiB RAM, без imagegen/новых браузерных процессов.
Пороговые ограничения E действуют. Новых denial не было.

Следующий шаг после передачи арта: загрузить exact bytes, подтвердить контракт
на малом стыке, проверить source/native и контактные кадры до/во время/после
перекрытия. Только потом явно заморозить named candidate для QA.
