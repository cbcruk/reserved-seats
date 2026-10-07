import type { PointerEvent as ReactPointerEvent } from 'react'

/** Visual state and handlers for a single seat circle. */
export interface SeatMarkProps {
  /** Horizontal center of the seat in its parent element's coordinates. */
  x: number
  /** Vertical center of the seat in its parent element's coordinates. */
  y: number
  /** CSS color of the seat circle, usually its ticket category color. */
  fill: string
  /** Seat number to draw inside the circle; `null` draws an empty circle (e.g. sold out). */
  label: string | null
  /** Replaces the label with a wheelchair glyph when a label is shown. */
  accessible: boolean
  /** Draws a selection ring around the seat. */
  selected: boolean
  /** Renders the seat faded, for seats that cannot be picked. */
  muted?: boolean
  /** Tooltip text shown on hover, e.g. "Row A, Seat 3". */
  title?: string
  /** Called on pointer down; when set, the seat shows a pointer cursor and hover outline. */
  onPointerDown?: (event: ReactPointerEvent<SVGGElement>) => void
  /** Called when the pointer moves onto the seat. */
  onPointerEnter?: () => void
  /** Called when the pointer moves off the seat. */
  onPointerLeave?: () => void
}
