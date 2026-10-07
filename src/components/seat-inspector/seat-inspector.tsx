import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { collectSeats } from '../../seating/seat-status'
import { useSeating } from '../../seating/seating-store'
import { colors } from '../../styles/tokens.stylex'
import { Button } from '../button/button'
import { FieldShell, SelectField } from '../form-fields/form-fields'
import { Notice, Panel, PanelHeader } from '../panel/panel'
import { categoryOptions, NO_CATEGORY } from '../properties-panel/properties-panel.utils'
import { Swatch } from '../swatch/swatch'
import type { SeatInspectorProps } from './seat-inspector.types'

const styles = stylex.create({
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    marginLeft: 'auto',
    color: colors.muted,
    fontVariantNumeric: 'tabular-nums',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
})

const INHERIT = '__inherit'
const MIXED = '__mixed'

/** Assigns tickets and seat properties (such as wheelchair access) to individually selected seats. */
export function SeatInspector({ seatIds, onClear }: SeatInspectorProps): ReactNode {
  const { map, sales, dispatch } = useSeating()
  const idSet = new Set(seatIds)
  const entries = collectSeats(map).filter((s) => idSet.has(s.seat.id))

  const overrideValues = new Set(
    entries.map((s) => {
      const value = map.seatOverrides[s.seat.id]?.categoryId
      return value === undefined ? INHERIT : (value ?? NO_CATEGORY)
    }),
  )
  const ticketValue = overrideValues.size === 1 ? [...overrideValues][0]! : MIXED
  const accessibleCount = entries.filter((s) => s.accessible).length
  const isMixedAccessible = accessibleCount > 0 && accessibleCount < entries.length
  const soldCount = entries.filter((s) => sales.soldSeats[s.seat.id] !== undefined).length

  const breakdown = new Map<string, { name: string; color: string; count: number }>()
  for (const s of entries) {
    const key = s.category?.id ?? NO_CATEGORY
    const row = breakdown.get(key) ?? {
      name: s.category?.name ?? 'Not for sale',
      color: s.category?.color ?? '#cbd5e1',
      count: 0,
    }
    row.count++
    breakdown.set(key, row)
  }

  const options = [
    ...(ticketValue === MIXED ? [{ value: MIXED, label: '— Mixed —' }] : []),
    { value: INHERIT, label: 'Same as row / table' },
    ...categoryOptions(map.categories),
  ]

  return (
    <Panel>
      <PanelHeader title={`${entries.length} seat${entries.length === 1 ? '' : 's'} selected`}>
        <Button variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </PanelHeader>

      <ul {...stylex.props(styles.breakdown)}>
        {[...breakdown.values()].map((row) => (
          <li key={row.name} {...stylex.props(styles.breakdownRow)}>
            <Swatch color={row.color} />
            {row.name}
            <span {...stylex.props(styles.count)}>{row.count}</span>
          </li>
        ))}
      </ul>
      {soldCount > 0 && <Notice>{soldCount} of these seats are already sold.</Notice>}

      <SelectField
        label="Ticket"
        value={ticketValue}
        options={options}
        onChange={(value) => {
          if (value === MIXED) return
          dispatch({
            type: 'update-seats',
            seatIds,
            patch: { categoryId: value === INHERIT ? undefined : value || null },
          })
        }}
      />

      <FieldShell label="Seat properties">
        <label {...stylex.props(styles.checkbox)}>
          <input
            ref={(checkbox) => {
              if (checkbox) checkbox.indeterminate = isMixedAccessible
            }}
            type="checkbox"
            checked={entries.length > 0 && accessibleCount === entries.length}
            onChange={(e) =>
              dispatch({ type: 'update-seats', seatIds, patch: { accessible: e.target.checked } })
            }
          />
          ♿ Wheelchair accessible
        </label>
      </FieldShell>

      <Button variant="ghost" onClick={() => dispatch({ type: 'reset-seats', seatIds })}>
        Reset seat overrides
      </Button>
    </Panel>
  )
}
