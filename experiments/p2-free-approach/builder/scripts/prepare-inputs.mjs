import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { root, inputFiles, pinnedFile, canonicalLF, verifyInputs } from './pins.mjs';

mkdirSync(path.join(root, 'inputs'), { recursive: true });
for (const [local, relative] of Object.entries(inputFiles)) {
  writeFileSync(path.join(root, 'inputs', local), canonicalLF(pinnedFile(relative)));
}
verifyInputs();
console.log('Four accepted P1 inputs extracted and byte-verified; no P1 art or private core copied.');
