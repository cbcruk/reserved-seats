import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { useLocalStorageSync } from '../hooks/use-local-storage-sync'
import { readLocalStorage } from '../hooks/use-local-storage-sync.utils'
import { salesReducer } from './sales-reducer'
import { SAMPLE_MAP, SAMPLE_SALES } from './sample-venue'
import { historyReducer } from './seating-reducer'
import type { HistoryState } from './seating-reducer.types'
import type { PersistedSeating, SeatingStore } from './seating-store.types'
import type { SalesState } from './seating.types'

const STORAGE_KEY = 'reserved-seats:v1'

function loadPersisted(): PersistedSeating | null {
  const persisted = readLocalStorage<PersistedSeating>(STORAGE_KEY)
  return persisted?.version === 1 ? persisted : null
}

function initHistory(): HistoryState {
  return { past: [], present: loadPersisted()?.map ?? SAMPLE_MAP, future: [] }
}

function initSales(): SalesState {
  return loadPersisted()?.sales ?? SAMPLE_SALES
}

const SeatingContext = createContext<SeatingStore | null>(null)

/** Provides the seating map, sales records and their dispatchers, persisted to `localStorage`. */
export function SeatingProvider({ children }: { children: ReactNode }): ReactNode {
  const [history, dispatch] = useReducer(historyReducer, undefined, initHistory)
  const [sales, dispatchSales] = useReducer(salesReducer, undefined, initSales)

  const persisted = useMemo<PersistedSeating>(
    () => ({ version: 1, map: history.present, sales }),
    [history.present, sales],
  )
  useLocalStorageSync(STORAGE_KEY, persisted)

  const resetToSample = useCallback((): void => {
    dispatch({ type: 'replace-map', map: SAMPLE_MAP })
    dispatchSales({ type: 'replace', sales: SAMPLE_SALES })
  }, [])

  const value = useMemo<SeatingStore>(
    () => ({
      map: history.present,
      sales,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      dispatch,
      dispatchSales,
      resetToSample,
    }),
    [history, sales, resetToSample],
  )

  return <SeatingContext.Provider value={value}>{children}</SeatingContext.Provider>
}

/** Reads the seating store; must be called under {@linkcode SeatingProvider}. */
export function useSeating(): SeatingStore {
  const store = useContext(SeatingContext)
  if (!store) throw new Error('useSeating must be used within SeatingProvider')
  return store
}
