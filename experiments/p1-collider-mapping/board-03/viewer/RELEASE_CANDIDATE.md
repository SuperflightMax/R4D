# Board 03 — локальный frozen release candidate

Статус: **локально подготовлен, не опубликован**. Scope ограничен board 03.

- Lead integration candidate: `c7f6f4f4cb743d63f3cf20759d26def223521b93`.
- Целевой route: `/review/r4d/p1-collider-mapping/`.
- Millionko sim-core: `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, detached checkout.
- Source image SHA-256: `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.
- Mapping canonical SHA-256: `fc4e467b8eeced91e08e2a62ed367693ac9317675a2f33a8ab76379ac47429be`.
- Mapping source-file SHA-256: `9ec384087ed2094830c48b695281dac76f69cd1a9b76d711bd8e3143eaf61e32`.
- Config SHA-256: `69ebafc086bea82513b9107ebf272d4f6b1d552cd080810eefe893616c454c6f`.
- Ball SHA-256: `05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087`.
- Shadow SHA-256: `fbd1fc9f8e637a73e6d10eee36c9bd25ae1441cd18b002fb52e1d34dbd5d15ef`.
- Output: 27 файлов, 1 202 119 байт; hashes в `release-manifest.sha256`.

## Воспроизведение

Из `board-03`:

```powershell
pnpm install --frozen-lockfile
node ..\research\check-board-03-mapping.mjs
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

