# P5 Technical QA — адресный frozen C03

29 октября 2026, Europe/Kyiv; actual проход примерно01:02–01:08 UTC. **C02-V01 закрыт в собственном actual C03 окне670/674/675/676/677/680.** Сфера больше не исчезает над открытым полом. Затронутые центральная/левая кромка, соседний head case и receiver01/03 проверены адресно; новых дефектов этой дельты в просмотренных cases не выявлено.

Это лучший фактически наблюдавшийся результат исправления near-ledge: исходный дефект устранён, полезное partial→hide→reveal у структурной кромки сохранено, native результаты не изменились. Оснований продолжать правку этих проверенных мест текущий проход не дал. **Это не общий artistic/technical PASS всего P5 и не release approval:** оставшиеся ограничения перечислены ниже.

Покрытие четырёх семейств/контактов/side-wall и100snapshots C02 сохраняется по `a3fac041969bcc287ae5fbb0c25a53a71034d4ea:experiments/p5-regenerated-objects/qa/technical/REPORT_C02.md`. Эта законченная матрица не повторялась. C02 остаётся версией с подтверждённым V01; его отчёт и evidence не переписаны.

## Exact identity и единственная семантическая дельта

- Consumer/index commit `af23e124cf5bd1d9de884082ffbc993448217112`, prefix `experiments/p5-regenerated-objects/builder/`; код app/controller/framing/P1 projection/view-math побайтно совпал с `398b0daaaad914cc67b8390a51454d21db524e7a`.
- Frozen root `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public`. Полностью прочитан index11618bytes,SHA256 `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d`.
- Все29файлов/21675411bytes совпали на диске и по HTTP. Относительно C02 изменены только `assets/manifest.json` и `data/preview-input.json`. App571012bytes,SHA256 `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c` неизменен.
- Staged manifest66026bytes,SHA256 `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91`.
- Artist `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966`; полностью прочитаны `HANDOFF_MINI_03.md` и `DELTA_MINI_03.json`. Source manifest89838bytes,SHA256 `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0`; regions15922bytes,SHA256 `118abd360f963b6088dab47f23c56554e9d4b31ef718d91345954fa3cc97e870`. Все supporting hashes/bytes из producer index проверены.
- Deep comparison source manifests после исключения **только** `near-ledge.sourceClipPx` дал полное равенство. Полное source→staged соответствие проверено после объявленной нормализации URL/schema/provenance digests. Все17PNG,23texture IDs,64instances,bindings,receiver policy,два serpent contours,config/native/deps/license bytes прежние. Alpha/dimensions/native source/лицензии заново не анализировались: фактической дельты там нет, hash identity подтверждена.
- Новая граница дана в texture1254 и exact преобразована `×1536/1254`. Bounds source меняются с `[330.7177033,1054.6220096,930.9090909,121.2631579]` на `[330.7177033,1099.9425837,930.9090909,75.9425837]`; area53666.1238→37474.5413sourcepx². Это анатомическая перетрассировка всей фасции, не offset/условие вокруг seed/tick.

Preview `http://127.0.0.1:55185/`, ownerPID12500/session67163/rootC03 проверены до браузера. После прохода owner и served app/staged manifest совпали. Свой сервер/копия product/rebuild не создавались; frozen index с creation-status не редактировался ради QA.

## Actual C03: собственные кадры

Собственная скрытая Codex IAB вкладка browser2/tab4, исходный viewport. Действия — UI replay/slider/buttons/checkbox/select. CDP использован только для чтения snapshot/config/meta/record. Каждый snapshot подтвердил actual Artist source digest C03; не использовалась страница Producer или его selfcheck. Вкладка закрыта; warning/error console сообщений не было.

| Адресный сценарий | Собственные actual кадры/действия | Результат |
| --- | --- | --- |
| **C02-V01** seed4210403976 |670/674/675/676/677/680,Art on/Geometry off; затем676Geometry иArt off | На открытом полу sphere видна, прежнее false hiding не воспроизвелось. Geometry показывает прежний ground point; native не перемещался |
| Motion того же case |seek650,Continue; actual reads691/714,затем LOST757 | Нормальное движение и прежний проигрыш сохранены. Moving screenshot не имеет атомарного tick timestamp |
| Центральная near-ledge |seed0:1919/1930/1933/1935/1945 | Видимый подход, partial на1930,полное скрытие1935,появление1945. Изменённая граница сохраняет убедимую последовательность у stone face в этом пути |
| Receiver03 |seed0/1956 | Sphere внутри aperture, прежний IN_BUCKET1956 |
| Левая кромка/receiver01 |1696420279:850/854/858/860/864/875 | Partial→hide→reveal у фасции сохранены; receiver01/875 внутри отверстия |
| Соседний left-head |3339315606:1590/1600/1610/1620 | Просмотрен проход возле nose/фасции; нового резкого pop слоя в этом окне не выявлено. Это локальная проверка, не PASS всему contour |
| Left-head result/replay |3339315606/1709;replay1610;1610Geometry/Art off | Старый LOST1709 state совпал; локальный replay и view сохранили state/RNG/config |
| Controls/bounds |676Art/Geometry/Whole/Field;+1→677,+10→687 | State/RNG/config и Field domain не менялись от view; реальные тики соответствуют запросу |

Закрытие C02-V01 основано на этих собственных actual кадрах, а не на fixed point containment, producer selfcheck или неизменности числаPNG. Сфера может затем скрываться за реальной stone fascia/head частью; отсутствие всякого скрытия не является критерием исправления.

Ключевой исправленный кадр: `browser/final-fixed676.png`,152011bytes,SHA256 `de7abe432ceadadddfc7efea30595e6856ec640243e2ee212779f836cf109667`. Он сопоставлен с прежним собственным C02-V01 тем же seed/state676; native/source position остались прежними.

