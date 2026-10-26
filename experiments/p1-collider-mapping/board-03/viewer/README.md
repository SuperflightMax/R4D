# P1 board 03 — PixiJS viewer shell

Узкий viewer для checkpoint `03-sun-temple.jpg`. Он не содержит собственной
геометрии или физики: `Board03Bundle` читает точный Simulation Builder config,
подключает version-pinned настоящий `@millionko/sim-core` через adapter и
строит overlay из `pins`, `segments`, `buckets` и трёх встроенных стенок.

Готовы независимые переключатели «Арт»/«Геометрия», perspective/flat view,
фиксированный real-time tick, pause, `+1/+10` ticks, seed 1/2/reset, точные
seed/tick/rng indicators и защита полного simulation snapshot от визуальных
переключателей.

Flat art rectification строится из `flatToSim` и `simToImage` без собственного
набора координат и включает весь домен `1000×1150`: playable plane
`y=0…1000` и отдельно объявленный foreground receiver apron `y=1000…1150`.
Candidate-B ball масштабируется равномерно из физического `ball.r=18`;
нативные 64 px не используются как фиксированный экранный размер. Выбранная
manifest тень candidate-C — отдельный визуальный sprite без PRNG/physics.
Публичная сборка и доски 01/02/04 вне границы.

Projection port реализует exact Researcher mapping v0.2
`83e3b0e63ecc3fb7878719c30f59a3b4306fc467`. Perspective-контуры окружностей
и сегментов строятся соответственно по 96 и 32 samples, а не заменяются
экранным кругом или прямой между концами.

Viewer показывает только реальные config primitives: 7 pins, 61 explicit
segments, три implicit walls до `y=1150` и четыре bucket circles `r=48`.
Goals перенесены из v0.2 напрямую, без прежней rectangular approximation.

## Проверка checkpoint

Из каталога `viewer`:

```powershell
npm run check
npm run dev
```

`MILLIONKO_SOURCE_ROOT` можно задать явно; без него используется соседний
read-only checkout `millionko-source/sim-builder`. Gate требует detached HEAD
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, config SHA-256
`4c708fab600a7224bd43782b0e48540db1ea19ad1a399fb175cb840dc438e4b6`,
mapping SHA-256
`070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf`
и source image SHA-256
`f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.

V0.2 Visual QA evidence:

- `output/playwright/v02-perspective.png`
- `output/playwright/v02-flat.png`
- `output/playwright/v02-art-only-tick360.png`
- `output/playwright/v02-collision-tick081.png`
- `output/playwright/v02-collision-tick082.png`
- `output/playwright/v02-collision-tick083.png`
- `output/playwright/v02-seed1-terminal-tick935-goal02.png`
- `output/playwright/v02-seed2-terminal-tick1023-goal01.png`

