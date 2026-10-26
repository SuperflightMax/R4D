# Lead P0 perspective — рабочее состояние

Обновлено: 26 октября 2026, Europe/Kyiv.

## Канон и границы

- Заказ: `orders/perspective/ORDER.md` и `orders/perspective/P0-perspective.md` из R4D `e5892fbea71fbbfeb9f22e6a18f0f788cf9a1449`.
- Вход: `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg`, только чтение.
- Только P0: без физики, коллайдеров, шарика, `sim-core` и P1–P6.
- Главный `D:\dev\R4D` не менять. Каждый сотрудник работает только в назначенном worktree.
- После публикации P0 очередь останавливается до явной приёмки Макса.

## Минимальный план зависимостей

1. Researcher (`codex/r4d-p0-perspective-research-01`) выпускает research v0.1: формальный эталон, числовые правила, признаки сравнения и честные допуски.
2. Concept Artist (`codex/r4d-p0-perspective-concept-01`) выпускает concept v0.1: художественные инварианты, признаки законченной доски и ограничения для постановки генератору.
3. Visual QA (`codex/r4d-p0-perspective-visual-qa-01`) до просмотра результата фиксирует независимый rubric v0.1.
4. Builder (`codex/r4d-p0-perspective-builder-01`) принимает только exact commits Researcher и Concept Artist, фиксирует их SHA и собирает эталон перспективы v1 с воспроизводимым визуальным шаблоном.
5. Asset Artist (`codex/r4d-p0-perspective-asset-01`) после exact Builder v1 и Concept v0.1 делает диагностическую генерацию d1 по одной зафиксированной редакции, сохраняя реальные входы, запрос, генератор, настройки, проверки и исправления.
6. Visual QA проверяет Builder v1 и d1 по заранее зафиксированному rubric; продукт не исправляет.
7. После checkpoint и исправлений Asset Artist делает четыре независимые законченные доски по одному принятому эталону. Builder собирает точный кандидат; QA проверяет комплект.
8. Release Engineer (`codex/r4d-p0-perspective-release-01`) заранее сверяет маршрут read-only, а после принятого CTO candidate commit публикует отдельную страницу `/review/r4d/p0-perspective/` и возвращает точную ссылку/версию.
9. Lead передаёт CTO exact commits, решения, остаточные дефекты и ссылку. После публикации — обязательный стоп.

## Ближайший checkpoint

Ориентир — примерно два часа активной работы. Нужны вместе:

- research v0.1 и concept v0.1;
- rubric v0.1, объявленный до просмотра результата;
- интеграционный Builder commit с эталоном перспективы v1 и воспроизводимым шаблоном;
- Asset d1 с полной фактической provenance;
- Visual QA verdict по v1/d1;
- готовность маршрута публикации без самой публикации.

Точный checkpoint формируется только из названных commit SHA. Незакоммиченный материал, сообщение «готово» и состояние чужого worktree версией не считаются.

## Стартовое фактическое состояние

- Researcher, Concept Artist, Builder и Release Engineer работают.
- Asset Artist завершил подготовительный разбор и ждёт exact commits эталона/шаблона; вход подтвердил как 1536×1536, SHA-256 `F5CFA2BBE8E4B49ECBC0F4C7A0CEE99842B182B56AE495979153B8FC9FF86E32`.
- Visual QA получил поручение зафиксировать rubric v0.1 до кандидатов; после этого ждёт exact Builder v1 и Asset d1.
- Всем шести сотрудникам доставлены адресные гейты и формат ближайшей передачи.

## Полученные версии и решения

