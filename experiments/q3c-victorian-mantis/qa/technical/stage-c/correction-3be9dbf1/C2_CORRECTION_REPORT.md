# Q3C C2 — техническая перепроверка коррекции 3be9dbf1

**PASS · Technical QA · C2_FULL_RIG_TRANSFORM**

7 ноября 2026 · `technical-qa-r4d-q3c-01` · `WIN-36E9FF9EJM0` · host `local` · `D:\dev\R4D`.

Кандидат `3be9dbf11e7a07a2678c3be161e54fd24aa7f893`. На входе `HEAD = origin/main = candidate`. База сравнения `be62b16b0253208493e5d546e0f9d158342a9250`. Предыдущие технический PASS `fbe415a8` и визуальный FAIL `54d683f5` относятся к прежнему кандидату. [Прежний технический отчёт](../C2_REPORT.md) · [Матрица C2](../C2_GATE.md)

## Точные входы и сборка

| Проверка | Результат |
| --- | --- |
| Pin | 86 входов извлечены из Git blobs. До и после работы совпали blob ID и SHA-256 каждого файла. SHA-256 pin `89f974c1e97a29ca25adca8e8d74889649d41a6f4d49ccbde4e43ff7624be735`. |
| Разница с be62 | Совпали 80 входов, включая весь asset pack, manifest, lockfile и конфигурацию сборки. Изменились ровно `src/model.js`, `src/rig.js`, `tests/QA_HOOKS.md`, `tests/c2-rig.test.js`, `tests/c2-smoke.js` и `tests/model.test.js`. `git diff --check 3be9dbf1^ 3be9dbf1` прошёл. |
| Установка, тесты, сборка | Node 24.15.0, npm 11.12.1, PowerShell 7.6.9. `npm ci --offline --cache E:\Caches\npm`, `npm test` (**18/18**) и `npm run build -- --outDir $dist` завершились с кодом 0. |
| Build integrity | До и после совпали 87 файлов сборки, SHA-256 manifest `91ddd4bb5c36b5797b9f18b3b9b37513f11f8e40d1d78f1e3e73d21ce097926c`. По сравнению с be62 совпали 85 артефактов, изменился `index.html`, основной bundle сменился с `index-DrQuQWKH.js` на `index-B7GabxtC.js`. |

[Pin](evidence/input-pin.json) · [Build manifest](evidence/build-manifest.json) · [Сверка SHA до/после и точная разница](evidence/integrity-after.json) · [Команды и коды выхода](evidence/commands.json) · [Тесты](evidence/test.log) · [Сборка](evidence/build.log)

## Выход опор

В Chromium пройдено 409 последовательных кадров первого раскрытия, тики 282–690 при 120 Гц. Проверены instance tokens, asset ID и родители всех 98 узлов. Положение колена взято из физической матрицы голени и переведено в координаты нижней рамы. Первый выход через нижнюю кромку каждого проёма измерен отдельно.

| Опора | Тик выхода | От первого ввода | Запас до бокового края окна | Створка | Первое касание / постановка, тики |
| --- | ---: | ---: | ---: | ---: | ---: |
| Задняя дальняя | 347 | 2,892 с | 7,521 ед. | 104° | 400 / 469 |
| Передняя дальняя | 361 | 3,008 с | 7,092 ед. | 104° | 419 / 483 |
| Задняя ближняя | 376 | 3,133 с | 7,676 ед. | 104° | 427 / 497 |
| Передняя ближняя | 390 | 3,250 с | 7,198 ед. | 104° | 443 / 512 |

