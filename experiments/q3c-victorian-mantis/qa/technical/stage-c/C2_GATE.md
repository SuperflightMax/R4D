# C2_FULL_RIG_TRANSFORM

Stage C · Technical QA `technical-qa-r4d-q3c-01` · подготовка `01a1b358-2bfd-7901-8ae1-2db81e0e5a58`. Старт `21fbafcfb435838bc84aed931fe68e57cae9fdbc`. Результат закреплённого прогона в [C2_REPORT.md](C2_REPORT.md). Источники: [заказ, ред. 2](../../../../../orders/animation/Q3C-victorian-mantis.md), [handoff](../../../../../work/requests/Q3C_CTO_HANDOFF.md), [Stage C STATE](../../../STATE.md), [план A–E](../../../PRODUCTION_PLAN.md).

## Вход от CTO и Builder

- Полный 40-символьный SHA, доступный в `origin/main` после push Builder, и точный список его runtime/build inputs. Фиксируем версии связанных concept/asset commits и production rig. Порядок фиксации результатов Stage C проходит через Lead → Concept → Asset → Builder → TQA → VQA. Git index и push отчёта открываются отдельным сообщением CTO.
- Команды установки, тестов, production build и preview. Версии Node/npm и lockfile. Runtime использует артефакты закреплённого инвентаря `FULL_RIG_V1.json`, `PRODUCTION_RIG_V1.md` и `assets/production-v1/**`.
- Семантика `Раскрыться`, момент готовности каждой формы, границы K0–K5, управление повтором и перезапуском. Доставить read-only snapshot, native tick, seed, детерминированный pause/step и соответствие реальной сцены полям снимка. Достаточный контракт описан в [TRACE_CONTRACT.md](TRACE_CONTRACT.md).
- Живые world matrices физических деталей, токены экземпляров рендера, pivots/длины/локальные контуры, допустимые скорости, точки опор, геометрия люков и глубина. Для приводов нужны фактические локальные значения и отделяемый вклад idle. Значения допусков и ожидаемые пары фиксируются до просмотра численных результатов.

## Проверочная матрица

