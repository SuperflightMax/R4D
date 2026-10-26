# P1 board 01 — simulation slice

Это независимый Simulation slice только для `01-jungle.jpg`. Единственный
физический config — `runtime/board-01-config.v1.json`; Viewer обязан строить
геометрию из него.

Config детерминированно адаптирует frozen Research mapping
`92df55715867916669bc370a8040d6bf7d3e1eb7` без новой разметки:

- 25 `circle` → 25 штатных Millionko `pin` с теми же id, центрами и радиусами;
- 5 near bounds → 5 `segment` с теми же концами;
- far/left/right bounds → встроенные `wall_top/wall_left/wall_right`;
- 4 `bucketCircle` → 4 `bucket` с теми же центрами и `radius=26`;
- start `(500,60)` и направление `+y` → один drop с `angleDeg=90`.

Simulation domain `1000×1180` включает playable `y=0..1000` и receiver apron
`y=1000..1180`. Встроенные left/right walls используют `board.height` и
продолжаются через apron. Общие принятые параметры сохранены: ball `r=18`,
tick `8 ms`, `lcg32`, ненулевые angle/bounce deviations и те же physics,
что в принятом board-03 slice.

## Проверка

```text
pnpm install --frozen-lockfile
pnpm mapping:check
pnpm config:build
pnpm typecheck
pnpm check
```

`pnpm trace:update` перезаписывает traces только при намеренном изменении
mapping/config/core. Seed `1` и `2` — первые обычные seed без reroll или
success filtering; их фактические terminal outcomes фиксируются независимо от
попадания. Приватные исходники Millionko и source maps сюда не копируются.
