import path from 'node:path';

export const expected = Object.freeze({
  board03: Object.freeze({
    image: 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32',
    mapping: '070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf',
    config: '4c708fab600a7224bd43782b0e48540db1ea19ad1a399fb175cb840dc438e4b6',
  }),
  board01: Object.freeze({
    researchCommit: '92df55715867916669bc370a8040d6bf7d3e1eb7',
    image: 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72',
    mappingCanonical: '9a248421ad8453d839940bccf7e9838e9091ffa83ab40e1b50998f57e7041d5c',
    mappingJsSemantic: '25c72590f39559b6d775d485731d3138e0f91f05f02165fb5c940d0962a0cb7d',
    config: '7d652dc28e30bfc42f7d862fc6cb4bfc2489b4e88593c655d31baca4f85de057',
    traces: 'd1def71c96b6733a5f60b262ef1a27419d67619f6e5f26e6a1d02e9843622d68',
  }),
  board02: Object.freeze({
    researchCommit: 'bbf4b70d67f32a45118630d49c53c2fc48ec0971',
    image: '7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a',
    mappingCanonical: '4f5862f5c2a602fccdc4d4419f7b5e6e4049fb807038d386ee3950d9cad24a12',
    mappingJsSemantic: '04d45ad1b02b0b1ccdb12a6d9b901986673f14933079b059d29ba9f7eb28814a',
    config: 'aea8c0d299b71facbed00d7774da6e31211a7cfb6c119604637a4caa65e4dd48',
    traces: 'd6aee07a7104ea8d1e48ed63859d0511005e69d239aa10a49001b4bfca4dd236',
  }),
  simCore: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  ball: '05b797dd1dbb97d029e7d93a526f718844b2d1f02504f484ccf9f74def7c5087',
  shadow: 'ee10607ce00c2a3d7e8644e941879748cdb841f671dda8399353929fce5ed213',
});

export const paths = Object.freeze({
  board03: Object.freeze({
    image: 'K:\\Agents\\R4D\\Assets\\perspective\\03-sun-temple.jpg',
    mapping: path.resolve('../../research/board-03-mapping-v0.2.json'),
    config: path.resolve('../runtime/board-03-config.v1.json'),
  }),
  board01: Object.freeze({
    image: 'K:\\Agents\\R4D\\Assets\\perspective\\01-jungle.jpg',
    mapping: path.resolve('../../research/board-01-jungle/mapping-v0.1.json'),
    config: path.resolve('../../board-01/runtime/board-01-config.v1.json'),
    configManifest: path.resolve('../../board-01/runtime/board-01-config.manifest.json'),
    traces: path.resolve('../../board-01/checks/board-01-traces.v1.json'),
  }),
  board02: Object.freeze({
    image: 'K:\\Agents\\R4D\\Assets\\perspective\\02-dark-temple.jpg',
    mapping: path.resolve('../../research/board-02-dark-temple/mapping-v0.1.json'),
    config: path.resolve('../../board-02/runtime/board-02-config.v1.json'),
    configManifest: path.resolve('../../board-02/runtime/board-02-config.manifest.json'),
    traces: path.resolve('../../board-02/checks/board-02-traces.v1.json'),
  }),
  ball: path.resolve('../../assets/candidate-b/ball-64.png'),
  shadow: path.resolve('../../assets/candidate-c/shadow-r18-54x27.png'),
  assetManifest: path.resolve('../../assets/manifest.json'),
  simCoreRoot: path.resolve(
    process.env.MILLIONKO_SOURCE_ROOT
      ?? '../../../../../millionko-source/sim-builder',
  ),
});
