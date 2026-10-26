import type { HomographyMappingContract } from './projection';

// Public runtime subset of Research board-04 mapping. Private source paths,
// evidence metadata and the Research JSON itself never enter the browser tree.
export const board04ProjectionContract = Object.freeze({
  source: { widthPx: 1536, heightPx: 1536 },
  flat: {
    extent: { x: [0, 1000], y: [0, 1250] },
    playable: { x: [0, 1000], y: [0, 1000] },
    receiverApron: { x: [0, 1000], y: [1000, 1250] },
  },
  transform: {
    id: 'perspective-homography',
    forwardMatrix: [
      [1.156, -0.09745015105740179, 190],
      [0, 0.6754984894259819, 250],
      [0, -0.0001268882175226586, 1],
    ],
    inverseMatrix: [
      [0.8650519031141869, 0.08970908624887862, -186.78713315391514],
      [0, 1.4139860737323253, -353.4965184330813],
      [0, 0.00017941817249775724, 0.9551454568755606],
    ],
  },
} satisfies HomographyMappingContract);
