import type { Order } from '../../seating/seating.types'
import type { CartLine } from '../guest-view/guest-view.types'

/** Props of {@linkcode Cart}. */
export interface CartProps {
  /** Resolved cart lines in display order; an empty list shows the empty-cart hint. */
  lines: CartLine[]
  /** Area ids mapped to their remaining capacity, for quantity limits. */
  areaRemaining: Record<string, number>
  /** Tickets the guest can still add under the per-order limit; `0` disables adding more. */
  ticketsLeft: number
  /** Called when the guest picks another price option for the line with the given key. */
  onChangePriceOption: (key: string, priceOptionId: string) => void
  /** Called with the requested quantity of an area line; `0` or less means remove it. */
  onChangeQuantity: (key: string, quantity: number) => void
  /** Called when the guest removes the line with the given key. */
  onRemove: (key: string) => void
  /** Called when the guest presses Checkout; only reachable while the cart has lines. */
  onCheckout: () => void
}

/** Props of {@linkcode OrderConfirmation}. */
export interface OrderConfirmationProps {
  /** The order that was just placed. */
  order: Order
  /** Called when the guest chooses to book more tickets. */
  onDone: () => void
}
