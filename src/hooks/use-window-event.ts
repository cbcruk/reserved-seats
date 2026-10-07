import { useEffect, useEffectEvent } from 'react'

/**
 * Listens for an event on `window` for as long as the component is mounted.
 *
 * The listener always sees the latest props and state without re-subscribing on every render.
 *
 * @example Closing on Escape
 * ```tsx
 * import { useWindowEvent } from '../../hooks/use-window-event'
 *
 * useWindowEvent('keydown', (event) => {
 *   if (event.key === 'Escape') onClose()
 * })
 * ```
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
): void {
  const onEvent = useEffectEvent(listener)

  useEffect(() => {
    const handle = (event: WindowEventMap[K]): void => onEvent(event)
    window.addEventListener(type, handle)
    return () => window.removeEventListener(type, handle)
  }, [type])
}
