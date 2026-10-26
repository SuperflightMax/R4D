import * as simCore from '@millionko/sim-core';
import config from '../../runtime/board-03-config.v1.json';
import configManifest from '../../runtime/board-03-config.manifest.json';
import { createBoard03Adapter, type SimCorePublicApi } from '../../runtime/sim-adapter';
import { geometryFromConfig, type Board03Config } from './config-geometry';
import { createBoard03Projection } from './projection';
import { board03ProjectionContract } from './public-projection-contract';
import type { Board03Bundle, SimulationPort, SimulationSnapshot } from './types';

const authoredConfig = config as unknown as Board03Config;
const adapter = createBoard03Adapter(
  simCore as unknown as SimCorePublicApi,
  config as never,
);
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
export const board03Bundle: Board03Bundle = Object.freeze({
  sourcePins: Object.freeze({
    imageSha256: configManifest.mapping.sourceImageSha256,
    projectionVersion: board03ProjectionContract.transform.id,
    configVersion: configManifest.config.file,
    configSha256: configManifest.config.sha256,
    mappingSha256: configManifest.mapping.sha256,
    simCoreCommit: configManifest.simCoreCommit,
  }),
  art: Object.freeze({
    ballUrl: `${import.meta.env.BASE_URL}assets/ball-candidate-b-64.png`,
    shadowUrl: `${import.meta.env.BASE_URL}assets/shadow-candidate-b-96x48.png`,
    ballNativeDiameter: 64,
    shadowNativeSize: [96, 48] as const,
    shadowOffsetInBallDiameters: [-0.18, 0.25] as const,
  }),
  geometry: geometryFromConfig(authoredConfig),
  projection: createBoard03Projection(board03ProjectionContract),
  simulation,
});
