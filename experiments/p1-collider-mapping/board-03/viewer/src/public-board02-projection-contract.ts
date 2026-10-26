import type { HomographyMappingContract } from './projection';

// Public runtime subset of Research board-02 mapping. Private source paths,
// evidence metadata and the Research JSON itself never enter the browser tree.
export const board02ProjectionContract = Object.freeze({
  source: { widthPx: 1536, heightPx: 1536 },
  flat: {
    extent: { x: [0, 1000], y: [0, 1150] },
    playable: { x: [0, 1000], y: [0, 1000] },
    receiverApron: { x: [0, 1000], y: [1000, 1150] },
  },
  transform: {
    id: 'perspective-homography',
    forwardMatrix: [
      [0.896, -0.20672104404567704, 320],
      [0, 0.5723784665579119, 252],
      [0, -0.00026916802610114194, 1],
    ],
    inverseMatrix: [
      [1.1160714285714286, 0.21021893346379658, -410.11802837573384],
      [0, 1.5619903783431182, -393.62157534246575],
      [0, 0.000420437866927593, 0.8940496575342465],
    ],
  },
} satisfies HomographyMappingContract);
