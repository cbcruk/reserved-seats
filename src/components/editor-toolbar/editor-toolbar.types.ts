import type { ElementKind } from '../../seating/seating.types'
import type { EditorTool } from '../editor/editor.types'

/** Props of {@linkcode EditorToolbar}. */
export interface EditorToolbarProps {
  /** Pointer tool currently shown as pressed. */
  tool: EditorTool
  /** Called when the user picks the selection or seat tool. */
  onToolChange: (tool: EditorTool) => void
  /** Called when a palette button is clicked to add a new element. */
  onAdd: (kind: ElementKind, preset?: AddPreset) => void
}

/** Variant of an element kind offered as its own toolbar button. */
export type AddPreset = 'curved' | 'ellipse'

/** A button in the toolbar's "Add" palette. */
export interface PaletteItem {
  /** Kind of element the button adds. */
  kind: ElementKind
  /** Variant applied to the new element; omitted for the kind's default form. */
  preset?: AddPreset
  /** Visible button text, also used as the React key so it must be unique. */
  label: string
  /** Decorative glyph shown before the label and hidden from assistive technology. */
  icon: string
}
