import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { formatPrice } from '../../seating/currency'
import { colors } from '../../styles/tokens.stylex'
import { Button } from '../button/button'
import { Select } from '../form-fields/form-fields'
import { MAX_TICKETS_PER_ORDER } from '../guest-view/guest-view.utils'
import { IconButton } from '../icon-button/icon-button'
import { Hint, PanelHeader } from '../panel/panel'
import { Swatch } from '../swatch/swatch'
import type { CartProps, OrderConfirmationProps } from './cart.types'

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minHeight: '100%',
  },
  count: {
    color: colors.muted,
    fontVariantNumeric: 'tabular-nums',
  },
  lines: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    paddingBlock: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  swatch: {
    marginTop: 3,
  },
  info: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
  },
  amount: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  stepper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
  },
  quantity: {
    minWidth: 18,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 12,
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
  },
})

/** Lists the guest's picked tickets with price options, quantities and the order total. */
export function Cart(props: CartProps): ReactNode {
  const { lines, areaRemaining, ticketsLeft } = props
  const total = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0)
  const count = lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <div {...stylex.props(styles.root)}>
      <PanelHeader title="Your tickets">
        <span {...stylex.props(styles.count)}>
          {count} / {MAX_TICKETS_PER_ORDER}
        </span>
      </PanelHeader>

      {lines.length === 0 ? (
        <Hint>
          Select available seats on the map, or click a standing area to add general admission
          tickets.
        </Hint>
      ) : (
        <ul {...stylex.props(styles.lines)}>
          {lines.map((line) => (
            <li key={line.key} {...stylex.props(styles.line)}>
              <Swatch color={line.category.color} xstyle={styles.swatch} />
              <div {...stylex.props(styles.info)}>
                <strong>{line.label}</strong>
                <span {...stylex.props(styles.meta)}>{line.category.name}</span>
                {line.category.priceOptions.length > 1 && (
                  <Select
                    size="sm"
                    aria-label="Price option"
                    value={line.item.priceOptionId}
                    onChange={(e) => props.onChangePriceOption(line.key, e.target.value)}
                  >
                    {line.category.priceOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} · {formatPrice(o.amount)}
                      </option>
                    ))}
                  </Select>
                )}
                {line.item.kind === 'area' && (
                  <div {...stylex.props(styles.stepper)}>
                    <IconButton
                      aria-label="Fewer"
                      onClick={() => props.onChangeQuantity(line.key, line.quantity - 1)}
                    >
                      −
                    </IconButton>
                    <span {...stylex.props(styles.quantity)}>{line.quantity}</span>
                    <IconButton
                      aria-label="More"
                      disabled={
                        ticketsLeft === 0 || line.quantity >= (areaRemaining[line.item.areaId] ?? 0)
                      }
                      onClick={() => props.onChangeQuantity(line.key, line.quantity + 1)}
                    >
                      +
                    </IconButton>
                  </div>
                )}
              </div>
              <span {...stylex.props(styles.amount)}>
                {formatPrice(line.unitAmount * line.quantity)}
              </span>
              <IconButton
                aria-label={`Remove ${line.label}`}
                onClick={() => props.onRemove(line.key)}
              >
                ×
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <footer {...stylex.props(styles.footer)}>
        <div {...stylex.props(styles.total)}>
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <Button block disabled={lines.length === 0} onClick={props.onCheckout}>
          Checkout
        </Button>
      </footer>
    </div>
  )
}

/** Thank-you screen summarizing a just-completed order. */
export function OrderConfirmation({ order, onDone }: OrderConfirmationProps): ReactNode {
  return (
    <div {...stylex.props(styles.root)}>
      <PanelHeader title="Booking confirmed" />
      <Hint>Order {order.id}</Hint>
      <ul {...stylex.props(styles.lines)}>
        {order.lines.map((line) => (
          <li key={line.targetId} {...stylex.props(styles.line)}>
            <div {...stylex.props(styles.info)}>
              <strong>{line.label}</strong>
              <span {...stylex.props(styles.meta)}>
                {line.categoryName}
                {line.priceOptionName && ` · ${line.priceOptionName}`}
                {line.quantity > 1 && ` × ${line.quantity}`}
              </span>
            </div>
            <span {...stylex.props(styles.amount)}>
              {formatPrice(line.unitAmount * line.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <footer {...stylex.props(styles.footer)}>
        <div {...stylex.props(styles.total)}>
          <span>Paid</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
        <Button block onClick={onDone}>
          Book more tickets
        </Button>
      </footer>
    </div>
  )
}