- Lead dependency plan: `72464d892a4dd4fee6de3a81723139dfee9dcac8`, опубликован в `origin/codex/r4d-p0-perspective-lead-01`.
- Visual QA rubric v0.1: `21150e583311e8688146a27fa48aaa8c41c8aaa8`, `experiments/p0-perspective/qa/visual/RUBRIC_V0.1.md`. Зафиксирован до просмотра кандидатов; PASS не заявлен, продукт не менялся.
- Research v0.1: `627a9feb33cc6fdc8e63738ada13577752b9bf4a`, четыре файла в `experiments/p0-perspective/research/`. Выбран измеримый 2.5D-эталон: трапеция плоскости и независимый более слабый scale-by-depth; строгая гомография оставлена диагностикой, не объявлена восстановленной камерой.
- Concept v0.1: `d38139573648f097bd04e1c833ffff9be467ff71`, пять файлов в `experiments/p0-perspective/concept/`. Содержит художественные инварианты, структуру основного/корректирующего задания и визуальный шаблон; числовая геометрия намеренно оставлена эталону Researcher.
- Compatibility review: версии Research и Concept совместимы, но наблюдательная трапеция concept PNG отличается от числового Research quad. Решение: формальный эталон всегда приоритетен; concept PNG не используется вторым геометрическим control, а его guide-слои заменяются точной Research геометрией либо исключаются из art input.
- Builder v1: `91716e4c488bdb118fc04c03dab7794f4dad6cbe`, одиннадцать файлов в `experiments/p0-perspective/builder/`. Включает детерминированный `formal-reference-v1.svg`, диагностическое сравнение, метрики без aggregate score, статическую галерею и скрипты сборки/проверки/preview. Зафиксированы входные SHA `21150e58…`, `d3813957…`, `627a9feb…`; `npm run check` и браузерная проверка прошли.
- Cross-worktree check выявил ложный stale из-за CRLF checkout против LF Node output. Builder исправил только детерминизм/политику EOL в `0cc217d120597e1ec9f26cb2caa79e54d59386ba`; geometry и generated content не менялись. На свежем baseline с пятью cherry-picks `npm run check` прошёл до build, дерево осталось чистым.
- Asset diagnostic d1: `2db5dffdbcd0fecaee7ffa209ea3ebe8c775cd2f`, `experiments/p0-perspective/asset-artist/d1/`. Единственная неизменённая генерация 1254×1254, SHA-256 `05990a70ed85ee893d484545c2f5aa0ec0f5277b2db0331bfacc6ae3b63393b5`, с полным prompt/provenance. Четыре финальные доски не запускались.
- Visual QA d1: `fdc25db3e97dcd0c48d998b720cfb7c4ef4c8cec`, `experiments/p0-perspective/qa/visual/REPORT_D1.md`. Решение `TARGETED_CORRECTION_BEFORE_FINAL_SERIES`: provenance, эталон и художественная законченность PASS; поле требует коррекции, drums/S(z) FAIL. Финальная серия остаётся закрыта до одного corrected diagnostic с тем же formal reference и без новой камеры.
- Concept corrective brief c1: `b060203bfb3920dc3f11299c211836360bcc5cba`, тот же formal reference/камера и точные locks углов, seams, rows и drum scales.
- Asset corrected diagnostic c1: `6452515fff9f7cb90b619cbe632b62b9573d668b`, output SHA-256 `f6993beb13dc3af5f3901e3f0868fc42f921d95ffadc1bebe3812d652e6fe4f7`. Выполнена ровно одна correction, без crop/stretch/retouch и третьей генерации.
- Visual QA c1: `ac2c5f639cb49f05b074b54a6501cdedd02d6883`, `experiments/p0-perspective/qa/visual/REPORT_C1.md`. Решение `STOP_ESCALATE_CONTROL_TRANSFER_OPTIONS`: поле заметно улучшилось, основания/объёмы и художественное качество в целом PASS, но row anchors и uniform drum master + S(z) повторно FAIL; появились вторичные leaked control markers.
- Release route: отдельная страница `https://superflight.space/review/r4d/p0-perspective/` внутри существующего Review. Новая инфраструктура, права и credentials не нужны. Публикация заблокирована до accepted 40-символьного candidate commit, frozen self-contained route tree, allowlist/manifest и данных карточки. До этого Release Engineer ничего не публикует.
- Четыре финальные доски закрыты до решения CTO о control-передаче. Не запущенные варианты: deterministic layered composition с одним art master; structural img2img с edge/depth/segmentation control; precomposed exact raster control с masked/local finish.

