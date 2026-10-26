import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { defineConfig } from 'vite';

const expectedCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const simRoot = path.resolve(
  process.env.MILLIONKO_SOURCE_ROOT
    ?? '../../../../../millionko-source/sim-builder',
);
const actualCommit = execFileSync('git', ['-C', simRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (actualCommit !== expectedCommit) {
  throw new Error(`Millionko source must be ${expectedCommit}, received ${actualCommit}`);
}

export default defineConfig({
  base: '/review/r4d/p1-collider-mapping/',
  resolve: {
    alias: {
      '@millionko/sim-core': path.join(simRoot, 'packages/sim-core/src/index.ts'),
    },
  },
  server: {
    fs: { allow: [simRoot, path.resolve('../../..')] },
  },
  build: { sourcemap: false },
});
