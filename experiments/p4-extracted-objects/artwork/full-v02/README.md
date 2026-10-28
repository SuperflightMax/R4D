# Полный пакет P4: p4-full-v02

`manifest.json`, schema **r4d.p4.artwork.v1**, версия **p4-full-v02**.
Это полный художественный пакет для подключения и проверки в реальной сцене.
Финальный художественный или динамический QA PASS не заявлен.

## Состав и происхождение

- Background 1536×1536 с удалёнными 25 pins, их прежними тенями и четырьмя
  корзинами. Под извлечёнными частями переднего плана также есть восстановление.
- 25 исходных pin body и 25 отдельных ground-shadow: 50 частей.
- 4 receiver, у каждого rear (`body`) и front (`foreground`): 8 частей.
- 3 фиксированных `sceneParts`: левый/правый борта и передняя часть платформы.
- Собственный сгенерированный объёмный растровый ball и отдельная мягкая shadow.

Видимые RGB всех тел, корзин и foreground взяты из исходного JPG, без
генеративной замены. Alpha задаётся исходными контурами и локальным GrabCut;
исправление светлой крышки wood-07 дополнено контуром по исходному кропу.
Body flower-01/wood-01 и обе части receiver-01 побайтно совпадают со starter-v01.
Starter не перезаписывался. Новые тени — восстановленная оценка исходной
формы/opacity, согласованная с направлением света; это не точное разложение JPG.

Генератор использован только для локально скрытого пола/фона, ball и shadow.
Обязательный P4 не заменён новым набором препятствий. Hidden 3D backfaces не
изобретаются: камера и расстановка неизменны; восстановлены области, нужные
для разделения и движения в этой сцене. Все операции и raw SHA — в
`provenance.json` и [журнале](../RUN_RECORD.md).

## Существующий контракт loader

Поля source/P1, objects, sourceRectPx, anchorSourcePx/anchorLocalPx,
anchorNative/anchorResearch, parts, alpha/depth и SHA сохраняют смысл малого стыка.
Пути файлов — относительно manifest. sourceRect — `{x,y,width,height}`.
Все anchors взяты из exact принятого P1. Native = research + `[33256,34072]`.
Source placement = anchorSourcePx - anchorLocalPx; PNG размером sourceRect.
Прозрачный padding не влияет на положение.

PNG используют straight alpha. Один premultiply на загрузке в PixiJS;
не умножать RGB заранее второй раз. `restoration-regions.png` — provenance
локального восстановления, **не игровая маска перекрытия**.

Ground-shadow один раз под телами и шаром. Body сортируется по native Y
основания вместе с native Y шара. Receiver-back до шара; receiver-front после
шара при пересечении его source billboard с sourceRect соответствующей корзины.
Это прежний проверенный консервативный контракт; полного захода в четыре
receiver эта подготовка не доказывает. Общий config и r16 не изменять.

## Дополнение: sceneParts

Это массив тех же PNG-частей с sourceRect/anchor/alpha/SHA, но без objectId
коллайдера. `depth.layer = scene-front`. Эти фиксированные части рисуются
после depth-sorted body/ball и перед receiver-front. Source view — обычное
размещение по sourceRect. Native view — тот же source quad/mesh через P1 inverse.

Левый и правый слои содержат борта и исходную внешнюю декорацию, связанную
с ними; это широкие foreground-полосы за пределами игровой середины, а не
независимые перемещаемые snake-спрайты. Их alpha определяет видимость;
размер crop не является маской. Они не меняют коллайдеры или путь шара.
Верхняя архитектура и её фиксированные светотени остаются в подложке.

## Дополнение: ball

`ball.nativeRadius = 16` — тот же радиус общего config. `body` и `shadow`
содержат file/SHA/size/alpha, centerLocalPx и contentRadiusPx (граница alpha≥16).
Не масштабировать шар по полному холсту PNG: прозрачный padding не радиус.

Для native положения `(x,y)` и `H = p1.nativeToSource`:

```js
const P = project(H, { x, y });
const w = H[2][0] * x + H[2][1] * y + H[2][2];
const R = 16 / w; // горизонтальный радиус принятой P1-проекции
const bodyScale = R / ball.body.contentRadiusPx[0];
// pivot = ball.body.centerLocalPx; position = P; uniform scale = bodyScale
// shadow center = P + [-0.55*R, +0.60*R]
// shadow content half-size = [1.12*R, 0.42*R]
// shadow pivot = ball.shadow.centerLocalPx; alpha *= 0.42
```

Все коэффициенты также даны численно в `ball.render`, opacityMultiplier —
в `ball.shadow`. Изображение shadow сохраняет сгенерированную alpha; коэффициент
0.42 снижает её фактический пик с 216 до приблизительно 91/255.
В принятой drop-точке R=14,0742px; далее размер меняет только H/r16.
У body нет дополнительного сдвига центра.
Shadow — отдельный ground-слой один раз. Шар и тень перекрываются существующей
alpha объектов/foreground. Их эффекты не меняют sim state, шаги или PRNG.
Для native view сформировать source-space quad этими правилами и преобразовать
его вершины обратной матрицей P1, сохраняя тот же run/tick.

## Проверенное и оставшееся

Проверены source/P1 hashes, все 29 anchors, размеры/bytes/SHA PNG, наличие alpha,
исходные RGB вырезок, отсутствие изменения source RGB вне записанного
восстановления и сохранность starter. Фон, вырезки и статическая обратная сборка
просмотрены. Контур wood смягчён согласованием градиентов с исходным полом,
а не изменением тела или опорной точки. Сравнение — `preparation-evidence.png`.

`assembled-at-drop-preview.png` — **статический** арт в принятой drop-точке,
без придуманной траектории; это не доказательство Pixi/физики/QA.
`cutouts-preview.png` — контактный лист, не игровая сцена.

Нужна проверка полной реальной сцены: alpha-края/кайма в целевом масштабе,
читаемость теней и опора на пол, тонкие листья/перья/ободки, боковые контакты,
sceneParts и частичный вход/выход через все receiver. Opacity теней оценённая;
её художественное качество по наличию файлов не объявляется подтверждённым.
