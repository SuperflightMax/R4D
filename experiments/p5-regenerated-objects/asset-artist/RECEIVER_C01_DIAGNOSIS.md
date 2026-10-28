# Receiver C01 — измерение и адресный вариант контракта

C01/mini01 неизменны. Прочитаны Builder app exact `0c611039246904443128b9d12084af2c5a0ae6e6`, handoff `a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d`, independent TQA `955af7f4d7d576c6296671f141e5314198eb3f1f` и VQA `ca0219cf65490242a55b1b5b57591e458e556be6`. Подтверждённые screenshot hashes874/875 совпали с Lead handoff; кадры просмотрены. Чужие файлы/процессы не менялись, собственная симуляция/браузер не запускались.

## Подтверждённое

- Native receiver01 center `(32893.24699917258,34882.17558293618)`,r33.523990645255964. State875 seed1696420279: ball `(32911.5049218,34857.8713072)`,distance30.398183461003914. Штатное IN_BUCKET законно; P1 bug не установлен.
- Exact projection ball ground point `(380.9210837032579,1221.6262311009655)` source1536; receiver ground/source center `(358.55946155335715,1238.2098586093362)`. Ball visible center proxy `(380.94000640686045,1203.8956578253853)`; подъём17.7305732755802sourcepx.
- Receiver raw/selected1254² unchanged: SHA256 `8be0883ce8be36898f382c7afa8ede0ae7b0c6c98374cf28bc58988c25121d92`,1719504bytes. `groundAnchorPx=[628,477]`, capture footprint290x174.4px, uniform source scale0.26334262342857173.
- Видимый центр сферы в receiver texture `(712.9864126138082,346.6975053365863)`. Её source diameter36.293745509671965px; visible radius около69receiver-texturepx.
- Connected dark-cavity core в вертикальном сеченииx713 — y338..597; наx628 — y329..586. Приблизительный строгий color-core метод с neighbourhood отбрасывает узкие щели между камнями; не выдаётся за точную сегментацию всей апертуры. Цвет/тень в швах всё ещё ограничивают уверенность. Предыдущие overly broad threshold scans захватывали brown rope/stone crevices и в выводах не используются.
- Front texture alpha в `(713,347)` равна0; уx628 вy350..575 также0, вy600 alpha252 (передний каменный край). В просмотренных кадрах front/full не даёт заметного двойного контура. Поэтому front не закрывает эту конкретную сферу; Builder независимо подтвердил порядок back<ball<front и почти отсутствующее пересечение bounds.

## Причинная связь и предел уверенности

Точка native capture расположена внутри sensor circle, но сверху от его центра. Billboard sphere находится ещё на17.7sourcepx выше своей ground point. В результате её центр приходится почти на far aperture edge, а значительная часть объёма остаётся над ободом. Это совместимость authored aperture/capture anchor со sphere-height convention, не ошибка tick/core и не случайный layer jump. Полный optical aperture contour/ellipse не доказан одним threshold scan; отдельно измеренная граница и последующий actual повтор обязательны.

Начальный `[628,477]` был выбран как приблизительный optical opening center. Он не содержит заявленного clearance для сферы с bottom/contact anchor. Нельзя честно назвать весь нужный сдвиг простой ошибкой измерения на один пиксель: это уточнение anchor-контракта. Текущие native/source targets/radii не меняются.

## Варианты для Lead/Builder — пока НЕ применены

1. **Согласовать logical trigger anchor и optical aperture center с общей политикой сферы.** Optical point остаётся отдельно измеренным. Требуемая texture-local clearance при receiver scale `sR`: `hR=(1089-620.5)*ballProjectedWidthAtBucket/959/sR`. Logical authored anchor находится наhR ниже optical center, поскольку sphere center всегда поднимается над ground point. Это правило для всех buckets/r16, без seed/tick offsets и без уменьшения шара. Оно перемещает отображение чаши относительно logical plane и поэтому требует адресного решения владельца consumer contract; нельзя молча выдать за подтверждённую правку координат. Подготовить aliases/данные можно после решения Lead. Native/source center и физика неизменны.
2. Сохранить старый anchor-контракт и заново изготовить receiver с более глубокой/просторной оптической апертурой, согласованной с projected capture region и высотой сферы. Риск — потерять исходный ракурс или изменить пропорции; проверять рисунок и true aperture, не маскировать проблему искусственным sink/исчезновением.

Рекомендуется сначала явное решение по общему anchor contract (вариант1), затем адресная actual проверка875, соседнего874 и доступных обычных входов всех receivers. Ни один вариант не объявлен исправлением/QA PASS. Field framing C01-V02 — отдельная область Builder, не повод изменять ассет/геометрию.

## Данные

Raw read-only computation: `scripts/measure-receiver.ps1`; результат `records/receiver-c01-measurements.json`. Script обычную PowerShell array-arithmetic parsing ошибку исправил скобками, затем выполнен успешно; denial не было. Pixel scans менялись только как измерительная методика, исходные PNG не менялись. Тяжёлые reference crops — только own runtime refs, не финальный арт.
