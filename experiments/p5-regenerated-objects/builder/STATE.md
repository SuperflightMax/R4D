# P5 Builder — состояние

2026-10-28 22:25 UTC. Stage 2 адресно открыт Lead после опубликованного P4. Contract: `5ae51fa0342689cb0ad4b5b5d5681ddc16b60e81:experiments/p5-regenerated-objects/coordination/STAGE2.md`.

Первый материальный результат: `contracts/ASSET_CONSUMER.md`, JSON schema/example, exact P1 inputs и вычисленная таблица `public/data/targets.json`. Пример проверен по структуре; это явно не реальные ассеты и не художественный результат. Четыре P1 файла побайтно сверены SHA256+bytes, исходный Jungle проверен read-only (671136 bytes). Exact native tree подтверждён; API Config/Sim/SimState прочитаны, запуск native ещё не заявляется.

Resource guard 22:19:39 UTC: total/free RAM 31.907/16.595 GiB, CPU 1%, aggregate process working set 19.015 GiB (сумма не равна unique physical use), 431 processes; C/D/E free 17.133/16.282/12.203 GiB. Первый schema шаг peak <0.1 GiB RAM/<0.01 GiB E. Следующая локальная сборка ожидается <=1 GiB RAM/0.3 GiB E, плюс allowance другим процессам 4 GiB RAM/2 GiB E; перед ней свежий guard.

Найденные обычные зависимости в read-only native node_modules: PixiJS 8.17.1, esbuild 0.25.12, TypeScript 5.9.3, playwright-core 1.60.0; Pillow 12.1.1. Установка не выполнялась. Их точные package pins будут записаны при сборке. Отсутствие корневого .gitignore — обычное отсутствие файла, не denial.

Lead передал ранний floor raw candidate Artist: runtime asset-artist/raw/floor-v1.png, SHA256 24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06, 3079122 bytes. Ещё не проверен Builder, не принят как final. Следующий шаг — проверить exact floor и материализовать private native из exact Git bytes в own runtime; собрать собственный Pixi consumer, не ожидая полного набора. Native state/RNG/физика/P1 не изменяются.

Server writes 0. Release gate закрыт. Другие чаты, worktree и модели не изменялись. P2–P4/P6 не читались. Ни independent QA PASS, ни готовая сцена не заявлены.
