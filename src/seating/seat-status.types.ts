import type { Point } from './geometry.types'
import type { SeatGeometry, SeatingElement, TicketCategory } from './seating.types'

/** A seat together with its owning element, venue position and resolved ticket settings. */
export interface SeatEntry {
  /** Seat geometry in element-local coordinates. */
  seat: SeatGeometry
  /** Element that owns the seat. */
  element: SeatingElement
  /** Seat center in venue coordinates, with the element's position and rotation applied. */
  world: Point
  /** `undefined` when the seat has no (existing) category and cannot be sold. */
  category: TicketCategory | undefined
  /** Whether a seat override marks the seat as wheelchair accessible. */
  accessible: boolean
}
