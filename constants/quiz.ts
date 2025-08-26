export const MAX_OPTIONS = [10, 20, 30, 60, 80, 120] as const
export type MaxOption = (typeof MAX_OPTIONS)[number]

export const DEFAULT_MAX: MaxOption = 60
export const MAX_SET = new Set<number>(MAX_OPTIONS as readonly number[])

/** Ta emot number/string/okänt → säkert MaxOption (fallback = DEFAULT_MAX) */
export function normalizeMax(input: unknown, fallback: MaxOption = DEFAULT_MAX): MaxOption {
  const n = typeof input === 'string' ? Number(input) : typeof input === 'number' ? input : NaN
  return (Number.isFinite(n) && MAX_SET.has(n)) ? (n as MaxOption) : fallback
}