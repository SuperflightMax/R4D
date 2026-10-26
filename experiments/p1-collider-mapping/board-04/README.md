# P1 board 04 — simulation slice

Это независимый Simulation slice только для `04-water-temple.jpg`. Единственный
физический config — `runtime/board-04-config.v1.json`; Viewer должен строить
геометрию из него.

Config механически адаптирует frozen Research commit
`9219aa8acf38a46e068580e186dfea1fa4011c3c` без новой разметки:

- 6 `circle` → 6 Millionko `pin` с теми же id, центрами и радиусами;
- 15 `axisAlignedSegmentLoop` → 60 штатных `segment`;
- 5 near bounds → ещё 5 `segment`;
- far/left/right bounds → встроенные `wall_top/wall_left/wall_right`;
- 4 `bucketCircle` → 4 `bucket` с теми же центрами и `radius=45`;
- start `(500,55)` и `+y` → один drop с `angleDeg=90`.

Simulation domain `1000×1250` включает единую непрерывную playable plane
`y=0..1000` и только receiver apron `y=1000..1250`. Water channels, green
islands, bridges, ramps и steps не создают дополнительных colliders или height
mechanics. Shoreline, elevation/bridge edges, depth и внешние каскады исключены;
скрытые основания не уточняются сверх frozen mapping.

Общие принятые параметры сохранены: ball `r=18`, tick `8 ms`, `lcg32`,
ненулевые angle/bounce deviations и те же physics, что у принятых slices.

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
