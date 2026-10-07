import { describe, expect, it } from 'vite-plus/test'
import { clampZoom, fitView } from './use-viewport.utils'

describe('clampZoom', () => {
  it('keeps the zoom between 0.2 and 6', () => {
    expect(clampZoom(0.01)).toBe(0.2)
    expect(clampZoom(1.5)).toBe(1.5)
    expect(clampZoom(100)).toBe(6)
  })
})

describe('fitView', () => {
  it('returns the identity view before the canvas is measured', () => {
    expect(fitView({ width: 0, height: 600 }, 1000, 800)).toEqual({ x: 0, y: 0, zoom: 1 })
  })

  it('fits the limiting dimension with padding and centers the venue', () => {
    const view = fitView({ width: 1080, height: 2000 }, 1000, 800)
    expect(view.zoom).toBe(1)
    expect(view.x).toBe(-40)
    expect(view.x + 1080 / view.zoom / 2).toBe(500)
    expect(view.y + 2000 / view.zoom / 2).toBe(400)
  })
})
