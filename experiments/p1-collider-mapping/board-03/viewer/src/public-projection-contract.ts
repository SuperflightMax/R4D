import type { Board03MappingContract } from './projection';

// Public runtime subset of the exact Researcher mapping. The projection test
// compares these values with the canonical mapping JSON, while local source
// paths and unrelated research metadata stay out of the browser bundle.
export const board03ProjectionContract = Object.freeze({
  sources: {
    sourceImage: { widthPx: 1536, heightPx: 1536 },
  },
  coordinateSystems: {
    flat: { extent: { x: [0, 1000], y: [0, 1000] } },
  },
  transform: {
    id: 'p0-selected-ruled-trapezoid-v0.1',
    constants: {
      flatSize: 1000,
      centerP: 0.5,
      farQ: 0.255,
      qPerZ: 0.52,
      farHalfWidth: 0.275,
      halfWidthPerZ: 0.14,
    },
  },
} satisfies Board03MappingContract);
