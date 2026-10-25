// Alpha-derived lower pixel boundary in SOURCE coordinates. No image is changed.
export function lowerAlphaContour(rgba, width, height, crop, threshold = 1) {
  const points = [];
  for (let x = 0; x < width; x++) {
    for (let y = height - 1; y >= 0; y--) {
      if (rgba[(y * width + x) * 4 + 3] >= threshold) {
        // Pixel-cell lower corners include the antialiased boundary footprint.
        points.push({ x: crop[0] + x - 0.5, y: crop[1] + y + 0.5 },
          { x: crop[0] + x + 0.5, y: crop[1] + y + 0.5 });
        break;
      }
    }
  }
  if (!points.length) throw new Error('The real foot alpha contour is empty');
  return points;
}

export function supportOffset(contour, ankle, angle) {
  let winner = null, maximum = -Infinity;
  const sin = Math.sin(angle), cos = Math.cos(angle);
  for (const p of contour) {
    const value = (p.x - ankle.x) * sin + (p.y - ankle.y) * cos;
    if (value > maximum) { maximum = value; winner = p; }
  }
  return { y: maximum, sourcePoint: winner };
}
