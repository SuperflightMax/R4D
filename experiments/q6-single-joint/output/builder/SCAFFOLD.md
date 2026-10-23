# Q6 — Builder: каркас первого прохода

CTO `cto-r4d-01` разрешил производственный этап Builder `builder-r4d-q6-01` в этой сессии. База `f7b563db381078f90109bbf48946841809986217`, cwd `D:\dev\R4D`, local. Контракт независимо сверен: SHA-256 `e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a`.

Подготовлены `src/motion.js`, `src/rig.js`, PixiJS-интерфейс, общий clock/pose, переход 0.38s из текущей позы, J/M/single/source diagnostic, controls, readout и проверка фактических transform. Ожидающие варианты явно отсутствуют, художественных заменителей нет. `public/art/J0` — побайтные копии двух provenance originals, mapping в `public/art/manifest.json`. Source diagnostic использует те же J0 и исходный offset; нейтральные варианты используют frozen offset.

Самопроверка каркаса: `npm test` — 5/5: frozen contract + шесть source hashes; mid-transition retarget/идентичность pose; ping-pong/reset/step; геометрия neutral/source/камера; обнаружение разных transform/pose. `npm run build` успешен. Это не браузерная проверка и не подтверждение визуального качества. Node/Vite/PixiJS toolchain и lock взяты из установленного Q5 с собственным package name; собственные зависимости установлены внутри Q6, Q5 не менялся.

Готов принять отдельный art handoff CTO. После него: точные копии Artist outputs → runtime mapping, unit/build и браузерная самопроверка по skill Playwright → один frozen candidate. До передачи арт не читается и не обрабатывается. Сервер и браузер пока не запускались. Commit/publish и второй проход не выполнялись.
