# Q5A — независимый Concept motion/design review

25 октября 2026 года, Europe/Kyiv. Concept Artist `concept-artist-r4d-q5a-01`.

**Финальный вердикт: CHANGES_REQUIRED.** Обязательное замечание **CM1**: крупный просмотр 2× обрезает поднятые кисти и голову в полёте на desktop и mobile. Это мешает видеть целый силуэт и принимать работу верхней части тела в обязательной фазе jump. В просмотренных полноценных кадрах иных обязательных художественных исправлений персонажа/движения не выявил. До устранения CM1 `CONCEPT_MOTION_PASS` не выдаю.

## Frozen candidate и среда

Проверен **Q5A-NELA-ASSEMBLY-02**, exact commit **`f86e1dccb2748b901d1e2480669347c71de464ae`**. В начале и при завершении HEAD=origin/main на этом commit. Production assembly, art attempt03 и construction v4 не редактировались. Образ сопоставлен с [DESIGN.md](DESIGN.md) и [принятым статическим артом](ART_CONCEPT_REREVIEW_ATTEMPT03.md); мой прежний статический PASS не переносился на движение автоматически.

Лично запущен `node assembly/server.mjs` из `D:\dev\R4D\experiments\q5a-construction-first`, `PORT=5188`. Адрес просмотра — `http://127.0.0.1:5188/review/r4d/q5a-construction-first/`. Порты 5185/5187 не использовались.

- Реальный headed Chrome 155 на Windows, отдельная сессия `q5a-concept-5188`, viewport **1440×1080**, DPR1. Node **24.15.0**, Playwright CLI **0.1.22**. [Снятая среда desktop](output/artist-motion-concept/environment-desktop.json).
- Отдельный mobile browser context `q5a-concept-mobile-5188`: Chrome **155.0.8059.12**, эмуляция **Pixel10 / Android16**, viewport **390×844**, DPR3, touch1. [Среда и наблюдения mobile](output/artist-motion-concept/mobile.json). Это эмуляция в реальном Chrome, физический телефон не использовался.
- Просмотрены light/dark, штатные режимы **1×/2×**, чистый растр и наложение костей/опор/mesh. На mobile сцена вписывается в CSS-ширину; logical anatomy390px не выдаётся за фактический CSS-размер на телефоне.

Прочитаны инструкция запуска и доступные controls. Выводы Builder/Lead, self-check, чужой художественный motion review и чужие evidence основанием вердикта не служили. Наблюдения и все ссылки ниже — собственные браузерные захваты.

## Как смотрел и что прошёл

Обычный realtime работал со скоростью **1×**, с UI-командами и собственными видео/последовательными захватами промежуточных кадров. Пауза и пошаговый просмотр использовали тот же работающий runtime. Для плотных серий вызывался штатный `window.q5a.step(2)`, эквивалент одного «Кадр +» (1/60с); сама кнопка также нажата. Данные моторов/фаз читались для привязки к кадрам. Поза, моторы, rig и траектория вручную не подменялись.

