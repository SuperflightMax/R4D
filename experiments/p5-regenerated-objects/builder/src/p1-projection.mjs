export function project(matrix, [x, y]) {
  const w = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2];
  return [(matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]) / w,
    (matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]) / w];
}

export function multiply(a, b) {
  return a.map(row => b[0].map((_, col) => row.reduce((sum, value, index) => sum + value * b[index][col], 0)));
}

export function bounds(points) {
  return {
    minX: Math.min(...points.map(p => p[0])), maxX: Math.max(...points.map(p => p[0])),
    minY: Math.min(...points.map(p => p[1])), maxY: Math.max(...points.map(p => p[1]))
  };
}