Разрыв между выходами 14, 15 и 14 тиков. Оси бедра и голени совпали с концами звеньев. Максимальное проникновение проверенных контуров подошв в пол **5,69×10⁻¹⁴ ед.**, ошибка точки постановки **7,25×10⁻¹⁴ ед.** Максимальный шаг детали **4,661 ед./тик** при лимите 6, угловой шаг **0,0791 рад/тик** при лимите 0,25. Пальцы приводов сохраняют сопряжение (ошибка ≤7,33×10⁻¹⁵ ед.), ход в пределах манифеста. На кадрах мобильных проходов сложенные звенья видны под нижней кромкой корпуса, техническую траекторию можно сопоставить с проёмами. [Сырые кадры измерения](evidence/raw-intro.json.gz) · [Расчёт](evidence/correction-geometry.json) · [Кадр 390×844](evidence/touch390-legs.png) · [Кадр 360×732](evidence/touch360-legs.png)

## Полный C2 и новая стойка

- **Постоянство рига.** Сверены байты 64 SVG, 98 узлов, 28 каналов, 17 жёстких звеньев и 82 крепления. Один `eye.lens` под `eye.barrel`, те же опорные и хватательные цепи. K0–K5 в обеих трассах на тиках **2280 / 2380 / 2483 / 2578 / 2651 / 2787**, от команды до K5 **4,225 с**. Четыре опоры сохраняются на каждом тике перехода. Дельта физической и экранной матриц на тике команды 0, максимальный шаг 2,889 ед./тик. Ошибки pivot ≤5,86×10⁻¹⁴ ед., длины ≤4,27×10⁻¹⁴ ед., пола ≤9,33×10⁻¹⁴ ед. Дрейф контакта ≤1,38×10⁻¹³ ед. Минимальный нахлёст поршней 5,447 ед. при пороге 5. Погрешность Pixi-проекции ≤0,00290 CSS px при бюджете 0,01. [Замеры](evidence/measurements.json) · [Ключевые кадры K0](evidence/desktop-K0.png) · [K2](evidence/desktop-K2.png) · [K5](evidence/desktop-K5.png)
- **Верхний проход.** На всех **97 тиках** фактического выхода плеча (2386–2482, от первого смещения до высоты 105 ед.) ближняя и дальняя двери, передняя и задняя крыша открыты минимум на **106° / 105° / 106° / 104°** при пороге 100°. Первое движение бедра при высоте ≥105,082 ед., клинка ≥120,443 ед. [Замеры обеих трасс](evidence/measurements.json)
- **Калибровка и проекция.** Цели четырёх приводов в K5 — 95° и 68° для груди, 93° и 148,92° для дальнего бедра и клинка. Сверка `pose.stance[id]` плюс вклад idle с физическими матрицами дала максимум 1,54×10⁻¹⁵ рад. На 1739 тиках от K4 до конца idle в каждом replay минимальные расстояния между проекциями соответствующих шарниров, середин и концов двух клинков **50,94 / 96,92 / 143,03 ед.** (пороги >48 / >58 / >70). Минимальный просвет между осевыми отрезками **50,94 ед.**, угол между звеньями груди ≥25,33°. На 360×732 в K5 видны два отдельных шарнира и два клинка. [Расчёт](evidence/correction-geometry.json) · [390×844 K5](evidence/touch390-K5.png) · [360×732 K5](evidence/touch360-K5.png)
- **Кинематика.** Все 28 каналов прошли пороги хода, нелинейности, перебега и затухания. Нижняя → верхняя грудь: задержка 12,31 тика, 340 тиков одновременного движения, разница выровненных профилей 0,212. Ближнее бедро → клинок: 93,44 / 122 / 0,394. Дальнее бедро → клинок: 95,93 / 134 / 0,243. Дальний клинок идёт в обратном направлении относительно прежней дорожки, измеритель использует откалиброванное значение до idle. [Дорожки](evidence/measurements.json)
- **Replay и idle.** В двух независимых прогонах seed 42 совпали 3612 отсчётов и снимок до команды, включая позы, события, каналы и обе системы матриц. Две формы записаны по **12,50 с** (1501 отсчёт) в каждом прогоне. На обычной скорости desktop — 1503 и 1507 тиков. У корпуса, глаза и вторичного канала есть размах, окон замирания нет. Максимальная лаговая |ρ| по трём парам при ±2 с — **0,460 / 0,865** при пределе 0,985. Контроль 42→77→42 подтверждает повторяемость и влияние seed. [Замеры](evidence/measurements.json) · [Хеши полных трасс](evidence/trace-seal.json)
- **Ввод.** Семь живых маршрутов: pointer и клавиатура 1440×1000, touch 390×844 и 360×732, плюс `prefers-reduced-motion: reduce` на всех трёх размерах. В каждом одна команда раскрытия, четыре контакта на ключах, тот же глаз, штатный перезапуск в waiting на тике 0, горизонтального overflow нет. Отдельно 11 проверок E, повторного E, Tab/focus, Space, клавиатуры после перезапуска, resize в K2 и seed. Ошибок console/page/request/HTTP в семи маршрутах 0. [Живые маршруты](evidence/integrity-after.json) · [E/Space/focus](evidence/input-correction.json) · [Reduced 360](evidence/reduced360.json)

