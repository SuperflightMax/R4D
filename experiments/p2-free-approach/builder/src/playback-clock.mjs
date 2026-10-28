export const PLAYBACK_RATES = Object.freeze([0.25, 0.5, 1]);
export const DEFAULT_PLAYBACK_RATE = 0.25;

// Presentation time only: this helper never reads a simulation, seed or RNG.
export class PlaybackClock {
  constructor(tickMs, rate = DEFAULT_PLAYBACK_RATE) {
    if (!Number.isFinite(tickMs) || tickMs <= 0) throw new RangeError('Invalid fixed tick duration');
    this.tickMs = tickMs;
    this.setRate(rate);
    this.suspended = false;
    this.reset();
  }

  get rate() { return this._rate; }
  setRate(rate) {
    if (!PLAYBACK_RATES.includes(rate)) throw new RangeError('Playback rate must be 0.25, 0.5 or 1');
    this._rate = rate; // Keep earned fractional simulation time on a rate change.
  }

  reset() { this.remainderSimMs = 0; this.discardNextDelta = true; }
  setSuspended(value) {
    if (typeof value !== 'boolean') throw new TypeError('Suspended must be boolean');
    if (this.suspended !== value) { this.suspended = value; this.reset(); }
  }

  consume(deltaMs, remainingTicks) {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new RangeError('Invalid presentation delta');
    if (!Number.isSafeInteger(remainingTicks) || remainingTicks < 0) throw new RangeError('Invalid remaining ticks');
    if (remainingTicks === 0) { this.reset(); return 0; }
    if (this.suspended) return 0;
    if (this.discardNextDelta) { this.discardNextDelta = false; return 0; }
    const budget = this.remainderSimMs + deltaMs * this.rate;
    if (!Number.isFinite(budget)) throw new RangeError('Presentation budget overflow');
    const available = Math.floor(budget / this.tickMs);
    const ticks = Math.min(available, remainingTicks);
    this.remainderSimMs = available >= remainingTicks ? 0 : budget - ticks * this.tickMs;
    return ticks;
  }

  snapshot() {
    return { tickMs: this.tickMs, rate: this.rate, remainderSimMs: this.remainderSimMs,
      suspended: this.suspended, discardNextDelta: this.discardNextDelta,
      timingPolicy: 'capped-pixi-deltaMS-times-rate', resetPolicy: 'discard-fraction-and-next-delta' };
  }
}

// Physical checkpoint may stay at a later tick; presentation describes the latest inspection.
export function mergeObservation(previous, item) {
  const physical = previous?.tick > item.tick ? previous : item;
  const inspectedTicks = [...new Set([...(previous?.inspectedTicks || []), item.tick])];
  return { ...physical, inspectedTicks, presentation: item.presentation };
}
