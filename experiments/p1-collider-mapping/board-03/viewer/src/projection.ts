import type { Point, ProjectionPort } from './types';

export interface Board03MappingContract {
  sources: {
    sourceImage: { widthPx: number; heightPx: number };
  };
  coordinateSystems: {
    flat: {
      extent: { x: [number, number]; y: [number, number] };
      semanticDomains: {
        playablePlane: { x: [number, number]; y: [number, number] };
        foregroundReceiverApron: { x: [number, number]; y: [number, number] };
      };
    };
  };
  transform: {
    id: string;
    constants: {
      flatSize: number;
      centerP: number;
      farQ: number;
      qPerZ: number;
      farHalfWidth: number;
      halfWidthPerZ: number;
    };
  };
}

const DOMAIN_EPSILON = 1e-8;

export function createBoard03Projection(contract: Board03MappingContract): ProjectionPort {
  const { widthPx: width, heightPx: height } = contract.sources.sourceImage;
  const { flatSize, centerP, farQ, qPerZ, farHalfWidth, halfWidthPerZ } = contract.transform.constants;
  const { x: flatX, y: flatY } = contract.coordinateSystems.flat.extent;
  const projection: ProjectionPort = {
    mode: 'perspective',
    imageSize: { width, height },
    flatSize: { width: flatX[1] - flatX[0], height: flatY[1] - flatY[0] },
    simToImage(point): Point {
      assertFlatDomain(point, contract);
      const u = (2 * point.x) / flatSize - 1;
      const z = point.y / flatSize;
      return {
        x: width * (centerP + u * (farHalfWidth + halfWidthPerZ * z)),
        y: height * (farQ + qPerZ * z),
      };
    },
    imageToSim(point): Point {
      const p = point.x / width;
      const q = point.y / height;
      const z = (q - farQ) / qPerZ;
      const u = (p - centerP) / (farHalfWidth + halfWidthPerZ * z);
      const flat = { x: (flatSize * (u + 1)) / 2, y: flatSize * z };
      assertFlatDomain(flat, contract);
      return flat;
    },
    simToFlat(point): Point {
      assertFlatDomain(point, contract);
      return { x: point.x, y: point.y };
    },
    flatToSim(point): Point {
      assertFlatDomain(point, contract);
      return { x: point.x, y: point.y };
    },
  };
  return Object.freeze(projection);
}

function assertFlatDomain(point: Readonly<Point>, contract: Board03MappingContract): void {
  const [[minX, maxX], [minY, maxY]] = [
    contract.coordinateSystems.flat.extent.x,
    contract.coordinateSystems.flat.extent.y,
  ];
  if (
    point.x < minX - DOMAIN_EPSILON
    || point.x > maxX + DOMAIN_EPSILON
    || point.y < minY - DOMAIN_EPSILON
    || point.y > maxY + DOMAIN_EPSILON
  ) {
    throw new RangeError(`Point is outside board 03 mapping domain: ${point.x}, ${point.y}`);
  }
}

