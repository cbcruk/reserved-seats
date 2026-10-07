import type { Bounds } from './geometry.types'
import type { RowLabelMark, SeatGeometry } from './seating.types'

/** Derived geometry of one element, in coordinates relative to its center. */
export interface ElementLayout {
  /** Every seat of the element; empty for areas, shapes and text. */
  seats: SeatGeometry[]
  /** Row labels to draw; empty for everything except straight or partially curved rows. */
  rowLabels: RowLabelMark[]
  /** Unrotated box enclosing the element, including seat radius and padding. */
  bounds: Bounds
}
