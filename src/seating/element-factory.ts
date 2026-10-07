import type { Point } from './geometry.types'
import { createId } from './ids'
import type { ElementKind, LabelConfig, SeatingElement } from './seating.types'

const NUMBERS: LabelConfig = { scheme: 'numbers', start: '1', direction: 'forward' }
const LETTERS: LabelConfig = { scheme: 'letters', start: 'A', direction: 'forward' }

const NAME_PREFIX: Record<ElementKind, string> = {
  rows: 'Section',
  'rect-table': 'Table',
  'round-table': 'Table',
  area: 'Area',
  shape: 'Shape',
  text: 'Text',
}

function nextLabel(kind: ElementKind, existing: SeatingElement[]): string {
  const prefix = NAME_PREFIX[kind]
  if (kind === 'text') return 'Label'
  const used = new Set(existing.map((e) => e.label))
  let n = existing.filter((e) => NAME_PREFIX[e.kind] === prefix).length + 1
  while (used.has(`${prefix} ${n}`)) n++
  return `${prefix} ${n}`
}

/**
 * Creates an element of the given kind with sensible defaults, centered on a point.
 *
 * @param existing Elements already on the map, used to pick an unused label such as `Table 3`.
 */
export function createElement(
  kind: ElementKind,
  at: Point,
  existing: SeatingElement[],
): SeatingElement {
  const base = {
    id: createId('el'),
    x: Math.round(at.x),
    y: Math.round(at.y),
    rotation: 0,
    label: nextLabel(kind, existing),
  }
  switch (kind) {
    case 'rows':
      return {
        ...base,
        kind,
        categoryId: null,
        rowCount: 4,
        seatsPerRow: 10,
        seatSpacing: 22,
        rowSpacing: 26,
        curve: 0,
        rowLabels: LETTERS,
        rowLabelPosition: 'left',
        seatLabels: NUMBERS,
      }
    case 'rect-table':
      return {
        ...base,
        kind,
        categoryId: null,
        width: 90,
        height: 44,
        seats: { top: 3, right: 1, bottom: 3, left: 1 },
        seatLabels: NUMBERS,
      }
    case 'round-table':
      return { ...base, kind, categoryId: null, radius: 30, seatCount: 8, seatLabels: NUMBERS }
    case 'area':
      return { ...base, kind, categoryId: null, width: 200, height: 120, capacity: 100 }
    case 'shape':
      return {
        ...base,
        kind,
        label: 'Stage',
        shape: 'rect',
        width: 240,
        height: 70,
        fill: '#475569',
      }
    case 'text':
      return { ...base, kind, fontSize: 18, color: '#334155' }
  }
}

/** Copies elements with fresh ids, shifted by an offset so the copies are visible. */
export function duplicateElements(
  elements: SeatingElement[],
  existing: SeatingElement[],
  offset = 30,
): SeatingElement[] {
  const all = [...existing]
  return elements.map((element) => {
    const copy: SeatingElement = {
      ...element,
      id: createId('el'),
      x: element.x + offset,
      y: element.y + offset,
      label: element.kind === 'text' ? element.label : nextLabel(element.kind, all),
    }
    all.push(copy)
    return copy
  })
}