| Gate | Сценарий и условие закрытия |
| --- | --- |
| C2-00 Pin | SHA от CTO является потомком Stage C и доступен в `origin/main`. Все build inputs извлечены из Git в собственную папку QA и совпадают по blob. До и после прогона совпадают SHA256 входов и manifest served build. |
| C2-01 Build/live | `npm ci`, все тесты кандидата, production build. Обычный URL от preview только этой сборки. Реальная страница и ассеты загружаются, console/page/request failures собраны с URL, системные сбои стенда разобраны отдельно. |
| C2-02 Direct action | Свежий вход через scene click, клавишу и touchscreen tap. Обычный путь маячок → падение на маячок → люки/опоры/глаз → K0. В K0 видимая доступная кнопка раскрытия запускает ровно один переход. Удержание/повтор ввода во время перехода сохраняют состояние. Явный «Заново» возвращает штатное ожидание и повторный пользовательский вход. |
| C2-03 K0–K5 | K0 низкая капсула, K1 упор и отпирание, K2 диагональный выход сложенного узла, K3 подъём груди и закрытых хватательных цепей, K4 плечо/бедро/клинок с задержками, K5 собранный высокий богомол и затухание. Сверить физические признаки с закреплённой C2 постановкой. На каждом переходе есть снимки до/после и один непрерывный просмотр в обычном темпе. |
| C2-04 Identity/continuity | Полный инвентарь, одинаковые реальные instance tokens, asset IDs и физические parent IDs в K0–K5 и обеих idles. Масштабы жёстких деталей и handedness постоянны, shear в допуске. Сравнить миропозу до и сразу после реального действия на одном tick, затем каждый tick. Дельты положения/угла в заранее заданном кинематическом пределе. Смотреть зазоры, мерцание видимости, alpha и смену слоёв в промежуточных кадрах. |
| C2-05 Pivots / lengths | Посчитать мировые точки из физических матриц и локальных anchors rig handoff. Экранные матрицы Pixi сверить отдельно. Совпадение осей в пределах `position`, длины жёстких звеньев неизменны. Выдвижение каретки проверяется по ходу отдельных штоков и остаточному нахлёсту; пределы из manifest. Шарниры груди, головы, всех четырёх опор и обеих хватательных цепей покрыты. |
| C2-06 Floor / aperture | В опорной сцене есть контакт. Вершины заявленных физических контуров и подошв остаются над плоскостью в допуске, контактная точка стоит на плоскости и сохраняется в каждом непрерывном интервале постановки. Сверить визуальную подошву с измеренной точкой. На выходе хватательных пакетов проверить моменты до входа в проём, пересечение плоскости проёма и выход. Крышка освобождает фактический проход, допустимые пересечения проекции обоснованы глубиной или парой сопрягаемых деталей. Привязать каждый подозрительный участок к tick и фактическим границам. |
| C2-07 Viewport / a11y | Desktop 1440×1000, touch 390×844 и 360×732. Доступные имя/роль, реальный Tab, видимый focus, штатные Enter/Space, click и tap. Сверить фокус и индикацию доступности до K0, во время действия и после. Проверить основной объект и кнопки на обрезание/перекрытие и горизонтальный overflow. Resize во время активной сцены меняет экранное кадрирование, мировая поза непрерывна. Физический телефон фиксируется отдельной строкой. |
| C2-08 Replay | Два независимых запуска с одним SHA/build/seed, одним viewport и одинаковыми действиями по ticks. Сопоставить события, границы K0–K5, всю позу и каналы на каждом совпадающем tick. Идентификаторы экземпляров проверяются внутри каждого запуска. Пробой другого seed подтвердить заявленное seeded свойство на повторяемом участке, сохранив механические инварианты. |
| C2-09 Timing | Замерить локальные каналы при одном native tick. У каждого выбранного главного привода есть движение выше шума, различимая нелинейность на активном интервале и измеримый settle. У заранее выбранных пар есть задержка, перекрытие и различие самих нормированных кривых там, где это предусмотрено механикой. Проверить overshoot в номинированных приводах и пределы жёстких упоров. Сверить результаты с обычным темпом. |
| C2-10 Async idles | В обеих формах без ввода и после стабилизации взгляда наблюдаются корпус, глаз и вторичный привод. Записать минимум 12 с и два характерных периода самой медленной проверяемой составляющей. Временные окна без движения, размахи и сходство волн после сдвига измеряются отдельно для каждой формы. Повторить живой просмотр обоих idle на том же SHA. |

Ходьба, мотылёк, поимка и её частицы относятся к Stage D. Технические строки закрывает Technical QA по фактической сборке. Визуальную выразительность и CTO acceptance ведут соответствующие владельцы.

## Численный критерий