## State/config/RNG: точные границы доказательства

Сохранены **39actual snapshots**. Из них30побайтно по JSON state/RNG/config/event sequence сопоставлены с уже проверенными saved independent native traces:

| Seed | Переиспользованный trace SHA256 | Результат |
| ---: | --- | --- |
|0|`971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572`|receiver03/1956|
|1696420279|`04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14`|receiver01/875|
|4210403976|`555e6fe1566f24c5a37b4e41359c2dcd548035bab51f8cc7d93f711a244f3890`|LOST757 сохранён|

Остальные9snapshots относятся к3339315606. Для промежуточных1590–1620 проверены exact config/pins и локальная view/replay invariance; независимого сохранённого per-tick trace этого seed у TQA нет и такое сравнение не заявляется. Terminal1709 полностью сопоставлен с прежним actual native результатом VQA: raw AX7288bytes,SHA256 `6c25a8926823f3adbeda6d7e9c33fe54424651555c00b22fee3932b5464166ee`, pin из `c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/EVIDENCE_C01.json`. Сохранены rng3706765538,pos(32982.9916626,35372.5193698),vel(161.1079593,1590.6581421),LOST1709. Это reuse результата, не новый native oracle run.

Field domain совпал с C02 и оставался постоянным во всех snapshots: X180.0574163..1384.1148325,Y300..1410.0959465;11important part bounds внутри domain. Actual Whole/Field/Art/Geometry рассмотрены. Новая near-ledge bbox уменьшилась, другие parts/камера не сдвинулись. Перекрывающая mask и geometry относятся к прежней проверенной tree topology; Art off на676 и left1610 не оставил невидимого перекрытия диагностического пути.

**Отдельных headless/native oracle runs0,new UI throws0.** Настоящее native движение в самой странице, включая seek/replay, выполнялось штатным consumer. Source/projection1922points,core export,seed0–3 и100snapshot C02 matrix не запускались повторно. Cached traces проверены по hashes и использованы read-only. Статический rendering math/metadata не выдаётся за просмотр actual движения.

## Итог, разумная остановка и остатки

Адресная техническая коррекция near-ledge пригодна к следующему CTO review на этих exact pins. На original failure window она лучше C02: open paving больше не закрывает сферу. В просмотренных центральном/левом и receiver переходах полезное перекрытие сохранилось. Нового воспроизводимого дефекта этой дельты не найдено; дальнейшая правка тех же мест без нового факта не обоснована этим проходом.

Сохраняются реальные ограничения из завершённого C02: не проверены actual entry receiver02/04, все позиции длинных unpartitioned side rails и полные serpent/head boundaries, каждый contact каждого из25targets, информативные body order flips вне просмотренных траекторий,coarse moss/feather edges,timeout exception/UI download/другие DPR,raw generation audit и release/privacy. Left-head1590–1620 и правое соседство670–680 добавляют локальное покрытие; они не превращают оба head contours в полностью проверенные. Художественная цель и readable shadows остаются также предметом независимой VQA. Общий P5/release PASS не выдан.

C01/C02 immutable и их ordinary LOST1858573514/843,2608986051/1175,4210403976/757 сохраняются; исходы не отбрасывались. Поиск seed ради receiver02/04 или красивого результата не выполнялся. Следующее действие — адресное решение CTO/Lead по итоговому разумному результату/остаткам; новые широкие прогоны самостоятельно не открываются.

## Evidence, ресурсы и cleanup

Raw evidence только `E:/R4D/perspective/p5-runtime/technical-qa/c03/`. [C03_EVIDENCE_PINS.json](C03_EVIDENCE_PINS.json) содержит exact hashes/bytes. `evidence-index.json`:15440bytes,SHA256 `ba939a9a8f9a8b2d4cd05446484609c5481b785473fe36c144dac6a8b49b33ac`;87files/10549082bytes до самого index.

- `package-verification.json`:8315bytes,SHA256 `e3588c5aa2e74ff0f848dfb6e8f2ba363d5b5ff74ae4fbb6ee90b3feef454a0f`;
- `browser-comparison.json`:9067bytes,SHA256 `ca57462a19b37279ae46875c316d436ac495967030bc4f2604da39ff020fb5e9`;
- `saved333-terminal-baseline.json`:853bytes,SHA256 `60d17df33c739577043206b97aad2d5df611d66483afa4a6132472fd67441ecf`;
- `producer-exit-verification.json`:1156bytes,SHA256 `d398085cfdb9cab078be4920646d2b4fc4116f693e93a0e69e644eba0d5bb0f9`.

Fresh guard до шага: RAMfree15.428/31.907GiB,CPU6%,aggregateWS19.888GiB,385processes,C16.288/D16.281/E11.999GiB. Own peak estimate1.2GiB RAM/.1GiB E + concurrent allowance4GiB RAM/2GiB E. После: RAM15.634GiB,CPU9%,aggregateWS19.329GiB,382processes,C16.271/D16.281/E11.983GiB. Browser peak отдельно не измерен; shared working sets не трактуются как unique RAM. E4/2GiB thresholds не достигнуты.

Собственная hidden вкладка закрыта; viewport не менялся, свой сервер не создавался. Builder PID12500/session67163/rootC03 не трогался. TEMP/TMP/output/evidence — свойE/process-local. Source checkout,dirtyD:/dev/R4D,чужие worktree/PID/devices,model/effort/host/globalsettings/security/credentials не менялись. Denial/403/file fallback не было. Server release writes0,CTO gate закрыт. Другим чатам не писал; Lead получает отчёт через собственный final/snapshot.
