import type { Point, ProjectionPort } from './types';

export async function rectifyArt(
  sourceUrl: string,
  projection: ProjectionPort,
  gridSize = 32,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  canvas.width = projection.flatSize.width;
  canvas.height = projection.flatSize.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is unavailable for flat art rectification');

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x0 = (column / gridSize) * canvas.width;
      const x1 = ((column + 1) / gridSize) * canvas.width;
      const y0 = (row / gridSize) * canvas.height;
      const y1 = ((row + 1) / gridSize) * canvas.height;
      const destination = [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
      ];
      const source = destination.map((point) =>
        projection.simToImage(projection.flatToSim(point)),
      );
      drawTriangle(context, image, [source[0], source[1], source[2]], [destination[0], destination[1], destination[2]]);
      drawTriangle(context, image, [source[0], source[2], source[3]], [destination[0], destination[2], destination[3]]);
    }
  }
  return canvas;
}

function drawTriangle(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  source: readonly [Point, Point, Point],
  destination: readonly [Point, Point, Point],
): void {
  const [s0, s1, s2] = source;
  const [d0, d1, d2] = destination;
  const determinant = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(determinant) < 1e-9) return;

  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / determinant;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / determinant;
  const e = (
    d0.x * (s1.x * s2.y - s2.x * s1.y)
    + d1.x * (s2.x * s0.y - s0.x * s2.y)
    + d2.x * (s0.x * s1.y - s1.x * s0.y)
  ) / determinant;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / determinant;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / determinant;
  const f = (
    d0.y * (s1.x * s2.y - s2.x * s1.y)
    + d1.y * (s2.x * s0.y - s0.x * s2.y)
    + d2.y * (s0.x * s1.y - s1.x * s0.y)
  ) / determinant;

  context.save();
  context.beginPath();
  context.moveTo(d0.x, d0.y);
  context.lineTo(d1.x, d1.y);
  context.lineTo(d2.x, d2.y);
  context.closePath();
  context.clip();
  context.setTransform(a, b, c, d, e, f);
  context.drawImage(image, 0, 0);
  context.restore();
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Cannot load board art: ${url}`));
    image.src = url;
  });
}

