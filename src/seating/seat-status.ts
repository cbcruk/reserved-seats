import { toWorld } from './geometry'
import type { Point } from './geometry.types'
import { layoutElement } from './seat-layout'
import type { SeatEntry } from './seat-status.types'
import type {
  SeatGeometry,
  SeatingElement,
  SeatingMap,
  SeatOverride,
  TicketCategory,
  TicketedElement,
} from './seating.types'

/** Narrows an element to one that can carry a ticket category. */
export function isTicketed(element: SeatingElement): element is TicketedElement {
  return (
    element.kind === 'rows' ||
    element.kind === 'rect-table' ||
    element.kind === 'round-table' ||
    element.kind === 'area'
  )
}

/**
 * Resolves which ticket category a seat is sold under.
 *
 * A seat-level override wins over the element's category.
 *
 * @returns The category id, or `null` when the seat is not for sale.
 */
export function resolveSeatCategoryId(
  element: SeatingElement,
  seatId: string,
  overrides: Record<string, SeatOverride>,
): string | null {
  const override = overrides[seatId]
  if (override && override.categoryId !== undefined) return override.categoryId
  return isTicketed(element) ? element.categoryId : null
}

/** Looks up a ticket category by id, tolerating ids of deleted categories. */
export function findCategory(
  categories: TicketCategory[],
  id: string | null | undefined,
): TicketCategory | undefined {
  if (!id) return undefined
  return categories.find((c) => c.id === id)
}

/** Lists every seat on the map with its venue position and resolved ticket settings. */
export function collectSeats(map: SeatingMap): SeatEntry[] {
  const entries: SeatEntry[] = []
  for (const element of map.elements) {
    for (const seat of layoutElement(element).seats) {
      entries.push(toEntry(map, element, seat))
    }
  }
  return entries
}

function toEntry(map: SeatingMap, element: SeatingElement, seat: SeatGeometry): SeatEntry {
  const world: Point = toWorld(element, seat)
  const categoryId = resolveSeatCategoryId(element, seat.id, map.seatOverrides)
  return {
    seat,
    element,
    world,
    category: findCategory(map.categories, categoryId),
    accessible: map.seatOverrides[seat.id]?.accessible === true,
  }
}

/** Returns the ids of every seat that belongs to the given element. */
export function seatIdsOf(element: SeatingElement): string[] {
  return layoutElement(element).seats.map((s) => s.id)
}

/** Extracts the element id from a seat id of the form `elementId:row:seat`. */
export function elementIdOfSeat(seatId: string): string {
  return seatId.slice(0, seatId.indexOf(':'))
}
