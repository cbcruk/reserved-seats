import * as stylex from '@stylexjs/stylex'
import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useViewport } from '../../hooks/use-viewport'
import { formatPrice } from '../../seating/currency'
import { seatDisplayName } from '../../seating/seat-layout'
import { findCategory, isTicketed, resolveSeatCategoryId } from '../../seating/seat-status'
import { useSeating } from '../../seating/seating-store'
import type { AreaElement, Order, SeatGeometry, SeatingElement } from '../../seating/seating.types'
import { breakpoints } from '../../styles/tokens.stylex'
import { canvasStyles } from '../canvas/canvas.styles'
import { Cart, OrderConfirmation } from '../cart/cart'
import { ElementView } from '../element-view/element-view'
import { layoutStyles } from '../layout/layout.styles'
import { SeatMark } from '../seat-mark/seat-mark'
import { Swatch } from '../swatch/swatch'
import { ZoomControls } from '../zoom-controls/zoom-controls'
import type { CartItem } from './guest-view.types'
import {
  areaRemaining,
  buildOrder,
  cartKey,
  cartQuantity,
  describeTarget,
  MAX_TICKETS_PER_ORDER,
  resolveCart,
} from './guest-view.utils'

const SOLD_FILL = '#d1d5db'
const UNAVAILABLE_FILL = '#eef2f7'
const SELECTED_FILL = '#0f172a'

const styles = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 340px', [breakpoints.compact]: '1fr' },
    gridTemplateRows: { default: null, [breakpoints.compact]: '1fr auto' },
    minHeight: 0,
  },
  legend: {
    gap: '8px 16px',
    paddingInline: 16,
    fontSize: 12,
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
})

