# p4-full-v03 — только параметры тени шара

Schema `r4d.p4.artwork.v1`. Это исправление VQA-01 для новой named версии,
подготовленное после проверки current02. Финальный Art PASS не заявлен.
Старые full-v02 и candidate02 не изменялись.

## Диагноз

Просмотрены реальные VQA кадры 30 и31, особенно целая доска574×574 при
viewport1280×720, seed1842222754/t590, zoom1/followBallfalse.
Frozen art manifest и shadow PNG совпали с Artist full-v02 по SHA.
В exact consumer source b2db9e947ebf2213e725a66f1e778f9137b14d5f
не обнаружено расхождения с переданными content radii/pivot/scale/offset/alpha.
Builder через Lead отдельно подтвердил live current02: один shadow sprite,
alpha0.42, half-height2.29CSSpx, правильные scale/offset, без повторного opacity
или premultiply. Это полученное подтверждение, не мой живой браузерный осмотр.

Старый центр тени находится на расстоянии0.814R от центра сферы, внутри её
силуэта. После покрытия body в статической реконструкции остаётся около34%
суммарной alpha тени: в обычном масштабе пятно почти сливается с краем шара.
Коррекция относится к художественным display params; PNG достаточен.

## Точные изменения для Builder

| Поле manifest | full-v02 | full-v03 |
|---|---|---|
| `ball.render.shadowSourceCenterOffsetR` | `[-0.55,0.60]` | `[-0.95,0.86]` |
| `ball.render.shadowSourceContentHalfSizeR` | `[1.12,0.42]` | `[1.55,0.58]` |
| `ball.shadow.opacityMultiplier` | `0.42` | `0.65` |

Соответствующие текстовые формулы в `ball.placement` синхронизированы.
Изменений loader/schema не требуется: существующий ballPlacement уже читает
эти поля. `R` по-прежнему вычисляется из общего r16 и P1. Body pivot/scale,
bodyCenter, native position, P1 matrices/anchors, config/core/PRNG не меняются.
Тень по-прежнему отдельная, одна, ground layer под телами; мягкость сохранена
исходной alpha и расширяется масштабированием пятна. Свет — сверху справа,
смещение тени вниз-влево, как у препятствий. Новая генерация не выполнялась.

Все65 PNG-компонентов (64 runtime textures и provenance mask) побайтно
совпадают с full-v02, включая ball-body и ball-shadow. Остальные body,
25 object shadows, floor, baskets и foreground не перерабатывались.
Весь остальной [контракт full-v02](../full-v02/README.md) сохраняется.

## Evidence и предел доказанного

`shadow-before-after-normal574.png` — две полные доски574² на одном и том же
сохранённом положении t590. Это самостоятельная **статическая реконструкция**
Artist из точных PNG, не live Pixi кадр. `shadow-before-after-detail.png` —
только дополнительный увеличенный фрагмент; решение принималось по полной
доске. `proposal.json` сохраняет точное состояние, SHA реального исходного
VQA кадра, коэффициенты, атрибуцию Builder и вспомогательные alpha metrics.

На статике новое мягкое пятно отделяется от края шара. Вспомогательная оценка
непокрытой alpha выросла с34% до78%; это объяснение эффекта, не критерий PASS.
Проверить именно новую версию в consumer на том же seed/tick и обычном
574px масштабе, затем передать независимой VQA. Новый live proof ещё отсутствует.

Ограничения receiver01/03, partial front-rim при capture и отсутствия отдельной
фазы погружения после native end сохраняются. Новых seed, height physics,
коррекции ball size/anchors/colliders нет. Consumer/native source в пакет
не включён. Правка кадрового цикла остаётся участком Builder.
