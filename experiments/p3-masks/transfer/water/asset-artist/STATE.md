# P3 Water — Asset Artist

29 октября 2026. staff_id asset-artist-r4d-p3-masks-01.
Actual turn: 01a186fc-3554-7330-8c86-29166bcd6773.
Прямой новый старт Max через CTO/Lead 09:04:16Z и09:13:39Z заменяет паузу
только для поручённого переноса. Все4 карточки exact c6603f0 прочитаны.
Собственная branch codex/r4d-p3-masks-asset-artist-01, старт545bf170, дерево чистое.
Первое действие: read-only Git/JPG hash inspection и просмотр реального Water.

Baseline выбран до переноса: CODE f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74,
ART f899a308aed156a11e2a1013292ed68c6669959d,
frozen manifest e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f.
Ссылки рецепта: ART:experiments/p3-masks/asset-artist/CONSUMER_CONTRACT.md,
CODE:experiments/p3-masks/builder/ASSET_CONTRACT.md и src/app.js.
Jungle PARTIAL/MAP-01/post-auth не переоткрываются. Jungle файлы не меняются.

Текущие входы: exact P1 4b47db04, Water boards/04/trial-02 и
research/board04-projection.candidate-02.json; все3 SHA независимо совпали.
JPG04-water-temple SHA8da65c76...d3b80d совпал. Полные пути/SHA в INPUTS.json.
Первое применение: тот же source-aligned alpha и scalar/line depth,
отдельные части сложного силуэта; никаких новых коллайдеров или изменения
ядра/PRNG/проекции. Ворота имеют две физические опоры, без lintel collider.
Водная поверхность остаётся той же2D плоскостью по принятому входу.

Ранний пакет: frog-01, arch-01 (левая/правая опора и перемычка), свой ранее
generated ball/shadow из выбранного ART как exact copies в Water assets/.
Это первая попытка прежнего рецепта, без reroll. Настройка тени — обычные
параметры сцены. Проём в alpha остаётся прозрачным. Полной сцены/QA ещё нет.

Добавлен также arch-07 тремя частями для уже найденного TQA обычного seed1,
ticks1014/1015/1016 (LOST1196), без подбора seed. Всего ранних масок7.
Source alpha hole/body probes проходят. Это не visual/native движения PASS.

Текущий первый полный комплект71 masks описан в CONSUMER_CONTRACT.md.
Исходный метод scalar/line сохранён. В частности, early наблюдение порядка
1014/1015 не правилось незаметно. Нужна full QA и отдельная версия при коррекции.
Тела восьми арок с открытыми hole probes, береговые/платформенные stone faces,
rail и basin rims подготовлены. Ошибка широкой rail mask на воде исправлена
как авторинг контура; rejected overlay сохранён runtime/mask-overlay-boundary-v1-rejected.png.
Собственный source overlay просмотрен; package/schema/alpha и source probes
проходят. Принимаемый visual PASS не заявляется. Следующий шаг — exact full
handoff, затем смотреть названные реальные frames/дефекты через Lead.

После независимого VQA/поручения Lead подготовлен один data-only вариант:
variants/arch-front-edge-01/assets.json. Baseline17dc и прежний assets.json
не меняются. Общее правило всех8 arches — midpoint принятого front edge
feet вместо centroid;24 depth entries,73 PNG и47 прочих областей byte-unchanged.
Bounded self-check seed1: crossing переносится1015→1021, geometric overlap
в момент crossing21.324%→0.001%; native state1014 совпал с Builder checkpoint,
LOST1196 не изменился. Это оценка alpha, не Pixi/независимый PASS. Следующее:
exact comparative handoff Builder, actual frames1006–1018 и1020–1022,
отдельная тень; при неуспехе сохранить отрицательное, не менять renderer.

Server_write=false. Свои дополнительные peak <=0.5GiB RAM/0.2GiB E;
свежий09:32:15Z snapshot: RAMfree16.557GiB, CPU2%, C16.338/D16.280/E11.942GiB.
Тяжёлое только E runtime suffix asset-artist/transfer-water-dark/water.
Следующий шаг: ранний exact handoff Builder через Lead, затем полный набор
и реальные обычные контактные тики. При mapping blocker показать конкретный
случай CTO; физику/геометрию под картинку не подгонять.