- `position` и `contact` задаются в world units, `angle` в радианах, `scale` без единиц. Бюджет каркаса ≤0.001 U для позиций/опор, ≤0.001 для scale/rad. Выбрать более тесный допуск по точности экспорта и проверяемому rig, зафиксировать источник. Вылет за пределы шага считается по физической скорости и native dt. Порог между кадрами применяется отдельно от нулевого скачка на моменте команды.
- Форма канала измеряется по накопленному модулю перемещения локального угла или хода. Активный интервал берётся между 2% и 98% пути. 17 точек на одинаковой нормированной шкале времени дают остаток от прямой. Отличие >max(1% пути, 5×шум в этих единицах) подтверждает различимую нелинейность. В отчёте также signed velocity, peak tick и диапазон acceleration.
- Пары сравниваются после независимого выравнивания начала и длительности. Отличие формы >max(2% пути, сумма нормированных шумовых порогов) нужно как минимум у двух заранее выбранных механических пар. Обязательно покрыть пару C1→C2 и плечо→бедро/бедро→клинок. Для близкой/дальней стороны отдельно измерить сдвиг начала. Delay и overlap замеряются по исходным 2%/98% ticks, хотя бы одна существенная задержка и одно перекрытие имеют бюджет ≥3 ticks. Кандидатный план может задавать более строгие границы и дополнительные пары.
- Overshoot измеряется относительно закреплённого target в указанном направлении. Номинальный overshoot берётся из допустимого хода привода и заметен выше шума. Для жёсткого упора нижняя граница нулевая. Settle требует последние ≥0.1 с в полосе target при измерении базового движения. Видимый idle продолжается поверх него.
- Для каждого idle из трёх семейств берутся реальные локальные каналы. В каждом секундном окне с шагом полсекунды хотя бы один канал имеет размах ≥max(5×шум, 5% минимального размаха канала). Сравнить формы волн при лагах из заранее заданного окна 0.5–3 с. Требуется как минимум две пары разных семейств с достаточной амплитудой и максимальным |ρ| после сдвига <0.985. Период, окно лагов и наблюдение в обычном темпе фиксируются вместе с результатом.

Численные пороги задают разрешение этого метода. Пограничные измерения разбираются по исходной трассе, калибровке и реальной позе. Флаги складываются в один список с причиной, влиянием и воспроизведением. Пропуск обязательной проверки остаётся открытым. Формат записи результата находится в [C2_REPORT.template.md](C2_REPORT.template.md).

## Команды после выдачи точного SHA

```powershell
Set-Location D:\dev\R4D
$stage = 'D:\dev\R4D\experiments\q3c-victorian-mantis\qa\technical\stage-c'
$sha = '<40-hex SHA от CTO>'
git fetch origin
& "$stage\pin-candidate.ps1" -CandidateSha $sha -Run r02
$run = Get-Content -LiteralPath "$stage\.local\$sha-r02\pin.json" -Raw | ConvertFrom-Json
$env:TEMP = Join-Path $run.runRoot 'temp'
$env:TMP = $env:TEMP
$env:npm_config_logs_dir = Join-Path $run.runRoot 'logs'
$dist = Join-Path $run.runRoot 'dist'
Push-Location $run.productRoot
npm ci --offline --cache E:\Caches\npm 2>&1 | Tee-Object "$($run.runRoot)\logs\ci.log"
if ($LASTEXITCODE -ne 0) { throw 'Clean install failed. Check locked dependencies and cache.' }
npm test 2>&1 | Tee-Object "$($run.runRoot)\logs\test.log"
if ($LASTEXITCODE -ne 0) { throw 'Candidate tests failed.' }
npm run build -- --outDir $dist 2>&1 | Tee-Object "$($run.runRoot)\logs\build.log"
if ($LASTEXITCODE -ne 0) { throw 'Candidate build failed.' }
Pop-Location
$buildFiles = Get-ChildItem -LiteralPath $dist -Recurse -File | Sort-Object FullName | ForEach-Object {
    [pscustomobject]@{ path = $_.FullName.Substring($dist.Length + 1); sha256 = (Get-FileHash -LiteralPath $_.FullName).Hash.ToLowerInvariant() }
}
$buildFiles | ConvertTo-Json | Set-Content -LiteralPath "$($run.runRoot)\build-manifest.json" -Encoding utf8
$buildSha256 = (Get-FileHash -LiteralPath "$($run.runRoot)\build-manifest.json").Hash.ToLowerInvariant()
```

При cache miss повторить чистую установку в том же изолированном дереве с разрешённым registry и `--cache "$($run.runRoot)\npm-cache"`, записав отличие среды. Команда preview выполняется в отдельной собственной сессии, с проверкой свободного порта.

```powershell
Set-Location $run.productRoot
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4205 --strictPort --outDir $dist
```

