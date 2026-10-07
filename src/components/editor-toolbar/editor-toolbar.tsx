import * as stylex from '@stylexjs/stylex'
import { Fragment, type ReactNode } from 'react'
import { breakpoints, colors, radii } from '../../styles/tokens.stylex'
import type { EditorTool } from '../editor/editor.types'
import { segmentedStyles } from '../segmented/segmented.styles'
import type { EditorToolbarProps, PaletteItem } from './editor-toolbar.types'

const SEATING: PaletteItem[] = [
  { kind: 'rows', label: 'Rows', icon: '⋯' },
  { kind: 'rows', preset: 'curved', label: 'Curved rows', icon: '◡' },
  { kind: 'rect-table', label: 'Rect table', icon: '▭' },
  { kind: 'round-table', label: 'Round table', icon: '◯' },
  { kind: 'area', label: 'Area (GA)', icon: '▢' },
]

const OBJECTS: PaletteItem[] = [
  { kind: 'shape', label: 'Rectangle', icon: '■' },
  { kind: 'shape', preset: 'ellipse', label: 'Circle', icon: '●' },
  { kind: 'text', label: 'Text', icon: 'T' },
]

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: { default: 'column', [breakpoints.compact]: 'row' },
    flexWrap: { default: 'nowrap', [breakpoints.compact]: 'wrap' },
    gap: 4,
    padding: 12,
    overflowY: 'auto',
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRightWidth: { default: 1, [breakpoints.compact]: 0 },
    borderBottomWidth: { default: 0, [breakpoints.compact]: 1 },
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  heading: {
    display: { default: 'block', [breakpoints.compact]: 'none' },
    marginTop: 12,
    marginBottom: 4,
    marginInline: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: colors.muted,
  },
  firstHeading: {
    marginTop: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 7,
    paddingInline: 8,
    borderWidth: 0,
    borderRadius: radii.sm,
    backgroundColor: { default: 'transparent', ':hover': colors.accentSoft },
    textAlign: 'left',
    cursor: 'pointer',
  },
  icon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
  },
  shortcuts: {
    display: { default: 'block', [breakpoints.compact]: 'none' },
    marginTop: 'auto',
    paddingTop: 12,
    fontSize: 12,
    color: colors.muted,
  },
  summary: {
    cursor: 'pointer',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '4px 8px',
    marginTop: 8,
    marginBottom: 0,
  },
  key: {
    fontWeight: 600,
    color: colors.text,
  },
  description: {
    margin: 0,
  },
})

const SHORTCUTS: [string, string][] = [
  ['V / S', 'Selection / seat tool'],
  ['⌘Z / ⇧⌘Z', 'Undo / redo'],
  ['⌘D', 'Duplicate'],
  ['⌘A', 'Select all'],
  ['Del', 'Delete'],
  ['Arrows', 'Nudge (⇧ ×10)'],
  ['[ / ]', 'Rotate 15°'],
  ['Space+drag', 'Pan'],
  ['⌘ + wheel', 'Zoom'],
]

/** Left-hand palette for choosing the pointer tool and adding seating and decorative elements. */
export function EditorToolbar({ tool, onToolChange, onAdd }: EditorToolbarProps): ReactNode {
  const renderItems = (items: PaletteItem[]): ReactNode =>
    items.map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={() => onAdd(item.kind, item.preset)}
        {...stylex.props(styles.item)}
      >
        <span aria-hidden {...stylex.props(styles.icon)}>
          {item.icon}
        </span>
        {item.label}
      </button>
    ))

  const toolButton = (value: EditorTool, label: string, title: string): ReactNode => (
    <button
      type="button"
      aria-pressed={tool === value}
      title={title}
      onClick={() => onToolChange(value)}
      {...stylex.props(segmentedStyles.item, tool === value && segmentedStyles.active)}
    >
      {label}
    </button>
  )

  return (
    <aside {...stylex.props(styles.root)}>
      <h2 {...stylex.props(styles.heading, styles.firstHeading)}>Tool</h2>
      <div {...stylex.props(segmentedStyles.root)}>
        {toolButton('select', 'Selection', 'Selection (V)')}
        {toolButton('seat', 'Seats', 'Seat selection (S)')}
      </div>
      <h2 {...stylex.props(styles.heading)}>Seating</h2>
      {renderItems(SEATING)}
      <h2 {...stylex.props(styles.heading)}>Objects</h2>
      {renderItems(OBJECTS)}
      <details {...stylex.props(styles.shortcuts)}>
        <summary {...stylex.props(styles.summary)}>Keyboard shortcuts</summary>
        <dl {...stylex.props(styles.list)}>
          {SHORTCUTS.map(([key, description]) => (
            <Fragment key={key}>
              <dt {...stylex.props(styles.key)}>{key}</dt>
              <dd {...stylex.props(styles.description)}>{description}</dd>
            </Fragment>
          ))}
        </dl>
      </details>
    </aside>
  )
}
