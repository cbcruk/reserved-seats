import { useEffect } from 'react'

/**
 * Writes a value to `localStorage` as JSON whenever it changes.
 *
 * Pass a memoized value; a new object on every render rewrites storage on every render.
 * Write failures (private mode, full quota) are ignored so the app keeps working in memory.
 */
export function useLocalStorageSync(key: string, value: unknown): void {
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage may be unavailable (private mode, quota); the app keeps working in memory.
    }
  }, [key, value])
}
