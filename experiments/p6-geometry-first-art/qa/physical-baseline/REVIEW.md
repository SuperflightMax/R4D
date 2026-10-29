# Ранняя физическая проверка baseline b1bb84d

Проверена настоящая физика и управление диагностическим consumer. Финальный арт, готовый sphere/shadow и art occluders в этом baseline отсутствуют и не оценивались. Художественный/motion PASS не заявлен. Выявлено одно связное замечание к вводу тика во время движения; кнопочное скачивание replay отдельно не проверено из-за остановленной неподдерживаемой операции IAB.

## Exact кандидат и независимость

Source commit `b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96`. Local URL `http://127.0.0.1:41766/`. Public frozen snapshot `baseline-b1bb84d`: 9files, 2397043bytes. Inventory file SHA-256 `dc98e5271aac9e4a173a3902b13c62741630c4eacedc854a4326511b0c8bdef9`; сами9 files/live URL/разрешённый public snapshot совпали побайтно. Их paths/размеры/hashes сохранены в frozen-inventory.json.

- Actual served native import: `./native/core.mjs`, SHA-256 `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`.
- Core exact `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`.
- Native bundle независимо пересобран esbuild0.25.5 из собственного Git-object native extraction. Получились **те же exact bytes**. Builder private source/runtime/oracle не читались; разрешённый public candidate snapshot использован только как проверяемый кандидат.
- Независимый oracle из оригинальных native TS был ранее подготовлен через Node stripTypeScriptTypes; его saved states не передавались consumer как координаты.
- App bundle SHA-256 `4fca4cdbeff694e7e49d15bccc5ee4b7ee20ef6fcfaac917c77795c7a06c0d4a`. Source hashes из build-meta совпали с frozen Git bytes; фактический app импортирует native module.
- Config/manifest совпали с independently extracted P1 hashes `dd5c519c…`/`7784dc0a…`. Native/r16/tick5ms/quantize7/g980/speed2000/noise2deg/.02/lcg32 и исходный start сохранены.
- Небольшие pinned npm dependencies установлены только в own E runtime; TEMP/TMP/npm cache process-local на E. Root tsconfig.base.json вне разрешённого native package не извлекался: esbuild выдал соответствующее предупреждение, но воспроизвёл served native byte-for-byte. Raw private TS/maps и native builds в public QA Git не добавлены.

## Что подтверждено

| Seed | Все состояния | События в исходном порядке | Терминал |
|---|---:|---:|---|
| 0 | 1957 | 27 | receiver-03, tick1956 |
| 1 | 1736 | 18 | LOST, tick1735 |
| 2 | 1291 | 15 | LOST, tick1290 |

Совпали **все4984 состояния** (tick, pos/vel, rngU32, nearMissBucketIds, done/result) и60 events, без числового epsilon. Сравнение выполнено отдельно для frozen controller+served native и для фактических arrays из IAB browser consumer. Совпали также eventStateTicks: обычный contact event94 соответствует resulting state95. Full/batch10, seek0/94/95/96/1956 и controller replay/import совпали с independent oracle.

В IAB реально нажаты и проверены:

- Ввод тика на паузе, «Перейти», +1 и +10: exact94→95,105,96. Event navigation и «Следующий контакт» выбрали state95.
- Real-time «Продолжить» дал state63 при движении; «Пауза» остановила наstate80, совпавшем с oracle. Дальнейшие действия на паузе состояние не изменили.
- Независимые «Арт»/«Геометрия», source/flat и viewport resize1000×800 сохранили полный native state/PRNG. Override viewport сброшен.
- Через настоящий file chooser UI импортирован replay seed0/tick1956 из own E файла. Восстановились состояние и все события. Browser exportReplay API проверена отдельно, без выдачи её за тест кнопки скачивания.
- Два обычных первых random drops дали seeds1554059940 и2252766342, без выбора/отбрасывания. Все наблюдённые states/events обоих запусков совпали с независимым native source build; повтор каждого на паузе точно дошёл до95. Первый bounce дал различные native velocities.
- Console error/warn при итоговом чтении не обнаружены. IAB оставлен на паузе seed0/state95. Скриншоты и их hashes перечислены в screenshots.json.

## [P2] Движение перезаписывает редактируемое поле «Тик»

Файл `experiments/p6-geometry-first-art/builder/viewer/app.mjs`, frozen source line120: `draw()` каждый кадр присваивает `$('tick').value=st.tick` и аналогично обновляет Seed. После «Новый бросок» real-time запускается сразу. Пользователь вводит95, но следующий redraw заменяет ввод до обработки «Перейти».

Наблюдение на первых двух обычных random drops: запрос95 привёл к110 и86. Контрольный повтор seed0: после заполнения95 и наблюдения UI поле уже содержало83; нажатие «Перейти» остановило на99. Native state99 корректно совпал с oracle. После предварительной паузы seek95 работает точно на обоих сохранённых random seeds.

Влияние: пользователь не может надёжно выбрать нужный tick при движении. Это проблема взаимодействия с editable input, а не подмена физики или ошибка oracle. Рекомендуется отделить редактируемый target tick от текущего tick, либо не перезаписывать поле при редактировании. Кандидат QA не исправлял. Подробные факты — browser.json; screenshot seek-race.png.

## Остановленная download operation

- Exact call_id: `call_dfb293d358174d6b8a83b1b0686463ad`.
- Action: `Page.setDownloadBehavior` через IAB CDP.
- Target: tab1, `http://127.0.0.1:41766/`; downloadPath `E:/R4D/perspective/p6-runtime/technical-qa/browser/downloads`.
- Фактический ответ: `This method is not supported through raw CDP. Use tab.playwright.waitForEvent("download") before triggering a download instead.`

Операция остановлена, не повторялась и не переносилась на другой actor/transport. Кнопка «Сохранить повтор» не проверена. Независимые разрешённые exportReplay API, file import/replay, random и real-time проверки выполнены отдельно; они не засчитаны за проверку скачивания.

## Предел вывода и следующие входы

Совпадение native bytes/states не подтверждает художественное качество, визуальный sphere/shadow, occlusion или удобство конечного художественного candidate. Baseline содержит диагностический draft/круг. Новый frozen renderer integration проверяется отдельно ограниченно, без повторения всего baseline. Изображения, config/projection и продукт QA не исправлял.

Scripts: qa/check-physical-consumer.mjs и qa/check-browser-evidence.mjs. Raw native/полные oracle и browser traces остаются в own private E runtime; в public QA доставлены результаты, hashes и выбранные UI screenshots.

Уточнение source-byte provenance inventory: исходный переданный inventory имеет 2002bytes/58CRLF и SHA-256 `dc98e5271aac9e4a173a3902b13c62741630c4eacedc854a4326511b0c8bdef9`. Git нормализовал первоначальную QA-копию frozen-inventory.json в 1944-byte LF с SHA-256 `d4ef9f92d877b838374f0ebaa23ffab054b6379f80737f61e43f39f13d552a84`. Она остаётся читаемой canonical копией с тем же JSON; исходные byte-for-byte данные дополнительно сохранены как frozen-inventory.source-crlf.bin с явным -text attribute. Baseline site/runtime/исходный inventory не менялись. Нормализация QA-копии не является изменением проверенного candidate.
