/**
 * Reads and parses a JSON value from `localStorage`.
 *
 * The parsed value is not validated; check its shape before trusting it.
 *
 * @returns The parsed value, or `null` when the key is missing, unreadable or not valid JSON.
 */
export function readLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