## Решение CTO после c1

CTO выбрал deterministic layered composition: в текущем доступном `image_gen` нет hard mask, edge/depth control-strength или другого интерфейса, достаточного для доказуемых вариантов structural img2img / masked finish. Третья single-shot генерация запрещена.

Открыт только один diagnostic L1:

1. Builder фиксирует contract v2 до новых изображений: frame, exact quad/seams, q→pixels, anchors `.338/.453/.567/.681`, один RGBA master со scales `.939/.978/1.018/1.058`, z-order/occlusion, contact shadows, отсутствие markers, машинная проверка и воспроизводимая сборка.
2. Concept Artist фиксирует art-integration brief для законченного component-based результата.
3. После обоих exact commits Asset Artist создаёт одну independent finished environment/floor plate без встроенного семейства и один clean RGBA art master.
4. Builder программно собирает L1, сохраняет components/manifest/hashes/command/numeric report; глобальная перерисовка после композиции запрещена.
5. Visual QA применяет неизменный rubric `21150e58…` к geometry, identity, grounding, art cohesion и leakage.
6. Только PASS обязательной геометрии и художественной законченности возвращается CTO для решения о четырёх досках. При FAIL — stop/evidence, L2 не открывается.

Финальная серия, публикация и P1 остаются закрыты.

## Layered diagnostic L1

- Concept art-integration brief: `b807bcd53cc4baa45ef06925126256f09f99b1ac`.
- Builder composition contract v2: `606737181da71457372b0f026b4d25cced68d4ee`; exact frame/quad/seams/q→pixels/anchors/scales/order/shadows/marker ban и машинные проверки.
- Asset components: `0e23670803d57e6df564a1553c4d87a824e8bcd0`; finished opaque plate, один clean RGBA master, отдельная shadow RGBA, metadata/provenance и воспроизводимая alpha-preparation.
- Builder L1 composite: `9a8a01002672398bf171d540c50009c32c4a8f9d`, composite SHA-256 `6d4ebbac63ad381b0a538db08fda07e0897c594c7322da6afd4652ad5d1f9a17`. Layout был frozen до первого render: `p=.50/.36/.64/.48`, `q=.338/.453/.567/.681`, scales `.939/.978/1.018/1.058`; после render не подгонялся. Fresh-check воспроизвёл PNG побайтно.
- Visual QA L1: `4cf8c4b7132013c5520b56d1abb46f99e0049850`, `REPORT_L1.md`; verdict `L1_PASS_FOR_CTO_SERIES_DECISION`. Formal quad, rows/S(z), one-master identity, grounding/shadows, art completeness и leakage прошли. Неблокирующее ограничение: тень компактная, края sprite немного резче plate.

L1 PASS подтверждает layered contract на одном finished diagnostic, но не несколько независимых досок и не полный P0. Финальная серия не открывается автоматически; ожидается отдельное решение CTO.

## Решение CTO после L1

CTO принял `L1_PASS_FOR_CTO_SERIES_DECISION` и открыл ровно четыре независимо созданные finished boards. Это не PASS P0 и не разрешение публикации.

До первой генерации обязательны:

1. Один frozen Concept series brief: четыре различимые темы/архитектуры/материала/содержания при неизменных camera/formal block/frame/aspect/quad/seams/S(z).
2. Четыре frozen Builder layout manifests и cross-series checker: разные `p` допустимы, но contract v2, `q=.338/.453/.567/.681`, `S=.939/.978/1.018/1.058`, base-center/z-order/assembly неизменны; layouts не подгоняются после изображений.

