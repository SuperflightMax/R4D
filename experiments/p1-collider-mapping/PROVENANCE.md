# Происхождение ассетов P1 board 03

## Инструменты и сборка

- Генерация: встроенный `image_gen`, прозрачный фон.
- Подготовка размеров: Pillow `12.1.1`, скрипт `scripts/build_ball_assets.py`.
- Входной JPG использован только как визуальный референс и фон производного preview; исходник не записывался.

Воспроизведение размеров и preview:

```powershell
python experiments/p1-collider-mapping/scripts/build_ball_assets.py --candidate b --reference 'K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg'
python experiments/p1-collider-mapping/scripts/build_ball_assets.py --candidate c --reference 'K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg'
```

## Исходники генерации

| Файл | SHA-256 |
| --- | --- |
| `assets/source/ball-candidate-a-generated.png` | `b5e0f7f0dddf347bb51ce7887c497e2f4b6f7d9def88ad2e1960f21484f99a70` |
| `assets/source/ball-candidate-b-generated.png` | `32de721b419c4bc8fe2c4fe14e9d2b6b3cfa6850471716646f302b742bca5699` |
| `assets/source/shadow-candidate-a-generated.png` | `4e8324d6bf0417350ea28630b2e74470715de724db750ac5c75e5978fa882f67` |
| `assets/source/shadow-candidate-c-generated.png` | `b8642b871edd4d13ca14086d227b9c79426ce3f1801f4364629925d6f9f699d4` |

## Контрольные суммы выбранного комплекта

| Файл | SHA-256 |
| --- | --- |
| `assets/candidate-b/ball-64.png` | `05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087` |
| `assets/candidate-b/ball-master-512.png` | `3c4f88c53e533832de085d98fe6f4454732fa0be0049edf80f101a235de26439` |
| `assets/candidate-c/shadow-r18-54x27.png` | `ee10607ce00c2a3d7e8644e941879748cdb841f671dda8399353929fce5ed213` |
| `assets/candidate-c/shadow-96x48.png` | `6defe0d041820280464c2d24fbfd77264470192b7410296e46f47eaf5476d6d9` |
| `assets/candidate-c/shadow-master-768x384.png` | `9fd25cc4a4bf280f7df8892ce8ebef16f980e3e3008628bd5554e5ad20ef75f1` |
| `previews/board03-r18-shadow-b-vs-c.png` | `e462d2b6d639b9dcdd0272c5565a2a757b604e9ffd82181fad1683b421c0af03` |

## Промпт шарика, candidate A

```text
Use case: stylized-concept
Asset type: transparent 2D game sprite master for the P1 ball on board 03
Input image: Image 1 is a style, palette, material, lighting, and viewpoint reference only; do not edit or reproduce the board.
Primary request: create one clearly spherical, volumetric raster game ball that naturally belongs in this sun-temple environment.
Subject: a compact polished sandstone-and-gold sphere with a restrained embossed sun medallion and tiny turquoise inlay accents; unmistakably a ball, readable at small game size, strong round silhouette.
Style/medium: polished stylized 3D game art matching the reference's warm red sandstone, honey-gold trim, turquoise details, soft painterly realism, and gently worn material edges.
Composition/framing: one isolated sphere centered in a square canvas, fully visible, generous transparent padding, camera/viewpoint compatible with the board's elevated three-quarter view.
Lighting/mood: warm light from upper right, convincing form shading and subtle highlight; shading belongs on the sphere itself.
Constraints: genuinely transparent background; ball only; NO cast shadow or ground contact shadow; no floor, no scene, no pedestal, no extra objects, no text, no watermark; clean anti-aliased edge; symmetrical circular silhouette; production-ready sprite master.
```

## Точечная правка шарика, candidate B

```text
Use case: precise-object-edit
Asset type: transparent 2D game sprite master for the moving P1 ball on board 03
Input image: Image 1 is the edit target.
Primary request: improve small-size gameplay readability while preserving this exact spherical ball concept and sun-temple material language.
Change only these features: replace the central gold dome with a clearly visible polished turquoise gemstone core in a thin gold bezel; simplify the surrounding gold sun rays to eight broader rays; slightly reduce fine cracks and tiny ornamental detail so the sprite remains readable at 64 px.
Preserve: the perfectly round silhouette, three-dimensional spherical curvature, warm sandstone/red/gold palette, upper-right lighting, worn stylized 3D finish, transparent padding, overall proportions, and all other design intent.
Constraints: genuinely transparent background; ball only; NO cast shadow or contact shadow; no floor, no scene, no pedestal, no extra objects, no text, no watermark; clean anti-aliased edge; production-ready sprite master.
```

## Промпт отдельной тени

```text
Use case: stylized-concept
Asset type: transparent 2D game sprite master for a separate ball shadow
Primary request: create exactly one simple, clearly visible soft cast-shadow element for a spherical game ball, designed to sit on a warm pale sandstone floor.
Subject: a dark warm-brown semi-transparent oval shadow, soft feathered edges, slightly denser near the upper-right origin and smoothly fading toward the lower-left; elongated and offset-looking to match parallel sunlight from upper right.
Composition/framing: isolated oval centered in a wide transparent canvas with generous padding; no ball and no ground.
Style/medium: clean production-ready raster alpha sprite, subtle natural softness, deliberately noticeable rather than faint.
Constraints: genuinely transparent background; shadow only; no object, no floor texture, no outline, no text, no watermark; preserve real semi-transparent alpha and smooth anti-aliased falloff; one continuous oval with no hard edge.
```

## Точечная правка тени, candidate C

```text
Use case: precise-object-edit
Asset type: transparent 2D game sprite master for the separate P1 ball shadow, candidate C
Input image: Image 1 is the edit target and establishes the down-left direction.
Primary request: make this shadow remain clearly visible when reduced to about 54 x 27 screen pixels under a ball with projected radius about 18 px.
Change only the shadow rendering: make it slightly more compact; use a warm dark-brown soft contact core near the upper-right origin and a broader feathered penumbra extending down-left; increase useful midtone contrast and opacity while remaining visibly semi-transparent; remove the pale/bright interior that disappears on the sandstone floor.
Preserve: one continuous oval footprint, the existing down-left direction under parallel upper-right light, smooth feathered edges, natural soft falloff, transparent canvas, and the absence of any object.
Constraints: genuinely transparent background; shadow only; no ball, no floor texture, no outline, no hard edge, no text, no watermark; no fully opaque black patch; production-ready raster alpha sprite.
```

При подготовке размеров прозрачная область обрезается по alpha-порогу 8, затем изображение вписывается в заданный холст фильтром Lanczos. Для исторической B alpha умножается на `1.15`. Для C alpha умножается на `1.08` и до масштабирования ограничивается значением `224`; это сохраняет мягкость и полупрозрачность, но повышает полезный контраст при `54×27`.
