# M1: один atlas-first вызов

Подготовка и генерация разрешены отдельным dispatch CTO после freeze. `prepare.py` проверяет шесть исходных SHA и контракт, создаёт точные J0 copies, source-atlas, технический layout и бинарные маски. Содержимое references не становится новым художественным ассетом: PNG M1 получены одним встроенным image_gen.

`prompt.txt` — verbatim prompt. `tool-args.json` — фактические аргументы вызова, `ordered-refs.json` — порядок refs и SHA-256. Tool не раскрывает image model ID или отдельный mask API. `raw.png` скопирован побайтно из generated_images; исходник там оставлен. Время ожидания вызова около39.1с по tool; это не оценка полного труда или стоимости. Один вызов, повторов0.

`normalized.png`, `thigh-raw-crop.png`, `shin-raw-crop.png` и `art/M1` изготовлены общей процедурой `../M2/finalize.py`. Нормализация и фиксированные crops не оптимизировались по изображению. `metrics.json` хранит размеры, alpha bboxes, outside-mask diff, silhouette drift и coverage losses. У thigh нарушена регистрация у правого края; открытые торцы прочитались полостями. Результат не исправлялся.
