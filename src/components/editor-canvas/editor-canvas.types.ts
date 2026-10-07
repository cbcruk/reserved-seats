import type { Bounds } from '../../seating/geometry.types'
import type { EditorTool, SelectionMode } from '../editor/editor.types'

/** Props of {@linkcode EditorCanvas}. */
export interface EditorCanvasProps {
  /** Active pointer tool; `seat` makes clicks and box selection pick seats instead. */
  tool: EditorTool
  /** IDs of the selected elements, outlined while the selection tool is active. */
  selectedIds: string[]
  /** IDs of the selected seats, drawn with a selection ring. */
  selectedSeatIds: string[]
  /** Called when elements are clicked or box-selected; empty `ids` clears on `replace`. */
  onSelectElements: (ids: string[], mode: SelectionMode) => void
  /** Called when seats are picked with the seat tool; empty `ids` clears on `replace`. */
  onSelectSeats: (ids: string[], mode: SelectionMode) => void
}

/** In-progress box selection on the editor canvas, in venue coordinates. */
export interface DragState {
  /** Discriminant identifying the drag as a box selection. */
  type: 'marquee'
  /** Rectangle spanned from the drag start to the current pointer position. */
  rect: Bounds
}
