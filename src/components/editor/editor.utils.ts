import type { SelectionMode } from './editor.types'

/** Combines a pick with the current selection according to the selection mode. */
export function applySelection(current: string[], ids: string[], mode: SelectionMode): string[] {
  if (mode === 'replace') return ids
  if (mode === 'add') return [...new Set([...current, ...ids])]
  const set = new Set(current)
  for (const id of ids) {
    if (set.has(id)) set.delete(id)
    else set.add(id)
  }
  return [...set]
}

/** Checks whether a keyboard event comes from a form control, where editor shortcuts must not fire. */
export function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
  )
}
