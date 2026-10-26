import type { Board01MappingContract } from './projection';

// Public runtime subset of Research board-01 mapping. Private source paths,
// evidence metadata and the Research JSON itself never enter the browser tree.
export const board01ProjectionContract = Object.freeze({
  source: { widthPx: 1536, heightPx: 1536 },
  flat: {
    extent: { x: [0, 1000], y: [0, 1180] },
    playable: { x: [0, 1000], y: [0, 1000] },
    receiverApron: { x: [0, 1000], y: [1000, 1180] },
  },
  transform: {
    id: 'perspective-homography',
    forwardMatrix: [
      [0.756, -0.22333958724202627, 390],
      [0, 0.5026228893058161, 286],
      [0, -0.00029080675422138837, 1],
    ],
    inverseMatrix: [
      [1.3227513227513228, 0.24821604724752427, -586.8628053858077],
      [0, 1.707085847521683, -488.2265523912013],
      [0, 0.0004964320944950485, 0.8580204209744161],
    ],
  },
} satisfies Board01MappingContract);
