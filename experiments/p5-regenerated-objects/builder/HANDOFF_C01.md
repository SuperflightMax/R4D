# c01 — ранний generated mini-set для независимых QA

2026-10-28 22:53 UTC / 29 октября Europe/Kyiv. Это **early freeze**, не final/release seal и не QA PASS. Artist mini01 остаётся immutable. Consumer собран самостоятельно, P2–P4/P6 не использовались. Release/server writes0; CTO release gate закрыт.

## Exact snapshot

| Pin | Значение |
|---|---|
| Consumer commit | `0c611039246904443128b9d12084af2c5a0ae6e6` |
| Consumer path | `experiments/p5-regenerated-objects/builder/` |
| Branch | `codex/r4d-p5-regenerated-builder-01` |
| Schema first publication | `b327e5ff53190c9a356f350835390de2e77580ac:experiments/p5-regenerated-objects/builder/contracts/ASSET_CONSUMER.md` + соседние schema/example |
| Artist source | `5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json` |
| Artist manifest | 23553bytes, SHA256 `7b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f` |
| Staged render manifest | `assets/manifest.json`,15630bytes, SHA256 `96305bca8706f22a0cad0537599a30a5ef9ae75bc49d998da5ccc573e55da7b5` |
| app.js | 569494bytes, SHA256 `39d0cc5cdc8e869df975f008057c3c408ed3e41ce40bdd870dd0f001f19f1f44` |
| Immutable public root | `E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public` |
| Build index | `E:/R4D/perspective/p5-runtime/builder/output/previews/c01/index.json` |
| Build index digest | 7149bytes, SHA256 `a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac` |

Index содержит exact SHA256/bytes всех22файлов, общий размер13937155bytes, accepted input pins, native/core, source и staged manifests. Все10PNG скопированы без изменения байтов; URL имён нормализован к hash-prefix. Полный provenance вне web root, staged schema `r4d.p5.render-assets/1` хранит digest-связи с source manifest. `raw native TS/maps/private staging` не вошли в explicit whitelist. Это не подменяет отдельную privacy проверку Release.

## Preview ownership

- URL: `http://127.0.0.1:55185/`.
- PID **32108**, exec session **55195**, host `WIN-36E9FF9EJM0`.
- Root exact immutable `.../output/previews/c01/public`, старт `2026-10-28T22:50:19.140Z`.
- Ownership current record: `E:/R4D/perspective/p5-runtime/builder/preview-owner.json`. В нём также записана замена старого own PID22076/session80690/root`.../site`.
- Старый exec `exec-8095858f-25fb-4c24-9bae-3d4973b82f5e`, который Lead видит как exit1, был штатно завершён Builder через `Stop-Process -Id 22076` после проверки PID/command/root/listener. До нового запуска порт проверен свободным. Startup старого listener был успешным; первичного текста runtime error/denial не было. Это не основание предполагать policy/race. Чужие PID не менялись.
- Новый listener оставлен для текущих независимых QA. Проверять в собственном изолированном браузере, не использовать личный Chrome/desktop Max. Не перезаписывать immutable root. Для нового кандидата — новый каталог и адресный handoff.

Если нужен свой preview root/port, скрипт consumer `scripts/preview.mjs <own-root-inside-own-runtime> <free-port>` показывает принцип ownership; QA не должны запускать его с Builder runtime как своим пишущим runtime. Можно использовать свой уже разрешённый способ изоляции на exact copied public bytes.

## Native, inputs и зависимости

- Accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; public `data/config.json`9503bytes SHA256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`; `data/p1-manifest.json`11565bytes SHA256 `7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18`.
- Exact P1 projection614bytes SHA256 `b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431`; view-math3050bytes SHA256 `96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e`. Translation `[33256,34072]`, обе матрицы сохранены.
- Jungle1536²/671136bytes SHA256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`, read-only original. Original не становится floor/spрайтами.
- Native commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`;27runtime files materialized exact только в private runtime. Ball r16,tick5ms,quantize7,gravity980,maxspeed2000,noise2deg/.02,lcg32,25pins/16segments/4buckets/1drop. Меняется только seed собственной копии config.
- PixiJS8.17.1/esbuild0.25.12, Node24.15.0. Actual installed common dependency lock: consumer `DEPENDENCIES.lock.json` и public `data/dependency-lock.json`; включает hashes package metadata и private722file build-input inventory digest. Исходный installed common pnpm-lock SHA256 `471b2ec0c5900a87c2469490b31e9408e9a0ecf2d332366ab9006d8c34566518`. npm install не выполнялся, synthetic npm lockfile не создавался. Third-party terms включены; недостающий @pixi/colord license file отмечен ниже.

## Что уже проверил Builder

- Все10PNG/13instances: SHA/bytes/dimensions, alpha>0 и alpha>=16 bounds, anchors/footprints; Asset verification — `E:/R4D/perspective/p5-runtime/builder/output/asset-verification.json` (mutable build record; необходимые делtas также видны в UI данных).
- Загрузка generated mini01 в actual Codex IAB/Pixi/native, coverage4/25pins и1/4receivers, ordinary replay1696420279 в realtime и native terminal875. Контактный кадр835 и корзина874/875 сохранены.
- Ранний floor-only consumer self-check подтвердил +1tick,95→96,seek95 и неизменность state/RNG при Art/Geometry/framing. В mini01 тот же native controller/config; независимая проверка exact c01 controls/occlusion ещё нужна. Ни frame existence, ни numerical finish не объявлены artistic PASS.
- `src/controller.mjs` использует штатные session/step/timeout API. Collision event t → state t+1; bucket/lifecycle events уже имеют свой state tick.3200ticks и штатный timeout; core не правится. Scene/view/drawing получают detached snapshots, не native RNG.

## Обычные replay/evidence pins

`E:/R4D/perspective/p5-runtime/builder/evidence/c01-replays/index.json`:5430bytes, SHA256 `aca3ca025c5aee9a0fdf7069035ce376207029c38b99f48f0611e650b7a93c4b`. Внутри start/config/core/projection/artist/app pins, hashes/bytes trace/replay файлов и contact windows. Это сохранение двух уже наблюдавшихся UI seeds через exact consumer, без поиска новых и без повтора oracle matrix0–3.

| Seed | Наблюдение и полезное окно |
|---|---|
|0|Default UI seed; receiver03/tick1956. Artwork receiver03 отсутствует. Present frog05: event1715 → states1715/1716/1717. Full trace SHA256 `971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572`,315344bytes, совпадает с TQA oracle.|
|1696420279|Первый обычный New throw crypto seed, без отбора. Receiver01/tick875; present flower07 event834 → states834/835/836; bucket states874/875. Full trace SHA256 `04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14`,140152bytes.|

Actual browser evidence index: `E:/R4D/perspective/p5-runtime/builder/evidence/c01-browser/index.json`,1903bytes, SHA256 `1efa516bc89ffc87ca86d8fb64c16f022b334c7b578a5ade578bd94da3db8a02`. Screenshots перед byte-identical freeze связаны с тем же app SHA. Внутри file hashes/bytes:

- `.../evidence/mini01-seed1696420279-state835-art.png`:147411bytes,SHA256 `ce74b1809e7f1450e1f14a6d4b827710990730db9f4fd84f8cf34f158071e980`.
- `.../evidence/mini01-seed1696420279-state874-art.png`:117769bytes,SHA256 `0bfcb21469b1f816dd842743575c48a41eda357a04e9c647b40e210261e28aad`.
- `.../evidence/mini01-seed1696420279-state875-art.png`:118401bytes,SHA256 `28d2c4ce53c75e682fe8f6089a400c969ce152f1ba15107b25c4e92b954d43c8`.
- Browser terminal875 JSON313bytes,SHA256 `bbe35db30cb948a5e6ee04326ea5fb8bce490e2abce1facf8d9a8bfa79248640`.

Replay UI: ввести seed, «Повтор» сбрасывает вtick0; «Продолжить» реальное время; slider пересчитывает от нулевого тика с тем же seed, +1/+10 двигают actual ticks на паузе. Независимые Art/Geometry и Whole/Field не должны менять state/RNG. Геометрия из actual config выше art; Art off выключает весь art tree. UI download ещё не испытывался отдельным сценарием.

## Известные границы и вопросы для ранней QA

- Готовы только flower07,leaf05,frog05,wood04 и receiver01. Остальные21pins/3receivers без арта; их collisions остаются, поэтому отскок в пустом месте вне coverage не скрывается. Это объём мини-набора, не полный результат P5. Side rail/near-platform occluders ещё не prepared.
- Body depth residuals послеuniform scale: flower+3.123736,leaf+1.092168,frog−0.958852,wood+0.016809sourcepx. Source/native anchors не менялись, XY warp нет. Shadow logical footprint deltas выведены отдельно; визуальную casting shape/опору оценивать в сборке.
- Partial occlusion/center sort не объявлен достаточным. Receiver full/back и native-edited front имеют общую регистрацию, но надёжность overlap пока unverified. В кадре874/875 sphere близка к дальнему rim: проверить убедительность попадания и первичную причину (asset anchor/aperture/part layer/general input), не двигать bucket.
- Tени присутствуют как generated отдельные текстуры; читаемость и согласование света/резкости/volume требуют VQA обычного масштаба. Faint alpha за visible bounds не отрезалась скрыто.
- Runtime blocker/loading/control break не выявлен. Исключительные timeout и UI download пока unverified. Никакой полной контактной/художественной матрицы Builder до c01 не проводил.
- @pixi/colord2.9.6 package declares MIT, но в installed package отсутствует license file. Этот packaging gap нужно закрыть до release; не причина блокировать локальную early QA. Private compiled native use разрешён контрактом, open-source license для private ядра не выдумывается.

Resource guard до mini build22:43:23UTC: RAMfree16.305/31.907GiB, systemCPU5%, aggregateCPU6.75%, aggregateWS19.468GiB,444processes; C/D/E free16.967/16.282/12.170GiB. Own peak estimate1.2GiB RAM/0.2GiB E, concurrent allowance4GiB RAM/2GiB E. Пороги4/2GiB наE не достигнуты. TEMP/TMP/cache/staging толькоownE/process-local. Denial не было; историческая denied операция/обходы не выполнялись.

Следующий адресный шаг — независимые TQA/VQA **этих exact bytes**, затем коррекции по связанным первичным причинам. c01 и mini01 не перезаписывать; новый art/consumer delta получает новый candidate. Server release gate остаётся закрыт.