| Просмотренный сценарий | Собственные evidence |
|---|---|
| Вся A: idle → low → walk → stop(idle) → jump → idle, realtime | [Видео A](output/artist-motion-concept/realtime-a.webm), 42 исходных `a-000…041.png`, обзор [1](output/artist-motion-concept/a-filmstrip-1.jpg), [2](output/artist-motion-concept/a-filmstrip-2.jpg), [3](output/artist-motion-concept/a-filmstrip-3.jpg), [4](output/artist-motion-concept/a-filmstrip-4.jpg) |
| Вся B: walk → low → jump → walk → jump → low, realtime; в контрольной записи обе наземные цели подаются после фактического начала flight | [Видео B с привязкой к фазе](output/artist-motion-concept/realtime-b-phase-guard.webm), [команды и фазы](output/artist-motion-concept/sequence-b-phase-guard.json). Первый прогон также сохранён как `realtime-b.webm` и `b-000…039.png` |
| Ранний low→walk после **4/60с**, частые idle/low/walk, stop в low, отмена подъёма и новый walk; dark2×, step | [Полная запись C](output/artist-motion-concept/step-switches-complete.json), 75 `c2-000…074.png`, семь `c2-filmstrip-*.jpg` |
| Low→jump после **2/60, 7/60 и 15/60с**, с просмотром подготовки/отрыва/полёта/посадки | [Запись E](output/artist-motion-concept/early-jumps.json), `e-000…035.png`, [первый вариант](output/artist-motion-concept/e-filmstrip-1.jpg), [другие моменты команды](output/artist-motion-concept/e-filmstrip-2.jpg), [третий вариант](output/artist-motion-concept/e-filmstrip-3.jpg) |
| Jump из idle/low/walk; смены idle/low/walk в prepare, push, flight, landing и recovery; повторный запрос jump в prepare/push/flight; новый полный jump | [Запись D с точными фазами](output/artist-motion-concept/step-jump.json), 75 `d-000…074.png`, семь `d-filmstrip-*.jpg`; исходные A/B также охватывают три наземных старта |
| Повторный jump в landing при elapsed≈**0,0417с** и в ground/recovery при elapsed≈**0,375с** | [Запись E](output/artist-motion-concept/early-jumps.json), `e-036…061.png`, [посадка→новый jump](output/artist-motion-concept/e-filmstrip-4.jpg), [восстановление→новый jump](output/artist-motion-concept/e-filmstrip-5.jpg). В подписи helper есть «first recovery frame»; фактический elapsed0,375с указан здесь и в данных, за самый первый кадр recovery этот случай не выдаётся |
| Mobile touch: low, start/stop, jump из low/walk/idle, выбор цели в полёте, ранний low→walk; realtime light1×/dark2×, чистый и диагностический показ | [Видео mobile](output/artist-motion-concept/realtime-mobile.webm), [данные](output/artist-motion-concept/mobile.json), 64 `m-000…063.png`, шесть `m-filmstrip-*.jpg`, [полная страница с диагностикой](output/artist-motion-concept/mobile-diagnostic-full.png) |

Все перечисленные серии кадров просмотрены последовательно; подозрительный apex дополнительно разобран по исходным PNG и отдельному воспроизведению без смены позы. Обзорные JPG содержат только подписанные области собственных screenshots; исходные PNG сохранены. Browser capture/helper scripts лежат рядом, production code ими не меняется.

Первый покадровый C остановился из-за моего неточного селектора списка «Остановка в». Его 31 кадр `c-*.png` и `step-switches.json` с ошибкой сохранены как незавершённый служебный прогон. Для выводов о полном C использован успешный повтор `c2-*` / `step-switches-complete.json`. Контрольная B с фазовым ожиданием отдельно фиксирует момент запроса после отрыва; ранняя команда из первого realtime B не подменяет эту проверку.

## CM1 — обязательное исправление кадрирования 2×

**Средний приоритет, требуется до закрытия этого motion gate.** В верхней части jump видимый растр заканчивается на верхней границе canvas: пропадают кончики пальцев, затем часть поднятых рук и верх головы. Это повторяется на светлом и тёмном фоне, с диагностикой и без неё. Полный screenshot страницы показывает тот же срез внутри сцены, поэтому причиной не является кадрирование обзорного JPG или положение страницы при прокрутке.

Простое повторение на frozen candidate:

1. Загрузить viewer, нажать «Пауза» в исходной стойке.
2. Нажать «Прыжок ↑» и выполнить **60 «Кадр +»**. Эквивалент в [моём воспроизведении](output/artist-motion-concept/reproduce-framing.js) — 120 штатных substeps по1/120с.
3. На той же паузе переключить «Крупно2×», фон и диагностику.

Desktop: **tick129, t≈1,075с, flight elapsed≈0,491667с**. Mobile: **tick130, t≈1,083333с, тот же flight elapsed**. Между сравнительными снимками landmarks не изменились (`samePose=true` в обоих JSON):

- Desktop: [1×, персонаж целиком](output/artist-motion-concept/repro-desktop-1x-light.png) → [2×, обрезаны голова и руки](output/artist-motion-concept/repro-desktop-2x-light.png); [dark+diagnostics](output/artist-motion-concept/repro-desktop-2x-diagnostic.png), [полная страница](output/artist-motion-concept/repro-desktop-2x-full-page.png), [фаза/поза](output/artist-motion-concept/repro-desktop.json).
- Mobile: [1×](output/artist-motion-concept/repro-mobile-1x-light.png) → [2×](output/artist-motion-concept/repro-mobile-2x-light.png); [dark](output/artist-motion-concept/repro-mobile-2x-dark.png), [полная страница](output/artist-motion-concept/repro-mobile-2x-full-page.png), [фаза/поза](output/artist-motion-concept/repro-mobile.json).
- В последовательном движении дефект виден, например, в [d-020](output/artist-motion-concept/d-020.png), при flight elapsed≈0,308333с, и в mobile `m-058…060.png`. Это не единственный неудачно выбранный кадр.

