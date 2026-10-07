import { describe, expect, it } from 'vite-plus/test'
import { formatLabel, fromLetters, toLetters } from './labels'

describe('letters', () => {
  it('round-trips spreadsheet-style labels', () => {
    expect(toLetters(0)).toBe('A')
    expect(toLetters(25)).toBe('Z')
    expect(toLetters(26)).toBe('AA')
    expect(fromLetters('AA')).toBe(26)
    expect(fromLetters('c')).toBe(2)
    expect(fromLetters('1')).toBe(0)
  })
})

describe('formatLabel', () => {
  it('numbers forward from the start value', () => {
    expect(formatLabel({ scheme: 'numbers', start: '10', direction: 'forward' }, 2, 5)).toBe('12')
  })

  it('numbers in reverse', () => {
    expect(formatLabel({ scheme: 'numbers', start: '1', direction: 'reverse' }, 0, 5)).toBe('5')
  })

  it('uses alternate numbers, fixing the parity of the start', () => {
    expect(formatLabel({ scheme: 'odd', start: '2', direction: 'forward' }, 1, 5)).toBe('5')
    expect(formatLabel({ scheme: 'even', start: '1', direction: 'forward' }, 0, 5)).toBe('2')
  })

  it('continues letters from the start letter', () => {
    expect(formatLabel({ scheme: 'letters', start: 'Y', direction: 'forward' }, 2, 5)).toBe('AA')
  })
})
