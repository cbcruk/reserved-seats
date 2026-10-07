import type { ReactNode } from 'react'
import { isTicketed } from '../../seating/seat-status'
import { useSeating } from '../../seating/seating-store'
import type { ElementPatch } from '../../seating/seating-reducer.types'
import { Button } from '../button/button'
import {
  ColorField,
  FieldGrid,
  FieldShell,
  NumberField,
  SelectField,
  TextField,
} from '../form-fields/form-fields'
import { Fieldset, Panel, PanelHeader } from '../panel/panel'
import {
  categoryOptions,
  DIRECTION_OPTIONS,
  NO_CATEGORY,
  ROW_LABEL_POSITION_OPTIONS,
  SCHEME_OPTIONS,
} from '../properties-panel/properties-panel.utils'
import type { ElementInspectorProps, LabelConfigFieldsProps } from './element-inspector.types'

const KIND_TITLE = {
  rows: 'Rows',
  'rect-table': 'Rectangular table',
  'round-table': 'Round table',
  area: 'General admission area',
  shape: 'Shape',
  text: 'Text',
} as const

function LabelConfigFields(props: LabelConfigFieldsProps): ReactNode {
  const { title, value, disabled, onChange } = props
  return (
    <Fieldset legend={title}>
      <SelectField
        label="Format"
        value={value.scheme}
        options={SCHEME_OPTIONS}
        disabled={disabled}
        onChange={(scheme) => onChange({ ...value, scheme })}
      />
      <TextField
        label="Start at"
        value={value.start}
        disabled={disabled}
        onChange={(start) => onChange({ ...value, start })}
      />
      <SelectField
        label="Direction"
        value={value.direction}
        options={DIRECTION_OPTIONS}
        disabled={disabled}
        onChange={(direction) => onChange({ ...value, direction })}
      />
    </Fieldset>
  )
}

