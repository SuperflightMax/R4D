# Третья цельная проба и текущая граница

Native invocation `exec-8319cb01-2eff-4465-be6f-3d9bbe18ae43`.
Prompt `whole-board-correction-v02.txt`, SHA256 `bef5431205d84eebf7d2b191e943fea4cb55daef2ef129a8764089b6206f6aac`.
Inputs: original geometry-draft.png first, exact Jungle style reference second.
Raw `raw/whole-board-v03.png`, 1254-square, SHA256 `86a781198ba09b92ebbf16ce033784805cfcdd29d75ec28b2214521fbd79b501`.
Native C retained; byte-for-byte E copy verified. Prepared1536 and exact overlay saved.

Материалы-only запрос не удержал экранную геометрию. Actual overlay снова показывает
дальний край и все ряды на других местах. Дополнительно появились декоративные
круглые floor glyphs, отсутствующие в исходной сцене. Receiver capture centres снова
лежат у ближнего края вместо центра тёмного рта. Никакого геометрического PASS нет.
Первая содержательная проба, обе осмысленные corrections и overlays сохранены.

Из трёх whole-image результатов v02 пока наиболее полезен для дальнейшей работы
(нижние основания ближе, нет новых glyphs), но он НЕ пригоден как согласованный
финальный арт по геометрии. Это локальный сравнительный выбор, не независимый QA PASS.
Заменять accepted config/проекцию/registration или делать local warp запрещено.

Сейчас по поручению Lead передаю независимый sphere/shadow packet для проверки
реального native движения Consumer. Whole-board остаётся evidence целой дорисовки;
подготовленные перекрытия и готовность доски не заявляются. Следующий компонентный
вариант, если будет выбран в разрешённых границах, сохраняется отдельно от этой пробы.
