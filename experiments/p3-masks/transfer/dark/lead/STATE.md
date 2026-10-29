# P3 Dark — текущее состояние Lead

29 октября 2026. Lead: `lead-r4d-p3-masks-01`.
Worktree: `E:\R4D\perspective\p3-worktrees\lead`.
Branch: `codex/r4d-p3-masks-lead-01`. Новых ролей/веток/worktrees нет.
[Метод и исходные входы](BASELINE.md) зафиксированы до переноса.

## BOUNDED DARK RESULT COMPLETE — targeted Technical PASS / overall Visual PARTIAL

[RESULT](RESULT.md) содержит точный кандидат, применённый рецепт, независимые
доказательства и решение Lead. Targeted Technical report
`18e880e117f30747c4d938b1f94cf3622f20fdc0` полностью прочитан и интегрирован:
[REPORT](../technical-qa/targeted-receiver-front04/REPORT.md).93files/MIME/
14CP provenance/12lines scope,25selected states/68browser samples совпали.
Targeted Visual report `bc34a864bc44cba231d466daa46bdc7b02651845` полностью
прочитан и интегрирован: [REPORT](../visual-qa/receiver-front-edge-04/REPORT.md).
Lead лично посмотрел независимый actual D-POP A/B монтаж. D-POP-01 локально
закрыт на04,43paired states/camera exact,normalPlay/neighboring100%/200%,
существенной новой регрессии в трёх good entries и side-подходе не найдено.
Общий Visual PASS не дан: тени/все направления/остальные48 records имеют
пределы покрытия. Малые RGB-различия entry до14/255 не выданы за pixel identity.
Исторический FAIL03 сохранён. Оба own QA old/new tabs закрыты, read-complete
6869 и6870 явные. Публикации нет; write token пока отсутствует.

Builder handoff `86d35d7af73883d83fd976eb4c0d5ef281048024` полностью прочитан
Lead: [STATE](../builder/STATE.md), [RECIPE](../builder/RECIPE.md), actual freeze.
Candidate: `dark-receiver-front-edge-04`.
SOURCE: `d7eac5d7d76127e3138480f1f16eaf28aac0f15a`.
ART: `e5d3e1f44c112e483ff2a23fbd169cb119390865`.
ART prefix: `experiments/p3-masks/transfer/dark/asset-artist/variants/receiver-front-edge-01/`.
Bundle: `E:\R4D\perspective\p3-runtime\builder\transfer-water-dark\dark\receiver-front-edge-04`.
Manifest SHA256: `d180e5a63bb1dec7c510507fc2ce990e7cb10927b337a19c4bb9effc67e4ed1b`.
92 payload / 3494340 bytes; manifest 15737 bytes; всего 93 файла / 3510077 bytes.
Freeze: `2026-10-29T12:23:43.716Z`, outside-payload record:
`dark/candidates/dark-receiver-front-edge-04.freeze.json` в Builder runtime.
Manifest независимо совпал у Lead.

NEW preview: `http://127.0.0.1:6870/review/r4d/p3-masks-dark/`.
Builder owner PID15752 / exec session31501. Это новый Dark процесс.
OLD Water6870/PID17380 остановлен владельцем в11:52:26Z; не переиспользовать.
OLD Dark03: `http://127.0.0.1:6869/review/r4d/p3-masks-dark/`, PID37660/session87426.
Water04: `http://127.0.0.1:6868/review/r4d/p3-masks-water/`, PID29572/session61378.
Все три текущих процесса удерживает Builder; QA их не останавливает.
OLD6869 нужен только для короткого A/B до явного read-complete обеих QA.

## Изменение и независимость

[README варианта](../asset-artist/variants/receiver-front-edge-01/README.md)
прочитан Lead. Assets.json18591 bytes, SHA256:
`2b02dcde6c07266b67285700040e4ae0342f06fb760ae6ed0cf1fdcdc9b6cbad`.
Lead самостоятельно сравнил exact Git bytes: ровно12 depthLineNative records
четырёх receivers; все48 остальных records/62PNG/60rect/alpha/ball/shadow и
metadata прежние относительно ART17dc. Внешний76-file Artist packet manifest:
`f5036ba0863766eb0ba00d47f383a910355b526d51d7ec20bc77ecfbd042c5f7`, hash совпал.

Общее правило: выбрать в сохранённом front-полигоне ребро с максимальным
средним nativeY после accepted sourceToNative; его линия служит общей передней
опорой front/left-rim/right-rim. Это нижнее ребро фасада, исходный edge11→12,
вместо верхней внутренней кромки. Новых силуэтов/сортировки/физики нет.
Renderer app SHA256:
`760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6`.
Compiled native SHA256:
`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`.
Native5a6fa03/P1 4b47db04 board02 trial01 candidate01/JPG/проекция неизменны.
CODE меняет только thin Dark import/build/static verifier/replay provenance.
Native build и полная native-матрица при packaging не выполнялись.

## Что выполнено раньше и что проверяется теперь

