# Water: первое применение frozen P3

Baseline ART f899a308aed156a11e2a1013292ed68c6669959d,
CODE f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74. Рецепт/интерфейс:
ART:experiments/p3-masks/asset-artist/CONSUMER_CONTRACT.md и
CODE:experiments/p3-masks/builder/ASSET_CONTRACT.md. Renderer не меняется.

`assets.json`, schema r4d-p3-assets-v1, sourceSize1536². Origin top-left,
+x right/+y down; PNG crops имеют white RGB и alpha тела. rectPx без rescale.
Цельный JPG04-water-temple остаётся фоном. Вода/падающие тени не являются
непрозрачными телами. Art-off выключает все маски; geometry выше арта.

Pin depth = exact config pin.y. Для segmentLoop depth — средняя native.y
принятой опоры P1 (verticesFlat + исходная translation.offset). Это прежний
scalar anchor, не новый коллайдер. Для перемычки line между anchors двух
принятых feet; видимая пустота проёма сохраняется alpha0. Силуэт разделён
на left-body/lintel/right-body с1px перекрытием внутри исходного тела,
как прежние полосы сложного силуэта. Никаких seed/tick условий.

Ball/shadow — exact собственные generated PNG из frozen ART, раздельные
копии здесь, origin/path/hash в provenance.json. Это первая попытка прежнего
рецепта. Radius/anchors измерены ранее и сохранены; radius_native16 задаёт
config. Shadow alpha0.72, offset[-.45,.5], scale[1.15,2.6] (oval texture,
затем floor projection), свет сверху-справа по исходнику. Новых генераций нет.

Раннее покрытие: frog-01, arch-01 и arch-07 (каждая арка тремя частями).
Проём и непрозрачные опоры/перемычки проверены контрольными source pixels.
Полное покрытие ещё готовится. Runtime/movement/art PASS не заявляется.

Первый известный реальный случай от TQA: обычный заранее выбранный seed1,
arch-07 tick1015, соседние1014/1015/1016, source≈[518.076,957.456]. Run LOST1196
сохраняется, не отбирался по красоте. Это native witness, НЕ просмотр Artist
в PixiJS: Builder/QA должны проверить движение и фактические соседние кадры,
включая видимость шарика/тени в отверстии и за перемычкой.

Все JSON записаны UTF-8/LF, hashes относятся к точным байтам. Перед передачей
они дополнительно сверяются по git show exact commit. Полные входы INPUTS.json.

## Первый полный набор, прежний способ

71 masks: 6 frogs, 7 pillars,24 части8 arches,6 rail areas,9 видимых platform
faces,3 divider walls,16 передних strips четырёх приёмников. Runtime алгоритм
не менялся. Source contours подготовлены вручную по исходнику. Верхняя и
нижняя ограда разбиты по реальным каменным телам, чтобы не залить голубой
поток; неудачный boundary overlay сохранён отдельно в собственном runtime.
Восемь arch-hole probes, четыре basin holes/front probes и четыре явно
водных source-point probes проверены. Зелёный пол/вода не стали масками тела.

Ранний Pixi стык7 masks подтверждён Lead. Builder обнаружил наблюдение:
seed1/t1014 маски закрывают около35% sphere-alpha; на1015 depth отключает
их при ещё примерно23% projected overlap. VQA уточняет отнесение. Текущий
полный набор сохраняет исходные scalar/line правила до такой коррекции;
не выдаётся за PASS и не подменяет early4eb4001. При дальнейшей смене depth
данных/метода нужен отдельный named version с сохранением этого результата.

Повтор авторинга: python -B author_objects.py, затем python -B prepare_assets.py.
Exact packet: python -B freeze_handoff.py <commit>. Manifest вне payload,
включает все тексты/PNG/provenance/hashes по фактически извлечённым Git bytes.
