# Board 03 — локальный frozen release candidate

Статус: **локально подготовлен, не опубликован**. Scope ограничен board 03.

- Release packaging glue: `72bb6ffa88e1b10d9c15df375ffe29a614b0f41a`.
- Research mapping v0.2: `83e3b0e63ecc3fb7878719c30f59a3b4306fc467`.
- Simulation config v0.2: `274ac8a701046f8241df280d802159928a36e736`.
- Asset shadow-C: `81ab4031e0e631a930f7763b08917630a10a3ae9`.
- Целевой route: `/review/r4d/p1-collider-mapping/`.
- Millionko sim-core: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, detached checkout.
- Source image SHA-256: `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.
- Mapping canonical SHA-256: `070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf`.
- Config SHA-256: `4c708fab600a7224bd43782b0e48540db1ea19ad1a399fb175cb840dc438e4b6`.
- Ball SHA-256: `05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087`.
- Shadow-C SHA-256: `ee10607ce00c2a3d7e8644e941879748cdb841f671dda8399353929fce5ed213`.
- Output: 27 файлов, 1 200 688 байт; hashes в `release-manifest.sha256`.

## Воспроизведение

Из `board-03`:

```powershell
pnpm install --frozen-lockfile
node ..\research\check-board-03-mapping-v0.2.mjs
pnpm config:build
pnpm typecheck
pnpm check
```

Из `board-03/viewer`:

```powershell
npm ci
npm run check
```

Готовое дерево находится в `dist/`; его содержимое предназначено для корня
целевого route. Публикация этим документом не разрешена.

## Граница публичного дерева

В `dist/` отсутствуют TypeScript-файлы, source maps, приватное дерево исходников
Millionko, абсолютные локальные пути, credentials и временные browser artifacts.
Настоящий sim-core присутствует только как production bundle без исходников и
source maps. Research JSON и локальные входные пути не входят в release tree.

