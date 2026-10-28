# P5 Technical QA — actual runtime C01

29 октября 2026, Europe/Kyiv. Проверка браузера 28 октября примерно22:56–23:08 UTC. Это независимая ранняя проверка frozen C01, не final QA/release и не художественный PASS P5.

**Итог:** exact C01 загрузился и двигался в собственной вкладке Codex IAB. Проверенные UI controls сохраняют native config/state/RNG в заявленных границах; наблюдавшиеся состояния и события совпали с независимым штатным ядром. Найдено остаточное визуальное расхождение в завершении входа receiver01. Общий порядок перекрытий, боковые стенки и полный набор25 не закрыты.

## Версия и происхождение

- Полностью прочитан handoff `a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d:experiments/p5-regenerated-objects/builder/HANDOFF_C01.md`.
- Consumer `0c611039246904443128b9d12084af2c5a0ae6e6`, `experiments/p5-regenerated-objects/builder/`. Прочитаны app/controller и контракт ассетов этой версии; просмотрены нужные фрагменты build/asset-verifier для проверки digest-связей. Product не менялся и не пересобирался.
- Artist `5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json`,23553bytes,SHA256 `7b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f`.
- Immutable public root `E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public`; index7149bytes,SHA256 `a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac`.
- `app.js`569494bytes,SHA256 `39d0cc5cdc8e869df975f008057c3c408ed3e41ce40bdd870dd0f001f19f1f44`; staged manifest15630bytes,SHA256 `96305bca8706f22a0cad0537599a30a5ef9ae75bc49d998da5ccc573e55da7b5`.
- Все22файла/13937155bytes проверены на диске и по HTTP GET: bytes/SHA256 совпали с index. Собственная копия/сервер не создавались. Builder URL `http://127.0.0.1:55185/`, ownerPID32108/session55195, owner record прочитан, HTTP200 и существование PID подтверждены. Listener не изменялся и не останавливался.
- Public config/p1-manifest совпали побайтно с accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; exact consumer projection/view-math совпали с исходными P1 hashes. Native pin `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`/tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`.
- Public dependency lock побайтно совпал с consumer Git: SHA256 `c1935a947fe5e3f39757f82bfacc192c7014719253381030a6fbe4cb48417788`. Заявлены PixiJS8.17.1/esbuild0.25.12. Actual rendered canvas и runtime meta renderer1 наблюдались в браузере. Повторная сборка и независимый полный аудит722private build inputs не проводились; декларация lock не выдаётся за такую проверку.
- Source→staged texture metadata,13instances и десять provenance digests проверены. Pillow12.1.1 независимо прочитал все10PNG: hashes/bytes/dimensions, alpha>0 bounds, alpha>=16 bounds и max alpha совпали. Это не аудит raw генераций и не художественная оценка alpha/опоры.

## Actual browser и проверенные сценарии

Создана собственная hidden вкладка IAB browser2/tab1. Целевые действия выполнены через CUA UI: buttons, settable seed/slider, framing select. Native snapshot/config/view/meta/record читались через read-only CDP; функции replay/seek/step через CDP не вызывались. Личный Chrome/desktop не использовался. В конце собственная вкладка закрыта. Warning/error console сообщений при проверке не было.

| Сценарий | Наблюдение | Граница вывода |
| --- | --- | --- |
| Default seed0 | UI+1:tick1, +10:tick11, slider94, +1:tick95; contact RNG изменился строго на95 | Состояния совпали с уже сохранённым source oracle; старый прогон не запускался заново |
| Art/Geometry/Whole/Field на95 | Все сочетания слоёв и framing сохранили state/RNG/config; следующий выбранный tick совпал с native | Это actual UI, не только code assert |
| Present frog05 | Art-only states1715/1716/1717 до/после event1715; отдельно Geometry поверх и Art off на1716 | Локальное окно контакта/перекрытия; не общий PASS center sort |
| Present flower07 | Seed1696420279, Art-only states834/835/836, event834→state835 | Отскок у видимого объекта рассмотрен; широкая контактная матрица не заявляется |
| Receiver01 | Seed1696420279 states874/875, art-only и geometry;875=`IN_BUCKET receiver-01` | Native корректен; видимое завершение требует коррекции/уточнения ниже |
| Actual realtime | Seed1696420279: видимые ticks34→70 и snapshots44→80; pause зафиксировал100, повторное наблюдение сохранило100; resume дошёл до875 | Realtime и exact step terminal совпали; moving screenshot не имеет атомарной привязки к считанному перед ним tick |
| Обычный новый бросок | Один клик «Новый бросок» дал **3957814979**, terminal847=`LOST`, finalX33610.3173563 | Случай не отбрасывался; новых seeds ради удачи не искали |
| Повтор обычного броска | «Повтор» сбросил тот же seed в0; slider847 восстановил одинаковые state/RNG/result/events | Повтор через реконструкцию native; второй полный realtime просмотр этой траектории не выполнялся |
| Terminal clamp | +10 на875 оставил875 и исходный state/result | После native done продвижения физики нет |
| Default terminal | UI seed0/seek1956 дал exact `receiver-03` | Арт receiver03 отсутствует; видимый вход в него unverified |

Проверены33сохранённых actual browser snapshots:29полных сравнений state/RNG/config/event sequence и четыре дополнительных state/RNG/config comparisons по существующему seed0 trace. Локальный frozen config/start/physical fields не менялись; менялся только seed отдельного запуска. Изменения UI view не расходовались на native RNG.

Native comparison использовал уже проверенный exact compiled runtime из `source-oracle-001`: перед импортом повторно сверены только его compiled file hashes. **Seeds0–3 и1922точки не пересчитывались.** Старый seed0 trace использован read-only; для двух новых адресных seeds штатное ядро выполнено по одному разу:

| Seed | Native trace SHA256 | Native/browser результат |
| ---: | --- | --- |
| 0, существующий | `971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572` | receiver03/tick1956; контакт1716 и UI samples совпали |
| 1696420279 | `04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14` | receiver01/tick875; также совпал с переданным Builder trace digest |
| 3957814979 | `f722ffbe0d33fc110f850e2be3e68393b7c72f07a6147d51fce62183f4137979` | LOST/tick847; actual terminal и повтор совпали |

Полный browser per-tick trace не записывался. Совпадение selected states и всех доступных до них native событий не подменяется заявлением о проверке каждого нарисованного кадра.

## F-C01-01 — шарик остаётся у дальнего бортика после IN_BUCKET

**Наблюдение:** seed1696420279 → «Повтор» → slider874 → +1. На875 UI и native дают `IN_BUCKET receiver-01`, но art-only кадр показывает голубую сферу у дальнего золотого бортика. Она не читается как завершённый вход внутрь отверстия; после done остаётся на этой позиции. Это также наблюдалось после realtime проигрывания, не только seek.

**Проверенная часть причины:** native trajectory/result/config верны, actual source anchor и r16 не менялись, bootstrap/загрузка/контролы работают. Consumer фиксирует native done без последующего представления завершения. В rendered связке ball-bottom anchor, aperture и receiver back/front первое пересечение trigger ещё выглядит как положение на бортике. **Точный вклад anchor/aperture/part registration пока не изолирован**; это не доказанный дефект общего P1 mapping, не повод двигать bucket/drop или менять ядро.

Native законно завершает при `center distance < bucket.r`, без полного погружения шара. Поэтому само отсутствие дальнейших физических тиков не является ошибкой ядра. Открыт именно визуальный результат захвата в данной generated сборке.

**Что передать Artist/Builder:** сопоставить фактическое отверстие и маски front/back с неизменным native trigger/ball ground anchor; устранить ощущение остановки на бортике средствами разрешённого отображения. Нужный повтор — адресно874/875 и короткое realtime завершение этих exact replay условий на новом candidate. QA продукт не исправлял и способ коррекции не назначает как уже проверенный.

Evidence относительно собственного C01 runtime:

- `browser/seed1696420279-basket874-art.png`,SHA256 `2abf816b705c40af31a27d8cfe51fcd3a2ae12c7c48b6592f664cefefdc56eae`;
- `browser/seed1696420279-basket875-art.png`,SHA256 `016a270f864d8d072680d2db13c35e9b4f6c72086161949eec8d106f81c7d5e8`;
- `browser/seed1696420279-basket875-geometry.png`,SHA256 `4a342d54a50a2dacad575674bdc341812b2df06c86cf566e5e9c3c22400053d7`;
- paired JSON плюс `known-realtime-terminal.json` подтверждают seed/start/config/core/projection/state pins.

## Перекрытия и известная неполнота

Четыре present bodies — flower07,leaf05,frog05,wood04; receiver01 back/front; ball/shadow и floor.21pins и3receivers остаются без своего арта, отдельные side-rail/near-platform occluders не переданы. Все исходные collisions сохранились. Отскоки от отсутствующего арта не классифицируются как новая ошибка C01 sorting/anchor и не скрываются.

В frog окне sphere показывается у края силуэта; на1716 с Art off весь арт исчезает, а actual geometry и полный белый ball outline остаются видимы. При включённом арте диагностическая geometry проходит поверх него. В просмотренных frog/flower контактных окнах явного пространственного скачка/отскока от пустоты у present объекта не выявлено. **Это локальное наблюдение, не полная проверка side bounce/no-empty-air/частичного скрытия всех объектов.** Надёжность смены порядка по всей траектории и полного набора, сложные parts и убедительность receiver-front остаются открыты.

## Evidence, ресурсы и служебные ограничения

Всё raw evidence находится в `E:/R4D/perspective/p5-runtime/technical-qa/c01/`. `evidence-index.json`:14575bytes,SHA256 `b34472b1c85021f73f24f432cb856a2e7ea29df40e3adae99a7eaf01b1edaf85`;81файл/6090469bytes до добавления самого index. Публичный короткий указатель — [C01_EVIDENCE_PINS.json](C01_EVIDENCE_PINS.json). Private исходники/maps/native dumps в Git не передаются.

- `package-verification-002.json`,SHA256 `565fc79aff9217da9bc38100206735b12bf775d6a791afbf6c4bbf970861701c`;
- `pixel-verification.json`,SHA256 `d605c398eca5a330f0e4de4efc39581e7e2c1a5781a71a6d96d64419c04e90fb`;
- `browser-native-comparison.json`,SHA256 `001a9b23095f7ec68fd8255d809087030eb4dec7d55f0783fffc12f6970cad41`;
- `browser-native-addendum.json`,SHA256 `fb2fd08171c277be75ab2c913fa86eccbbc9a2120902467e2ec2b2c154779e34`;
- `provenance-bindings.json`,SHA256 `738f81839211c9678eeb81b0c099462db283e241c576cb16ec5a041172ad7fa8`.

Fresh resource guard до браузера: RAMfree16.263/31.907GiB, CPU2%, aggregateWS19.553GiB,440процессов; C/D/E примерно16.93/16.28/12.14GiB. Свой peak estimate1GiB RAM/0.1GiB E плюс concurrent allowance4GiB RAM/2GiB E. Перед адресными PNG/native checks сделан новый guard: RAM16.110GiB, CPU6%, E12.125GiB. После закрытия своей вкладки: RAM16.060GiB, CPU8%, aggregateWS19.688GiB,426процессов, C16.883/D16.282/E12.120GiB. Own browser peak отдельно не измерен; суммарные working sets не являются уникально занятой RAM. Пороги E4/2GiB не достигнуты.

TEMP/TMP и Python cache policy заданы только process-local; output/evidence — только свой E. Browser использован в собственной IAB вкладке. Native source checkout, чужие worktree/PID/devices, immutableC01, глобальные настройки/security/credentials не менялись. Server release writes0. Известный @pixi/colord license packaging gap не пересматривался как блокер локальной early QA; публичный release по-прежнему закрыт.

Обычные ошибки подготовки отделены от продукта: прочитан несуществующий `src/main.mjs`, затем из перечня выбран actual `src/app.mjs`; exact-label locator «Кадр» не совпал с DOM и заменён наблюдавшимся `#framing`; ожидание terminal вернуло selector deadline, последующее AX-наблюдение подтвердило штатное875. Screenshot clip вернул панель управления вместо корзины: `finding-receiver01-crop875.png` сохранён как raw, **исключён** из выводов; используются полные кадры. Package verification002 добавил явную сверку поляalpha после начального001. Это не denial, не runtime blocker и не основание приписывать policy/race. Denial/403/запрещённых обходов/file fallback не было.

## Что остаётся unverified

Полный25/4 generated комплект, все семейства контактов и side rails, broad draw-order/occlusion transitions, near-platform, convincing receiver-front/завершение входа, полный random UI corpus, timeout exception branch, UI download, resize/DPR/flat inverse view, raw image generation audit, полный build-input/binary provenance/privacy/license/release. В C01 есть Whole/Field framing; отдельного flat view нет и его PASS не заявляется.

Нужный следующий handoff — meaningful art/consumer delta с новыми frozen pins. Возврат сначала к F-C01-01 и реально изменённой coverage; готовые input/source oracle и завершённые матрицы не повторять без конкретной причины. Обе итоговые QA и новый CTO gate ещё впереди. Сообщения другим чатам не отправлялись; Lead получает этот результат через final/snapshot.
