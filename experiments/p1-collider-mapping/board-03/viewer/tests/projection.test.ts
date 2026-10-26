import { describe, expect, it } from 'vitest';
import mapping from '../../../research/board-03-mapping-v0.1.json';
import { createBoard03Projection, type Board03MappingContract } from '../src/projection';
import { board03ProjectionContract } from '../src/public-projection-contract';

const canonicalMapping = mapping as unknown as Board03MappingContract;
const projection = createBoard03Projection(board03ProjectionContract);

describe('board 03 projection', () => {
  it('round-trips the full 21x21 flat lattice', () => {
    for (let y = 0; y <= 1000; y += 50) {
      for (let x = 0; x <= 1000; x += 50) {
        const result = projection.imageToSim(projection.simToImage({ x, y }));
        expect(Math.hypot(result.x - x, result.y - y)).toBeLessThanOrEqual(1e-9);
      }
    }
  });

  it('maps exact flat corners to the accepted P0 quad', () => {
    expect(board03ProjectionContract).toEqual({
      sources: {
        sourceImage: {
          widthPx: canonicalMapping.sources.sourceImage.widthPx,
          heightPx: canonicalMapping.sources.sourceImage.heightPx,
        },
      },
      coordinateSystems: {
        flat: { extent: canonicalMapping.coordinateSystems.flat.extent },
      },
      transform: {
        id: canonicalMapping.transform.id,
        constants: canonicalMapping.transform.constants,
      },
    });
    const expected = mapping.transform.quadImagePxClockwise;
    const corners = [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
      { x: 1000, y: 1000 },
      { x: 0, y: 1000 },
    ];
    corners.forEach((corner, index) => {
      const point = projection.simToImage(corner);
      expect(point.x).toBeCloseTo(expected[index][0], 10);
      expect(point.y).toBeCloseTo(expected[index][1], 10);
    });
  });

  it('rejects clamp or extrapolation outside the mapping domain', () => {
    expect(() => projection.simToImage({ x: -1, y: 500 })).toThrow(RangeError);
    expect(() => projection.imageToSim({ x: 0, y: 0 })).toThrow(RangeError);
  });
});

