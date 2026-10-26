# P1 board 03 — PixiJS viewer shell

Узкий viewer для checkpoint `03-sun-temple.jpg`. Он не содержит собственной
геометрии или физики: единственный `Board03Bundle` должен быть установлен
интеграционным bridge после фиксации Researcher projection v1 и Simulation
Builder config/adapter.

Сейчас готовы независимые переключатели «Арт»/«Геометрия», выбор вида,
диагностические `+1/+10` ticks, seed reset, точные seed/tick/rng indicators и
защита от изменения simulation snapshot визуальными переключателями.

Flat art rectification и raster ball/shadow намеренно не подменены временной
реализацией: они подключаются только после точных projection и asset inputs.
Публичная сборка и доски 01/02/04 вне границы.

