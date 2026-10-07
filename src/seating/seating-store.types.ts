import type { Dispatch } from 'react'
import type { SalesAction } from './sales-reducer.types'
import type { HistoryAction } from './seating-reducer.types'
import type { SalesState, SeatingMap } from './seating.types'

/** Shared seating state exposed by {@linkcode useSeating}. */
export interface SeatingStore {
  /** Current seating map, i.e. the present entry of the undo history. */
  map: SeatingMap
  /** Tickets sold so far. */
  sales: SalesState
  /** Whether there is an earlier map to undo to. */
  canUndo: boolean
  /** Whether there is an undone map to redo. */
  canRedo: boolean
  /** Applies a map edit, undo, redo or checkpoint. */
  dispatch: Dispatch<HistoryAction>
  /** Records or resets ticket sales. */
  dispatchSales: Dispatch<SalesAction>
  /** Restores the bundled demo venue and its demo sales. */
  resetToSample: () => void
}

/** Shape persisted to `localStorage`. */
export interface PersistedSeating {
  /** Schema version; stored data with any other version is ignored. */
  version: 1
  /** Present seating map, without undo history. */
  map: SeatingMap
  /** Tickets sold so far. */
  sales: SalesState
}
