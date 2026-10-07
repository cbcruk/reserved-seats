import { formatPrice } from '../../seating/currency'
import { createId } from '../../seating/ids'
import { layoutElement, seatDisplayName } from '../../seating/seat-layout'
import { elementIdOfSeat, findCategory, resolveSeatCategoryId } from '../../seating/seat-status'
import type {
  AreaElement,
  Order,
  SalesState,
  SeatingMap,
  TicketCategory,
} from '../../seating/seating.types'
import type { CartItem, CartLine } from './guest-view.types'

/** Maximum number of tickets a guest can buy in one order. */
export const MAX_TICKETS_PER_ORDER = 10

/** Returns the stable key of a cart item: the seat id, or the area element id. */
export function cartKey(item: CartItem): string {
  return item.kind === 'seat' ? item.seatId : item.areaId
}

/** Counts the tickets in a cart, including area quantities. */
export function cartQuantity(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + (item.kind === 'seat' ? 1 : item.quantity), 0)
}

/** Returns how many admissions of a general admission area are still for sale. */
export function areaRemaining(area: AreaElement, sales: SalesState): number {
  return Math.max(0, area.capacity - (sales.areaSold[area.id] ?? 0))
}

/**
 * Resolves cart items against the current map and sales.
 *
 * Items whose seat, area, category or price option no longer exists, or whose seat has been sold, are dropped.
 */
export function resolveCart(map: SeatingMap, sales: SalesState, cart: CartItem[]): CartLine[] {
  const lines: CartLine[] = []
  for (const item of cart) {
    if (item.kind === 'seat') {
      if (sales.soldSeats[item.seatId] !== undefined) continue
      const element = map.elements.find((e) => e.id === elementIdOfSeat(item.seatId))
      const seat = element && layoutElement(element).seats.find((s) => s.id === item.seatId)
      if (!element || !seat) continue
      const category = findCategory(
        map.categories,
        resolveSeatCategoryId(element, seat.id, map.seatOverrides),
      )
      const option =
        category?.priceOptions.find((o) => o.id === item.priceOptionId) ?? category?.priceOptions[0]
      if (!category || !option) continue
      lines.push({
        key: cartKey(item),
        item: { ...item, priceOptionId: option.id },
        label: seatDisplayName(element, seat),
        category,
        unitAmount: option.amount,
        quantity: 1,
      })
    } else {
      const area = map.elements.find(
        (e): e is AreaElement => e.id === item.areaId && e.kind === 'area',
      )
      const category = area && findCategory(map.categories, area.categoryId)
      const option =
        category?.priceOptions.find((o) => o.id === item.priceOptionId) ?? category?.priceOptions[0]
      if (!area || !category || !option) continue
      const quantity = Math.min(item.quantity, areaRemaining(area, sales))
      if (quantity <= 0) continue
      lines.push({
        key: cartKey(item),
        item: { ...item, priceOptionId: option.id, quantity },
        label: `${area.label} (General admission)`,
        category,
        unitAmount: option.amount,
        quantity,
      })
    }
  }
  return lines
}

/** Turns resolved cart lines into a completed order. */
export function buildOrder(lines: CartLine[]): Order {
  return {
    id: createId('order'),
    createdAt: new Date().toISOString(),
    total: lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0),
    lines: lines.map((l) => ({
      kind: l.item.kind,
      targetId: cartKey(l.item),
      label: l.label,
      categoryName: l.category.name,
      priceOptionName:
        l.category.priceOptions.find((o) => o.id === l.item.priceOptionId)?.name ?? '',
      unitAmount: l.unitAmount,
      quantity: l.quantity,
    })),
  }
}

/** Formats a category's price, or its price range when it has several price options. */
export function priceRange(category: TicketCategory): string {
  const amounts = category.priceOptions.map((o) => o.amount)
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`
}

/**
 * Describes a hovered seat or area for the status bar.
 *
 * @param id A seat id or an area element id.
 * @returns `null` when the id matches nothing on the map.
 */
export function describeTarget(map: SeatingMap, sales: SalesState, id: string): string | null {
  const area = map.elements.find((e): e is AreaElement => e.kind === 'area' && e.id === id)
  if (area) {
    const category = findCategory(map.categories, area.categoryId)
    if (!category) return `${area.label} · Not available`
    return `${area.label} · General admission · ${category.name} · ${priceRange(category)} · ${areaRemaining(area, sales)} left`
  }
  const element = map.elements.find((e) => e.id === elementIdOfSeat(id))
  const seat = element && layoutElement(element).seats.find((s) => s.id === id)
  if (!element || !seat) return null
  const name = seatDisplayName(element, seat)
  if (sales.soldSeats[id] !== undefined) return `${name} · Sold`
  const category = findCategory(
    map.categories,
    resolveSeatCategoryId(element, id, map.seatOverrides),
  )
  if (!category) return `${name} · Not available`
  const accessible = map.seatOverrides[id]?.accessible ? ' · ♿ Wheelchair accessible' : ''
  return `${name} · ${category.name} · ${priceRange(category)}${accessible}`
}
