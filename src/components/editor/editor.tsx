import * as stylex from '@stylexjs/stylex'
import { useCallback, useState, type ReactNode } from 'react'
import { useWindowEvent } from '../../hooks/use-window-event'
import { createElement, duplicateElements } from '../../seating/element-factory'
import { useSeating } from '../../seating/seating-store'
import type { ElementKind } from '../../seating/seating.types'
import { breakpoints, colors } from '../../styles/tokens.stylex'
import { Button } from '../button/button'
import { CategoryPanel } from '../category-panel/category-panel'
import { EditorCanvas } from '../editor-canvas/editor-canvas'
import { EditorToolbar } from '../editor-toolbar/editor-toolbar'
import type { AddPreset } from '../editor-toolbar/editor-toolbar.types'
import { layoutStyles } from '../layout/layout.styles'
import { PropertiesPanel } from '../properties-panel/properties-panel'
import type { EditorPanelTab, EditorTool, SelectionMode } from './editor.types'
import { applySelection, isTypingTarget } from './editor.utils'

const styles = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: { default: '180px 1fr 320px', [breakpoints.compact]: '1fr' },
    gridTemplateRows: { default: null, [breakpoints.compact]: 'auto 1fr auto' },
    minHeight: 0,
  },
  tabs: {
    display: 'flex',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  tab: {
    flexGrow: 1,
    padding: 10,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
  },
  tabActive: {
    borderColor: colors.accent,
    color: colors.text,
    fontWeight: 600,
  },
})

/** The seating map builder: element palette, interactive canvas and side panel for properties and tickets. */
export function Editor(): ReactNode {
  const { map, dispatch, canUndo, canRedo } = useSeating()
  const [tool, setTool] = useState<EditorTool>('select')
  const [tab, setTab] = useState<EditorPanelTab>('properties')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])

  const liveSelectedIds = selectedIds.filter((id) => map.elements.some((e) => e.id === id))

  const selectElements = useCallback((ids: string[], mode: SelectionMode): void => {
    setSelectedIds((current) => applySelection(current, ids, mode))
    setTab('properties')
  }, [])

  const selectSeats = useCallback((ids: string[], mode: SelectionMode): void => {
    setSelectedSeatIds((current) => applySelection(current, ids, mode))
    setTab('properties')
  }, [])

  const changeTool = (next: EditorTool): void => {
    setTool(next)
    setSelectedSeatIds([])
  }

  const add = (kind: ElementKind, preset?: AddPreset): void => {
    let element = createElement(kind, { x: map.width / 2, y: map.height / 2 }, map.elements)
    if (preset === 'curved' && element.kind === 'rows')
      element = { ...element, curve: 60, seatsPerRow: 12 }
    if (preset === 'ellipse' && element.kind === 'shape')
      element = {
        ...element,
        shape: 'ellipse',
        width: 120,
        height: 120,
        label: 'Bar',
        fill: '#a16207',
      }
    dispatch({ type: 'add-elements', elements: [element] })
    setTool('select')
    setSelectedIds([element.id])
    setTab('properties')
  }

  const duplicate = useCallback((): void => {
    const source = map.elements.filter((e) => liveSelectedIds.includes(e.id))
    if (source.length === 0) return
    const copies = duplicateElements(source, map.elements)
    dispatch({ type: 'add-elements', elements: copies })
    setSelectedIds(copies.map((c) => c.id))
  }, [map.elements, liveSelectedIds, dispatch])

  const remove = useCallback((): void => {
    if (liveSelectedIds.length === 0) return
    dispatch({ type: 'delete-elements', ids: liveSelectedIds })
    setSelectedIds([])
  }, [liveSelectedIds, dispatch])

  useWindowEvent('keydown', (e) => {
    if (isTypingTarget(e.target)) return
    const mod = e.metaKey || e.ctrlKey
    const key = e.key.toLowerCase()

    if (mod && key === 'z') {
      e.preventDefault()
      dispatch({ type: e.shiftKey ? 'redo' : 'undo' })
    } else if (mod && key === 'y') {
      e.preventDefault()
      dispatch({ type: 'redo' })
    } else if (mod && key === 'd') {
      e.preventDefault()
      duplicate()
    } else if (mod && key === 'a') {
      e.preventDefault()
      if (tool === 'select') setSelectedIds(map.elements.map((el) => el.id))
    } else if (mod) {
      return
    } else if (key === 'delete' || key === 'backspace') {
      e.preventDefault()
      remove()
    } else if (key === 'escape') {
      setSelectedIds([])
      setSelectedSeatIds([])
    } else if (key === 'v') {
      changeTool('select')
    } else if (key === 's') {
      changeTool('seat')
    } else if (key.startsWith('arrow') && liveSelectedIds.length > 0 && tool === 'select') {
      e.preventDefault()
      const step = e.shiftKey ? 10 : 1
      const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
      const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
      dispatch({ type: 'move-elements', ids: liveSelectedIds, dx, dy })
    } else if ((key === '[' || key === ']') && liveSelectedIds.length > 0 && tool === 'select') {
      const delta = key === ']' ? 15 : -15
      dispatch({ type: 'checkpoint' })
      for (const element of map.elements.filter((el) => liveSelectedIds.includes(el.id))) {
        dispatch({
          type: 'update-element',
          id: element.id,
          patch: { rotation: (element.rotation + delta) % 360 },
          record: false,
        })
      }
    }
  })

  const tabButton = (target: EditorPanelTab, label: string): ReactNode => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === target}
      onClick={() => setTab(target)}
      {...stylex.props(styles.tab, tab === target && styles.tabActive)}
    >
      {label}
    </button>
  )

  return (
    <div {...stylex.props(styles.root)}>
      <EditorToolbar tool={tool} onToolChange={changeTool} onAdd={add} />
      <main {...stylex.props(layoutStyles.stage)}>
        <div {...stylex.props(layoutStyles.bar)}>
          <Button variant="ghost" disabled={!canUndo} onClick={() => dispatch({ type: 'undo' })}>
            ↶ Undo
          </Button>
          <Button variant="ghost" disabled={!canRedo} onClick={() => dispatch({ type: 'redo' })}>
            ↷ Redo
          </Button>
        </div>
        <EditorCanvas
          tool={tool}
          selectedIds={liveSelectedIds}
          selectedSeatIds={selectedSeatIds}
          onSelectElements={selectElements}
          onSelectSeats={selectSeats}
        />
      </main>
      <aside {...stylex.props(layoutStyles.sidePanel)}>
        <div role="tablist" {...stylex.props(styles.tabs)}>
          {tabButton('properties', 'Properties')}
          {tabButton('tickets', `Tickets (${map.categories.length})`)}
        </div>
        <div {...stylex.props(layoutStyles.sidePanelBody)}>
          {tab === 'properties' ? (
            <PropertiesPanel
              tool={tool}
              selectedIds={liveSelectedIds}
              selectedSeatIds={selectedSeatIds}
              onDuplicate={duplicate}
              onDelete={remove}
              onClearSeats={() => setSelectedSeatIds([])}
            />
          ) : (
            <CategoryPanel />
          )}
        </div>
      </aside>
    </div>
  )
}
