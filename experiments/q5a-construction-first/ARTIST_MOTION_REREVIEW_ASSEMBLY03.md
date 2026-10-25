# Q5A assembly03: личный re-review Asset Artist

**Финальный verdict: ARTIST_MOTION_PASS.** Исправление AM-A1 принято на проверенном frozen candidate. Весь нужный силуэт, включая волосы/голову, поднятые кисти и обувь, остаётся доступен в 2× на просмотренных прыжках. Режим действительно крупнее 1×. Нового мигания материалов, разрыва масок или нечитаемого скачка камеры в затронутом движении не обнаружил.

25 октября 2026 года, Europe/Kyiv. Постоянный Asset Artist `asset-artist-r4d-q5a-01`. Это адресный независимый личный re-review моего AM-A1, не новая команда и не QA/release. Прежний [ARTIST_MOTION_REVIEW.md](ARTIST_MOTION_REVIEW.md) с CHANGES_REQUIRED и его evidence оставлены без изменений.

## Frozen candidate и среда

**HEAD=origin/main=`101343caa68579aacd5e6c01b94206680c364ab7`**, `Q5A-NELA-ASSEMBLY-03`. Совпадение проверено перед запуском и после остановки. Cwd — `D:\dev\R4D\experiments\q5a-construction-first`, host `local`. Запускал лично: `$env:PORT='5192'; node assembly/server.mjs`; адрес `http://127.0.0.1:5192/review/r4d/q5a-construction-first/`. Отдельная session **`q5a-asset-rereview03-5192`**.

Реальный headed Chrome155.0.0.0 на Windows, WebGL1.0 (OpenGL ES2.0 Chromium), Playwright CLI из доступного cache; без установки пакетов. Desktop **1280×720, DPR1**. Mobile — отдельный временный browser context **390×844, DPR2, isMobile/touch** с desktop Chrome UA; эмуляция, не физический телефон/Safari. Полная среда сохранена в `environment.txt` и журналах browser capture.

`git diff f86e1dccb2748b901d1e2480669347c71de464ae HEAD -- assembly/rig.js assembly/motion.js art construction` не показал изменений. Замеры и художественный вывод ниже получены собственным браузером; самоотчёт Builder/Lead не использован как приёмка.

## Контрольные свидетели: до и после

### Desktop tick350 — та же точная поза

Повторил прежнюю последовательность из свежего pause: idle до tick240 → jump →12 шага →walk →12 шага →до push →low →12 шага →до flight →idle и повтор jump →48 шага. Используется тот же live engine, без установки motors/вершин/pose вручную.

Получен **tick350, t=2.9166667, flight elapsed=.4083333**. Максимальная разница всех сохранённых landmarks относительно прежнего `step.json / J-idle-apex-x2-light` — **0.0**. Поле elapsed здесь приведено по фактическому журналу, а не по приблизительной записи .400 в тексте старого отзыва.

- [До: assembly02, 2×, верх срезан](output/artist-motion-asset/J-idle-apex-x2-light.png).
- [После: assembly03, 2× light, полный силуэт](output/artist-motion-asset-rereview03/desktop-witness350-x2-light.png).
- [Та же paused pose, 1×](output/artist-motion-asset-rereview03/desktop-witness350-x1-light.png).
- [Та же paused pose, dark](output/artist-motion-asset-rereview03/desktop-witness350-x2-dark.png) и [diagnostics](output/artist-motion-asset-rereview03/desktop-witness350-x2-diagnostics.png).

Также лично просмотрены соседи **348/352**. В них волосы, голова, кончики поднятых кистей и обувь не касаются среза canvas. [Сравнение до/после/1×](output/artist-motion-asset-rereview03/desktop-before-after.jpg) собрано из полных browser PNG без изменения исходников; старый desktop viewport был1440×1100, новый1280×720, поэтому монтаж служит визуальным сравнением кадрирования, а точность позы подтверждается landmarks.

### Mobile recipe2824 — оговорка о предыстории сохранена

Воспроизведён сохранённый paused command tail: walk180 →stop(low)162 →walk120 →stop(idle)150 →jump12 →repeat jump →до push →walk/repeat jump →12 →до flight →low →48. До него использован свежий idle до tick2102. Получены **tick2824 / flight elapsed=.4083333**, соседи **2822/2826**. Запись — `mobile2824.json`, driver — `mobile-exact2824.js`.

В исходном realtime-журнале отсутствует полное начальное состояние motors и точное время всех предшествовавших UI-команд. Поэтому **историческая mobile world-поза не объявляется побайтно идентичной**: повторены paused recipe, фаза/elapsed и абсолютный номер тика с явно заданной idle-предысторией. Это ограничение не скрыто совпадением номера2824. Дополнительный mobile tail в `step.json` использует на12 тиков более длинную idle-предысторию (apex2836); он сохранён как дополнительный прогон, не подмена witness2824.

