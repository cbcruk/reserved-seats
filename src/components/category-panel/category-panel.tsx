import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { formatPrice } from '../../seating/currency'
import { createId } from '../../seating/ids'
import { collectSeats } from '../../seating/seat-status'
import { MAX_CATEGORIES } from '../../seating/seating-reducer'
import { useSeating } from '../../seating/seating-store'
import type { TicketCategory } from '../../seating/seating.types'
import { colors, radii } from '../../styles/tokens.stylex'
import { Button } from '../button/button'
import { ColorInput, Input } from '../form-fields/form-fields'
import { IconButton } from '../icon-button/icon-button'
import { Hint, Panel, PanelHeader } from '../panel/panel'
import { nextCategoryColor } from './category-panel.utils'

const styles = stylex.create({
  category: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  price: {
    width: 96,
    flexShrink: 0,
  },
  addOption: {
    alignSelf: 'flex-start',
  },
  meta: {
    margin: 0,
    fontSize: 12,
    color: colors.muted,
  },
})

/** Creates, edits and deletes ticket categories and their price options. */
export function CategoryPanel(): ReactNode {
  const { map, sales, dispatch } = useSeating()
  const seats = collectSeats(map)
  const save = (category: TicketCategory): void => dispatch({ type: 'upsert-category', category })

  const addCategory = (): void => {
    save({
      id: createId('cat'),
      name: `Ticket ${map.categories.length + 1}`,
      color: nextCategoryColor(map.categories.map((c) => c.color)),
      priceOptions: [{ id: createId('po'), name: 'Regular', amount: 50000 }],
    })
  }

  const usage = (category: TicketCategory): string => {
    const assigned = seats.filter((s) => s.category?.id === category.id)
    const sold = assigned.filter((s) => sales.soldSeats[s.seat.id] !== undefined).length
    const areas = map.elements.filter((e) => e.kind === 'area' && e.categoryId === category.id)
    const parts = [`${assigned.length} seats`, `${sold} sold`]
    if (areas.length > 0) parts.push(`${areas.length} GA area${areas.length === 1 ? '' : 's'}`)
    return parts.join(' · ')
  }

  return (
    <Panel>
      <PanelHeader title="Tickets">
        <Button disabled={map.categories.length >= MAX_CATEGORIES} onClick={addCategory}>
          + Add ticket
        </Button>
      </PanelHeader>
      <Hint>
        Assign tickets to rows, tables and areas with the Selection tool, or to single seats with
        the Seats tool. Up to {MAX_CATEGORIES} tickets per map.
      </Hint>

      {map.categories.map((category) => (
        <section key={category.id} {...stylex.props(styles.category)}>
          <div {...stylex.props(styles.row)}>
            <ColorInput
              aria-label={`${category.name} color`}
              value={category.color}
              onChange={(e) => save({ ...category, color: e.target.value })}
            />
            <Input
              aria-label="Ticket name"
              value={category.name}
              onChange={(e) => save({ ...category, name: e.target.value })}
            />
            <IconButton
              aria-label={`Delete ${category.name}`}
              onClick={() => dispatch({ type: 'delete-category', id: category.id })}
            >
              ×
            </IconButton>
          </div>
          <p {...stylex.props(styles.meta)}>{usage(category)}</p>
          <ul {...stylex.props(styles.options)}>
            {category.priceOptions.map((option) => (
              <li key={option.id} {...stylex.props(styles.row)}>
                <Input
                  aria-label="Price option name"
                  value={option.name}
                  onChange={(e) =>
                    save({
                      ...category,
                      priceOptions: category.priceOptions.map((o) =>
                        o.id === option.id ? { ...o, name: e.target.value } : o,
                      ),
                    })
                  }
                />
                <Input
                  xstyle={styles.price}
                  type="number"
                  min={0}
                  step={1000}
                  aria-label={`Price for ${option.name}`}
                  value={option.amount}
                  onChange={(e) =>
                    save({
                      ...category,
                      priceOptions: category.priceOptions.map((o) =>
                        o.id === option.id
                          ? { ...o, amount: Math.max(0, Number(e.target.value) || 0) }
                          : o,
                      ),
                    })
                  }
                />
                <IconButton
                  aria-label={`Remove ${option.name}`}
                  disabled={category.priceOptions.length === 1}
                  onClick={() =>
                    save({
                      ...category,
                      priceOptions: category.priceOptions.filter((o) => o.id !== option.id),
                    })
                  }
                >
                  ×
                </IconButton>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            xstyle={styles.addOption}
            onClick={() =>
              save({
                ...category,
                priceOptions: [
                  ...category.priceOptions,
                  {
                    id: createId('po'),
                    name: 'Option',
                    amount: category.priceOptions[0]?.amount ?? 0,
                  },
                ],
              })
            }
          >
            + Price option
          </Button>
          <p {...stylex.props(styles.meta)}>
            {formatPrice(Math.min(...category.priceOptions.map((o) => o.amount)))}
            {category.priceOptions.length > 1 &&
              ` – ${formatPrice(Math.max(...category.priceOptions.map((o) => o.amount)))}`}
          </p>
        </section>
      ))}
    </Panel>
  )
}
