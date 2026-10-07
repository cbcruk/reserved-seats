import { describe, expect, it } from 'vite-plus/test'
import { EMPTY_SALES, salesReducer } from './sales-reducer'
import { SAMPLE_SALES } from './sample-venue'
import type { Order } from './seating.types'

const order: Order = {
  id: 'order_1',
  createdAt: '2026-10-07T00:00:00.000Z',
  total: 160000,
  lines: [
    {
      kind: 'seat',
      targetId: 'center:2:3',
      label: 'Center · Row C, Seat 4',
      categoryName: 'VIP',
      priceOptionName: 'Regular',
      unitAmount: 120000,
      quantity: 1,
    },
    {
      kind: 'area',
      targetId: 'ga',
      label: 'Standing (General admission)',
      categoryName: 'Standing',
      priceOptionName: 'Regular',
      unitAmount: 40000,
      quantity: 1,
    },
  ],
}

describe('salesReducer', () => {
  it('marks seats sold by the order and adds area admissions to earlier sales', () => {
    const sales = salesReducer(SAMPLE_SALES, { type: 'checkout', order })
    expect(sales.soldSeats['center:2:3']).toBe('order_1')
    expect(sales.soldSeats['center:0:6']).toBe('order_demo')
    expect(sales.areaSold['ga']).toBe(38)
    expect(sales.orders).toEqual([order])
  })

  it('starts an area count from zero on its first sale', () => {
    const sales = salesReducer(EMPTY_SALES, { type: 'checkout', order })
    expect(sales.areaSold['ga']).toBe(1)
  })

  it('does not mutate the previous state', () => {
    salesReducer(EMPTY_SALES, { type: 'checkout', order })
    expect(EMPTY_SALES).toEqual({ soldSeats: {}, areaSold: {}, orders: [] })
  })

  it('resets to no sales and replaces the whole state', () => {
    expect(salesReducer(SAMPLE_SALES, { type: 'reset' })).toBe(EMPTY_SALES)
    expect(salesReducer(EMPTY_SALES, { type: 'replace', sales: SAMPLE_SALES })).toBe(SAMPLE_SALES)
  })
})
