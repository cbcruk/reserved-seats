import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { SeatGeometry, SeatingElement } from '../../seating/seating.types'

/** Inputs for rendering one map element; seat rendering is delegated to the caller. */
export interface ElementViewProps {
  /** Element to draw. */
  element: SeatingElement
  /** Color of the element's ticket category, used to tint tables and areas. */
  categoryColor: string | undefined
  /** Draws a dashed outline around the element's bounds. */
  selected: boolean
  /** Renders one seat, positioned in the element's local coordinates. */
  renderSeat: (seat: SeatGeometry) => ReactNode
  /** Secondary line drawn under an area's name, e.g. remaining capacity. */
  areaCaption?: string
  /** Highlights an area as part of the guest's cart. */
  areaActive?: boolean
  /** Called on pointer down on the element; when set, the element shows a pointer cursor. */
  onPointerDown?: (event: ReactPointerEvent<SVGGElement>) => void
}
