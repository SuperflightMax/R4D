# Вторая цельная проба

Native invocation `exec-f5b6e785-5d8b-44c5-923b-4ea7721fbac9`.
Prompt `whole-board-correction-v01.txt`, SHA256 `fff48f37bc39b11e06c0a32276445b80f5b3f1393b6b7af2f665a346afa69741`.
Inputs: original frozen geometry draft (edit target), first generated board (style-quality support only), Jungle (style only).
Raw `raw/whole-board-v02.png`, 1254-square, SHA256 `539e4b1cbbcca9931dcc5c1bfaedc680de03720a21d9c82148cfb74b1198680f`.
Native C retained, E-copy verified. Uniform full-frame1536 preparation and exact registration overlay saved.

После добавления нормализованных центров и far/near anchors нижние ряды оказались
ближе к принятым основаниям. Но верх поля и дальние объекты всё ещё слишком высоко;
основания по ширине/высоте не совпадают с actual config. Геометрического PASS нет.
Цельная художественность и читаемые тени сохраняются. Никакой local warp/подгонки нет.

Следующая гипотеза: команда ранее просила переоформление всей сцены, а крупная верхняя
архитектура из style могла провоцировать новую композицию. Correction-v02 возвращает
простой двухвходовый edit (draft + Jungle) и просит surface finishing при сохранении
экранных envelope/высот: небольшой hatch остаётся небольшим; верхний отступ остаётся
фоном. Это новая конкретная проверка, не повтор идентичного запроса.
