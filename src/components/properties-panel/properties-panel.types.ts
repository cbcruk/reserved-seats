import type { EditorTool } from '../editor/editor.types'

/** Props of {@linkcode PropertiesPanel}. */
export interface PropertiesPanelProps {
  /** Active pointer tool; `seat` shows the seat inspector instead of element inspectors. */
  tool: EditorTool
  /** IDs of the selected elements; empty shows the venue settings. */
  selectedIds: string[]
  /** IDs of the selected seats, inspected while the seat tool is active. */
  selectedSeatIds: string[]
  /** Called when the user duplicates the selected elements. */
  onDuplicate: () => void
  /** Called when the user deletes the selected elements. */
  onDelete: () => void
  /** Called when the user clears the seat selection. */
  onClearSeats: () => void
}
