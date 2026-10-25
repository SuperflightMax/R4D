# Q2A — независимая техническая проверка локального release package

**RELEASE_PACKAGE_TECHNICAL_QA_PASS.** Блокеров доставки в проверенном
локальном пакете не найдено. Это smoke принятого C2, не новая приёмка
анатомии и не разрешение VPS/release.

25 октября 2026, Europe/Kyiv. Technical QA `technical-qa-r4d-q2a-01`.
Основание: прямое поручение Lead и прочитанный `CTO_ACCEPTANCE_P2_C2.md`.
Проверка самостоятельная, скрипты/self-check Builder не запускались.

## Точная версия и неизменность

- Accepted source: `3c27b07d489f68b3d7d8b4c8beabd35c51402fd4`.
- Frozen source tree: `0c60f912f11cae1ce5e5cf99a6a8ce8fafc70bc4`.
- Public tree: `release-package/route-tree/review/r4d/q2a-simple-character/`.
- **18 файлов, 1 179 499 байт.**
- **SHA256 файла `release-package/provenance.json`:**
  `61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`.
- Начальные и конечные SHA256/размеры каждого из18 файлов, состав дерева
  и SHA256 самого manifest совпадают; `after.json: unchanged=true`.
- Принятый документ CTO совпадает с SHA256, записанным в provenance:
  `e18018746907ee498d67eee1d5a76bd4f6bf1693473a4835456f3ea32fcab6e1`.

Собственный `verify-independent.mjs` проверил каждую запись provenance
по **реальным Git bytes** source commit, а не только по утверждениям manifest:
source path/blob SHA1/bytes/SHA256, выходные bytes/SHA256, mode и HTTP-ответ.
Все18 публичных файлов по HTTP200 побайтно совпали с локальным пакетом.

## Происхождение и допустимые изменения

14 файлов полностью равны соответствующим Git blobs:10 PNG, motion.js,
pose.js, style.css и лицензия Pixi. Геометрия/движение не пересобирались.

Оставшиеся4 файла просмотрены отдельно:

- `index.html`: относительные адреса ресурсов, удалённые debug controls,
  краткое описание принятого PoC, source/tree и честные ограничения.
  Основные кнопки, pause, история и выбор фона сохранены.
- `runtime/art-binding.json`: version, rig, scale, translation и все численные
  данные parts/crop/offset/layer равны accepted. Из parts изменены только PNG URLs
  на маршрутные `./art/...`. Удалены неиспользуемые диагностические поля:
  artVersion/sourceMetadata/status/runtimeRevision/artStatus/knownDeviations.
  Их удаление не меняет используемый runtime rig или арт.
- `runtime/main.js`: просмотрен diff с accepted source. Независимая сверка
  всего файла после явно разрешённых преобразований сошлась: module-relative
  binding fetch, текст принятого статуса, удаление skeleton/selector/debug observer.
  Отдельно совпали генерация mesh, command/history и ticker. Все поверхности
  остаются видимыми, как в исходном режиме all; камера/формулы сохранены.
- `runtime/vendor/pixi.min.js`: исполняемая библиотека сохранена, удалена
  только завершающая source-map directive и её неисполняемые переводы строк.

Независимый whitelist содержит ровно: index.html; main/motion/pose/style,
art-binding; Pixi с лицензией;10 принятых PNG. Иных публичных файлов нет.
Raw, prompts, rejected attempts, QA screenshots/logs, source maps, server scripts,
credentials и локальных Windows/localhost путей в публичном дереве не найдено.
Source commit/tree в описании — разрешённые идентификаторы версии.
Контрольные HTTP-запросы к provenance, preview-server, runtime/server,
source map, обоим raw и QA-log вернули404. Это проверка отсутствия перечисленных
публичных файлов, не полный аудит безопасности будущего сервера.

## Собственный smoke по полному route

URL: **http://127.0.0.1:4340/review/r4d/q2a-simple-character/**.
Использован существующий preview-server Builder, PID104852, localhost4340.
Прочитан `preview-server.mjs`; сервер самостоятельно не запускал/не менял.
`PACKAGE.md` в начале отсутствовал, URL определён по серверному коду и
существующему listener. К завершению документ появился и прочитан полностью:
source/tree, manifest SHA256,18 файлов/1 179 499 байт и разрешённые адаптации
согласуются с собственными проверками. Самопроверка Builder не используется
как мой PASS. Исходный4333 для package-smoke не использовался.

