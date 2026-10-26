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

export interface HomographyMappingContract {
  source: { widthPx: number; heightPx: number };
  flat: {
    extent: { x: [number, number]; y: [number, number] };
    playable: { x: [number, number]; y: [number, number] };
    receiverApron: { x: [number, number]; y: [number, number] };
  };
  transform: {
    id: string;
    forwardMatrix: [[number, number, number], [number, number, number], [number, number, number]];
    inverseMatrix: [[number, number, number], [number, number, number], [number, number, number]];
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

export function createHomographyProjection(
  contract: HomographyMappingContract,
  boardLabel: string,
): ProjectionPort {
  const { widthPx: width, heightPx: height } = contract.source;
  const { x: flatX, y: flatY } = contract.flat.extent;
  const projection: ProjectionPort = {
    mode: 'perspective',
    imageSize: { width, height },
    flatSize: { width: flatX[1] - flatX[0], height: flatY[1] - flatY[0] },
    simToImage(point): Point {
      assertDomain(point, contract.flat.extent, boardLabel);
      return applyHomography(contract.transform.forwardMatrix, point);
    },
    imageToSim(point): Point {
      const flat = applyHomography(contract.transform.inverseMatrix, point);
      assertDomain(flat, contract.flat.extent, boardLabel);
      return flat;
    },
    simToFlat(point): Point {
      assertDomain(point, contract.flat.extent, boardLabel);
      return { x: point.x, y: point.y };
    },
    flatToSim(point): Point {
      assertDomain(point, contract.flat.extent, boardLabel);
      return { x: point.x, y: point.y };
    },
  };
  return Object.freeze(projection);
}

function applyHomography(
  matrix: HomographyMappingContract['transform']['forwardMatrix'],
  point: Readonly<Point>,
): Point {
  const denominator = matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2];
  if (!Number.isFinite(denominator) || Math.abs(denominator) < Number.EPSILON) {
    throw new RangeError('Projection denominator is invalid');
  }
  return {
    x: (matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2]) / denominator,
    y: (matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2]) / denominator,
  };
}

export const createBoard01Projection = (contract: HomographyMappingContract): ProjectionPort =>
  createHomographyProjection(contract, 'board 01');

function assertFlatDomain(point: Readonly<Point>, contract: Board03MappingContract): void {
  assertDomain(point, contract.coordinateSystems.flat.extent, 'board 03');
}

function assertDomain(
  point: Readonly<Point>,
  extent: { x: [number, number]; y: [number, number] },
  board: string,
): void {
  const [[minX, maxX], [minY, maxY]] = [extent.x, extent.y];
  if (
    point.x < minX - DOMAIN_EPSILON
    || point.x > maxX + DOMAIN_EPSILON
    || point.y < minY - DOMAIN_EPSILON
    || point.y > maxY + DOMAIN_EPSILON
  ) {
    throw new RangeError(`Point is outside ${board} mapping domain: ${point.x}, ${point.y}`);
  }
}

