import { elementIdOfSeat, isTicketed } from './seat-status'
import type { HistoryAction, HistoryState, MapAction } from './seating-reducer.types'
import type { SeatingElement, SeatingMap, SeatOverride } from './seating.types'

/** Maximum number of ticket categories per map, matching the Wix Events limit. */
export const MAX_CATEGORIES = 50

const HISTORY_LIMIT = 100

function withoutElementOverrides(
  overrides: Record<string, SeatOverride>,
  elementIds: Set<string>,
  field?: keyof SeatOverride,
): Record<string, SeatOverride> {
  const next: Record<string, SeatOverride> = {}
  for (const [seatId, override] of Object.entries(overrides)) {
    if (!elementIds.has(elementIdOfSeat(seatId))) {
      next[seatId] = override
      continue
    }
    if (!field) continue
    const { [field]: _removed, ...rest } = override
    if (Object.keys(rest).length > 0) next[seatId] = rest
  }
  return next
}

/** Applies a single edit to a seating map and returns the new map, or the same map when nothing changed. */
export function mapReducer(map: SeatingMap, action: MapAction): SeatingMap {
  switch (action.type) {
    case 'add-elements':
      return { ...map, elements: [...map.elements, ...action.elements] }

    case 'update-element':
      return {
        ...map,
        elements: map.elements.map((e) =>
          e.id === action.id ? ({ ...e, ...action.patch } as SeatingElement) : e,
        ),
      }

    case 'move-elements': {
      if (action.dx === 0 && action.dy === 0) return map
      const ids = new Set(action.ids)
      return {
        ...map,
        elements: map.elements.map((e) =>
          ids.has(e.id) ? { ...e, x: e.x + action.dx, y: e.y + action.dy } : e,
        ),
      }
    }

    case 'delete-elements': {
      const ids = new Set(action.ids)
      return {
        ...map,
        elements: map.elements.filter((e) => !ids.has(e.id)),
        seatOverrides: withoutElementOverrides(map.seatOverrides, ids),
      }
    }

    case 'assign-category': {
      const ids = new Set(action.elementIds)
      return {
        ...map,
        elements: map.elements.map((e) =>
          ids.has(e.id) && isTicketed(e) ? { ...e, categoryId: action.categoryId } : e,
        ),
        seatOverrides: withoutElementOverrides(map.seatOverrides, ids, 'categoryId'),
      }
    }

    case 'update-seats': {
      const seatOverrides = { ...map.seatOverrides }
      for (const id of action.seatIds) seatOverrides[id] = { ...seatOverrides[id], ...action.patch }
      return { ...map, seatOverrides }
    }

    case 'reset-seats': {
      const seatOverrides = { ...map.seatOverrides }
      for (const id of action.seatIds) delete seatOverrides[id]
      return { ...map, seatOverrides }
    }

    case 'upsert-category': {
      const exists = map.categories.some((c) => c.id === action.category.id)
      if (!exists && map.categories.length >= MAX_CATEGORIES) return map
      return {
        ...map,
        categories: exists
          ? map.categories.map((c) => (c.id === action.category.id ? action.category : c))
          : [...map.categories, action.category],
      }
    }

    case 'delete-category': {
      const seatOverrides: Record<string, SeatOverride> = {}
      for (const [seatId, override] of Object.entries(map.seatOverrides)) {
        seatOverrides[seatId] =
          override.categoryId === action.id ? { ...override, categoryId: undefined } : override
      }
      return {
        ...map,
        categories: map.categories.filter((c) => c.id !== action.id),
        elements: map.elements.map((e) =>
          isTicketed(e) && e.categoryId === action.id ? { ...e, categoryId: null } : e,
        ),
        seatOverrides,
      }
    }

    case 'update-settings':
      return { ...map, ...action.patch }

    case 'replace-map':
      return action.map
  }
}

/** Applies map edits while maintaining undo and redo stacks. */
export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'undo': {
      const previous = state.past[state.past.length - 1]
      if (!previous) return state
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case 'redo': {
      const next = state.future[0]
      if (!next) return state
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) }
    }
    case 'checkpoint':
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: state.present,
        future: [],
      }
    default: {
      const next = mapReducer(state.present, action)
      if (next === state.present) return state
      if (action.record === false) return { ...state, present: next }
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      }
    }
  }
}
