# P3 Builder: локальная сборка

Собственный стенд PixiJS, неизменённый native sim-core и source-aligned
перекрытия цельной Jungle. ORDER/P3 определяют требования; этот файл — запуск.

1. `node prepare-inputs.mjs` извлекает exact P1 objects и сверяет SHA256.
2. `node import-artist.mjs <40-char Artist commit>` извлекает только
   referenced PNG и JSON контракта в собственный E runtime.
3. Commit source в свою ветку. После свежей проверки system-wide ресурсов
   задать **только process-local** TEMP/TMP на own runtime temp и
   `P3_ARTIST_ASSETS` на сохранённый exact Artist snapshot.
4. `node build.mjs E:\R4D\perspective\p3-runtime\builder\<fresh-name>`.
   Existing build не перезаписывается. Browser-facing modules — `.js`.
   Node-only инструменты — `.mjs`. Новые зависимости не устанавливаются:
   используются read-only Pixi 8.22.0 и rolldown принятого P1 viewer.
5. `node preview.mjs <absolute-build-dir> 0` выбирает свободный exclusive
   loopback port. Единственный route — `/review/r4d/p3-masks/`.

`file-manifest.json` содержит все файлы кроме самого manifest с SHA256;
`build.json` закрепляет source, Artist, native и P1 revisions. Private core
читается из exact Git objects, в bundle попадает только compiled minified JS.
TS, карты исходников, private filesystem paths и credentials не публикуются.

Новый бросок получает обычный crypto-random uint32 seed, меняет только
`rng.seed`. Весь запуск рассчитывается штатной native session на 5ms тиках,
включая штатный timeout; просмотр выбирает точные сохранённые состояния.
Импорт checkpoint пересчитывает run и проверяет config, версии и состояние;
патчить физическое состояние через import нельзя. Backend/POST отсутствуют.

Ball — uniform масштаб по локальному горизонтальному масштабу r16.
`liftRadius` (по умолчанию 0.65) — визуальная высота центра над floor point
в source pixel радиусах, не изменение mapping или физики. Shadow проецируется
как плоская отдельная текстура с фактическими metadata Artist; её глубина
учитывает её собственное смещение. Не повторно сжимать уже овальную shadow.

Source-aligned маски возвращают неизменённые source pixels после shadow и
после ball отдельно. Scalar/line depth — рабочие гипотезы, требующие просмотра
контактов/бокового перехода. Art-off убирает фон, ball/shadow и оба набора
overlays; диагностический ball и actual-config контуры находятся выше арта.

Завершённый native run сам по себе не доказывает художественное качество,
корректность всех масок или качество общего маппинга.