После обоих exact commits Asset Artist создаёт для каждой доски отдельные independently generated plate и master/family. Нельзя переиспользовать L1 или source между досками, делать crop/recolor, скрытый reroll или global redraw composite. Каждый вызов и failure сохраняется.

Builder собирает четыре boards детерминированно. Visual QA проверяет каждую и серию неизменным rubric без среднего PASS. После exact QA Researcher готовит cross-series вывод/рецепт. Release Engineer только read-only проверяет pre-release пакет; публикация требует отдельного решения CTO. После будущей публикации — STOP до явной приёмки Макса.

## Final-series pre-generation freeze

- Concept frozen brief: `ae82913a18cf0beed2b67f1c421b30e1c1988e3b`, `FINAL_SERIES_FROZEN_BRIEF.md`. Варианты: F1 «Воздушная астролябия», F2 «Сад ступенчатого святилища», F3 «Цитадель янтарных печей», F4 «Жемчужный приливный двор»; formal block общий, plate/master каждой доски независимы.
- Builder freeze/checker: `0260519c5e3ff74365556713042d576b7bbec66e`, четыре layout manifests и cross-series checker. Frozen `p`: board-01 `.42/.62/.35/.58`; board-02 `.58/.38/.66/.44`; board-03 `.33/.52/.69/.54`; board-04 `.67/.47/.31/.60`. Все 16 IDs уникальны; общие q/scales/contract v2 invariants неизменны.
- Cross-series checker требует четыре exact manifests, разные plate/master/shadow hashes, 12 уникальных component hashes и запрещает все L1 source hashes. Self-test отвергает duplicate master, L1 reuse и anchor drift. Fresh-check PASS; до freeze изображений серии нет.

Generation gate открыт только для четырёх независимых component sets по этим exact commits; layouts после изображений не меняются.

## Final-series candidate и повторная проверка

- Asset final component sets: `557e4650ee22cb7387290f5baece37d1219484cb`, 51 файл и 10 фактических image-generation вызовов: восемь обязательных sources и две plate-corrections. Сохранены показательные failures F1 markers и F3 chutes; 12 component hashes уникальны, L1 не переиспользован.
- Builder first candidate: `4cdd9e6b1da397ae1549ab4085af0f830555fd42`. Composite SHA-256: F1 `2fee80e59e52f519a519d18ec340bec11e1f96b276a125ffbbbcd684946b19c4`, F2 `873e58c160e7ecfd0831002b6c5c3cd273693518fe39ea38d2953643c05ed52b`, F3 `114c16ed5c412191e27175b6a498e109f56f02b9ac302c8b80fc0b237ff836c6`, F4 `4db1465934ad1e7fb3f831d81b06c7995d02ec38c72ed58b9555e77be8916225`.
- Frozen QA: `91b11a2090dd1ce00c9603c9d88fa73d42ed0f4c`, `REPORT_FINAL_SERIES.md`; F2–F4 PASS, F1 FAIL из-за яркого drum на сильной baked diagonal floor shadow. Серия была заблокирована без усреднения результата.
- Разрешена ровно одна F1 plate-only component correction: layout, master, shadow и F2–F4 запрещено менять. Asset correction: `62387b6fda2190f0377a59bcbc3435923365ffac`; новый plate SHA-256 `221a351ed7acebdec03cad4395ac0e04690e6b1c186de59778e1bff8f8efe10a`, один exact ImageGen edit, исходный plate сохранён как evidence.
- Builder corrected candidate: `9c1050596751deee3e736fe2d4f968a37c91af97`; corrected F1 composite SHA-256 `6c9e6c221ebf17cc6f9549b8b43f29cea1f04416beffbe185f9252b17d084e4e`; F2–F4 побайтно не изменились; все fresh checks PASS.
- Final repeat QA: `0c3934908d9e795b631e9eaee89025e62541e2ce`, `REPORT_F1_CORRECTION.md`; verdict `READY_FOR_RESEARCH_RECIPE_AND_PRERELEASE`, F1–F4 и gallery PASS. Это не публикация, не приёмка Макса и не открытие P1.
- Research cross-series conclusion и reproducible recipe: `ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b`, `CROSS_SERIES_CONCLUSION_AND_RECIPE.md` и `README.md`. Разделены generator capability, deterministic composition и human/agent interventions; четыре composite hashes пересчитаны независимо и совпали.

