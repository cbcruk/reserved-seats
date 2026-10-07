import type { LabelConfig, SeatingElement } from '../../seating/seating.types'

/** Props of {@linkcode ElementInspector}. */
export interface ElementInspectorProps {
  /** Element being edited. */
  element: SeatingElement
  /** Whether any ticket for this element has been sold; locks labels like Wix does. */
  hasSales: boolean
  /** Called when the Duplicate button is clicked. */
  onDuplicate: () => void
  /** Called when the Delete button is clicked. */
  onDelete: () => void
}

/** Props of the label scheme editor used for row and seat labels. */
export interface LabelConfigFieldsProps {
  /** Legend of the fieldset, e.g. "Row labels" or "Seat labels". */
  title: string
  /** Current labeling scheme, start value and direction. */
  value: LabelConfig
  /** Locks every field, used once tickets have been sold. */
  disabled: boolean
  /** Called with the full updated config whenever any of its fields changes. */
  onChange: (value: LabelConfig) => void
}
