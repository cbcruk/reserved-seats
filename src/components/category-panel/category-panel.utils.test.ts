import { describe, expect, it } from 'vite-plus/test'
import { nextCategoryColor } from './category-panel.utils'

describe('nextCategoryColor', () => {
  it('picks the first palette color not in use', () => {
    expect(nextCategoryColor([])).toBe('#7c3aed')
    expect(nextCategoryColor(['#7c3aed', '#0d9488'])).toBe('#2563eb')
  })

  it('cycles through the palette once every color is used', () => {
    const used: string[] = []
    while (used.length < 10) used.push(nextCategoryColor(used))
    expect(new Set(used).size).toBe(10)
    expect(nextCategoryColor(used)).toBe(used[0])
  })
})
