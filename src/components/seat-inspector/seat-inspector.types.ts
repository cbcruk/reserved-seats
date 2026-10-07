/** Props of {@linkcode SeatInspector}. */
export interface SeatInspectorProps {
  /** IDs of the seats being edited together. */
  seatIds: string[]
  /** Called when the Clear button is clicked to empty the seat selection. */
  onClear: () => void
}