Встроенный браузер Codex, своя сессия `q2a-release-package-technical`.
Desktop1440×1000 и mobile390×844. Личный Chrome и чужие вкладки не трогал.
Состояния фиксировались через публичные DOM/status/aria-pressed и историю;
удалённый debug observer обратно не добавлялся.

| Проверка | Собственный результат |
|---|---|
| Загрузка точного route | Загружен художественный персонаж, статус `p2_candidate_c2`, без обращения к исходному runtime4333 |
| Canonical idle/low/walk/jump | Через реальные кнопки; low выраженный, walk движется с сопровождением камеры, jump имеет полёт и посадку |
| Последовательность1 | idle→low→walk→idle→jump→idle пройдена на desktop/light и mobile/light |
| Последовательность2 | walk→low→jump→walk→jump→low пройдена на desktop/dark и mobile/dark; перед выбором walk/low показано «Полёт» |
| Flight targets | Дополнительно на mobile каждую idle/walk/low выбирал после подтверждённого «Полёт»; сразу после выбора статус ещё «Полёт» с новой целью, после посадки получено выбранное наземное поведение |
| Pause | На desktop40,6 с и mobile104,7 с показ времени/стадия/история не изменились за600 мс наблюдения; кнопка «Продолжить» |
| History branch | Desktop: cursor3600→3480, время40,6→39,6 с; команда walk продолжила ветку до40,3 с/max3562, старый хвост не восстановлен. Mobile: cursor3300 восстановил «Подготовка»/102,2 с; walk продолжил тот прыжок до «Полёт · Ходьба»/102,9 с/max3382 |
| Light/dark | Оба фона переключаются, персонаж и наземные метки видны |
| Wrapper/описание | Открыто «Об опыте и ограничениях», видны принятые ограничения и source/tree. Длинные hashes не создают горизонтальный overflow на mobile |
| Framing/overflow | В просмотренных наземных состояниях и прыжках персонаж внутри canvas на обоих размерах; горизонтального overflow не обнаружено, вертикальная прокрутка штатная |
| Console/runtime/network | Console errors/warnings0; в наблюдаемом CDP target loadingFailed/runtime exceptions/HTTP≥400 —0. HTTP(S)-адреса только127.0.0.1:4340 и полный Review route; кроме них встроенные data/blob. Все18 файлов дополнительно проверены независимо по HTTP |

## Ограничения вывода и завершение

Проверен локальный маршрут и доставка тех же принятых motion/pose/PNG.
Новая геометрическая/анатомическая correction-итерация не проводилась;
ограничения49,20° toe/61,26° свободной стопы, колена, ткани и плеча остаются
принятыми согласно CTO. Технический smoke не отменяет их и не доказывает
художественное совершенство.

Это агентский просмотр, не человеческий playtest. Настоящий телефон/touch,
другие движки, будущая VPS-авторизация/headers/cache и post-auth публичный
canvas не проверялись. Внешняя сеть физически не отключалась. Сетевой журнал
охватывает основной CDP target; метод auto-attach к worker targets недоступен
через этот браузерный интерфейс. Поэтому отсутствие внешних запросов
утверждается для наблюдаемого target, а не как полный сетевой аудит worker-ов.
Все включённые PNG и модули имеют локальные разрешённые адреса и проверены HTTP.

Собственные доказательства только в `qa/release-package-technical/`:
before/after/verification.json, независимые verify-independent.mjs и
check-private.mjs/private-paths.json, browser-observations.json, console.json,
network.json и собственные desktop/mobile PNG. Они не входят в public tree.
Проверяемый пакет и прежние отчёты/evidence не менял. Собственная вкладка
закрыта, viewport сброшен; сервер Builder оставлен работающим. Файлы/Git
чужой работы не очищались; commit/push, VPS и release не выполнялись.

Результат передаётся Lead: пакет соответствует exact accepted source в
проверенном объёме, manifest/публичные bytes стабильны, блокеров нет.
