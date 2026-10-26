# P1 board 03 — PixiJS viewer shell

Узкий viewer для checkpoint `03-sun-temple.jpg`. Он не содержит собственной
геометрии или физики: единственный `Board03Bundle` должен быть установлен
интеграционным bridge после фиксации Researcher projection v1 и Simulation
Builder config/adapter.

Сейчас готовы независимые переключатели «Арт»/«Геометрия», выбор вида,
диагностические `+1/+10` ticks, seed reset, точные seed/tick/rng indicators и
защита от изменения simulation snapshot визуальными переключателями.

Flat art rectification уже строится из переданных `flatToSim` и `simToImage`
без собственного набора координат. Raster ball/shadow намеренно не подменены
временной графикой: они подключаются только после точного asset input.
Публичная сборка и доски 01/02/04 вне границы.

Projection port реализует exact Researcher mapping
`071c52477c829cf6dac5ea8b1dec49f23d48d9ca`. Perspective-контуры окружностей
и сегментов строятся соответственно по 96 и 32 samples, а не заменяются
экранным кругом или прямой между концами.