Из `$run.runRoot\evidence` использовать изолированный Playwright CLI. Для кандидата из отчёта привязать коллектор через `bind-be62.ps1`. Сначала обычный темп на desktop и touch, затем отдельные stepped runs `seed42-a` и `seed42-b` с одинаковыми входами. Сценарий другого seed и ручные проверки из матрицы оформляются отдельно.

```powershell
$cli = 'E:\Caches\npm\_npx\31e32ef8478fbf80\node_modules\@playwright\cli\playwright-cli.js'
& "$stage\bind-be62.ps1" -RunRoot $run.runRoot
Set-Location "$($run.runRoot)\evidence"
node $cli -s=q3c-c2-d open http://127.0.0.1:4205/ --browser chrome --idle-timeout 0 --profile "$($run.runRoot)\profiles\desktop"
node $cli -s=q3c-c2-d snapshot
node $cli -s=q3c-c2-d run-code --filename "$($run.runRoot)\collect-live-desktop.js" | Tee-Object live-desktop.log
node $cli -s=q3c-c2-d run-code --filename "$($run.runRoot)\collect-live-keyboard.js" | Tee-Object live-keyboard.log
node $cli -s=q3c-c2-d run-code --filename "$($run.runRoot)\collect-seed42-a.js" | Tee-Object seed42-a.log
node $cli -s=q3c-c2-d run-code --filename "$($run.runRoot)\collect-seed42-b.js" | Tee-Object seed42-b.log
node $cli -s=q3c-c2-d run-code --filename "$stage\input-be62.js" | Tee-Object input-be62.log
node $cli -s=q3c-c2-d close
node $cli -s=q3c-c2-t open http://127.0.0.1:4205/ --browser chrome --device 'Pixel 7' --idle-timeout 0 --profile "$($run.runRoot)\profiles\touch"
node $cli -s=q3c-c2-t snapshot
node $cli -s=q3c-c2-t run-code --filename "$($run.runRoot)\collect-live-touch390.js" | Tee-Object live-touch390.log
node $cli -s=q3c-c2-t run-code --filename "$($run.runRoot)\collect-live-touch360.js" | Tee-Object live-touch360.log
node $cli -s=q3c-c2-t close
Copy-Item "$stage\c2-adapter-be62.mjs" "$($run.runRoot)\c2-adapter.mjs"
node --max-old-space-size=4096 "$stage\normalize-c2.mjs" $sha $run.runRoot seed42-a > seed42-a.json
node --max-old-space-size=4096 "$stage\normalize-c2.mjs" $sha $run.runRoot seed42-b > seed42-b.json
node --max-old-space-size=4096 "$stage\analyze-c2.mjs" $sha seed42-a.json seed42-b.json > measurements.json
node "$stage\review-be62.mjs" $run.runRoot > probe-review.json
```

Коды анализатора: 0 — измерения завершены без численных флагов, 2 — вход неполон или несовместим, 3 — есть численные флаги. Общий вердикт выводится из всех строк матрицы. После прогона сверить хеши и закрыть собственный preview.

```powershell
foreach ($file in $run.files) {
    $observed = (Get-FileHash -LiteralPath (Join-Path $run.treeRoot $file.path)).Hash.ToLowerInvariant()
    if ($observed -ne $file.sha256) { throw "Input changed: $($file.path)" }
}
$savedBuild = Get-Content -LiteralPath "$($run.runRoot)\build-manifest.json" -Raw | ConvertFrom-Json
if (@(Get-ChildItem -LiteralPath $dist -Recurse -File).Count -ne @($savedBuild).Count) { throw 'Build file inventory changed' }
foreach ($file in $savedBuild) {
    $observed = (Get-FileHash -LiteralPath (Join-Path $dist $file.path)).Hash.ToLowerInvariant()
    if ($observed -ne $file.sha256) { throw "Build changed: $($file.path)" }
}
```

Raw runs, profiles и build лежат в игнорируемом `stage-c/.local/`. Для отчёта отбираются воспроизводимые данные и нужные кадры в этой же зоне.
