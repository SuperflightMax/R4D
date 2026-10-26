import type { ProjectionPort } from './types';

export async function rectifyArt(
  sourceUrl: string,
  projection: ProjectionPort,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(sourceUrl);
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceContext) throw new Error('2D canvas is unavailable for source sampling');
  sourceContext.drawImage(image, 0, 0);
  const source = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

  const canvas = document.createElement('canvas');
  canvas.width = projection.flatSize.width;
  canvas.height = projection.flatSize.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is unavailable for flat art rectification');
  const output = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const sample = projection.simToImage(projection.flatToSim({ x: x + 0.5, y: y + 0.5 }));
      bilinearSample(source, sample.x - 0.5, sample.y - 0.5, output.data, (y * canvas.width + x) * 4);
    }
  }
  context.putImageData(output, 0, 0);
  return canvas;
}

function bilinearSample(
  source: ImageData,
  x: number,
  y: number,
  output: Uint8ClampedArray,
  outputOffset: number,
): void {
  const x0 = Math.max(0, Math.min(source.width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(source.height - 1, Math.floor(y)));
  const x1 = Math.min(source.width - 1, x0 + 1);
  const y1 = Math.min(source.height - 1, y0 + 1);
  const tx = x - Math.floor(x);
  const ty = y - Math.floor(y);
  const offsets = [
    (y0 * source.width + x0) * 4,
    (y0 * source.width + x1) * 4,
    (y1 * source.width + x0) * 4,
    (y1 * source.width + x1) * 4,
  ];
  for (let channel = 0; channel < 4; channel += 1) {
    const top = source.data[offsets[0] + channel] * (1 - tx) + source.data[offsets[1] + channel] * tx;
    const bottom = source.data[offsets[2] + channel] * (1 - tx) + source.data[offsets[3] + channel] * tx;
    output[outputOffset + channel] = top * (1 - ty) + bottom * ty;
  }
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

