import type { ReactNode } from 'react'
import { elementIdOfSeat, isTicketed } from '../../seating/seat-status'
import { useSeating } from '../../seating/seating-store'
import { ElementInspector } from '../element-inspector/element-inspector'
import { Button } from '../button/button'
import { SelectField } from '../form-fields/form-fields'
import { MapSettings } from '../map-settings/map-settings'
import { Hint, Panel, PanelHeader } from '../panel/panel'
import { SeatInspector } from '../seat-inspector/seat-inspector'
import { categoryOptions } from './properties-panel.utils'
import type { PropertiesPanelProps } from './properties-panel.types'

const MIXED = '__mixed'

/** Shows the inspector matching the current selection: seats, one element, several elements, or the venue. */
export function PropertiesPanel(props: PropertiesPanelProps): ReactNode {
  const { tool, selectedIds, selectedSeatIds, onDuplicate, onDelete, onClearSeats } = props
  const { map, sales, dispatch } = useSeating()

  if (tool === 'seat') {
    if (selectedSeatIds.length > 0)
      return <SeatInspector seatIds={selectedSeatIds} onClear={onClearSeats} />
    return (
      <Panel>
        <PanelHeader title="Seat selection" />
        <Hint>
          Click seats, drag a box around them, or click a row or table to pick all of its seats.
          Then assign a ticket or mark them as wheelchair accessible.
        </Hint>
      </Panel>
    )
  }

  const selected = map.elements.filter((e) => selectedIds.includes(e.id))
  const [single] = selected
  if (selected.length === 0 || !single) return <MapSettings />

  if (selected.length === 1) {
    const hasSales =
      Object.keys(sales.soldSeats).some((seatId) => elementIdOfSeat(seatId) === single.id) ||
      (sales.areaSold[single.id] ?? 0) > 0
    return (
      <ElementInspector
        key={single.id}
        element={single}
        hasSales={hasSales}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    )
  }

  const ticketed = selected.filter(isTicketed)
  const categoryIds = new Set(ticketed.map((e) => e.categoryId ?? ''))
  const value = categoryIds.size === 1 ? [...categoryIds][0]! : MIXED

  return (
    <Panel>
      <PanelHeader title={`${selected.length} elements selected`}>
        <Button variant="ghost" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </PanelHeader>
      {ticketed.length > 0 && (
        <SelectField
          label={`Ticket for ${ticketed.length} seating element${ticketed.length === 1 ? '' : 's'}`}
          value={value}
          options={[
            ...(value === MIXED ? [{ value: MIXED, label: '— Mixed —' }] : []),
            ...categoryOptions(map.categories),
          ]}
          onChange={(id) => {
            if (id === MIXED) return
            dispatch({
              type: 'assign-category',
              elementIds: ticketed.map((e) => e.id),
              categoryId: id || null,
            })
          }}
        />
      )}
      <Hint>
        Drag any selected element to move the whole group. Arrow keys nudge, [ and ] rotate each
        element.
      </Hint>
    </Panel>
  )
}