[До: срезанный верх](output/artist-motion-asset/M-apex-2x-light.png) → [после: полный силуэт в2×](output/artist-motion-asset-rereview03/mobile2824-x2-light.png). Тот же новый paused кадр просмотрен в [1×](output/artist-motion-asset-rereview03/mobile2824-x1-light.png), dark и diagnostics; соседи2822/2826 также целые. [Сравнительный монтаж](output/artist-motion-asset-rereview03/mobile-before-after.jpg) учитывает названную оговорку о предыстории.

## Весь затронутый прыжок

Лично прогнал jump из установившихся **idle, low и walk**, от подготовки до восстановления наземного поведения:

- **Realtime:** двенадцать полных прогонов — три исходных состояния ×desktop/mobile ×два набора просмотра. Для каждого состояния просмотрены light иdark; в одном наборе bones/mesh включены, в другом выключены. Скорость1×, непрерывный requestAnimationFrame, команды UI. Журналы `realtime.json` и `realtime-alt.json`, по72 собственных кадров. В каждом проходе сохранены prepare/push/flight/landing/ground recovery, а не только apex.
- **Step:** шесть полных прогонов, по180 наблюдений через1/60с, всего **1080**. Ключевые промежуточные PNG, соседние кадры, смена light/dark/diagnostics и сравнение с1× в той же paused pose сохранены в `step.json`; контактные листы `desktop/mobile-idle/low/walk-step-sheet.jpg`.

Пауза и `q5a.step` используют действующий кандидат; art/rig/motion или runtime-позы не заменялись. Визуально просмотрены свои контактные последовательности и полные контрольные PNG. Realtime capture имеет интервалы между кадрами; он не выдаётся за запись каждого display-frame или измерение всех возможных переходов. Полный первоначальный обзор всех ground-команд здесь не повторялся: предмет — исправленный framing/jump.

В подготовке, махе, отрыве, верхней/нисходящей части полёта и посадке **волосы, голова, наружный контур поднятых кистей с authored-срезами и обе туфли доступны целиком**, с учётом естественного перекрытия дальней конечности ближней. Нового прямоугольного торца кисти, исчезновения маски, скачка цвета ткани/кожи или разрыва изображения не увидел. Диагностические линии не меняют кадрирование. После отключения overlay материал сохраняет прежний вид.

Камера в2× заметно сопровождает верх тела в полёте и возвращает линию пола при снижении. Это читаемое сопровождение: не увидел нового перескока в другую позу, двойного смещения картинки или мигающего перемасштабирования. Появление/уход линии пола за край в полёте не срезает персонажа. Увеличенный мах остаётся энергичным, как в прежнем принятом наблюдении о стилизации; нового дефекта материала он не создаёт.

## Размер и границы — дополнительная собственная сверка

Кроме визуального просмотра, независимо считал фактические **GPU uniforms** zoom/origin/camera и проецировал все material vertices; проверка не сводится к чтению нового `framing.margins`. На1080 step-наблюдениях минимальный запас до границы canvas — **23.99994px (≈24px)**. Полный консервативный material envelope находится внутри поля, включая волосы/кисти/обувь; это согласуется с PNG.

Во всех шести полных step-прыжках фактический GPU scale оставался **2.0**, без скачка масштаба. В exact desktop350 и mobile2824 тот же paused персонаж имеет **CSS-увеличение1.5× относительно режима1×**: внутренний рендер увеличен2×, но canvas1280×960 вписывается иначе, чем960×640. Таким образом, режим действительно крупнее на экране, а не просто переименован. У desktop effective CSS scale .94921875 против .6328125; у mobile .56875 против .3791667. Переключение фона/diagnostics/масштаба в paused witness не меняет landmarks.

Цифры — вспомогательное свидетельство. Они не подменяют личный художественный вывод и не объявляют пройденной отдельную QA-программу. Две маски кистей загружены во всех сохранённых наблюдениях; browser console —0 errors/warnings.

## Evidence, сохранность и решение

Все новые материалы находятся только в [output/artist-motion-asset-rereview03/](output/artist-motion-asset-rereview03/): **399** кадров с состоянием/tick и12 полностраничных видов, всего411PNG; driver scripts, журналы, `summary.json`, `evidence-index.json` с SHA каждого кадра и сравнительные листы. Оригиналы старого review/evidence не пересохранялись: **232 файла** сверены по SHA с начальным `protected-prior.json` и совпали.

Production assembly/art/construction, другие review/state и чужие dirty/untracked не менялись. `git diff --name-only 101343caa68579aacd5e6c01b94206680c364ab7 -- .` из каталога Q5A пуст; новые собственные файлы остаются untracked. Build/assets/test, commit/push, QA/release/Q4A/Q2A и межчатовые сообщения не выполнялись.

**ARTIST_MOTION_PASS для Q5A-NELA-ASSEMBLY-03 на указанном frozen commit. AM-A1 закрыт личным повторным просмотром.** Это не переписывает исторический CHANGES_REQUIRED assembly02 и не является решением о release/следующем опыте вместо CTO.

Все свои временные mobile contexts и browser session закрыты; собственный сервер5192 остановлен, отсутствие listener проверено. Подтверждения — `browser-close.txt` и `server-stopped.txt`. Другие сессии/серверы не закрывались.
