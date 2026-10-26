# P1 board 03 — simulation vertical slice

Этот каталог содержит только checkpoint третьей доски. Физическая истина —
`runtime/board-03-config.v1.json`; Viewer обязан строить геометрию из него, а не
из отдельной разметки.

Config детерминированно собран из Researcher mapping commit
`071c52477c829cf6dac5ea8b1dec49f23d48d9ca`. Семь круглых оснований стали
pins, четырнадцать прямоугольных оснований развёрнуты в 56 штатных segments,
пять ближних границ добавлены как segments, а дальняя/левая/правая границы
сопоставлены встроенным стенкам ядра. Четыре прямоугольные goal-зоны сведены к
вписанным trigger-кругам `bucket`; видимая и объявленная прямоугольная форма не
скрывается и этот консервативный компромисс явно записан в
`runtime/board-03-config.manifest.json`. Итого config содержит ровно 56
obstacle segments + 5 явных ближних boundary segments = 61 segment.

`runtime/sim-adapter.ts` принимает публичный API настоящего
`@millionko/sim-core`, создаёт запуск с заданным seed и продвигает ту же session
на фиксированное число тиков. Adapter не реализует физику, PRNG или коррекцию
траектории.

## Локальная проверка

По умолчанию проверка ожидает выданный read-only Millionko checkout рядом с
R4D worktree. Другой разрешённый checkout можно указать через
`MILLIONKO_SOURCE_ROOT`; его HEAD всё равно должен быть detached exact commit
`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`.

```text
pnpm install --frozen-lockfile
pnpm config:build
pnpm typecheck
pnpm check
```

До интеграции Researcher commit путь к mapping можно передать через
`BOARD_03_MAPPING_PATH`. После интеграции команда `config:build` ожидает его в
`experiments/p1-collider-mapping/research/`.

`pnpm trace:update` используется только при намеренном изменении config и
перезаписывает зафиксированные headless traces. Приватные исходники Millionko и
source maps в этот каталог не копируются.

Headless gate не требует, чтобы выбранные обычные seed завершились попаданием:
он подтверждает точный replay, различие соседних seed, реальные столкновения и
сохраняет фактический терминальный исход без reroll или фильтрации. Если seed
попал в bucket, это остаётся наблюдением в trace, а не условием PASS.
