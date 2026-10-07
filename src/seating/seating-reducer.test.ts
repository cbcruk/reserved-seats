import { describe, expect, it } from 'vite-plus/test'
import { historyReducer, MAX_CATEGORIES, mapReducer } from './seating-reducer'
import { SAMPLE_MAP } from './sample-venue'
import { resolveSeatCategoryId } from './seat-status'
import type { HistoryState } from './seating-reducer.types'

const center = SAMPLE_MAP.elements.find((e) => e.id === 'center')!

describe('mapReducer', () => {
  it('returns the same map for a move by zero', () => {
    expect(mapReducer(SAMPLE_MAP, { type: 'move-elements', ids: ['stage'], dx: 0, dy: 0 })).toBe(
      SAMPLE_MAP,
    )
  })

  it('removes every override of reset seats', () => {
    const map = mapReducer(SAMPLE_MAP, { type: 'reset-seats', seatIds: ['center:5:0', 't5:0:4'] })
    expect(map.seatOverrides['center:5:0']).toBeUndefined()
    expect(map.seatOverrides['t5:0:4']).toBeUndefined()
    expect(map.seatOverrides['center:5:1']).toEqual({ accessible: true })
  })

  it('updates an existing category in place and appends new ones', () => {
    const renamed = { ...SAMPLE_MAP.categories[0]!, name: 'Premium' }
    const updated = mapReducer(SAMPLE_MAP, { type: 'upsert-category', category: renamed })
    expect(updated.categories[0]?.name).toBe('Premium')
    expect(updated.categories).toHaveLength(SAMPLE_MAP.categories.length)

    const added = mapReducer(SAMPLE_MAP, {
      type: 'upsert-category',
      category: { ...renamed, id: 'cat_new' },
    })
    expect(added.categories.at(-1)?.id).toBe('cat_new')
  })

  it('refuses new categories beyond the limit', () => {
    const template = SAMPLE_MAP.categories[0]!
    const full = {
      ...SAMPLE_MAP,
      categories: Array.from({ length: MAX_CATEGORIES }, (_, i) => ({ ...template, id: `c${i}` })),
    }
    expect(
      mapReducer(full, { type: 'upsert-category', category: { ...template, id: 'one_more' } }),
    ).toBe(full)
  })

  it('patches map settings', () => {
    expect(
      mapReducer(SAMPLE_MAP, { type: 'update-settings', patch: { name: 'Hall B' } }).name,
    ).toBe('Hall B')
  })

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

  it('ignores undo and redo with empty stacks and edits that change nothing', () => {
    expect(historyReducer(initial, { type: 'undo' })).toBe(initial)
    expect(historyReducer(initial, { type: 'redo' })).toBe(initial)
    expect(historyReducer(initial, { type: 'move-elements', ids: ['stage'], dx: 0, dy: 0 })).toBe(
      initial,
    )
  })

  it('caps the undo history at 100 entries', () => {
    let state = initial
    for (let i = 0; i < 120; i++)
      state = historyReducer(state, { type: 'move-elements', ids: ['stage'], dx: 1, dy: 0 })
    expect(state.past).toHaveLength(100)
  })

  it('clears redo after a new edit', () => {
    const undone = historyReducer(
      historyReducer(initial, { type: 'move-elements', ids: ['stage'], dx: 1, dy: 0 }),
      { type: 'undo' },
    )
    const edited = historyReducer(undone, { type: 'move-elements', ids: ['bar'], dx: 1, dy: 0 })
    expect(edited.future).toEqual([])
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
