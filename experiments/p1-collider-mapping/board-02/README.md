# P1 board 02 — simulation slice

Это независимый Simulation slice только для `02-dark-temple.jpg`. Единственный
физический config — `runtime/board-02-config.v1.json`; Viewer должен строить
геометрию из него.

Config механически адаптирует frozen Research commit
`bbf4b70d67f32a45118630d49c53c2fc48ec0971` без новой разметки:

- 12 `circle` → 12 Millionko `pin` с теми же id, центрами и радиусами;
- 12 `axisAlignedSegmentLoop` → 48 штатных `segment`;
- 5 near bounds → ещё 5 `segment`;
- far/left/right bounds → встроенные `wall_top/wall_left/wall_right`;
- 4 `bucketCircle` → 4 `bucket` с теми же центрами и `radius=34`;
- start `(500,60)` и `+y` → один drop с `angleDeg=90`.

Simulation domain `1000×1150` включает playable `y=0..1000` и receiver apron
`y=1000..1150`. Общие принятые параметры сохранены: ball `r=18`, tick `8 ms`,
`lcg32`, ненулевые angle/bounce deviations и те же physics, что у принятых
Simulation slices.

## Проверка

```text
pnpm install --frozen-lockfile
pnpm mapping:check
pnpm config:build
pnpm typecheck
pnpm check
```

Seed `1` и `2` запускаются без reroll или success filtering; фактический
terminal outcome фиксируется даже при `LOST`. Приватные исходники Millionko и
source maps сюда не копируются.
