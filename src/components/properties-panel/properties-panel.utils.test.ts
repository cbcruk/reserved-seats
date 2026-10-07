import { describe, expect, it } from 'vite-plus/test'
import { SAMPLE_MAP } from '../../seating/sample-venue'
import { categoryOptions, NO_CATEGORY } from './properties-panel.utils'

describe('categoryOptions', () => {
  it('leads with a "none" entry followed by every category', () => {
    const options = categoryOptions(SAMPLE_MAP.categories, 'None')
    expect(options[0]).toEqual({ value: NO_CATEGORY, label: 'None' })
    expect(options.slice(1).map((o) => o.value)).toEqual(SAMPLE_MAP.categories.map((c) => c.id))
  })
})
