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
набора координат. Candidate-B ball масштабируется равномерно из физического
`ball.r=18`; нативные 64 px не используются как фиксированный экранный размер.
Тень — отдельный визуальный sprite без PRNG/physics. Публичная сборка и доски
01/02/04 вне границы.

Projection port реализует exact Researcher mapping
`071c52477c829cf6dac5ea8b1dec49f23d48d9ca`. Perspective-контуры окружностей
и сегментов строятся соответственно по 96 и 32 samples, а не заменяются
экранным кругом или прямой между концами.

Четыре прямоугольные Researcher goal-зоны представлены фактическими
вписанными `bucket`-кругами config. Viewer показывает только эти реальные
trigger contours и явно подписывает аппроксимацию в интерфейсе.

## Проверка checkpoint

Из каталога `viewer`:

```powershell
npm run check
npm run dev
```

`MILLIONKO_SOURCE_ROOT` можно задать явно; без него используется соседний
read-only checkout `millionko-source/sim-builder`. Gate требует detached HEAD
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, config SHA-256
`69ebafc086bea82513b9107ebf272d4f6b1d552cd080810eefe893616c454c6f`,
mapping SHA-256
`fc4e467b8eeced91e08e2a62ed367693ac9317675a2f33a8ab76379ac47429be`
и source image SHA-256
`f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.

Visual QA evidence:

- `output/playwright/board03-perspective-final.png`
- `output/playwright/board03-flat-final.png`

