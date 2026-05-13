export function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return function random() {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function jitter(random: () => number, range: number) {
  return 1 + (random() - 0.5) * range
}
