import * as simCore from '@millionko/sim-core';
import config from '../../../board-01/runtime/board-01-config.v1.json';
import configManifest from '../../../board-01/runtime/board-01-config.manifest.json';
import { createBoard01Adapter, type SimCorePublicApi } from '../../../board-01/runtime/sim-adapter';
import { geometryFromConfig, type Board03Config } from './config-geometry';
import { createBoard01Projection } from './projection';
import { board01ProjectionContract } from './public-board01-projection-contract';
import type { BoardBundle, SimulationPort, SimulationSnapshot } from './types';

const authoredConfig = config as unknown as Board03Config;
const adapter = createBoard01Adapter(simCore as unknown as SimCorePublicApi, config as never);
let currentRun = adapter.createRun(1);

function viewerSnapshot(): Readonly<SimulationSnapshot> {
  const snapshot = currentRun.snapshot();
  return Object.freeze({
    seed: snapshot.seed,
    tick: snapshot.tick,
    rngU32: snapshot.rngU32,
    ball: Object.freeze({
      x: snapshot.ball.pos.x,
      y: snapshot.ball.pos.y,
      radius: authoredConfig.board.ball.r,
      vx: snapshot.ball.vel.x,
      vy: snapshot.ball.vel.y,
    }),
    done: snapshot.done,
    result: snapshot.result ?? null,
  });
}

const simulation: SimulationPort = Object.freeze({
  tickMs: adapter.tickMs,
  snapshot: viewerSnapshot,
  stepTicks(count: number) {
    currentRun.stepTicks(count);
    return viewerSnapshot();
  },
  reset(seed: number) {
    currentRun = adapter.createRun(seed);
    return viewerSnapshot();
  },
});

export const board01Bundle: BoardBundle = Object.freeze({
  id: '01',
  label: 'Board 01 · Jungle',
  domain: Object.freeze({ playableMaxY: 1000, apronMaxY: 1180, goalRadius: 26 }),
  sourcePins: Object.freeze({
    imageSha256: configManifest.mapping.sourceImageSha256,
    projectionVersion: board01ProjectionContract.transform.id,
    configVersion: configManifest.config.file,
    configSha256: configManifest.config.sha256,
    mappingSha256: configManifest.mapping.canonicalSha256,
    simCoreCommit: configManifest.simCoreCommit,
  }),
  art: Object.freeze({
    imageUrl: `${import.meta.env.BASE_URL}assets/01-jungle.jpg`,
    ballUrl: `${import.meta.env.BASE_URL}assets/ball-candidate-b-64.png`,
    shadowUrl: `${import.meta.env.BASE_URL}assets/shadow-candidate-c-r18-54x27.png`,
    ballNativeDiameter: 64,
    shadowNativeSize: [54, 27] as const,
    shadowOffsetInBallDiameters: [-0.18, 0.25] as const,
  }),
  geometry: geometryFromConfig(authoredConfig),
  projection: createBoard01Projection(board01ProjectionContract),
  simulation,
});