## Как повторить

В `D:\dev\R4D` сверить `git fetch origin`, SHA кандидата и `git diff --check`. Запускать из собственного каталога прогона.

~~~powershell
$q = Join-Path (Get-Location) 'experiments/q3c-victorian-mantis/qa/technical/stage-c'
$check = Join-Path $q 'correction-3be9dbf1'
$sha = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893'
& "$q/pin-candidate.ps1" -CandidateSha $sha -Run correction-r01
$run = Join-Path $q ".local/$sha-correction-r01"
$pin = Get-Content "$run/pin.json" -Raw | ConvertFrom-Json
$dist = Join-Path $run 'dist'
$env:TEMP = Join-Path $run 'temp'
$env:TMP = $env:TEMP
$env:npm_config_logs_dir = Join-Path $run 'logs'
Set-Location $pin.productRoot
npm ci --offline --cache E:\Caches\npm
npm test
npm run build -- --outDir $dist
# Записать build-manifest.json как в C2_GATE.md, затем открыть отдельный preview.
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4207 --strictPort --outDir $dist
~~~

`& "$check/bind.ps1" -RunRoot $run` подготавливает точные параметры записи. Из `$run/evidence` использовать Playwright CLI 0.1.23 `run-code --filename`. Запустить `collect-desktop.js`, `collect-keyboard.js`, `collect-reduced-desktop.js` и `input-correction.js` в изолированной desktop-сессии. Запустить `collect-touch390.js`, `collect-touch360.js`, `collect-reduced390.js` и `collect-reduced360.js` в сессии с устройством Pixel 7. В отдельном desktop-профиле записать `collect-seed42-a.js`, `collect-seed42-b.js` и `observe-intro.js`. JSON живых маршрутов берётся из `Result` CLI.

~~~powershell
node "$check/make-adapter.mjs" $run
Set-Location "$run/evidence"
node --max-old-space-size=4096 "$q/normalize-c2.mjs" $sha $run seed42-a > seed42-a-normalized.json
node --max-old-space-size=4096 "$q/normalize-c2.mjs" $sha $run seed42-b > seed42-b-normalized.json
node --max-old-space-size=4096 "$q/analyze-c2.mjs" $sha seed42-a-normalized.json seed42-b-normalized.json > measurements.json
node --max-old-space-size=4096 "$check/measure-correction.mjs" $run > correction-geometry.json
~~~

Обе нормализации и оба измерителя завершились кодом 0. Сырые полные replay и нормализованные кадры сохранены локально по путям в `trace-seal.json`. В коммит входят журналы, выбранные кадры, сырая компактная трасса выхода опор и итоговые замеры. Три браузерные сессии закрыты, порт preview 4207 освобождён.

## Границы проверки

Геометрия выхода опор измерена по осям, кромке проёма, точкам сопряжения и контурным вершинам подошвы. Экранный просвет хватателей измерен между осями. Полный объёмный sweep всех деталей и художественная читаемость относятся к отдельным проверкам. Touch проверен эмуляцией Chromium. Reduced smoke подтверждает работу действий при системной настройке, степень уменьшения анимации отдельно не оценивалась. Ходьба, охота и захват относятся к Stage D.
