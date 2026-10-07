import type { Order, SalesState } from './seating.types'

/** A change to the event's sales records. */
export type SalesAction =
  | { type: 'checkout'; order: Order }
  | { type: 'reset' }
  | { type: 'replace'; sales: SalesState }
