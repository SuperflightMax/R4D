import { bounds } from './p1-projection.mjs';

// Source1536 bounds, independent of viewport, Art visibility and simulation tick.
// Ball placement is supplied once at accepted initialization/drop. Include its
// authored alpha>0 silhouette, rather than only the ground footprint below it.
// Floor/shadow canvas padding must not turn Field into Whole.
export function importantPartBounds(spec, texture, placement) {
  if (!['receiver-back', 'receiver-front', 'foreground', 'ball'].includes(spec.role)) return null;
  const [x, y, width, height] = spec.role === 'ball' ? texture.alpha.bounds : texture.alpha.visibleBounds;
  const { x: left, y: top, scale } = placement;
  let box = { minX: left + x * scale, minY: top + y * scale,
    maxX: left + (x + width) * scale, maxY: top + (y + height) * scale };
  if (spec.sourceClipPx) {
    const clip = bounds(spec.sourceClipPx.polygon);
    box = { minX: Math.max(box.minX, clip.minX), minY: Math.max(box.minY, clip.minY),
      maxX: Math.min(box.maxX, clip.maxX), maxY: Math.min(box.maxY, clip.maxY) };
  }
  return box.maxX > box.minX && box.maxY > box.minY ? { instanceId: spec.id, ...box } : null;
}

export function fieldFramingBounds(groundPoints, partBounds) {
  return bounds([...groundPoints, ...partBounds.flatMap(box => [[box.minX, box.minY], [box.maxX, box.maxY]])]);
}
