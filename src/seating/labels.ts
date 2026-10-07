import type { LabelConfig } from './seating.types'

/** Converts a zero-based index to a spreadsheet-style letter label (`0` → `A`, `26` → `AA`). */
export function toLetters(index: number): string {
  let n = Math.max(0, Math.floor(index)) + 1
  let out = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    out = String.fromCharCode(65 + rem) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

/**
 * Converts a letter label back to its zero-based index (`A` → `0`, `AA` → `26`).
 *
 * @returns `0` when the value contains anything other than letters.
 */
export function fromLetters(value: string): number {
  const normalized = value.trim().toUpperCase()
  if (!/^[A-Z]+$/.test(normalized)) return 0
  let n = 0
  for (const ch of normalized) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

function parseStart(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function firstWithParity(value: string, parity: 0 | 1): number {
  const base = parseStart(value, parity === 1 ? 1 : 2)
  return Math.abs(base % 2) === parity ? base : base + 1
}

/**
 * Formats the label at a position in a labelled sequence.
 *
 * @param index Zero-based position counted in the forward direction.
 * @param count Length of the sequence; needed to number in reverse.
 *
 * @example Alternate numbering
 * ```ts
 * import { formatLabel } from "./labels";
 *
 * formatLabel({ scheme: "odd", start: "1", direction: "forward" }, 2, 5); // "5"
 * ```
 */
export function formatLabel(config: LabelConfig, index: number, count: number): string {
  const i = config.direction === 'reverse' ? count - 1 - index : index
  switch (config.scheme) {
    case 'letters':
      return toLetters(fromLetters(config.start) + i)
    case 'odd':
      return String(firstWithParity(config.start, 1) + i * 2)
    case 'even':
      return String(firstWithParity(config.start, 0) + i * 2)
    case 'numbers':
      return String(parseStart(config.start, 1) + i)
  }
}
