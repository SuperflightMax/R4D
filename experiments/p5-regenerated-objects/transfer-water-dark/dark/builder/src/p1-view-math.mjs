/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ minX: number, maxX: number, minY: number, maxY: number }} Bounds */

/** @param {number[][]} matrix @param {Point} p @returns {Point} */
export function transform(matrix, p) {
  const w = matrix[2][0] * p.x + matrix[2][1] * p.y + matrix[2][2];
  if (!Number.isFinite(w) || Math.abs(w) < 1e-12) throw new RangeError('Projection is at its horizon');
  return {
    x: (matrix[0][0] * p.x + matrix[0][1] * p.y + matrix[0][2]) / w,
    y: (matrix[1][0] * p.x + matrix[1][1] * p.y + matrix[1][2]) / w,
  };
}

/** @param {Point[]} points @returns {Bounds} */
export function boundsOf(points) {
  return {
    minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)),
  };
}

/** @param {Bounds} bounds @param {number} width @param {number} height */
export function contain(bounds, width, height) {
  const margin = 8;
  const scale = Math.min((width - 2 * margin) / (bounds.maxX - bounds.minX),
    (height - 2 * margin) / (bounds.maxY - bounds.minY));
  return {
    scale,
    x: (width - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale,
    y: (height - (bounds.maxY - bounds.minY) * scale) / 2 - bounds.minY * scale,
  };
}

/** @param {{transform:{forward:number[][]},domains:{sourceImageQuadPx:number[][],wholeSourceFlatPolygon:number[][],playableFloorFlatPolygon:number[][],receiverFlatPolygon:number[][]}}} data
 * @param {'source'|'flat'} view @param {'whole'|'floor'} framing */
export function framingPolygon(data,view,framing){
  if(framing==='whole')return (view==='source'?data.domains.sourceImageQuadPx:data.domains.wholeSourceFlatPolygon).map(([x,y])=>({x,y}));
  return [...data.domains.playableFloorFlatPolygon,...data.domains.receiverFlatPolygon].map(([x,y])=>view==='source'?transform(data.transform.forward,{x,y}):{x,y});
}

/** @param {number[][]} inverse @param {number} width @param {number} height */
export function inverseImageMesh(inverse, width, height) {
  // Dense UV mesh of the entire source image, including its four exact corners.
  // Mesh subdivision is rendering precision; it never supplies collider data.
  const cells = 96;
  const vertices = new Float32Array((cells + 1) ** 2 * 2);
  const uvs = new Float32Array(vertices.length);
  const indices = new Uint32Array(cells ** 2 * 6);
  for (let row = 0; row <= cells; row++) {
    for (let column = 0; column <= cells; column++) {
      const offset = (row * (cells + 1) + column) * 2;
      const u = column / cells, v = row / cells;
      const point = transform(inverse, { x: u * width, y: v * height });
      vertices[offset] = point.x; vertices[offset + 1] = point.y;
      uvs[offset] = u; uvs[offset + 1] = v;
      if (row < cells && column < cells) {
        const a = row * (cells + 1) + column, b = a + 1, c = a + cells + 1, d = c + 1;
        indices.set([a, b, d, a, d, c], (row * cells + column) * 6);
      }
    }
  }
  return { vertices, uvs, indices };
}
