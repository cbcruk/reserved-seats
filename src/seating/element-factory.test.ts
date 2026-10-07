import { describe, expect, it } from 'vite-plus/test'
import { createElement, duplicateElements } from './element-factory'
import { SAMPLE_MAP } from './sample-venue'

describe('createElement', () => {
  it('rounds the position and leaves ticketed elements unassigned', () => {
    const rows = createElement('rows', { x: 10.6, y: 20.2 }, [])
    expect(rows).toMatchObject({ kind: 'rows', x: 11, y: 20, rotation: 0, categoryId: null })
  })

  it('numbers labels after existing elements of the same family', () => {
    const table = createElement('round-table', { x: 0, y: 0 }, SAMPLE_MAP.elements)
    expect(table.label).toBe('Table 6')
    expect(createElement('rows', { x: 0, y: 0 }, SAMPLE_MAP.elements).label).toBe('Section 4')
  })

  it('skips labels that are already taken', () => {
    const first = createElement('area', { x: 0, y: 0 }, [])
    const renamed = { ...first, label: 'Area 2' }
    expect(createElement('area', { x: 0, y: 0 }, [renamed]).label).toBe('Area 3')
  })

  it('gives every element a unique id', () => {
    const a = createElement('text', { x: 0, y: 0 }, [])
    const b = createElement('text', { x: 0, y: 0 }, [])
    expect(a.id).not.toBe(b.id)
    expect(a.id).toMatch(/^el_/)
  })
})

describe('duplicateElements', () => {
  it('offsets copies and gives each a fresh id and label', () => {
    const source = SAMPLE_MAP.elements.filter((e) => e.id === 't1' || e.id === 't2')
    const copies = duplicateElements(source, SAMPLE_MAP.elements)
    expect(copies.map((c) => c.label)).toEqual(['Table 6', 'Table 7'])
    expect(copies[0]).toMatchObject({ x: source[0]!.x + 30, y: source[0]!.y + 30 })
    expect(copies.map((c) => c.id)).not.toContain('t1')
  })

  it('keeps the text of duplicated text labels', () => {
    const text = SAMPLE_MAP.elements.filter((e) => e.kind === 'text')
    expect(duplicateElements(text, SAMPLE_MAP.elements, 0)[0]).toMatchObject({
      label: '↓ Entrance',
      x: text[0]!.x,
    })
  })
})
