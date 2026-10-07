import type { ReactNode } from 'react'
import type { MapSettingsPatch } from '../../seating/seating-reducer.types'
import { useSeating } from '../../seating/seating-store'
import { Button } from '../button/button'
import { ColorField, FieldGrid, NumberField, TextField } from '../form-fields/form-fields'
import { Fieldset, Hint, Panel, PanelActions, PanelHeader } from '../panel/panel'

/** Edits venue-wide settings and summarizes the map when nothing is selected. */
export function MapSettings(): ReactNode {
  const { map, sales, dispatch, dispatchSales, resetToSample } = useSeating()
  const update = (patch: MapSettingsPatch): void => dispatch({ type: 'update-settings', patch })

  const soldCount =
    Object.keys(sales.soldSeats).length + Object.values(sales.areaSold).reduce((a, b) => a + b, 0)

  return (
    <Panel>
      <PanelHeader title="Venue" />
      <TextField label="Map name" value={map.name} onChange={(name) => update({ name })} />
      <FieldGrid>
        <NumberField
          label="Width"
          value={map.width}
          min={200}
          max={5000}
          onChange={(width) => update({ width })}
        />
        <NumberField
          label="Height"
          value={map.height}
          min={200}
          max={5000}
          onChange={(height) => update({ height })}
        />
      </FieldGrid>
      <ColorField
        label="Background"
        value={map.background}
        onChange={(background) => update({ background })}
      />
      <Hint>
        Select an element to edit it, or switch to the Seats tool to edit individual seats.
      </Hint>

      <Fieldset legend="Sales">
        <Hint>
          {soldCount} tickets sold across {sales.orders.length} orders.
        </Hint>
        <PanelActions>
          <Button
            variant="ghost"
            disabled={soldCount === 0}
            onClick={() => dispatchSales({ type: 'reset' })}
          >
            Clear sales
          </Button>
          <Button variant="ghost" onClick={resetToSample}>
            Load demo venue
          </Button>
        </PanelActions>
      </Fieldset>
    </Panel>
  )
}
