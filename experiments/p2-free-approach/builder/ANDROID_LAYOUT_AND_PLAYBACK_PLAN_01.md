# P2: Android layout diagnosis и playback plan 01

28 октября 2026. **SOURCE_DIAGNOSIS_AND_PLAN_ONLY; IMPLEMENTATION_NOT_STARTED**. Resume Max от05:36UTC (07:36 Europe/Kiev) через trusted Dot/CTO и адресное поручение Lead прочитаны. Начальный HEAD `be4f3664c7764409a6d60c158f11cd941d2eb2e9`, branch `codex/r4d-p2-free-builder-01`, status clean; pause-checkpoint и delivery/current state прочитаны без reset/switch. Feedback1–7 прочитан адресно из `dceb1b9e425fb22812e871542118819c85492de8:docs/PERSPECTIVE_RESEARCH_STATE.md`.

Работа ограничена чтением exact source/SDK, арифметикой принятой проекции и этим report. Продуктовых правок, runtime/QA/build/install/generation, login-only повторов, browser/server действий и новых assets нет. Candidate03/source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`/frozen bytes не менялись; token уже освобождён. P2slot1 не закрыт. UGH/соседние опыты не изучались и не менялись.

## Что установлено исходниками

| Свидетельство | Exact место / результат |
| --- | --- |
| Main source | `src/main.mjs` blob `9f06dfcd41aaacd2b39335f64fb70b4eddfc182f` на sourcee7ed… |
| CSS source | `style.css` blob `de3235b7917f32e531cac04ae4c3b1873247cd33` |
| HTML source | `index.html` blob `29644c33c87b72e7ebdf5ecf56eb6b76c324412d` |
| Application | main:31–33, `app.init` с WebGL preference/resolution1, canvas вставляется в stage; event/touch options не заданы |
| Spatial scale | main:84–95: `scale=min(stage.clientWidth,stage.clientHeight)/1536*zoom`; renderer resize и scene.scale, только onchange/ResizeObserver |
| Layout | CSS:2,7–8: main padding16, stage height min(77vh,1000px)/min-height400, overflow:auto; canvas display:block |
| Viewport | HTML:4 width=device-width/initial-scale1; нет user-scalable=no/maximum-scale |
| Controls | HTML:17 zoom1/1.5/2; canvas pinch/pan/wheel application handlers отсутствуют; main:198–207 обрабатывает отдельные DOM controls |
| Playback | main:208–219: ticker.deltaMS → accumulator → floor(/tickMs); rate control/множитель отсутствует |
| Exact ticks | controller:28–44 advance вызывает настоящий core по целым тикам; seek пересчитывает от seed |

Из этого следует: select «Масштаб» увеличивает нарисованную сцену и размер canvas, но сам не реализует pinch, перетаскивание либо передачу touch-gesture браузеру. Даже исправно работающий select не доказывает работоспособность увеличения пальцами. При zoom>1 canvas выходит за ширину stage, появляется вложенная scroll-область; focal point шарика/центр scroll position код не сохраняет. Весь квадрат1536² вписывается по меньшей стороне stage, поэтому узкий телефон уменьшает доску даже при высоком panel. HTML meta сам page zoom явно не запрещает.

## Фактический pinned Pixi8.22.0 и сильная causal prediction

Прочитан существующий SDK package version8.22.0, не latest SDK. Candidate03 `vendor/pixi.js` SHA256 `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef` совпал с pin; в actual bytes есть по одному `touchAction="none"` и `autoPreventDefault=!0`. Это адресное чтение зависимости для диагноза, не повтор старой runtime/QA матрицы.

- `lib/environment-browser/browserAll.mjs:3` подключает events/init; `lib/events/init.mjs:7` регистрирует EventSystem. EventSystem.extension:584–591 относится к WebGL/Canvas/WebGPU systems.
- `lib/events/EventSystem.mjs:36,47,86–92`: Pointer Events capability берётся из globalThis.PointerEvent, autoPreventDefault=true, default eventMode=passive. Default event features612–620: move/globalMove/click/wheel=true.
- `setTargetElement(canvas)` вызывает `_addEvents`; строки332–339 независимо от пользовательских hit handlers задают **inline style.touchAction="none"** при поддержке Pointer Events. Есть отдельная legacy msPointer ветка.
- `_onPointerDown:200–208` дополнительно вызывает preventDefault только при нормализованном событии и cancelable. Поэтому неверно утверждать, что каждый native Android pointerdown обязательно отменяется этим JS вызовом.
- Wheel listener359–362 действительно passive:true, но это не разрешение touch/pinch. Pixi eventMode='passive' относится к scene events и не отменяет inline touchAction.
- Main/CSS после init не возвращают canvas touchAction к auto. Обычный CSS на ancestor не снимает запрет на самом canvas; autoPreventDefault=false/eventMode=none/отключение click по отдельности также не убирают эту SDK style-операцию.

Нормативный смысл `touch-action:none` — browser panning/zooming от жеста, начатого на элементе, подавляется; разрешения на ancestor учитываются совместно. Это проверено по [W3C Pointer Events3 §8](https://www.w3.org/TR/pointerevents3/#details-of-touch-action-values). Поэтому сильная prediction: в браузере Android с Pointer Events, без внешнего override, SDK inline style объясняет и невозможность native pinch на canvas, и блокировку page/inner scroll жестом с canvas. Это ещё **не воспроизведённый Android диагноз**: устройство/browser/version, viewport, actual computed style, способ «увеличить», seed/tick неизвестны; возможно вмешательство browser accessibility или иной gesture policy.

SDK text provenance: EventSystem.mjs SHA256 `961cd8f2d95420374d204a51e5f0f334de88e0146291f7561ba0d2749f0f313b`; events/init.mjs `84bdb9de3a59c508d197a8ce58a145fd34fc7e3904a8ef75b54adf15c0007258`. Приватных operator checkout paths в новые product sources не добавлено.

## Почему шарик может быть слишком мелким

Факт main:107–120: working diameter PNG830.5, а не canvas1254, масштабируется до projected2*r; затем дополнительно применяется scene.scale. Принятый r16 сохранён. Для принятой матрицы horizontal diameter exact равен `Dsource=32/(6.066459862490026−0.0001486986341421116*y)`; `Dcss=Dsource*min(stage.clientWidth,stage.clientHeight)/1536*zoom`. Это аналитическое следствие матрицы/кода, не симуляция.

Пример **условного** viewport390×844 CSS px: main padding16 и stage border1 дают ожидаемый clientWidth≈356; при достаточной высоте это лимит fit. Измерения устройства не было. Прогнозируемый диаметр видимого диска:

| Положение native-y | Dsource px | Fit CSS px | 200% CSS px |
| --- | ---: | ---: | ---: |
| Верх whole-source | 25.27 | 5.86 | 11.71 |
| Принятый drop | 28.15 | 6.52 | 13.05 |
| Низ playable floor | 35.27 | 8.17 | 16.35 |
| Низ whole-source | 39.06 | 9.05 | 18.10 |

В playable области это примерно6,5–8,2 CSS px при fit; плотность DPR не делает CSS-диск крупнее. Поэтому данные могут правильно соответствовать физическому r16 и одновременно быть неудобными для наблюдения. Это не доказанный alpha/canvas-padding дефект PNG. Resolution1 может влиять на детализацию на плотном экране, но смена resolution сама не увеличивает CSS size.

## Варианты для последующего обсуждения; сейчас не внедрять

| Вариант | Удобство | Риск / граница |
| --- | --- | --- |
| После init вернуть только canvas native gestures (touchAction:auto и autoPreventDefault:false) | Page/inner scroll и browser pinch без собственного gesture engine; сейчас app управляется DOM-кнопками | Нужны actual Android drag/pinch/scroll-chain проверки; browser pinch увеличивает страницу, не select value; будущие canvas interactions потребуют нового решения |
| pan-y pinch-zoom после init | Явно отдать вертикальный scroll и pinch браузеру | Горизонтальный pan внутри увеличенного stage останется запрещён; для200% это неудобно |
| Свой pinch/drag/focal zoom | Точное управление сценой и точкой увеличения | Существенно больше кода/жестовых конфликтов/QA; не минимальная правка |
| Изменить только spatial presentation (zoom viewport/лупа/фокус playable area) | Увеличить читаемость без изменения r/core/контактов | Часть доски/контекста уйдёт за экран; доступ к controls и pan надо сначала проверить |

Первый вариант выглядит самым простым кандидатом для отдельного разрешённого mobile pass, потому что canvas сейчас не имеет игровых touch actions. Он здесь не реализован. Автоматически менять ball size/radius/geometry/default spatial zoom/occlusion нельзя. Feedback4–5 про глаза жаб и высоту требует конкретного объекта/seed/тика; источник main:129–133 задаёт native-y depth swap только четырём накладкам, чего недостаточно для диагноза конкретного примера. В clock patch этот scope не включать. Положительное впечатление Max от движения (пункт6) не означает готовность сцены.

## Конкретное предложение playback-only, до implementation gate

Предлагаю select **«Скорость»** рядом с существующим пространственным «Масштаб»: **0,25× · разбор** (default), **0,5×**, **1×**. Меняется темп показа той же траектории. Spatial zoom и ball size остаются прежними. Default0,25× выбран для наблюдения контактов: при обычных60Hz в среднем<1 физического тика за display frame;0,5× часто выполнит1–2 тика,1×3–4. Цена — полный16sim-sec limit занимает ориентировочно64/32/16sec при стабильных кадрах. Это предложение для решения Lead, не уже выбранный product behavior.

| Rate | Wall ms на1 physical5ms tick при плавном clock | До известного contact frame95 |
| --- | ---: | ---: |
|0,25×|20|1,90s|
|0,5×|10|0,95s|
|1×|5|0,475s|

Rate не гарантирует показ каждого контакта: jank/background frame может продвинуть несколько тиков. Для точных95/94/96 по-прежнему служат contact seek/pause/+1. Интерполяцию позы и collision state не добавлять.

Clock policy: private playback rate, Pixi ticker.speed оставить1. В pinned `lib/ticker/Ticker.mjs:421–437` deltaMS уже ограничен default100ms и умножен на ticker.speed; raw elapsedMS отличается. Ticker SHA256 `596910a4265c92fbf2d37a9a66001ba6b0c2585dfb74256a05f9069b1c4a3ce7`. Не умножать rate одновременно через ticker.speed и собственный budget: получится rate². Не менять min/maxFPS и не использовать raw elapsedMS для неограниченного catch-up.

Псевдокод предлагаемого единственного clock пути:

```js
budgetSimMs += ticker.deltaMS * playbackRate;
const ticks = Math.min(Math.floor(budgetSimMs / fixedTickMs), remainingTicks);
budgetSimMs -= ticks * fixedTickMs; // сохранить дробный остаток, не round(frame*rate)
if (ticks > 0) sim.advance(ticks);   // только целые native ticks
if (sim.state.done) budgetSimMs = 0;
```

Fractional остаток измеряется в sim-ms и переносится между frames и сменой rate. При pause/start/replay/seek/ручных+ticks сбрасывается как нынешний accumulator; никакого позднего catch-up. Смена скорости не меняет paused/seed/текущий state; текущий rate сохраняется для следующего запуска. При terminal остаток сбросить. Rate допустим только из{0.25,0.5,1}; fixedTickMs остаётся5 из config. Core/controller/config/projection/PRNG/radius не менять.

Предлагаемый минимальный reviewable change-set после адресного разрешения:

1. `index.html`: один select с default0.25; `src/main.mjs`: binding/status rate, clock.consume→sim.advance и прежние reset points. Status sim-seconds не выдавать за wall time.
2. Малый `src/playback-clock.mjs` без DOM/core/PRNG: validated rate + fractional budget/consume/reset. Он нужен, чтобы значимую scheduler-проверку выполнить напрямую без mock browser и без дублирования алгоритма в тесте.
3. Явно добавить его browser emission `src/playback-clock.js` и единственную main import rewrite в build/check receipt lists. Это будет шестой module и новый candidate/source; immutable03 не редактировать.
4. Controller.descriptor и replay физический config оставить прежними. В observation/checkpoint добавить отдельный playback metadata: current rate, rateHistory с sequence/tick/paused/reason, timing policy capped-Pixi-deltaMS×rate. При rewind сохранять историю независимо от выбора старшего physical checkpoint, не терять rate-change records.
5. В `window.p2QA` добавить validated setPlaybackRate и playback fields snapshot. Exact step/seek/replay/seed/export state semantics сохраняются; UI rate не должен потреблять PRNG.

## Evidence после будущего разрешённого implementation/build

- Прямо исполнить тот же pure clock helper на дробных delta series, всех3 rates, смене rate при remainder, pause/reset и terminal/maxTicks. Проверить integer ticks и сохранение fractional budget; не писать тест-копию loop.
- Два прежних заранее выбранных seed1/490822599 через actual new clock+unchanged real Controller/core: state/event/frame hashes при одинаковых physical ticks совпадают с baseline; rate меняет только расписание. Показать94/95/96 и exact+1/+10/+100/seek после смены rate.
- Отдельно сохранить source/candidate/hash, полный неизменённый config/projection/core hashes, seed, rate/history/timing policy и exact inspected ticks. Старый QA PASS не переносится на новую сборку; test clock не равен visual PASS.
- Actual UI/Android pass — только при реальном разрешённом доступе: rate default/смена/паузa, spatial select отдельно от pinch, computed canvas touchAction, stage/client/canvas sizes, inner/outer scroll и сохранность seed/tick. Нужны конкретные device/browser/viewport; пока их нет, не повторять login-only цикл и не обещать воспроизведение.
- Перед будущим тяжёлым пакетом — fresh RAM/CPU/C/D/E с сосуществующими Millionko/P3 и оценка пика по4/2GiB. Сам этот report ничего тяжёлого не запускает.

Текущее выполненное: diagnosis+reviewable plan source-only. Следующий шаг — Lead сопоставляет независимые QA и выдаёт узкий implementation/build scope. Ни нового запуска, ни общего разрешительного вопроса Max для сдачи этого report не требуется. После commit/push checkpoint завершён без активного ожидания.
