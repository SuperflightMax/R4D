# PUBLIC visual delta P2 candidate 05

28 октября 2026, Europe/Kyiv. Visual QA `visual-qa-r4d-p2-free-01`. Actual turn `01a183f6-2614-7232-a67e-82872b353316`, начало `2026-10-28T19:21:49Z`, после TQA surface release `19:18:01.434Z`. Итог: **BLACK_200_NOT_REPRODUCED_IN_THIS_RUN / VISUAL_LIMITATIONS_REMAIN**. В одном actual PUBLIC проходе сцена видна на paused ticks 94/95/96 при 200% и после возврата fit. Это ограниченное отрицательное воспроизведение прежнего симптома, не доказательство исправления на всех устройствах и не Full Technical/Art/P2 PASS.

## Identity и первый фактический шаг

Target: `https://superflight.space/review/r4d/p2-free-approach/?seed=1&paused=1`. После проверки actual turn и preflight получены свежие IAB handles/capabilities browser 2; создана собственная временная tab 4. Первый PUBLIC переход открыл Jungle без login redirect; loading сменился сценой, `Объёмный шар · накладки: 4`, seed 1 / tick 0. Prior visibility фактически прочитана как `false`.

В обычном DOM source ref не показан. Обычная HTTPS-навигация на штатный `https://superflight.space/review/r4d/p2-free-approach/metadata.json` дала фактические `candidate: p2-jungle-static-candidate-05`, `sourceCommit: 0367d46211ed170c8840cf702b5ea1cc05f6e430`, `assetPacket: jungle-art-v2`, Pixi 8.22.0 и ограничение четырёх occluders. Документ сохранён как `PUBLIC_PROVENANCE.json`; затем выполнен обычный возврат к сцене. Это самостоятельное наблюдение provenance, без повторной network/static/hash/oracle suite.

По адресному handoff целевая поставка: build/source `0367d46211ed170c8840cf702b5ea1cc05f6e430`, 16 files / 2 453 059 bytes, tree SHA256 `19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec`, manifest `aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b`, main 16 809 bytes / `9e71e579cbf9a0e20a51eb2109801d94bfdb1714876718f2727fa4d55d53e87b`. Эти delivery receipts приведены для атрибуции; их полная byte-проверка VQA не повторялась.

## Один ограниченный проход

Только seed 1, Art включён, Geometry выключен, default 0,25×. Desktop viewport 1280×720, DPR 1. Через видимые UI controls выполнен +100 tick, выбран 200%, затем «Тик / Показать» 94, 95, 96. Все три raw JPG показывают Jungle, а не прежний полностью чёрный canvas; DOM tick до/после каждого capture совпадает. На 200% поле увеличено и обрезано scroll-контейнером; полный нижний участок доски в этот кадр не помещается.

Выбор «По размеру» вернул целую доску на том же paused tick 96 без дополнительного шага. Краткое обычное воспроизведение продолжило seed 1 до paused tick 120: running screenshot обрамлён DOM ticks 111/116, поэтому ему не приписывается один точный tick. Затем один UI +100 дал stable tick 220. Это короткая выборка движения, не приёмка его непрерывности, темпа или всей траектории.

UI фиксирует `leaf-01`: event tick 94, observedAtTick 95; контактов 0 на 94 и 1 на 95/96. Уверенно различить тонкую границу шара и частичное скрытие у листа по этим кадрам не удалось. Событие UI не подменяет визуальную приёмку контакта. На fit tick 220 золотистый шар различим над верхним центральным листом; отдельная тень шара и grounding остаются недостаточно различимыми для художественного вывода. Тени оснований препятствий видны, но это не доказательство качества тени шара.

Выполнен ровно один дополнительный narrow sample 390×844 на paused tick 220. Canvas CSS 341×650; доска уменьшена, присутствуют вертикальные поля и внутренние scrollbars stage. В этой точке documentWidth = scrollWidth = 375: общего горизонтального page overflow не наблюдалось. Это desktop viewport emulation; physical Android и жесты не проверялись. Шар/тень слишком малы для тонкой оценки в этом масштабе.

