# P0 L1 — browser/visual self-check

Проверенная версия: первый и единственный render из frozen
[`layout-v1.json`](layout-v1.json). После просмотра horizontal `p`, instanceIds,
anchors, scales и source normalization не менялись.

## Browser check

Локальный статический просмотр:

```powershell
node scripts/serve.mjs --root l1/output --port 4176
```

Через Playwright CLI открыт
`http://127.0.0.1:4176/review-l1.html`, сделаны snapshot, viewport screenshot и
отдельный screenshot finished-board image.

- `review-l1.html` — HTTP `200`;
- `composite-l1.png` — HTTP `200`;
- console — `0 errors`, `0 warnings`;
- снимки сохранены локально в игнорируемом
  `output/playwright/l1-self-check/.playwright-cli/` и не входят в release.

## Наблюдение finished-board cohesion

- PASS: environment, drums и shadows читаются как один законченный тёплый
  sandstone/bronze/jade мир с общим направлением света слева-сверху.
- PASS: четыре drum имеют одну конструкцию и детализацию; видимый рост по
  глубине слабый и последовательный, без независимой подгонки экземпляров.
- PASS: все основания однозначно стоят на непрерывной плоскости; контактные
  тени не содержат прямоугольных патчей или швов.
- PASS: frozen zig-zag layout оставляет спокойные просветы пола, не перекрывает
  дальний ориентир, side frame или foreground architecture.
- PASS: в чистом composite нет сетки, anchor dots, осей, подписей, UI,
  технических примитивов или иных control markers.
- PASS: кадр остаётся квадратным и законченным; L1 не создаёт новую камеру,
  global redraw или дополнительные изображения.

Это self-check Builder, не независимый Visual QA verdict и не разрешение
финальной серии.
