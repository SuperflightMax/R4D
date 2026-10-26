import type { Board03Bundle } from './types';

let installedBundle: Board03Bundle | undefined;

export function installBoard03Bundle(bundle: Board03Bundle): void {
  if (installedBundle) throw new Error('board 03 bundle is already installed');
  installedBundle = bundle;
}

export function requireBoard03Bundle(): Board03Bundle {
  if (!installedBundle) {
    throw new Error(
      'Ожидаются точные projection v1 и version-pinned sim adapter/config. Viewer не создаёт временную геометрию.',
    );
  }
  return installedBundle;
}

