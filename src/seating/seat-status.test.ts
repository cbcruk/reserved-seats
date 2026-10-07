import { describe, expect, it } from 'vite-plus/test'
import { SAMPLE_MAP } from './sample-venue'
import {
  collectSeats,
  elementIdOfSeat,
  findCategory,
  isTicketed,
  resolveSeatCategoryId,
  seatIdsOf,
} from './seat-status'

const byId = (id: string) => SAMPLE_MAP.elements.find((e) => e.id === id)!

describe('isTicketed', () => {
  it('accepts seated elements and areas but not decorations', () => {
    expect(['center', 't1', 't5', 'ga'].map((id) => isTicketed(byId(id)))).toEqual([
      true,
      true,
      true,
      true,
    ])
    expect(isTicketed(byId('stage'))).toBe(false)
    expect(isTicketed(byId('entrance'))).toBe(false)
  })
})

describe('resolveSeatCategoryId', () => {
  it('uses a null override to take a seat off sale', () => {
    expect(resolveSeatCategoryId(byId('t5'), 't5:0:4', SAMPLE_MAP.seatOverrides)).toBeNull()
    expect(resolveSeatCategoryId(byId('t5'), 't5:0:3', SAMPLE_MAP.seatOverrides)).toBe('cat_table')
  })

  it('ignores overrides that only set accessibility', () => {
    expect(resolveSeatCategoryId(byId('center'), 'center:5:0', SAMPLE_MAP.seatOverrides)).toBe(
      'cat_vip',
    )
  })

  it('returns null for elements without a category', () => {
    expect(resolveSeatCategoryId(byId('stage'), 'stage:0:0', {})).toBeNull()
  })
})

describe('findCategory', () => {
  it('returns undefined for missing, empty or deleted ids', () => {
    expect(findCategory(SAMPLE_MAP.categories, 'cat_vip')?.name).toBe('VIP')
    expect(findCategory(SAMPLE_MAP.categories, null)).toBeUndefined()
    expect(findCategory(SAMPLE_MAP.categories, '')).toBeUndefined()
    expect(findCategory(SAMPLE_MAP.categories, 'cat_gone')).toBeUndefined()
  })
})

describe('collectSeats', () => {
  const seats = collectSeats(SAMPLE_MAP)

  it('lists every seat of every seated element', () => {
    const tableSeats = 8 + 8 + 6 + 6 + (4 + 1 + 4 + 1)
    expect(seats).toHaveLength(6 * 14 + 6 * 8 * 2 + tableSeats)
  })

  it('resolves category, accessibility and venue position', () => {
    const accessible = seats.find((s) => s.seat.id === 'center:5:0')!
    expect(accessible.accessible).toBe(true)
    expect(accessible.category?.id).toBe('cat_vip')

    const offSale = seats.find((s) => s.seat.id === 't5:0:4')!
    expect(offSale.category).toBeUndefined()

    const t1 = byId('t1')
    const first = seats.find((s) => s.seat.id === 't1:0:0')!
    expect(Math.hypot(first.world.x - t1.x, first.world.y - t1.y)).toBeGreaterThan(30)
  })
})

describe('seat ids', () => {
  it('maps seats back to their element', () => {
    const ids = seatIdsOf(byId('t1'))
    expect(ids).toHaveLength(8)
    expect(ids.every((id) => elementIdOfSeat(id) === 't1')).toBe(true)
  })
})
