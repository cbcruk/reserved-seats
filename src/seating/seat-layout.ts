import { boundsOf, cornersOf, toWorld } from './geometry'
import type { Bounds, Point } from './geometry.types'
import { formatLabel } from './labels'
import type { ElementLayout } from './seat-layout.types'
import type {
  RectTableElement,
  RoundTableElement,
  RowLabelMark,
  RowsElement,
  SeatGeometry,
  SeatingElement,
} from './seating.types'

/** Radius of a rendered seat in venue units. */
export const SEAT_RADIUS = 8

const TABLE_GAP = 6
const CHAIR_OFFSET = SEAT_RADIUS + TABLE_GAP

function rowPoints(element: RowsElement, row: number): Point[] {
  const n = Math.max(1, element.seatsPerRow)
  const curve = Math.min(360, Math.max(0, element.curve))
  if (curve === 0 || n < 2) {
    return Array.from({ length: n }, (_, s) => ({
      x: s * element.seatSpacing,
      y: row * element.rowSpacing,
    }))
  }
  const span = (curve * Math.PI) / 180
  const full = curve === 360
  const step = full ? span / n : span / (n - 1)
  const baseRadius = full
    ? (n * element.seatSpacing) / span
    : ((n - 1) * element.seatSpacing) / span
  const radius = baseRadius + row * element.rowSpacing
  return Array.from({ length: n }, (_, s) => {
    const angle = -span / 2 + s * step + (full ? step / 2 : 0)
    return { x: radius * Math.sin(angle), y: radius * Math.cos(angle) }
  })
}

function extrapolate(from: Point, toward: Point | undefined, distance: number): Point {
  if (!toward) return { x: from.x - distance, y: from.y }
  const dx = from.x - toward.x
  const dy = from.y - toward.y
  const len = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / len) * distance, y: from.y + (dy / len) * distance }
}

function layoutRows(element: RowsElement): ElementLayout {
  const rowCount = Math.max(1, element.rowCount)
  const seats: SeatGeometry[] = []
  const rowLabels: RowLabelMark[] = []
  const full = element.curve >= 360

  for (let r = 0; r < rowCount; r++) {
    const points = rowPoints(element, r)
    const rowLabel = formatLabel(element.rowLabels, r, rowCount)
    points.forEach((p, s) => {
      seats.push({
        id: `${element.id}:${r}:${s}`,
        elementId: element.id,
        x: p.x,
        y: p.y,
        rowLabel,
        seatLabel: formatLabel(element.seatLabels, s, points.length),
      })
    })

    const first = points[0]
    const last = points[points.length - 1]
    if (!first || !last || element.rowLabelPosition === 'none' || full) continue
    const distance = element.seatSpacing * 0.9
    if (element.rowLabelPosition === 'left' || element.rowLabelPosition === 'both') {
      rowLabels.push({ key: `${r}:l`, text: rowLabel, ...extrapolate(first, points[1], distance) })
    }
    if (element.rowLabelPosition === 'right' || element.rowLabelPosition === 'both') {
      rowLabels.push({
        key: `${r}:r`,
        text: rowLabel,
        ...extrapolate(last, points[points.length - 2], distance),
      })
    }
  }

  const box = boundsOf(seats)
  const cx = (box.minX + box.maxX) / 2
  const cy = (box.minY + box.maxY) / 2
  for (const seat of seats) {
    seat.x -= cx
    seat.y -= cy
  }
  for (const mark of rowLabels) {
    mark.x -= cx
    mark.y -= cy
  }
  return { seats, rowLabels, bounds: boundsOf([...seats, ...rowLabels], SEAT_RADIUS + 2) }
}

function layoutRectTable(element: RectTableElement): ElementLayout {
  const { width: w, height: h } = element
  const sides = element.seats
  const points: Point[] = []
  for (let i = 0; i < sides.top; i++)
    points.push({ x: -w / 2 + ((i + 0.5) * w) / sides.top, y: -h / 2 - CHAIR_OFFSET })
  for (let i = 0; i < sides.right; i++)
    points.push({ x: w / 2 + CHAIR_OFFSET, y: -h / 2 + ((i + 0.5) * h) / sides.right })
  for (let i = 0; i < sides.bottom; i++)
    points.push({ x: w / 2 - ((i + 0.5) * w) / sides.bottom, y: h / 2 + CHAIR_OFFSET })
  for (let i = 0; i < sides.left; i++)
    points.push({ x: -w / 2 - CHAIR_OFFSET, y: h / 2 - ((i + 0.5) * h) / sides.left })

  const seats = points.map((p, i) => ({
    id: `${element.id}:0:${i}`,
    elementId: element.id,
    x: p.x,
    y: p.y,
    rowLabel: null,
    seatLabel: formatLabel(element.seatLabels, i, points.length),
  }))
  const pad = CHAIR_OFFSET + SEAT_RADIUS + 2
  return {
    seats,
    rowLabels: [],
    bounds: { minX: -w / 2 - pad, minY: -h / 2 - pad, maxX: w / 2 + pad, maxY: h / 2 + pad },
  }
}

function layoutRoundTable(element: RoundTableElement): ElementLayout {
  const n = Math.max(0, element.seatCount)
  const distance = element.radius + CHAIR_OFFSET
  const seats = Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return {
      id: `${element.id}:0:${i}`,
      elementId: element.id,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rowLabel: null,
      seatLabel: formatLabel(element.seatLabels, i, n),
    }
  })
  const r = distance + SEAT_RADIUS + 2
  return { seats, rowLabels: [], bounds: { minX: -r, minY: -r, maxX: r, maxY: r } }
}

function boxLayout(width: number, height: number): ElementLayout {
  return {
    seats: [],
    rowLabels: [],
    bounds: { minX: -width / 2, minY: -height / 2, maxX: width / 2, maxY: height / 2 },
  }
}

function computeLayout(element: SeatingElement): ElementLayout {
  switch (element.kind) {
    case 'rows':
      return layoutRows(element)
    case 'rect-table':
      return layoutRectTable(element)
    case 'round-table':
      return layoutRoundTable(element)
    case 'area':
    case 'shape':
      return boxLayout(element.width, element.height)
    case 'text':
      return boxLayout(
        Math.max(1, element.label.length) * element.fontSize * 0.6,
        element.fontSize * 1.3,
      )
  }
}

const cache = new WeakMap<SeatingElement, ElementLayout>()

/**
 * Computes seat positions, row labels and bounds of an element in its local coordinates.
 *
 * Elements are treated as immutable, so results are cached per element object.
 */
export function layoutElement(element: SeatingElement): ElementLayout {
  let layout = cache.get(element)
  if (!layout) {
    layout = computeLayout(element)
    cache.set(element, layout)
  }
  return layout
}

/** Computes the venue-space bounding box of an element, accounting for its rotation. */
export function worldBounds(element: SeatingElement): Bounds {
  return boundsOf(cornersOf(layoutElement(element).bounds).map((p) => toWorld(element, p)))
}

/** Returns the human-readable name of a seat, such as `Row A, Seat 5` or `Table 2, Seat 3`. */
export function seatDisplayName(element: SeatingElement, seat: SeatGeometry): string {
  if (seat.rowLabel !== null)
    return `${element.label} · Row ${seat.rowLabel}, Seat ${seat.seatLabel}`
  return `${element.label}, Seat ${seat.seatLabel}`
}
