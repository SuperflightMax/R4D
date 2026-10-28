# Первый generated набор P5 — mini01

Это ранний материальный handoff для совместной сборки, не финал P5 и не художественный PASS. Ассеты изготовлены native `image_gen`, не вырезаны из оригинала и не нарисованы кодом. UI service C: stub не использовался как checkout.

Manifest: `asset-manifest.mini-01.json`,24246bytes, SHA256 `92c8da9a421203d662c75bb0403264bc5e177081ee33ef0857f63497ecc86038`. Exact schema Builder `b327e5ff53190c9a356f350835390de2e77580ac` проверена `Test-Json`. Все PNG byte-identical своим native raw,1254x1254. Пол opaque; остальные straight RGBA с фактически измеренными bounds. Файлы: `E:/R4D/perspective/p5-runtime/asset-artist/selected/mini-set-01/`; raw: `.../raw/`. Native C originals сохранены. Все exact SHA256/bytes/tool IDs/prompts/raw paths и anchors в manifest, copy records и measurements.

Состав: floor, четыре характерных obstacle families, отдельный obstacle shadow, объёмный ball с отдельной тенью, receiver full/back и его native-edited front part. Instance targets: flower-07,leaf-05,frog-05,wood-04,receiver-01,$ball,$source. Это13instances из10textures; остальные21pins/3receivers ещё отсутствуют.

`BINDINGS.mini-01.json` фиксирует исходные native/source anchors, target footprints, authored footprints и uniform scales. Геометрия P1 не менялась. Текущие masters по измеренному нижнему контуру ближе к переднему ракурсу, поэтому ранние target bindings выбраны из уже существующих соответствующих мест. Смена целевого ID не означает перемещение pin. Far-view versions ещё нужны; нельзя назначить эти же raw всем дальним pins и объявить перспективу совпавшей.

Предварительное визуальное наблюдение по отдельным файлам: узнаваемые четыре семейства/материалы, цельный generated floor без старых obstacle shadows, объёмная jade/gold sphere, basket opening/front layer. Цветок имеет более высокий каменный drum, leaf center turquoise вместо полностью тёплой сердцевины; качество в масштабе сцены ещё не оценено. Cast shadows направлены вниз-влево qualitatively; exact visibility и связь с опорой требуют сборки.

Приоритет раннего просмотра: contact ellipse anchors/scale; читаемость shadow в обычном масштабе; отсутствие ghost/matte при faint alpha; receiver-front регистрация и частичное скрытие; цельность пола/masters. Bottom ropes native generation вышли на верхний край canvas; в assembly это должно совпасть с подвесом у ledge, не выдавать за уже проверенное. Полная side-rail/near-platform occlusion ещё не prepared. Dynamic native/QA не проводились художником и не заявлены.

Следующий содержательный шаг: получить exact consumer snapshot ранней сборки, исправить art/anchor/parts по первичной причине; отдельно подготовить более плоские дальние variants. Никаких серверных writes/deploy. Model/effort/host/settings не менялись; Director-confirmed gpt-6.1-sol/xhigh.
