# Малый стык P4: предлагаемый контракт v1

Это рабочий контракт consumer, ещё не подтверждённый реальными PNG Artist.
Владелец artwork/manifest/provenance — Artist; Builder их не редактирует.
Передача: exact commit и путь manifest внутри этого commit. Сборщик извлекает
только перечисленные bytes из Git, проверяет SHA256, не читает чужой checkout.

Manifest UTF-8 JSON, `schema: "r4d.p4.art.v1"`, `version`, `sourceSizePx: [1536,1536]`,
`sourceSha256`, `background: {file,sha256}`, `objects: [...]`.
Пути файлов относительны каталогу manifest. Background — RGBA/RGB PNG 1536²,
на нём удалены переданные объекты и их прежние тени. Остальные объекты пока
могут оставаться: эта версия прямо объявляется частичным комплектом.

Объект: `objectId` из P1, `anchorSourcePx: [x,y]`,
`anchorNative: [x,y]`, `parts: [...]`.
`anchorNative` сверяется с P1 sourceToNative(anchorSourcePx). Это native,
не research. Разница anchor с центром collider описывается, геометрия не меняется.

Часть: `id`, `file`, `sha256`, `sourceRectPx: [x,y,width,height]`,
`anchorLocalPx: [x,y]`, `role: "ground-shadow" | "body" | "foreground"`,
`depth: {mode: "native-y" | "always-front", nativeY: number, order: number}`,
`provenance: {kind: "extracted" | "restored" | "generated", note: string}`.
NativeY нужен для native-y; order разрешает равные глубины. PNG — straight RGBA,
без цветного matte; alphaMode: "straight" на manifest. Consumer использует
обычную загрузку Pixi, без ручного повторного premultiply.

Размещение всегда `anchorSourcePx - anchorLocalPx`. Оно обязано совпадать с
sourceRectPx origin. Padding входит в rect и local anchor, положение не меняется.
Shadow рисуется на полу до тел. Body и ball сортируются по native Y;
foreground может иметь отдельный depth или always-front. Для receiver нужен
реальный задний/передний разрез, если единый спрайт не даёт верного перекрытия.

Необязательные `ball` и `shadow`: `{file,sha256,anchorNormalized:[x,y],
visibleDiameterPx:number}`; у shadow также `widthDiameters`, `heightDiameters`,
`offsetNativeR:[x,y]`, `opacity`. Они свои для P4. Consumer выводит ball по
P1 registration и r16, shadow — отдельной частью на поверхности. Диагностический
круг без PNG остаётся только в слое Geometry и не считается художественным ball.

Первый стык: flower-01 + wood-01 + receiver-01, очищенный фон, реальные
RGBA/shadows и declared depth. Нужно получить exact commit/path, проверить
padding/alpha/anchors и кадры до/после перекрытия. До этого контракт — proposal.
