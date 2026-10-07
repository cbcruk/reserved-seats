/** Active pointer tool in the editor: whole elements or individual seats. */
export type EditorTool = 'select' | 'seat'

/** Tab shown in the editor's side panel. */
export type EditorPanelTab = 'properties' | 'tickets'

/** How a pick combines with the current selection. */
export type SelectionMode = 'replace' | 'add' | 'toggle'
