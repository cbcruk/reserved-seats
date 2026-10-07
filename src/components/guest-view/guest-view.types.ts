import type { TicketCategory } from '../../seating/seating.types'

/** Something the guest has picked but not paid for yet. */
export type CartItem =
  | { kind: 'seat'; seatId: string; priceOptionId: string }
  | { kind: 'area'; areaId: string; priceOptionId: string; quantity: number }

/** A cart item resolved against the current map, ready to display or check out. */
export interface CartLine {
  /** Stable identifier of the line: the seat id, or the area element id. */
  key: string
  /** The underlying cart item, normalized to a valid price option and available quantity. */
  item: CartItem
  /** Human-readable name of the seat or area. */
  label: string
  /** Ticket category the seat or area belongs to. */
  category: TicketCategory
  /** Price of one ticket for the selected price option, in KRW. */
  unitAmount: number
  /** Number of tickets; always `1` for seats and at least `1` for areas. */
  quantity: number
}