## Prerelease gate

Release Engineer подтвердил, что accepted visual/research chain достаточна по содержанию, но существующий tracked candidate ещё не является frozen self-contained route package. Для `/review/r4d/p0-perspective/` нужны route tree, original reference, recipe, QA pages, manifest и fail-closed packaging/check command.

Предлагаемый browser allowlist: `index.html`, `site.css`, SHA-pinned `assets/reference/03-sun-temple.jpg`, formal SVG, четыре финальные доски, три показательные failure images, `recipe.html`, `qa.html`. Raw payloads, prompts, components, scripts/layouts, intermediate diagnostics/L1, локальные пути, логи, Git metadata и P1+ в browser tree не включать; полный provenance остаётся вне публичного дерева.

## Решение CTO по prerelease packaging

CTO проверил exact Lead state `1e07b43f56c5a55f7d6f41b5eb2d1d8703b514df`, repeat QA, первый series QA, Research recipe, Asset run record и визуальные артефакты. Содержательный candidate `9c1050596751deee3e736fe2d4f968a37c91af97` принят только для prerelease packaging; это не разрешение публикации.

Разрешена byte-identical копия read-only JPG с SHA-256 `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32` только внутри существующего authenticated Review route. Нельзя менять исходник, Drive sharing, права/credentials, создавать отдельную публичную ссылку или asset route. Release audit и post-publish check должны подтвердить auth redirect/deny для прямых URL страницы и assets без сессии.

Builder получил адресное поручение собрать пакет без новых генераций и без изменений accepted boards/recipe/QA. Browser allowlist уточнён CTO: original JPG, formal SVG, четыре final boards и ровно три failures — d1 single-shot `2db5dffdbcd0fecaee7ffa209ea3ebe8c775cd2f`, c1 corrected single-shot `6452515fff9f7cb90b619cbe632b62b9573d668b`, QA-failed F1 composite из `4cdd9e6b1da397ae1549ab4085af0f830555fd42` — плюс HTML/CSS recipe/QA. Manifest, build и fail-closed checker должны быть tracked вне browser tree.

После Builder commit разрешён только отдельный read-only Release audit. Публикация требует следующего решения CTO; P1 закрыт.

## Frozen prerelease package

- Builder package: `94b6f709ece6b0f9df78ee315ebc0bec89b12e62`, branch `codex/r4d-p0-perspective-builder-01`.
- Manifest: `experiments/p0-perspective/builder/prerelease/manifest.json`; browser root: `experiments/p0-perspective/builder/prerelease/site/`.
- Browser tree содержит ровно 13 allowlisted routes. Reference, formal SVG, F1–F4 и три failure PNG взяты побайтно из exact inputs; HTML только представляет принятые Research/QA выводы.
- `npm run build:prerelease`, `npm run check:prerelease` и полный `npm run check` PASS. Отдельный clean-worktree rebuild exact commit PASS, post-rebuild status clean. Playwright desktop/mobile: routes 200, console 0 errors / 0 warnings.
- Release Engineer получил exact package на отдельный read-only audit. Publication запрещена до следующего решения CTO.

## Release audit v1 и узкая presentation correction

