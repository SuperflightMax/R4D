# Water + Dark: bounded public IAB smoke

2026-10-29. Lead проверил два фактических HTTPS sibling prefix после switch
2026-10-29T16:40:46.555575Z. Existing in-app browser, tabs1/2. Без login,
cookies/auth/header injection, смены защиты или нового browser profile.

- Water: https://superflight.space/review/r4d/p3-masks-water/ . Title
  `P3 · Water / маски`; реально видна цельная исходная сцена, controls и
  `Сцена загружена: 71 масок`. Footer source5196c0bd4981, core5a6fa03f1cdb,
  P1 4b47db04c714, Pixi8.22.0. Обычный UI `+10 тиков` перевёл seed0 из
  tick0 в tick10, 0.050с, paused; seek и tick controls согласованы.
- Dark: https://superflight.space/review/r4d/p3-masks-dark/ . Title
  `P3 · Dark / маски`; реально видна исходная сцена, controls и
  `Сцена загружена: 60 масок`. Footer sourced7eac5d7d761, тот же core/P1/Pixi.
  `+10 тиков` перевёл seed0 из tick0 в tick10, 0.050с, paused; controls согласованы.

Lead фактически просмотрел screenshots обоих canvas и accessibility state;
это сцены, не login/HTML-заглушки. Оба browser tabs отмечены deliverable.
Доказательства — текущий transcript `mcp__cua_repl.js`: initial Water open,
Water AX/screenshot, full Water AX + Dark open, Water step10 + Dark screenshot,
Dark step10 AX/screenshot. Canvas виден целиком по ширине, низ страницы scrollable.

Это короткий public UI smoke двух prefix в конкретном IAB context, не повтор
native/visual QA matrix и не универсальная auth/security приёмка. Случайные
броски, новая матрица, checkpoint import/export и новая visual acceptance не
проводились. Оба итоговых verdict остаются PARTIAL; W-DIVIDER-01 OPEN,
Dark coverage/shadow limits сохраняются. Payload/MIME доказательства отдельно
в фактических Release217 postchecks. Server writer только existing Release.