/** Edits the geometry, labels and ticket assignment of a single selected element. */
export function ElementInspector({
  element,
  hasSales,
  onDuplicate,
  onDelete,
}: ElementInspectorProps): ReactNode {
  const { map, dispatch } = useSeating()
  const update = (patch: ElementPatch): void =>
    dispatch({ type: 'update-element', id: element.id, patch })
  const lockHint = hasSales ? 'Locked: tickets have been sold for this element.' : undefined

  return (
    <Panel>
      <PanelHeader title={KIND_TITLE[element.kind]}>
        <Button variant="ghost" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </PanelHeader>

      <TextField
        label={element.kind === 'text' ? 'Text' : 'Name'}
        value={element.label}
        disabled={hasSales}
        hint={lockHint}
        onChange={(label) => update({ label })}
      />

      {isTicketed(element) && (
        <SelectField
          label="Ticket"
          value={element.categoryId ?? NO_CATEGORY}
          options={categoryOptions(map.categories)}
          hint={
            map.categories.length === 0
              ? 'Create tickets in the Tickets tab first.'
              : 'Applies to every seat; overrides from the seat tool are cleared.'
          }
          onChange={(id) =>
            dispatch({ type: 'assign-category', elementIds: [element.id], categoryId: id || null })
          }
        />
      )}

      <FieldGrid>
        <NumberField label="X" value={element.x} onChange={(x) => update({ x })} />
        <NumberField label="Y" value={element.y} onChange={(y) => update({ y })} />
        <NumberField
          label="Rotation"
          suffix="°"
          value={element.rotation}
          min={-360}
          max={360}
          onChange={(rotation) => update({ rotation })}
        />
      </FieldGrid>

      {element.kind === 'rows' && (
        <>
          <FieldGrid>
            <NumberField
              label="Rows"
              value={element.rowCount}
              min={1}
              max={60}
              onChange={(rowCount) => update({ rowCount })}
            />
            <NumberField
              label="Seats per row"
              value={element.seatsPerRow}
              min={1}
              max={100}
              onChange={(seatsPerRow) => update({ seatsPerRow })}
            />
            <NumberField
              label="Seat spacing"
              value={element.seatSpacing}
              min={16}
              max={80}
              onChange={(seatSpacing) => update({ seatSpacing })}
            />
            <NumberField
              label="Row spacing"
              value={element.rowSpacing}
              min={16}
              max={120}
              onChange={(rowSpacing) => update({ rowSpacing })}
            />
          </FieldGrid>
          <FieldShell
            label="Curve"
            htmlFor={`curve-${element.id}`}
            aside={`${element.curve}°`}
            hint="0° straight · 180° half circle · 360° full circle"
          >
            <input
              id={`curve-${element.id}`}
              type="range"
              min={0}
              max={360}
              step={5}
              value={element.curve}
              onChange={(e) => update({ curve: Number(e.target.value) })}
            />
          </FieldShell>
          <LabelConfigFields
            title="Row labels"
            value={element.rowLabels}
            disabled={hasSales}
            onChange={(rowLabels) => update({ rowLabels })}
          />
          <SelectField
            label="Row label position"
            value={element.rowLabelPosition}
            options={ROW_LABEL_POSITION_OPTIONS}
            onChange={(rowLabelPosition) => update({ rowLabelPosition })}
          />
          <LabelConfigFields
            title="Seat labels"
            value={element.seatLabels}
            disabled={hasSales}
            onChange={(seatLabels) => update({ seatLabels })}
          />
        </>
      )}

      {element.kind === 'rect-table' && (
        <>
          <FieldGrid>
            <NumberField
              label="Width"
              value={element.width}
              min={30}
              max={600}
              onChange={(width) => update({ width })}
            />
            <NumberField
              label="Height"
              value={element.height}
              min={30}
              max={600}
              onChange={(height) => update({ height })}
            />
          </FieldGrid>
          <Fieldset legend="Chairs per side">
            <FieldGrid>
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <NumberField
                  key={side}
                  label={side[0]!.toUpperCase() + side.slice(1)}
                  value={element.seats[side]}
                  min={0}
                  max={20}
                  onChange={(n) => update({ seats: { ...element.seats, [side]: n } })}
                />
              ))}
            </FieldGrid>
          </Fieldset>
          <LabelConfigFields
            title="Seat labels"
            value={element.seatLabels}
            disabled={hasSales}
            onChange={(seatLabels) => update({ seatLabels })}
          />
        </>
      )}

      {element.kind === 'round-table' && (
        <>
          <FieldGrid>
            <NumberField
              label="Radius"
              value={element.radius}
              min={15}
              max={200}
              onChange={(radius) => update({ radius })}
            />
            <NumberField
              label="Chairs"
              value={element.seatCount}
              min={0}
              max={40}
              onChange={(seatCount) => update({ seatCount })}
            />
          </FieldGrid>
          <LabelConfigFields
            title="Seat labels"
            value={element.seatLabels}
            disabled={hasSales}
            onChange={(seatLabels) => update({ seatLabels })}
          />
        </>
      )}

      {element.kind === 'area' && (
        <FieldGrid>
          <NumberField
            label="Width"
            value={element.width}
            min={40}
            max={2000}
            onChange={(width) => update({ width })}
          />
          <NumberField
            label="Height"
            value={element.height}
            min={40}
            max={2000}
            onChange={(height) => update({ height })}
          />
          <NumberField
            label="Capacity"
            value={element.capacity}
            min={1}
            max={100000}
            onChange={(capacity) => update({ capacity })}
          />
        </FieldGrid>
      )}

      {element.kind === 'shape' && (
        <>
          <SelectField
            label="Shape"
            value={element.shape}
            options={[
              { value: 'rect', label: 'Rectangle' },
              { value: 'ellipse', label: 'Circle / ellipse' },
            ]}
            onChange={(shape) => update({ shape })}
          />
          <FieldGrid>
            <NumberField
              label="Width"
              value={element.width}
              min={4}
              max={2000}
              onChange={(width) => update({ width })}
            />
            <NumberField
              label="Height"
              value={element.height}
              min={4}
              max={2000}
              onChange={(height) => update({ height })}
            />
          </FieldGrid>
          <ColorField label="Fill" value={element.fill} onChange={(fill) => update({ fill })} />
        </>
      )}

      {element.kind === 'text' && (
        <FieldGrid>
          <NumberField
            label="Font size"
            value={element.fontSize}
            min={8}
            max={96}
            onChange={(fontSize) => update({ fontSize })}
          />
          <ColorField label="Color" value={element.color} onChange={(color) => update({ color })} />
        </FieldGrid>
      )}
    </Panel>
  )
}
