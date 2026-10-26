import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { paths } from './input-paths.mjs';

const output = path.resolve('public/assets');
await mkdir(output, { recursive: true });
await Promise.all([
  copyFile(paths.image, path.join(output, '03-sun-temple.jpg')),
  copyFile(paths.ball, path.join(output, 'ball-candidate-b-64.png')),
  copyFile(paths.shadow, path.join(output, 'shadow-candidate-b-96x48.png')),
]);
console.log('Prepared exact board, candidate-B ball and separate shadow assets');
