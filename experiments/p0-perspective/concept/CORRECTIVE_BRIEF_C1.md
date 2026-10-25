# P0 corrective brief c1 — поле и контрольное семейство

Это минимальная добавка к `asset-artist/d1/prompts/d1-prompt.txt`, а не новый художественный brief. Основание коррекции:

- diagnostic d1: `2db5dffdbcd0fecaee7ffa209ea3ebe8c775cd2f`;
- Visual QA: `fdc25db3e97dcd0c48d998b720cfb7c4ef4c8cec`;
- formal reference остаётся тем же: `formal-reference-v1.png`, SHA-256 `08ebe1bd5dd7e3a60097a15c1e29e60c46c4bcf27e4babda730fcffa269f723f`;
- художественный референс остаётся тем же read-only `03-sun-temple.jpg`, SHA-256 `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.

Не менять тему Jade Sky Observatory, материалы, тёплый свет слева-сверху, композиционную иерархию и уровень законченности d1. Не вводить новую камеру, новый control, кадрирование, растяжение или постобработку готового результата.

## Prompt delta c1

Добавить после блока `Camera and field geometry` исходного d1 prompt:

```text
CORRECTION C1 — KEEP THE SAME CAMERA AND ART DIRECTION

The previous diagnostic made the floor too long, opened it too strongly, raised the far floor/architecture seam, lowered the near floor/threshold seam, and weakened side-edge convergence. Correct only these geometric defects and the repeated drum family. Do not redesign the scene.

FIELD BOUNDARY LOCK — NON-NEGOTIABLE
- Use formal-reference-v1.png as the same and only geometry control.
- The playable floor is exactly the quadrilateral with normalized clockwise corners:
  far-left (0.225, 0.255), far-right (0.775, 0.255),
  near-right (0.915, 0.775), near-left (0.085, 0.775).
- The far floor/architecture seam stays on q=0.255. Do not move it upward.
- The near floor/foreground-threshold seam stays on q=0.775. Do not move it downward.
- Both visible side boundaries pass through their exact far and near corner pairs as straight guides. Preserve their stronger convergence from the formal reference; do not widen the far field or make the view more top-down/wide-angle.
- Architecture may overlap the boundary locally, but must not extend, replace, or imply a second playable floor beyond it.

CONTROL ROW LOCK
- Keep the four formal depth rows at normalized q positions 0.338, 0.453, 0.567, and 0.681 (approximately y=519, 695, 871, 1047 in a 1536 reference frame).
- Anchor each drum by the center of its visible base on its assigned row. Do not use the shadow, silhouette center, or top ellipse as the anchor.
- Keep the foreground threshold separate below q=0.775; it must not pull the nearest drum or playable floor lower.

ONE IDENTICAL DRUM MASTER — UNIFORM SCALE ONLY
- Use one single jade-and-bronze pedestal-drum construction duplicated four times at the four formal control depths.
- Lock the master design: identical width-to-height ratio, body profile, top-ellipse aspect ratio, rim thickness, base thickness, bevels, panel count, ornament placement, jade insets, and bronze bands.
- Between copies change ONLY uniform image scale and position. Do not make a nearer copy squatter, wider, taller, more open at the top, more detailed, or differently constructed.
- Apply the exact visible scales in far-to-near order: 0.939, 0.978, 1.018, 1.058. Width, height, top ellipse, rims, ornaments, and every construction detail scale together by the same factor.
- The nearest drum is only about 12.7% larger than the farthest (1.058 / 0.939), not dramatically larger. The four sizes must increase smoothly and monotonically.
- Keep all four complete and clearly readable, with visible bases and without occlusion that prevents comparison.

PRESERVE
- Preserve the finished jade/bronze/sandstone material quality, warm coherent upper-left light, contact shadows, calm floor, distant observatory, side framing, foreground mass, and polished stylized-game finish achieved in d1.
- Do not output the technical grid, row lines, coordinates, labels, markers, or primitive appearance from the formal reference.

Priority for c1:
exact field corners and seams > exact control rows and identical uniformly scaled drums > readable bases and coherent volumes > preservation of d1 art quality > small decoration.
```

## Проверка до передачи QA

До оценки художественных деталей проверить в сопоставимом квадратном кадре:

1. дальняя и ближняя границы совпадают с `q=0.255` и `q=0.775`, а четыре угла не заменены декоративным контуром;
2. четыре основания drums лежат на `q=0.338 / 0.453 / 0.567 / 0.681`;
3. drums отличаются только равномерным масштабом `0.939 / 0.978 / 1.018 / 1.058`, их пропорции и эллипсы не переизобретены;
4. художественная законченность d1 не сменилась blockout, сеткой или примитивами.

Если генератор снова системно меняет трапецию или конструкцию drum при том же усиленном control, не подбирать новую камеру и не растягивать raster. Сохранить результат как свидетельство и вернуть решение CTO о смене представления или метода.
