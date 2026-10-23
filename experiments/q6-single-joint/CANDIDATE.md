# Q6 — кандидат q6-c1

Builder `builder-r4d-q6-01`, 23 октября 2026. Единственный полный производственный проход по поручению CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`. База `f7b563db381078f90109bbf48946841809986217`, local `D:\dev\R4D`; модель/effort по переданной конфигурации `gpt-6.1-sol` / `medium`.

## Точный кандидат и открытие

Манифест: [output/builder/q6-c1-files.json](output/builder/q6-c1-files.json), SHA-256 **`cc739d9e680f64b3fecf62e855b80caf4a7002f501eba282668a9e95758c8321`**. Время freeze записано внутри. **20 runtime-файлов / 1 048 402 bytes + 56 immutable inputs / 5 582 809 bytes = 76 файлов / 6 631 211 bytes**. Это исходники запуска и все frozen/provenance/art/process inputs; node_modules, build products, проверочные скрипты, evidence и изменяемые отзывы не входят в freeze. Все пути/размеры/SHA перечислены пофайлово. `verify-candidate.mjs` после браузера подтвердил **76/76**, failures 0; `freeze-verification.json` содержит результат.

Локальный URL **http://127.0.0.1:4186/**, Vite **PID 63020**; command line проверена как собственный Node/Vite Q6. Сервер оставлен CTO. Повторный запуск из этого каталога: `npm ci`, `npm run dev` (порт strict 4186; чужой процесс не останавливать). `npm test` — шесть узких проверок; `npm run build` пишет в `output/builder/dist`. Публикация и commit не выполнены.

## Что собрано

J0/J1/J2 рядом; M1/M2 рядом для одного целевого J1; переключение одного варианта; отдельная J0 source-vs-neutral диагностика. Один Motion, clock и mutable pose для всех панелей. Все requests используют smoothstep 0.38s с захватом текущей промежуточной позы. Play — общий ping-pong с bind, pause удерживает pose/clock, step — 1/60, reset — pause/bind/clock=0. Пять заданных поз, оба фона, два масштаба, bones/pivots/layers доступны через интерфейс.

Нейтральная геометрия строго из контракта: pivots `[98,35]` / `[102,28]`, offset `[41,284]`, layers `−10/−11`; overlay J2 следует shin на `−8`. Диагностика source использует только J0 и offset `[39,240]`. Параметры изображения не зависят от bbox/варианта. Readout показывает clock/request/blend/root/world transforms/pivots/layers и CSS scale. Равенство проверяется на фактически присвоенных спрайтам transform и общей ссылке pose для всех пяти neutral variants; source и намеренный overlay исключены.

Artist manifest независимо подтверждён: `78bffb5f7311affdb5d6eaee7cc6c05bc44c756f845f84bb0e1692740d89f726`. Все 11 PNG проверены по SHA-256 и native size до копирования; runtime bytes равны Artist outputs. [public/art/manifest.json](public/art/manifest.json) содержит source→runtime mapping/hash/byte count и оговорки вариантов. J0 совпадает с originals, J1=M2, J2 сохраняет точную подложку J1. Никакого изображения/маски/арт-пикселя Builder не изменял.

## Самопроверка

`npm test`: **6/6**, frozen contract + 6 source hashes, mid-retarget/pose identity, ping-pong/reset/step, neutral/source formula/camera, detection transform/pose drift, exact runtime/Artist bytes и отношения J1/M2/J2. `npm run build`: успешно, Vite 7.3.7 / PixiJS 8 по established Q5 package/lock, собственные зависимости Q6. Логи в `output/builder/unit-results.txt` и `build-results.txt`.

Skill Playwright, отдельная CLI session `q6-builder`, собственный Chromium: **один полный implementer self-check**, desktop **1440×1100**, mobile **390×844**, **34 контрольные точки / 26 screenshots**. Все режимы, single для пяти вариантов, J и M на всех пяти позах, два произвольных mid-transition retarget, реальные UI play/pause/step/reset, оба фона/масштаба/diagnostics проверены. Assertions загрузки/равенства/непрерывности/шага/сброса/ширины прошли. JS errors **0**, warnings **0**, failed requests **0**, HTTP ≥400 **0**. При mobile режимы идут вертикально, горизонтального overflow нет. Это viewport эмуляция, не реальное мобильное устройство.

Скрипт/CLI log: `output/builder/browser-selfcheck.cjs` и `.log`; screenshots: `output/builder/output/playwright/`. Итоговые наблюдения: [output/builder/observations.json](output/builder/observations.json). Ограничение фиксации: CLI не вернул console.log массива отдельных samples; полный повтор не делался. Сохранились все screenshots/readouts и успешное завершение assertions. Отдельная короткая численная выгрузка `readback.json` проверила реальный RAF clock (0→0.2405999999761552 с), удержание pause и exact equality; это не второй полный pass. Первоначальный вызов CLI с неверным синтаксисом завершился SyntaxError до действий страницы; следующий callback выполнен. Инфраструктурные недочёты фиксации не выдаются за дефект метода.

## Раздельные наблюдения и ограничения

**Диагностика сборки:** в bind прежний source offset поднимает shin на 18.48 canonical screen px относительно neutral. На сохранённом кадре различаются длина/перекрытие, но тёмный художественный торец остаётся у обоих. Исправление offset не объявляется исправлением рисунка. Слои runtime сохранены; числовой manifest `−9` показан только как справка в diagnostic layers readout.

**Оформление J:** на 92° у J0 явно читается тёмный диск торца; у J1 вместо него ткань, но угол остаётся жёстким, а сокращённый запас не восстановлен. J2 добавляет узкую наклонную деталь; она не гарантирует полного покрытия и не объявлена победителем. Отдельные красивые кадры не подтверждают отсутствие дыр во всём диапазоне; review Artist и независимый QA ещё не выполнены.

**Получение M:** M1 сохраняет полые торцы, дрейф, правое обрезание бедра. У M2 outside-mask final=0 обеспечено композицией Artist, raw changed=71 437; это не точность генератора. Укорочение/потеря покрытия внутри масок остаётся в runtime. Builder не делал новых генераций и не воспроизводил попиксельные метрики Artist независимо; проверены переданные bytes/размеры/хеши и сборка.

**Показ:** fixed zoom 0.84 в flexion обрезает дистальный ботинок краем панели, колено видно; камера намеренно не подгоняется. Canvas intrinsic 440×660, фактическая CSS ширина desktop 438 из-за border (коэффициент 438/440), mobile дополнительно пропорционально уменьшена; коэффициенты видны в readout, renderer transforms остаются 0.42/0.84. Непрерывная естественность движения и 60fps не доказаны диагностическими snapshots; play проверяет работу общего времени, а не человеческое восприятие. Полный персонаж, физика/опора, реальные мобильные устройства, универсальность метода не проверялись.

## Сохранность и следующий шаг

Без изменений: frozen contract/sha (2), все шесть provenance/source, все 11 art PNG, все 37 process файлов — точный список в `immutableInputs` манифеста. Проверка после self-check: 56/56 inputs и 20/20 runtime. Protected Q1–Q5, исходный 5.6, чужие dirty/untracked не редактировались и не очищались. Собственные CLI screenshots перенесены из созданной CLI папки в `output/builder/`, собственный browser session закрывается после сохранения evidence; сервер остаётся CTO.

Кандидат передаётся на независимые reviews и авторский просмотр, затем responses и решение CTO. [coordination/builder-response.md](coordination/builder-response.md) — текущая передача Builder; это не ответ на ещё не полученные QA-замечания. После freeze runtime/art/rig/motion не исправлялись. Коррекция и второй полный проход не запускались.
