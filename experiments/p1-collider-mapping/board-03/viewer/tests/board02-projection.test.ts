import { describe, expect, it } from 'vitest';
import mapping from '../../../research/board-02-dark-temple/mapping-v0.1.json';
import { createHomographyProjection } from '../src/projection';
import { board02ProjectionContract } from '../src/public-board02-projection-contract';

const projection = createHomographyProjection(board02ProjectionContract, 'board 02');

describe('board 02 public projection contract', () => {
  it('matches the exact private mapping subset without bundling Research JSON', () => {
    expect(board02ProjectionContract).toEqual({
      source: { widthPx: mapping.source.widthPx, heightPx: mapping.source.heightPx },
      flat: {
        extent: mapping.coordinates.flatExtent,
        playable: mapping.coordinates.domains.playable,
        receiverApron: mapping.coordinates.domains.receiverApron,
      },
      transform: {
        id: mapping.transform.mode,
        forwardMatrix: mapping.transform.forwardMatrix,
        inverseMatrix: mapping.transform.inverseMatrix,
      },
    });
    expect(projection.flatSize).toEqual({ width: 1000, height: 1150 });
  });

  it('round-trips the playable plane and receiver apron', () => {
    for (let y = 0; y <= 1150; y += 50) {
      for (let x = 0; x <= 1000; x += 50) {
        const result = projection.imageToSim(projection.simToImage({ x, y }));
        expect(Math.hypot(result.x - x, result.y - y)).toBeLessThanOrEqual(1e-6);
      }
    }
  });

  it('maps exact floor corners and rejects extrapolation', () => {
    const corners = [
      { x: 0, y: 0 }, { x: 1000, y: 0 },
      { x: 1000, y: 1000 }, { x: 0, y: 1000 },
    ];
    corners.forEach((corner, index) => {
      const point = projection.simToImage(corner);
      expect(point.x).toBeCloseTo(mapping.transform.imageQuadPxClockwise[index][0], 6);
      expect(point.y).toBeCloseTo(mapping.transform.imageQuadPxClockwise[index][1], 6);
    });
    expect(() => projection.simToImage({ x: 500, y: 1150.1 })).toThrow(RangeError);
    expect(() => projection.imageToSim({ x: 0, y: 0 })).toThrow(RangeError);
  });
});
