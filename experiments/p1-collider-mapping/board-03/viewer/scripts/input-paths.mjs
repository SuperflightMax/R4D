import path from 'node:path';

export const expected = Object.freeze({
  image: 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32',
  mapping: 'fc4e467b8eeced91e08e2a62ed367693ac9317675a2f33a8ab76379ac47429be',
  config: '69ebafc086bea82513b9107ebf272d4f6b1d552cd080810eefe893616c454c6f',
  simCore: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  ball: '05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087',
  shadow: 'fbd1fc9f8e637a73e6d10eee36c9bd25ae1441cd18b002fb52e1d34dbd5d15ef',
});
export const paths = Object.freeze({
  image: 'K:\\Agents\\R4D\\Assets\\perspective\\03-sun-temple.jpg',
  mapping: path.resolve('../../research/board-03-mapping-v0.1.json'),
  config: path.resolve('../runtime/board-03-config.v1.json'),
  ball: path.resolve('../../assets/candidate-b/ball-64.png'),
  shadow: path.resolve('../../assets/candidate-b/shadow-96x48.png'),
  simCoreRoot: path.resolve(
    process.env.MILLIONKO_SOURCE_ROOT
      ?? '../../../../../millionko-source/sim-builder',
  ),
});
