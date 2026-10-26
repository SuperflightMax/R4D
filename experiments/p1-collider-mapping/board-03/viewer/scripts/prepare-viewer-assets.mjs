import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { paths } from './input-paths.mjs';

const output = path.resolve('public/assets');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all([
  copyFile(paths.board03.image, path.join(output, '03-sun-temple.jpg')),
  copyFile(paths.board01.image, path.join(output, '01-jungle.jpg')),
  copyFile(paths.board02.image, path.join(output, '02-dark-temple.jpg')),
  copyFile(paths.ball, path.join(output, 'ball-candidate-b-64.png')),
  copyFile(paths.shadow, path.join(output, 'shadow-candidate-c-r18-54x27.png')),
]);
console.log('Prepared exact board, candidate-B ball and manifest-selected candidate-C shadow');
