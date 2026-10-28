# P5 — собственный Pixi/native consumer

Это ранняя сборка совместимости. Схема Artist уже опубликована; полный generated набор, читаемые тени, реальные parts/occlusion и независимая проверка ещё впереди. Ранний raw floor не является final Artist manifest.

Исполнять из назначенного checkout `E:/R4D/perspective/p5-worktrees/builder`. Все команды ниже используют `experiments/p5-regenerated-objects/builder/` как prefix скриптов. Runtime — только `E:/R4D/perspective/p5-runtime/builder`; исходники Millionko/materials/common deps read-only, глобальные env/settings не меняются.

1. `node experiments/p5-regenerated-objects/builder/scripts/prepare-inputs.mjs` — сверяет четыре exact P1 файла и Jungle, получает targets.
2. `node experiments/p5-regenerated-objects/builder/scripts/verify-assets.mjs --example` — проверяет форму примера, без выдуманных файлов.
3. Перед тяжёлым шагом `& './experiments/p5-regenerated-objects/builder/scripts/resource-guard.ps1' -Tag <unique-name>` в PowerShell. Если guard бросил ошибку, тяжёлый шаг не выполнять.
4. `node experiments/p5-regenerated-objects/builder/scripts/prepare-native.mjs` — exact native Git bytes только в private runtime.
5. `node experiments/p5-regenerated-objects/builder/scripts/build.mjs` — ранний floor adapter. При адресном handoff Artist: добавить `--manifest <exact-manifest-path>`; SHA/bytes/alpha/dimensions проверяются до staging.
6. `node experiments/p5-regenerated-objects/builder/scripts/pin-dependencies.mjs` — actual build input hash inventory в private runtime, dependency/lock pins и third-party licenses. Это не fake npm lockfile: сборка использует read-only common dependencies exact установленных версий. Перед следующей сборкой сверить согласованные pins; несовпадение требует явной дельты.
7. Проверить, что выбранный порт свободен. `node experiments/p5-regenerated-objects/builder/scripts/preview.mjs` — только own localhost 55185 и own site root; ownership записывается в runtime. Не останавливать чужие процессы. Для раннего immutable/QA handoff отдельно зафиксировать exact inventory и root; mutable dev preview не называть frozen.

Native state меняет только `src/controller.mjs`: штатные create/step/timeout API, r16/config/projection без правок. UI pause/step/seek/replay оперирует реальными тиками, seek повторно считает с тем же seed от нулевого состояния. «Новый бросок» берёт uint32 из browser crypto, не расходуя PRNG симуляции. Collision event tick t соответствует state t+1; lifecycle events сохраняют свой tick. Max 3200 и штатный timeout соответствуют exact native runUntilDone.

Арт и геометрия независимы. Контуры получены из actual config и exact P1 project; геометрия — отдельный верхний слой. Размеры PNG не определяют коллайдеры. Сфера/тени/parts будут потребляться из Artist manifest через опубликованный контракт, без скрытых offsets/масштабирования по траектории. Сортировка по объявленной глубине parts пока не подтверждена реальными generated частями и движением.

Build/site содержит compiled runtime без maps/raw TS. Это ещё не privacy approval и не release package. Полный esbuild metadata и исходники native остаются в private runtime. Release/server writes запрещены без нового CTO gate/token.
