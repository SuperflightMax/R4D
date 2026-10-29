# Первая цельная проба: наблюдение до correction

Native invocation `exec-70009f94-ad4b-47e6-a8e6-ce7e37eea12e`.
Prompt `prompts/whole-board-v02.txt` SHA256 `11ae1dd50f766713791908a8f78daf9c29a07df6da1ada820f4524fe7decca64`.
Фактические referenced_image_paths: original geometry-draft.png FIRST (edit target), Jungle SECOND (style only).
Draft SHA256 `bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532`.
Raw `raw/whole-board-v01.png`: 1254-square, 3277881 bytes,
SHA256 `204e30e5b8d296afc916def97936c90c42b3524d68650e390297c8b18dd9b81e`.
Native C source retained; E copy hash verified.

## Личное наблюдение по actual output и точному overlay

Сцена художественно цельная: четыре семейства различимы, препятствий 25,
технические кольца и сетка удалены, тени идут вниз-влево, корзины полноценные.
Но геометрия не удержана. В `evidence/whole-board-v01-registration.png` контуры
оснований далеко от реальных оснований. Дальняя граница пола оказалась выше
принятой y=300; дальние объекты тоже существенно подняты. По всем рядам есть
горизонтальный и вертикальный drift. Это FAIL удержания геометрии, не PASS.
Ресайз только uniform full-frame 1254->1536; никакой новой регистрации/warp нет.

## Следующая гипотеза

Первый запрос оставил модели свободу заполнить верхний отступ полем. Correction
возвращается к ORIGINAL draft как edit target, использует первый output только
для уже достигнутого стиля и добавляет вычисленные из frozen data нормализованные
base centres и far/near floor anchors. Это не изменение config и не компонентная
компоновка. Промпт сохранён до вызова. Полученный output снова проверяется тем же
overlay без подгонки. Сама таблица координат ещё не доказывает их соблюдения.
