import type { Board03Bundle, SimulationSnapshot, ViewId } from './types';

export interface VisibilityState {
  art: boolean;
  geometry: boolean;
}

export class ViewerState {
  view: ViewId = 'perspective';
  visibility: VisibilityState = { art: true, geometry: true };

  constructor(private readonly bundle: Board03Bundle) {}

  get snapshot(): Readonly<SimulationSnapshot> {
    return this.bundle.simulation.snapshot();
  }

  setView(next: ViewId): void {
    if (next === 'flat' && this.bundle.projection.mode === 'identity') return;
    this.assertVisualOnly(() => {
      this.view = next;
    });
  }

  setArt(visible: boolean): void {
    this.assertVisualOnly(() => {
      this.visibility = { ...this.visibility, art: visible };
    });
  }

  setGeometry(visible: boolean): void {
    this.assertVisualOnly(() => {
      this.visibility = { ...this.visibility, geometry: visible };
    });
  }

  stepTicks(count: number): Readonly<SimulationSnapshot> {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError('Diagnostic step count must be a positive integer');
    }
    return this.bundle.simulation.stepTicks(count);
  }

  reset(seed: number): Readonly<SimulationSnapshot> {
    return this.bundle.simulation.reset(seed >>> 0);
  }

  private assertVisualOnly(change: () => void): void {
    const before = JSON.stringify(this.bundle.simulation.snapshot());
    change();
    const after = JSON.stringify(this.bundle.simulation.snapshot());
    if (after !== before) {
      throw new Error('Visual control mutated simulation state');
    }
  }
}

