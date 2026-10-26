# P1 collider mapping — PixiJS viewer

Viewer объединяет `03-sun-temple.jpg`, `01-jungle.jpg` и
`02-dark-temple.jpg`. Он не содержит собственной геометрии или
физики: каждый board bundle читает точный Simulation Builder config,
подключает version-pinned настоящий `@millionko/sim-core` через adapter и
строит overlay только из config primitives.

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
Переключение доски сбрасывает выбранную доску к началу с текущим seed.
Perspective/flat и Art/Geometry внутри доски не меняют tick/RNG. Board 04
и публикация пока вне этой ревизии.

Board 03 projection port реализует exact Researcher mapping v0.2
`83e3b0e63ecc3fb7878719c30f59a3b4306fc467`. Perspective-контуры окружностей
и сегментов строятся соответственно по 96 и 32 samples, а не заменяются
экранным кругом или прямой между концами.

Viewer показывает только реальные config primitives: 7 pins, 61 explicit
segments, три implicit walls до `y=1150` и четыре bucket circles `r=48`.
Goals перенесены из v0.2 напрямую, без прежней rectangular approximation.

Board 01 использует exact Research homography v0.1 и flat domain `1000×1180`:
playable plane `y=0…1000`, receiver apron `y=1000…1180`. Overlay содержит
25 pins, пять explicit near segments, три implicit walls и четыре bucket
circles `r=26`. Canonical mapping SHA-256:
`9a248421ad8453d839940bccf7e9838e9091ffa83ab40e1b50998f57e7041d5c`;
config SHA-256:
`7d652dc28e30bfc42f7d862fc6cb4bfc2489b4e88593c655d31baca4f85de057`;
traces SHA-256:
`d1def71c96b6733a5f60b262ef1a27419d67619f6e5f26e6a1d02e9843622d68`.
Seed 1 честно заканчивается `LOST` на tick 395, seed 2 — `LOST` на tick 561.
Когда физический шар целиком вышел за mapped domain, он не дорисовывается
экстраполяцией; terminal diagnostics остаются видимыми.

Board 02 использует отдельную exact Research homography v0.1 и flat domain
`1000×1150`. Config-only overlay содержит 12 circle pins, 48 obstacle
segments, пять explicit near segments, три implicit walls и четыре goals
`r=34`. Canonical mapping SHA-256:
`4f5862f5c2a602fccdc4d4419f7b5e6e4049fb807038d386ee3950d9cad24a12`;
config SHA-256:
`aea8c0d299b71facbed00d7774da6e31211a7cfb6c119604637a4caa65e4dd48`;
traces SHA-256:
`d6aee07a7104ea8d1e48ed63859d0511005e69d239aa10a49001b4bfca4dd236`.
Seed 1 приходит в `goal-04` на tick 674, seed 2 — в `goal-02` на tick 476.

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

Board 01 integration evidence хранится отдельно в
`output/playwright/board-01/`: `perspective.png`, `flat.png`, `art-only.png`,
`geometry-only.png`, `collision-tick061.png`,
`seed1-terminal-lost-tick395.png`, `seed2-terminal-lost-tick561.png`.

Board 02 integration evidence хранится в `output/playwright/board-02/`:
perspective/flat, art-only/geometry-only, `collision-tick047.png`,
`seed1-terminal-goal04-tick674.png` и `seed2-terminal-goal02-tick476.png`.

`npm run candidate:manifest` создаёт
`scale-candidate-manifest.sha256`. Это непубликуемый scale-candidate manifest,
а не финальный release manifest.

