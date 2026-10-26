import path from 'node:path';

export const expected = Object.freeze({
  image: 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32',
  mapping: '070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf',
  config: '4c708fab600a7224bd43782b0e48540db1ea19ad1a399fb175cb840dc438e4b6',
  simCore: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  ball: '05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087',
  shadow: 'ee10607ce00c2a3d7e8644e941879748cdb841f671dda8399353929fce5ed213',
});
export const paths = Object.freeze({
  image: 'K:\\Agents\\R4D\\Assets\\perspective\\03-sun-temple.jpg',
  mapping: path.resolve('../../research/board-03-mapping-v0.2.json'),
  config: path.resolve('../runtime/board-03-config.v1.json'),
  ball: path.resolve('../../assets/candidate-b/ball-64.png'),
  shadow: path.resolve('../../assets/candidate-c/shadow-r18-54x27.png'),
  assetManifest: path.resolve('../../assets/manifest.json'),
  simCoreRoot: path.resolve(
    process.env.MILLIONKO_SOURCE_ROOT
      ?? '../../../../../millionko-source/sim-builder',
  ),
});
