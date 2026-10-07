import { describe, expect, it } from 'vite-plus/test'
import { applySelection } from './editor.utils'

describe('applySelection', () => {
  it('replaces the selection', () => {
    expect(applySelection(['a', 'b'], ['c'], 'replace')).toEqual(['c'])
  })

  it('adds without duplicates', () => {
    expect(applySelection(['a', 'b'], ['b', 'c'], 'add')).toEqual(['a', 'b', 'c'])
  })

  it('toggles each picked id', () => {
    expect(applySelection(['a', 'b'], ['b', 'c'], 'toggle')).toEqual(['a', 'c'])
  })
})