Завершение запуска и rewind не выполнялись ради проверки прежней подписи save-status. Других seeds, скоростей, replay/lifecycle, полного contact/occlusion набора, native view, входа в корзину и диагностики GPU/backend/renderer/device не было. Четыре occluders и отсутствие накладок остальных препятствий/ограды/бортиков остаются явным пределом продукта. Случай Макса перед глазами жаб здесь не объявляется воспроизведённым.

## API audit

Actual call `call_b4d57396065446adb8e2d26c7541e9e9`, read-only DOM evaluate для поиска metadata URL через `performance.getEntriesByType('resource')`, вернул первичную причину: `TypeError: Cannot read properties of undefined (reading 'getEntriesByType')`.

Классификация: обычная ошибка API scope/binding — `performance` оказался undefined в read-only DOM scope. Первичный результат не содержит explicit policy-denial; из него не выводятся product defect, policy или race. Failed lookup не повторялся. Для provenance использована обычная навигация к известному публичному metadata-документу. Runtime injection, CDP/скрытые mutators, другие renderer/actor и обходы исторических file-denial не применялись. После surface release браузер не использовался; сохранение JSON выполнялось из уже собранных буферов.

## Evidence, gate и освобождение поверхности

Worktree `E:\R4D\perspective\p2-worktrees\visual-qa`, branch `codex/r4d-p2-free-visual-qa-01`, входной clean HEAD `1ff628005fbe82ec087d30d5c62dde61265e9c7d`. Актуальная computer-use skill прочитана. Preflight: RAM 31.907 GiB / свободно 16.766 GiB, CPU 2%, C/D/E свободно 15.084 / 16.289 / 16.231 GiB. Собственный allowance 1 GiB RAM + 50 MiB evidence; concurrent allowance 4 GiB RAM + 2 GiB disk укладывается в sample. Каталог output перед созданием отсутствовал. Это system-wide preflight, не измерение пиков потребления браузера.

Evidence root: `E:\R4D\perspective\p2-runtime\output\visual-qa\candidate-05-public-01`. Сохранены 9 raw JPG, 1 171 904 bytes; весь пакет с JSON/index — 1 212 898 bytes. Все имена, размеры и SHA256 перечислены в `EVIDENCE_HASHES.json` (2 017 bytes, SHA256 `a15f1490acda990393de6bb55234b28679da366257c341e05eee3f1b22fadf25`). Старые evidence не менялись.

| Файл | Bytes | SHA256 |
| --- | ---: | --- |
| `PUBLIC_PROVENANCE.json` | 864 | `121e1770c8a139e5fff479209218f0e276c375da8b9b5be41047913ec713041a` |
| `PUBLIC_VISUAL_OBSERVATIONS.json` | 38 113 | `12e590520c95f9238945b970f78c96ba9bb018c7bc607fff4769a04003374ad3` |
| `desktop-zoom200-tick94.jpg` | 164 671 | `f6863692e05607755cd3a04978e1e777fdf01adb4cfb7b18b1b0f64a2ba87151` |
| `desktop-zoom200-tick95.jpg` | 164 546 | `13ade7c67b69fb30de265d17aa88de2d91c544ab207007bf4a498f0f347d4a99` |
| `desktop-zoom200-tick96.jpg` | 165 741 | `79eebb7232ce4139a9be0e92129b03d82445f0cd202db54d67c4fcfe09e3fd52` |
| `desktop-fit-return-tick96.jpg` | 123 918 | `d97e3f5951b9c0358729fdc4d1ccd37d656db0e94e876e124a71e8d5b225fbf6` |

**surfaceReleased: `2026-10-28T19:31:30.659Z`.** Перед закрытием фактически подтверждены pause (`Продолжить`), seed 1 / tick 220; viewport reset 1280×720; prior visibility false восстановлена и повторно прочитана false. Закрыта только собственная tab 4. CTO Review window и Builder owned lock VQA не освобождал. Продукт, source/frozen/art/config/core/mapping/physics, сервер, чужие вкладки/процессы не менялись. Серьёзность и дальнейшее решение оставлены Lead/CTO; автоматического product blocker или полного PASS нет.
