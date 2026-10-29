# Первый actual obstacle packet: wood-v01

`WOOD_PACKET_V01.json` + `raw/wood-master-v01.png`, own independent native generation,
not an asset from another method.1254-square; raw SHA256
`802f339d693d4dfc175a1e0f9013c78a6e9062bd6532a3db228bd98cd307e161`.
Call output `exec-f8e0f049-95f2-4fa4-bf9e-024239038eee`. Style source only own whole-v02.

Растровый деревянный столб с фактическим alpha, объёмом, rope/turquoise/gold и светом
сверху справа. Падающая тень отсутствует. Внешние gold/rope украшения шире нижнего
контактного основания; нельзя использовать весь alpha bbox как physical footprint.
Ground anchor(625,1032), base ellipse rx255/ry138 — approximate fit к actual нижнему
деревянному ободу. Нижняя точка1170 НЕ anchor. Примеры actual bottom-alpha samples:
x375->1058,400->1096,450->1130,500->1151,626->1170,750->1152,850->1098,875->1062.

Первые условия стыковки: поставить один экземпляр на actual wood ID по config и
точной projection; initial uniform scale=projected horizontal r/255, проверить
опору/нижний ellipse и высоту. При несовпадении исправляется master/нормализация,
не config и не регистрация. Фактическая высота выше черновой иллюстрации, поэтому
не размножаем без просмотра. Этот пакет не заявляет готовые occlusions или QA PASS.