/** The published, guest-facing map where visitors pick seats or standing tickets and check out. */
export function GuestView(): ReactNode {
  const { map, sales, dispatchSales } = useSeating()
  const viewport = useViewport(map.width, map.height)
  const [cart, setCart] = useState<CartItem[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Order | null>(null)

  const lines = resolveCart(map, sales, cart)
  const validCart = lines.map((l) => l.item)
  const ticketsLeft = MAX_TICKETS_PER_ORDER - cartQuantity(validCart)
  const inCart = new Set(validCart.map(cartKey))

  const remainingByArea: Record<string, number> = {}
  for (const element of map.elements) {
    if (element.kind === 'area') remainingByArea[element.id] = areaRemaining(element, sales)
  }

  const flash = (text: string): void => {
    setMessage(text)
    window.setTimeout(() => setMessage((current) => (current === text ? null : current)), 2500)
  }

  const toggleSeat = (element: SeatingElement, seat: SeatGeometry): void => {
    if (inCart.has(seat.id)) {
      setCart(validCart.filter((item) => cartKey(item) !== seat.id))
      return
    }
    if (ticketsLeft <= 0) {
      flash(`You can book up to ${MAX_TICKETS_PER_ORDER} tickets per order.`)
      return
    }
    const category = findCategory(
      map.categories,
      resolveSeatCategoryId(element, seat.id, map.seatOverrides),
    )
    const option = category?.priceOptions[0]
    if (!option) return
    setCart([...validCart, { kind: 'seat', seatId: seat.id, priceOptionId: option.id }])
  }

  const addAreaTicket = (area: AreaElement): void => {
    const category = findCategory(map.categories, area.categoryId)
    const option = category?.priceOptions[0]
    const remaining = remainingByArea[area.id] ?? 0
    if (!option) return
    if (ticketsLeft <= 0) {
      flash(`You can book up to ${MAX_TICKETS_PER_ORDER} tickets per order.`)
      return
    }
    const existing = validCart.find((item) => item.kind === 'area' && item.areaId === area.id)
    const quantity = existing?.kind === 'area' ? existing.quantity : 0
    if (quantity >= remaining) {
      flash(`${area.label} is sold out.`)
      return
    }
    setCart(
      existing
        ? validCart.map((item) =>
            item === existing && item.kind === 'area' ? { ...item, quantity: quantity + 1 } : item,
          )
        : [...validCart, { kind: 'area', areaId: area.id, priceOptionId: option.id, quantity: 1 }],
    )
  }

  const checkout = (): void => {
    if (lines.length === 0) return
    const order = buildOrder(lines)
    dispatchSales({ type: 'checkout', order })
    setCart([])
    setConfirmed(order)
  }

  const onBackgroundPointerDown = (e: ReactPointerEvent<SVGSVGElement>): void => {
    if (e.button === 0 || e.button === 1) viewport.beginPan(e)
  }

  const hoveredInfo = hovered ? describeTarget(map, sales, hovered) : null

  return (
    <div {...stylex.props(styles.root)}>
      <main {...stylex.props(layoutStyles.stage)}>
        <div {...stylex.props(layoutStyles.bar, styles.legend)}>
          {map.categories.map((c) => (
            <span key={c.id} {...stylex.props(styles.legendItem)}>
              <Swatch color={c.color} />
              {c.name} · {formatPrice(Math.min(...c.priceOptions.map((o) => o.amount)))}
              {c.priceOptions.length > 1 && '+'}
            </span>
          ))}
          <span {...stylex.props(styles.legendItem)}>
            <Swatch color={SOLD_FILL} />
            Sold
          </span>
          <span {...stylex.props(styles.legendItem)}>♿ Wheelchair accessible</span>
        </div>
        <div {...stylex.props(canvasStyles.frame)}>
          <svg
            ref={viewport.svgRef}
            viewBox={viewport.viewBox}
            onPointerDown={onBackgroundPointerDown}
            {...stylex.props(canvasStyles.svg, canvasStyles.cursor('grab'))}
          >
            <rect
              width={map.width}
              height={map.height}
              fill={map.background}
              {...stylex.props(canvasStyles.venue)}
            />
            {map.elements.map((element) => {
              const elementCategory = isTicketed(element)
                ? findCategory(map.categories, element.categoryId)
                : undefined
              const isArea = element.kind === 'area'
              const remaining = remainingByArea[element.id] ?? 0
              const areaInCart = validCart.find((i) => i.kind === 'area' && i.areaId === element.id)
              return (
                <g
                  key={element.id}
                  onPointerEnter={isArea ? () => setHovered(element.id) : undefined}
                  onPointerLeave={isArea ? () => setHovered(null) : undefined}
                >
                  <ElementView
                    element={element}
                    categoryColor={elementCategory?.color}
                    selected={false}
                    areaActive={areaInCart !== undefined}
                    areaCaption={
                      isArea
                        ? remaining === 0
                          ? 'Sold out'
                          : `${remaining} left${areaInCart?.kind === 'area' ? ` · ${areaInCart.quantity} in cart` : ''}`
                        : undefined
                    }
                    onPointerDown={
                      element.kind === 'area' && elementCategory && remaining > 0
                        ? (e) => {
                            if (e.button !== 0) return
                            e.stopPropagation()
                            addAreaTicket(element)
                          }
                        : undefined
                    }
                    renderSeat={(seat) => {
                      const category = findCategory(
                        map.categories,
                        resolveSeatCategoryId(element, seat.id, map.seatOverrides),
                      )
                      const sold = sales.soldSeats[seat.id] !== undefined
                      const available = category !== undefined && !sold
                      const selected = inCart.has(seat.id)
                      const accessible = map.seatOverrides[seat.id]?.accessible === true
                      const name = seatDisplayName(element, seat)
                      return (
                        <SeatMark
                          x={seat.x}
                          y={seat.y}
                          fill={
                            selected
                              ? SELECTED_FILL
                              : sold
                                ? SOLD_FILL
                                : category
                                  ? category.color
                                  : UNAVAILABLE_FILL
                          }
                          label={available || selected ? seat.seatLabel : null}
                          accessible={accessible && available}
                          selected={selected}
                          muted={!available}
                          title={
                            sold
                              ? `${name} · Sold`
                              : category
                                ? `${name} · ${category.name}`
                                : `${name} · Not available`
                          }
                          onPointerEnter={() => setHovered(seat.id)}
                          onPointerLeave={() => setHovered(null)}
                          onPointerDown={
                            available
                              ? (e) => {
                                  if (e.button !== 0) return
                                  e.stopPropagation()
                                  toggleSeat(element, seat)
                                }
                              : undefined
                          }
                        />
                      )
                    }}
                  />
                </g>
              )
            })}
          </svg>
          <ZoomControls viewport={viewport} />
          {(message ?? hoveredInfo) && (
            <p
              {...stylex.props(
                canvasStyles.overlay,
                canvasStyles.status,
                message !== null && canvasStyles.warn,
              )}
            >
              {message ?? hoveredInfo}
            </p>
          )}
        </div>
      </main>
      <aside {...stylex.props(layoutStyles.sidePanel)}>
        <div {...stylex.props(layoutStyles.sidePanelBody)}>
          {confirmed ? (
            <OrderConfirmation order={confirmed} onDone={() => setConfirmed(null)} />
          ) : (
            <Cart
              lines={lines}
              areaRemaining={remainingByArea}
              ticketsLeft={ticketsLeft}
              onChangePriceOption={(key, priceOptionId) =>
                setCart(
                  validCart.map((item) =>
                    cartKey(item) === key ? { ...item, priceOptionId } : item,
                  ),
                )
              }
              onChangeQuantity={(key, quantity) => {
                if (quantity <= 0) setCart(validCart.filter((item) => cartKey(item) !== key))
                else
                  setCart(
                    validCart.map((item) =>
                      cartKey(item) === key && item.kind === 'area' ? { ...item, quantity } : item,
                    ),
                  )
              }}
              onRemove={(key) => setCart(validCart.filter((item) => cartKey(item) !== key))}
              onCheckout={checkout}
            />
          )}
        </div>
      </aside>
    </div>
  )
}