Первый полный Dark03 сохранён: SOURCEc73d6128970b2b022d5313b08c34cafdec9a1bc3,
ART17dc9fcdc261562acb581dd8590096819734c807, manifest
`b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307`.
[Полная Technical QA03](../technical-qa/reports/dark-full-method-03.md),
commit `b327ae601a4962dd5826abfbfdeefaf77c090a55`, ранее выполнена:
Technical PASS в проверенном объёме,11793 native states/66browser samples,
JSON/controls/replay/negative. Этот report полностью прочитан Lead.
[Полная Visual QA03](../visual-qa/full-method-03/REPORT.md),
commit `2d40b3f31341bbf57fd2df76aa6637a3f1a303e8`, ранее выполнена:
Visual FAIL по D-POP-01, остальные семейства с неполным покрытием экземпляров.
Все первые3 ordinary outcomes,613raw/58selectedJPEG/4sheets сохранены.
Lead прочитал report и лично посмотрел actual comparison PNG/100%2012.

D-POP-01: seed3858699109, receiver04 front/right-rim,2011→2012.
Непрерывный nativeY34699.484191→34704.4149515 снимает сразу два meshes,
шар резко раскрывается поверх камня. Тень — отдельный predicate.

CTO прямо ограничил новый объём: exact новые bytes/scope12lines, D-POP на
старом и новом порогах, отдельная тень, близкие ранее хорошие входы.
Доказанно неизменённые native/browser/controls/negative/import проверки
использовать со ссылкой «ранее выполнено»; автоматически не повторять всю
матрицу/native build. Новое нарушение расширяет объём по факту. Общий
Visual PASS не наследуется.

Точный frozen handoff реально отправлен обеим QA после fresh idle/errornull,
оба send isError=false, selected gpt-6.1-sol/xhigh, Root max не менялся.
TQA turn: `01a187a5-57eb-7e90-a0c5-3d79fdbc24c5`.
VQA turn: `01a187a5-5a8c-7ef2-971c-4876a38daa11`.
Обе завершены/idle/errornull. Отчёты/решение наверху. Dispatch повторно не выдавать.
D-POP-01 CLOSED locally on04/seed3858699109/2010–2019,2044–2047.

Builder selfcheck сохранил40actualJPEG и4actualCP.2012 fullCP совпал сVQA03.
2011–2018 раскрытие постепенное; новый порог shadow2045/ball2046 без видимого
скачка по его наблюдению. Lead посмотрел actual new2012: камень сохраняет
partial overlap. Это selfcheck/наблюдение Lead, не независимая closure.
На новом пороге шар вне JPG; тень на тёмном фоне малоконтрастна. Не выдавать
численный predicate за GPU/универсальное качество теней.

## Следующий gate

V1publication preflight14:31:55Z остановился наhttp namespace error доfirstwrite.
CTO закрылv1token14:36:01Z; использоватьнельзя, сервернеизменён. ТотжеRelease
готовитединственнуюотдельнуюlocalv2 alias/runtime-smoke; старыеreceipts,
scope/archive/frozen сохраняются. Currentstatus/точныеrefs в WaterSTATE.
Новогоexecutionдоновоготокена/freshidleнет. Product-cycle неоткрывается.

CTO принял exact оба результата71a4f50 для Review с публичным PARTIAL.
Sealed combined intentfdac2e9ba909a034a4ad176d11a438a04dc78ccc полностью
прочитан Lead, все архивные entries/code hashes/guard проверены.
Подробный token-bound write-set и текущее WAIT_EXACT_CTO_TOKEN — в
[Water STATE](../../water/lead/STATE.md). Записей/authorization/token ещё нет.

Оба Dark reports прочитаны полностью, [Dark RESULT](RESULT.md) завершён.
Water имеет Technical PASS c482/Visual PARTIAL42dacf и отдельный
[Water RESULT](../../water/lead/RESULT.md). Artist triagecb8e869 прочитан:
W-DIVIDER-01 оставлен OPEN как coverage+planeCollapse spatial ambiguity,
не depth-off и не доказанная единственная physics/mapping вина.
Два bounded результата завершены. Теперь existing Release получает ОДИН
полный combined local intent и fresh opaque RO baseline для отдельного token.
Не делать server writes до нового exact CTO разрешения; сам Lead не пишет.

Release active turn `01a187d1-ae46-74d1-8458-aba76b9514ff`: конкретный local
combined packet/intent и fresh RO opaque audit после двух завершённых RESULT.
Server_write=false, execution/token отсутствуют; детали в Water STATE.
CTO закрыл P5 token/window10:55:12UTC и резервировал следующее окно P3.
Предпочтение: один combined intent/одно окно, но два отдельных sibling
prefixes `/review/r4d/p3-masks-water/` и `/review/r4d/p3-masks-dark/`, artifacts
и verdicts. Нужен новый exact CTO token. Expected opaque P5 pointer и строгие
условия fresh guard/transport — в [Water STATE](../../water/lead/STATE.md).
Это не fresh guard и не действующее разрешение писать.

Перед тяжёлым действием — fresh system-wide RAM/CPU/C/D/E и combined peak.
Builder postflight12:21:57Z RAMfree15.024GiB/E11.624GiB/CPU1%; не резерв.
E≤4GiB diagnose,≤2 safe checkpoint/stop. Только собственные E outputs и
process-local TEMP/TMP. Никаких global settings/credentials/policies/cleanup.
Legacy denied call_7b166cdf46834d468b5f9c297aad6e9f не повторять/не обходить;
новый denial — exact-operation STOP с action/target/toolcall/reason.
Jungle, P2/P4/P5/P6 implementation/art/findings и чужие процессы не трогать.
