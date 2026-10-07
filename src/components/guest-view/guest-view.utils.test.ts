import { describe, expect, it } from 'vite-plus/test'
import { SAMPLE_MAP, SAMPLE_SALES } from '../../seating/sample-venue'
import type { AreaElement } from '../../seating/seating.types'
import type { CartItem } from './guest-view.types'
import {
  areaRemaining,
  buildOrder,
  cartQuantity,
  describeTarget,
  priceRange,
  resolveCart,
} from './guest-view.utils'

const ga = SAMPLE_MAP.elements.find((e): e is AreaElement => e.id === 'ga')!
const standard = SAMPLE_MAP.categories.find((c) => c.id === 'cat_std')!
const vip = SAMPLE_MAP.categories.find((c) => c.id === 'cat_vip')!

describe('cart counts', () => {
  it('counts area quantities and remaining capacity', () => {
    const cart: CartItem[] = [
      { kind: 'seat', seatId: 'center:2:2', priceOptionId: 'po_vip' },
      { kind: 'area', areaId: 'ga', priceOptionId: 'po_ga', quantity: 3 },
    ]
    expect(cartQuantity(cart)).toBe(4)
    expect(areaRemaining(ga, SAMPLE_SALES)).toBe(113)
    expect(areaRemaining(ga, { ...SAMPLE_SALES, areaSold: { ga: 500 } })).toBe(0)
  })
})

describe('resolveCart', () => {
  it('drops sold, missing and off-sale seats', () => {
    const lines = resolveCart(SAMPLE_MAP, SAMPLE_SALES, [
      { kind: 'seat', seatId: 'center:0:6', priceOptionId: 'po_vip' },
      { kind: 'seat', seatId: 'gone:0:0', priceOptionId: 'po_vip' },
      { kind: 'seat', seatId: 't5:0:4', priceOptionId: 'po_table' },
      { kind: 'seat', seatId: 'center:2:2', priceOptionId: 'po_vip' },
    ])
    expect(lines.map((l) => l.key)).toEqual(['center:2:2'])
    expect(lines[0]).toMatchObject({ label: 'Center · Row C, Seat 3', unitAmount: 120000 })
  })

  it('falls back to the first price option when the chosen one was removed', () => {
    const [line] = resolveCart(SAMPLE_MAP, SAMPLE_SALES, [
      { kind: 'seat', seatId: 'left:0:0', priceOptionId: 'po_removed' },
    ])
    expect(line?.item.priceOptionId).toBe('po_std_adult')
  })

  it('caps area quantities at the remaining capacity', () => {
    const [line] = resolveCart(SAMPLE_MAP, { ...SAMPLE_SALES, areaSold: { ga: 148 } }, [
      { kind: 'area', areaId: 'ga', priceOptionId: 'po_ga', quantity: 5 },
    ])
    expect(line?.quantity).toBe(2)
    expect(
      resolveCart(SAMPLE_MAP, { ...SAMPLE_SALES, areaSold: { ga: 150 } }, [
        { kind: 'area', areaId: 'ga', priceOptionId: 'po_ga', quantity: 1 },
      ]),
    ).toEqual([])
  })
})

describe('buildOrder', () => {
  it('totals lines and records the chosen price option names', () => {
    const lines = resolveCart(SAMPLE_MAP, SAMPLE_SALES, [
      { kind: 'seat', seatId: 'left:0:0', priceOptionId: 'po_std_student' },
      { kind: 'area', areaId: 'ga', priceOptionId: 'po_ga', quantity: 2 },
    ])
    const order = buildOrder(lines)
    expect(order.total).toBe(50000 + 2 * 40000)
    expect(order.lines.map((l) => [l.kind, l.targetId, l.priceOptionName, l.quantity])).toEqual([
      ['seat', 'left:0:0', 'Student', 1],
      ['area', 'ga', 'Regular', 2],
    ])
    expect(order.id).toMatch(/^order_/)
  })
})

describe('priceRange', () => {
  it('shows a single price or a min–max range', () => {
    expect(priceRange(vip)).toBe('₩120,000')
    expect(priceRange(standard)).toBe('₩50,000 – ₩70,000')
  })
})

describe('describeTarget', () => {
  it('describes areas, sold, accessible and unknown targets', () => {
    expect(describeTarget(SAMPLE_MAP, SAMPLE_SALES, 'ga')).toBe(
      'Standing · General admission · Standing · ₩40,000 · 113 left',
    )
    expect(describeTarget(SAMPLE_MAP, SAMPLE_SALES, 'center:0:6')).toBe(
      'Center · Row A, Seat 7 · Sold',
    )
    expect(describeTarget(SAMPLE_MAP, SAMPLE_SALES, 'center:5:0')).toContain(
      'Wheelchair accessible',
    )
    expect(describeTarget(SAMPLE_MAP, SAMPLE_SALES, 't5:0:4')).toMatch(/Not available$/)
    expect(describeTarget(SAMPLE_MAP, SAMPLE_SALES, 'nope:0:0')).toBeNull()
  })
})
