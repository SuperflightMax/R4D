import { describe, expect, it } from 'vitest';
import mapping from '../../../research/board-01-jungle/mapping-v0.1.json';
import { createBoard01Projection } from '../src/projection';
import { board01ProjectionContract } from '../src/public-board01-projection-contract';

const projection = createBoard01Projection(board01ProjectionContract);

describe('board 01 public projection contract', () => {
  it('matches the exact private mapping subset without bundling the Research JSON', () => {
    expect(board01ProjectionContract).toEqual({
      source: {
        widthPx: mapping.source.widthPx,
        heightPx: mapping.source.heightPx,
      },
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
    expect(projection.flatSize).toEqual({ width: 1000, height: 1180 });
  });

  it('round-trips the playable plane and receiver apron', () => {
    for (let y = 0; y <= 1150; y += 50) {
      for (let x = 0; x <= 1000; x += 50) {
        const result = projection.imageToSim(projection.simToImage({ x, y }));
        expect(Math.hypot(result.x - x, result.y - y)).toBeLessThanOrEqual(1e-6);
      }
    }
    const edge = projection.imageToSim(projection.simToImage({ x: 500, y: 1180 }));
    expect(edge.x).toBeCloseTo(500, 6);
    expect(edge.y).toBeCloseTo(1180, 6);
  });

  it('maps exact floor and apron corners and rejects extrapolation', () => {
    const corners = [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
      { x: 1000, y: 1000 },
      { x: 0, y: 1000 },
    ];
    corners.forEach((corner, index) => {
      const point = projection.simToImage(corner);
      expect(point.x).toBeCloseTo(mapping.transform.imageQuadPxClockwise[index][0], 6);
      expect(point.y).toBeCloseTo(mapping.transform.imageQuadPxClockwise[index][1], 6);
    });
    const apron = [
      { x: 0, y: 1000 },
      { x: 1000, y: 1000 },
      { x: 1000, y: 1180 },
      { x: 0, y: 1180 },
    ];
    apron.forEach((corner, index) => {
      const point = projection.simToImage(corner);
      expect(point.x).toBeCloseTo(mapping.transform.receiverApronImagePxClockwise[index][0], 6);
      expect(point.y).toBeCloseTo(mapping.transform.receiverApronImagePxClockwise[index][1], 6);
    });
    expect(() => projection.simToImage({ x: 500, y: 1180.1 })).toThrow(RangeError);
    expect(() => projection.imageToSim({ x: 0, y: 0 })).toThrow(RangeError);
  });
});
