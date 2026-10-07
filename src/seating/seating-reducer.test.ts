import { describe, expect, it } from 'vite-plus/test'
import { historyReducer, mapReducer } from './seating-reducer'
import { SAMPLE_MAP } from './sample-venue'
import { resolveSeatCategoryId } from './seat-status'
import type { HistoryState } from './seating-reducer.types'

const center = SAMPLE_MAP.elements.find((e) => e.id === 'center')!

describe('mapReducer', () => {
  it('lets a seat override win over the element category', () => {
    const map = mapReducer(SAMPLE_MAP, {
      type: 'update-seats',
      seatIds: ['center:0:0'],
      patch: { categoryId: 'cat_std' },
    })
    expect(resolveSeatCategoryId(center, 'center:0:0', map.seatOverrides)).toBe('cat_std')
    expect(resolveSeatCategoryId(center, 'center:0:1', map.seatOverrides)).toBe('cat_vip')
  })

  it('clears seat category overrides but keeps accessibility when assigning a whole element', () => {
    let map = mapReducer(SAMPLE_MAP, {
      type: 'update-seats',
      seatIds: ['center:5:0'],
      patch: { categoryId: 'cat_std' },
    })
    map = mapReducer(map, {
      type: 'assign-category',
      elementIds: ['center'],
      categoryId: 'cat_table',
    })
    expect(map.seatOverrides['center:5:0']).toEqual({ accessible: true })
    expect(
      resolveSeatCategoryId(
        map.elements.find((e) => e.id === 'center')!,
        'center:5:0',
        map.seatOverrides,
      ),
    ).toBe('cat_table')
  })

  it('unassigns elements and seats when a category is deleted', () => {
    const map = mapReducer(SAMPLE_MAP, { type: 'delete-category', id: 'cat_vip' })
    const updated = map.elements.find((e) => e.id === 'center')!
    expect(resolveSeatCategoryId(updated, 'center:0:0', map.seatOverrides)).toBeNull()
  })

  it('drops seat overrides of deleted elements', () => {
    const map = mapReducer(SAMPLE_MAP, { type: 'delete-elements', ids: ['center'] })
    expect(Object.keys(map.seatOverrides).some((id) => id.startsWith('center:'))).toBe(false)
  })
})

describe('historyReducer', () => {
  const initial: HistoryState = { past: [], present: SAMPLE_MAP, future: [] }

  it('undoes and redoes edits', () => {
    const edited = historyReducer(initial, {
      type: 'move-elements',
      ids: ['stage'],
      dx: 10,
      dy: 0,
    })
    const undone = historyReducer(edited, { type: 'undo' })
    expect(undone.present).toBe(SAMPLE_MAP)
    expect(historyReducer(undone, { type: 'redo' }).present).toBe(edited.present)
  })

  it('groups unrecorded edits behind a single checkpoint', () => {
    let state = historyReducer(initial, { type: 'checkpoint' })
    state = historyReducer(state, {
      type: 'move-elements',
      ids: ['stage'],
      dx: 5,
      dy: 0,
      record: false,
    })
    state = historyReducer(state, {
      type: 'move-elements',
      ids: ['stage'],
      dx: 5,
      dy: 0,
      record: false,
    })
    expect(state.past).toHaveLength(1)
    expect(historyReducer(state, { type: 'undo' }).present).toBe(SAMPLE_MAP)
  })
})
