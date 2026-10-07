import * as stylex from '@stylexjs/stylex'
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useViewport } from '../../hooks/use-viewport'
import { useWindowEvent } from '../../hooks/use-window-event'
import { boundsIntersect, containsPoint, rectFromPoints } from '../../seating/geometry'
import { worldBounds } from '../../seating/seat-layout'
import {
  collectSeats,
  findCategory,
  isTicketed,
  resolveSeatCategoryId,
  seatIdsOf,
} from '../../seating/seat-status'
import { useSeating } from '../../seating/seating-store'
import type { SeatingElement } from '../../seating/seating.types'
import { canvasStyles } from '../canvas/canvas.styles'
import { isTypingTarget } from '../editor/editor.utils'
import { ElementView } from '../element-view/element-view'
import { SeatMark } from '../seat-mark/seat-mark'
import { ZoomControls } from '../zoom-controls/zoom-controls'
import type { DragState, EditorCanvasProps } from './editor-canvas.types'

const UNASSIGNED_SEAT = '#94a3b8'
const CLICK_TOLERANCE = 3

/** Interactive SVG canvas for placing, moving and selecting elements and seats. */
export function EditorCanvas(props: EditorCanvasProps): ReactNode {
  const { tool, selectedIds, selectedSeatIds, onSelectElements, onSelectSeats } = props
  const { map, sales, dispatch } = useSeating()
  const viewport = useViewport(map.width, map.height)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const spaceRef = useRef(false)

  const trackSpace = (e: KeyboardEvent): void => {
    if (e.code !== 'Space' || isTypingTarget(e.target)) return
    e.preventDefault()
    spaceRef.current = e.type === 'keydown'
    setSpaceHeld(spaceRef.current)
  }
  useWindowEvent('keydown', trackSpace)
  useWindowEvent('keyup', trackSpace)

  const wantsPan = (e: ReactPointerEvent): boolean => e.button === 1 || e.altKey || spaceRef.current

  const trackPointer = (
    onMove: (e: PointerEvent) => void,
    onUp: (e: PointerEvent) => void,
  ): void => {
    const up = (e: PointerEvent): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', up)
      onUp(e)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', up)
  }

  const startMove = (e: ReactPointerEvent, ids: string[]): void => {
    const start = viewport.clientToWorld(e.clientX, e.clientY)
    let applied = { x: 0, y: 0 }
    let moved = false
    trackPointer(
      (ev) => {
        const p = viewport.clientToWorld(ev.clientX, ev.clientY)
        const total = { x: Math.round(p.x - start.x), y: Math.round(p.y - start.y) }
        const dx = total.x - applied.x
        const dy = total.y - applied.y
        if (dx === 0 && dy === 0) return
        if (!moved) dispatch({ type: 'checkpoint' })
        moved = true
        dispatch({ type: 'move-elements', ids, dx, dy, record: false })
        applied = total
      },
      () => setDrag(null),
    )
  }

  const onElementPointerDown = (element: SeatingElement) => (e: ReactPointerEvent<SVGGElement>) => {
    if (e.button !== 0 || wantsPan(e)) return
    e.stopPropagation()
    if (tool === 'seat') {
      onSelectSeats(seatIdsOf(element), e.shiftKey ? 'add' : 'replace')
      return
    }
    const isSelected = selectedIds.includes(element.id)
    if (e.shiftKey) {
      onSelectElements([element.id], 'toggle')
      if (isSelected) return
    } else if (!isSelected) {
      onSelectElements([element.id], 'replace')
    }
    const ids = isSelected || e.shiftKey ? [...new Set([...selectedIds, element.id])] : [element.id]
    startMove(e, ids)
  }

  const onBackgroundPointerDown = (e: ReactPointerEvent<SVGSVGElement>): void => {
    if (wantsPan(e)) {
      e.preventDefault()
      viewport.beginPan(e)
      return
    }
    if (e.button !== 0) return
    const start = viewport.clientToWorld(e.clientX, e.clientY)
    const mode = e.shiftKey ? 'add' : 'replace'
    let rect = rectFromPoints(start, start)
    setDrag({ type: 'marquee', rect })
    trackPointer(
      (ev) => {
        rect = rectFromPoints(start, viewport.clientToWorld(ev.clientX, ev.clientY))
        setDrag({ type: 'marquee', rect })
      },
      () => {
        setDrag(null)
        const tiny =
          (rect.maxX - rect.minX) * viewport.zoom < CLICK_TOLERANCE &&
          (rect.maxY - rect.minY) * viewport.zoom < CLICK_TOLERANCE
        if (tool === 'seat') {
          const ids = tiny
            ? []
            : collectSeats(map)
                .filter((s) => containsPoint(rect, s.world))
                .map((s) => s.seat.id)
          if (!(tiny && mode === 'add')) onSelectSeats(ids, mode)
        } else {
          const ids = tiny
            ? []
            : map.elements.filter((el) => boundsIntersect(rect, worldBounds(el))).map((el) => el.id)
          if (!(tiny && mode === 'add')) onSelectElements(ids, mode)
        }
      },
    )
  }

  const selectedSeatSet = new Set(selectedSeatIds)
  const cursor: 'default' | 'grab' | 'crosshair' = spaceHeld
    ? 'grab'
    : tool === 'seat'
      ? 'crosshair'
      : 'default'

  return (
    <div {...stylex.props(canvasStyles.frame)}>
      <svg
        ref={viewport.svgRef}
        viewBox={viewport.viewBox}
        onPointerDown={onBackgroundPointerDown}
        {...stylex.props(canvasStyles.svg, canvasStyles.cursor(cursor))}
      >
        <defs>
          <pattern id="editor-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={1} fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect
          width={map.width}
          height={map.height}
          fill={map.background}
          {...stylex.props(canvasStyles.venue)}
        />
        <rect width={map.width} height={map.height} fill="url(#editor-grid)" pointerEvents="none" />
        {map.elements.map((element) => {
          const category = isTicketed(element)
            ? findCategory(map.categories, element.categoryId)
            : undefined
          return (
            <ElementView
              key={element.id}
              element={element}
              categoryColor={category?.color}
              selected={tool === 'select' && selectedIds.includes(element.id)}
              areaCaption={element.kind === 'area' ? `Capacity ${element.capacity}` : undefined}
              onPointerDown={onElementPointerDown(element)}
              renderSeat={(seat) => {
                const seatCategory = findCategory(
                  map.categories,
                  resolveSeatCategoryId(element, seat.id, map.seatOverrides),
                )
                return (
                  <SeatMark
                    x={seat.x}
                    y={seat.y}
                    fill={seatCategory?.color ?? UNASSIGNED_SEAT}
                    label={seat.seatLabel}
                    accessible={map.seatOverrides[seat.id]?.accessible === true}
                    selected={selectedSeatSet.has(seat.id)}
                    muted={sales.soldSeats[seat.id] !== undefined}
                    title={`${seat.rowLabel !== null ? `Row ${seat.rowLabel}, ` : ''}Seat ${seat.seatLabel}`}
                    onPointerDown={
                      tool === 'seat'
                        ? (e) => {
                            if (e.button !== 0 || wantsPan(e)) return
                            e.stopPropagation()
                            onSelectSeats([seat.id], e.shiftKey ? 'toggle' : 'replace')
                          }
                        : undefined
                    }
                  />
                )
              }}
            />
          )
        })}
        {drag?.type === 'marquee' && (
          <rect
            vectorEffect="non-scaling-stroke"
            {...stylex.props(canvasStyles.marquee)}
            x={drag.rect.minX}
            y={drag.rect.minY}
            width={drag.rect.maxX - drag.rect.minX}
            height={drag.rect.maxY - drag.rect.minY}
          />
        )}
      </svg>
      <ZoomControls viewport={viewport} />
      <p {...stylex.props(canvasStyles.overlay)}>
        {tool === 'seat'
          ? 'Click a seat · Shift+click to add · Drag to box-select · Click a row/table to pick all its seats'
          : 'Drag to move · Shift+click to multi-select · Drag empty space to box-select · Space+drag to pan'}
      </p>
    </div>
  )
}
