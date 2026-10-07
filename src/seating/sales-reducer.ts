import type { SalesAction } from './sales-reducer.types'
import type { SalesState } from './seating.types'

/** Sales state of an event before any ticket has been sold. */
export const EMPTY_SALES: SalesState = { soldSeats: {}, areaSold: {}, orders: [] }

/** Records completed orders as sold seats and area admissions. */
export function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case 'checkout': {
      const soldSeats = { ...state.soldSeats }
      const areaSold = { ...state.areaSold }
      for (const line of action.order.lines) {
        if (line.kind === 'seat') soldSeats[line.targetId] = action.order.id
        else areaSold[line.targetId] = (areaSold[line.targetId] ?? 0) + line.quantity
      }
      return { soldSeats, areaSold, orders: [...state.orders, action.order] }
    }
    case 'reset':
      return EMPTY_SALES
    case 'replace':
      return action.sales
  }
}
