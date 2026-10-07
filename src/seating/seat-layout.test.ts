import { describe, expect, it } from 'vite-plus/test'
import { createElement } from './element-factory'
import { layoutElement } from './seat-layout'
import type { RectTableElement, RowsElement } from './seating.types'

function rows(patch: Partial<RowsElement>): RowsElement {
  return { ...(createElement('rows', { x: 0, y: 0 }, []) as RowsElement), ...patch }
}

describe('layoutElement', () => {
  it('creates one seat per row position with row and seat labels', () => {
    const layout = layoutElement(rows({ rowCount: 2, seatsPerRow: 3 }))
    expect(layout.seats).toHaveLength(6)
    expect(layout.seats.map((s) => `${s.rowLabel}${s.seatLabel}`)).toEqual([
      'A1',
      'A2',
      'A3',
      'B1',
      'B2',
      'B3',
    ])
  })

  it('centers straight rows on the element origin', () => {
    const layout = layoutElement(rows({ rowCount: 1, seatsPerRow: 3, seatSpacing: 20 }))
    expect(layout.seats.map((s) => s.x)).toEqual([-20, 0, 20])
  })

  it('bends curved rows so the ends sit closer to the stage', () => {
    const layout = layoutElement(rows({ rowCount: 1, seatsPerRow: 9, curve: 90 }))
    const [first, middle] = [layout.seats[0]!, layout.seats[4]!]
    expect(first.y).toBeLessThan(middle.y)
    expect(first.x).toBeLessThan(0)
  })

  it('places full-circle rows evenly without row labels', () => {
    const layout = layoutElement(rows({ rowCount: 1, seatsPerRow: 4, curve: 360 }))
    expect(layout.seats).toHaveLength(4)
    expect(layout.rowLabels).toHaveLength(0)
  })

  it('numbers rectangular table chairs clockwise', () => {
    const table = {
      ...createElement('rect-table', { x: 0, y: 0 }, []),
      seats: { top: 2, right: 1, bottom: 2, left: 0 },
    } as RectTableElement
    const seats = layoutElement(table).seats
    expect(seats).toHaveLength(5)
    expect(seats[2]!.x).toBeGreaterThan(table.width / 2)
    expect(seats[3]!.x).toBeGreaterThan(seats[4]!.x)
  })
})
