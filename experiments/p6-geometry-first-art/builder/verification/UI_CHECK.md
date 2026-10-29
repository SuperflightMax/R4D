# P6: самопроверка технического consumer во встроенном браузере

29 октября 2026. Localhost `http://127.0.0.1:41766/`, встроенный браузер Codex, отдельная фоновая вкладка. Пользовательский Chrome/desktop не использовался.

Это проверка построенного Builder стенда на геометрическом черновике. Художественные PNG Artist ещё не подключены; качество слоёв/теней/перекрытий этим не подтверждено.

Проверено реальными действиями UI:

- Seed0, переход к state94; +1 даёт state95, native `object_hit leaf-01` с event tick94. Видимы `x33254.8464511`, `y33263.0448323`, `rngU32=1196435762`.
- На паузе source→flat, арт off/on сохраняют tick95, координаты и PRNG. Диагностическая геометрия видна при выключенном арте. Обратная проекция черновика отображается PixiJS mesh.
- «Новый бросок» выдал обычный browser-crypto seed1078206053; real-time прошёл 13 физических тиков, «Пауза» удержала state13. Сохранён соответствующий собственный native replay, затем весь этот seed рассчитан без отбора: LOST на tick1193, finalX33872.9607758. Оба replay лежат в own runtime/verification.
- Seed0, seek1956 показывает native IN_BUCKET/receiver-03, bucket event tick1956, resulting state1956. Полный кадр и состояние: `ui/seed0-terminal1956.png`.

Другие снимки: `ui/seed0-state95.png`, `ui/seed0-state95-flat-geometry.png`, `ui/seed0-state95-flat-draft.png`. Эти три сделаны до изменения CSS размера поля, без изменения физики. Точное native состояние и его события отдельно проверены в `native-selfcheck.json`, включая canonical digests всех retained normal seeds0/1/2.

Самопроверка native controller также проверяет экспорт/импорт replay и seek94/95/96. UI-путь выбора файла и сохранение browser download в этой проверке не исполнялись. Art-layer loader, RGBA ball и shadow grid требуют фактического frozen Artist candidate и просмотра независимой QA; предусмотренный код не считается результатом этой проверки.