- Release Engineer audit exact `94b6f709ece6b0f9df78ee315ebc0bec89b12e62`: `PACKAGE_INTEGRITY_PASS / PUBLICATION_HOLD`. Ровно 13 файлов, hashes/sizes/source pins, original/F1–F4/failures, fresh rebuild и fail-closed mutation probes PASS. Existing nginx `/review/` auth contract совместим: unauth page/asset наследуют 303 login, foreign Origin 403, dotfile 404.
- Два presentation findings закрываются до CTO publication decision: краткий browser `recipe.html` должен явно показывать фактические input hashes, `image_gen`, 11 invocations, settings/limitations, prompt/evidence locations и named corrections; заголовок «Принятая серия» заменяется на «Проверенная QA серия», чтобы не имитировать приёмку Макса.
- Builder получил узкое поручение изменить только HTML/manifest/check artifacts. Accepted binaries, source recipe/QA, 13-route allowlist и P0 gates неизменны; после нового exact commit требуется повторный read-only Release audit.
- Release audit рекомендует отдельный каталоговый раздел `R4D · перспективные доски` с одной карточкой, не менять существующий skeleton section/count 11. Exact catalog delta ещё не frozen; публикация запрещена.

## Final prerelease audit

- Builder presentation correction: `9e58b344f5ca7df1a054f6e8fb8357a7372ac10d`, parent `94b6f709ece6b0f9df78ee315ebc0bec89b12e62`. Изменены ровно пять text/presentation files; `qa.html`, `site.css` и все девять binary routes имеют zero diff; allowlist остаётся 13 routes.
- Browser recipe теперь явно фиксирует `image_gen`, 11 invocations, exact hashes/settings/limitations/evidence paths и named failures/correction без raw prompt payload. Index использует «Проверенная QA серия F1–F4»; формулировка, имитировавшая приёмку Макса, удалена.
- Release re-audit: `FINAL_PRERELEASE_AUDIT_PASS / PUBLICATION_FORBIDDEN_PENDING_CTO`. Fresh disposable-clone checker и расширенные mutation probes PASS; package total 13 files / 37,505,775 bytes. Existing auth/deployment contract повторно подтверждён без live changes.
- CTO передан exact publication gate: package `9e58b344f5ca7df1a054f6e8fb8357a7372ac10d` и отдельный catalog section `R4D · перспективные доски Millionko`, count `1 демонстрация`, без изменения skeleton section/count 11. До решения CTO ничего не публиковать.

## CTO publication hold по browser status

CTO принял package `9e58b344f5ca7df1a054f6e8fb8357a7372ac10d`, source pins/checks и предложенный catalog delta без изменений. Публикация всё ещё не разрешена: четыре prerelease-надписи в browser bytes после выпуска стали бы ложными.

Builder получил ровно одну presentation-only correction: заменить title, index eyebrow/footer и QA footer на формулировки опубликованного результата, всё ещё ожидающего приёмки Max. Главный P0/P1 status, QA facts, recipe facts, CSS/layout, 13-route allowlist и все binary/SVG assets заморожены. После нового commit требуется узкий read-only Release audit и отдельное окончательное разрешение CTO.

## Final package и разрешение публикации

- Final Builder package: `2c64c06f0deefcdc5725ba0373f3844dfcd636f9`, parent `9e58b344f5ca7df1a054f6e8fb8357a7372ac10d`. Изменены ровно пять ожидаемых presentation/build files; recipe/CSS/layout и все девять binary/SVG routes неизменны; allowlist 13.
- Final narrow Release audit: `FINAL_PRERELEASE_AUDIT_PASS / NO_PACKAGE_BLOCKERS`; fresh/mutation/auth checks PASS, package 37,505,860 bytes.
- CTO дал `PUBLISH AUTHORIZED` только exact `2c64c06f0deefcdc5725ba0373f3844dfcd636f9` и ранее принятому отдельному catalog delta. Любой live conflict/unexpected diff требует abort/rollback без импровизации.
- Release Engineer получил публикационное поручение: перечитать actual live root/manifest, сохранить все прежние bytes/entries, добавить только 13 P0 routes и exact catalog card, выполнить atomic switch и полный post-publish audit. После успешного выпуска — немедленный STOP P0; P1–P6 закрыты до явной приёмки Макса.