**Нужный результат:** весь силуэт, включая волосы, кисти и обувь, остаётся доступным в крупном просмотре на протяжении прыжка. Исправлять следует framing/вертикальное положение или вписывание сцены. Не нужно уменьшать прыжок, ограничивать мах рук, менять принятый арт или убирать 2×. После исправления повторить тот же apex, соседние промежуточные кадры и jump из трёх наземных состояний на desktop/mobile. Сейчас верхнюю часть этих кадров при2× полностью оценить нельзя.

## Художественные наблюдения по видимому движению

Нэла сохраняет лицо, характер, взрослую компактную фигуру, цветовое сочетание и открытые сочленения. Рисунок не переключается на другого персонажа; нет робота, бронепанелей, суставных дисков или новой накладки, объясняющей плохой стык.

**Вес и действие.** Idle сдержанный, с небольшим переносом корпуса. Low отчётливо опускает таз через бёдра/колени и наклоняет торс; это настоящий присед. Walk короткошаговый и немного пружинящий, с различимыми опорой/переносом и встречными руками. Для выбранного образа такую сдержанную походку принимаю как стилизацию. Jump имеет читаемые подготовку, выталкивание руками/ногами, полёт и смягчение посадки; при1× силуэт действия сохраняется целиком.

**Цельность и анатомия.** В видимых переходах плечо остаётся связано с грудной клеткой, таз — с двумя ногами; шорты не распадаются на жёсткие отдельные обоймы. Локти/колени продолжают живую кожу, кисти сохраняют ладонь, большой палец и группу кончиков. При быстрых изменениях цели руки энергично меняют направление, но в просмотренных промежуточных кадрах не возникли отрыв, поперечный тёмный торец, механическая накладка или сброс в bind. Временное перекрытие двух рук естественно; дальняя рука прослеживается в раскрытых положениях.

**Опора и остановка.** По рисунку и отметкам пола не увидел длительного видимого скольжения заявленной опорной стопы или зависания обеих ног в наземной стойке. При остановке завершается перенос/подстановка стопы, затем тело приходит в выбранный idle/low. Отрыв и новый контакт в jump различимы. Это визуальная оценка своих прогонов, не исчерпывающее техническое доказательство контактов во всех возможных командах.

**Прерывания.** В записях C/D/E непосредственно до/после UI-команды сохранялись положения и скорости моторов; последовательные картинки подтверждают продолжение текущего движения. Ранний low можно сменить walk/jump, направление подъёма — развернуть. Повторный запрос в prepare/push/flight не дал второго отрыва в воздухе. Запрос в landing/recovery начинает новый цикл из текущего тела, без показанного скачка в исходную стойку.

На крупном просмотре остаются упрощённые свет/складка колена, мягкая фактура шорт и местами близкие силуэты двух рук. Пока они видны целиком, характер и живая форма читаются; дополнительных обязательных исправлений по этим особенностям не назначаю. CM1 отдельно закрывает видимость верхнего силуэта в apex; отсутствие других замечаний не заменяет его устранения.

## Сохранность и завершение собственного запуска

Сравнение с начальным снимком подтвердило побайтную сохранность **2404/2404** существовавших файлов, включая production и чужие dirty/untracked. Параллельные чужие добавления не редактировались. Созданы только этот новый отзыв и собственные материалы внутри `output/artist-motion-concept/`. Изменений иных review, art, construction, assembly, state, commit/push и публикации нет. Build/test/QA/release и Q4A/Q2A не запускались.

Обе мои browser sessions закрыты; собственный localhost5188 server остановлен, слушателя5188 после остановки нет. Короткий дополнительный запуск для контрольной B также завершён. [Фиксация завершения](output/artist-motion-concept/cleanup.json), [desktop close](output/artist-motion-concept/desktop-close.log), [контрольный desktop close](output/artist-motion-concept/desktop-second-close.log), [mobile close](output/artist-motion-concept/mobile-close.log). Дальнейшее решение и поручение на исправление остаются за CTO.
