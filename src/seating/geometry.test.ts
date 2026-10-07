import { describe, expect, it } from 'vite-plus/test'
import {
  boundsIntersect,
  boundsOf,
  containsPoint,
  cornersOf,
  rectFromPoints,
  rotatePoint,
  toWorld,
} from './geometry'

describe('rotatePoint', () => {
  it('rotates clockwise in screen coordinates', () => {
    const p = rotatePoint({ x: 10, y: 0 }, 90)
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(10)
  })
})

describe('toWorld', () => {
  it('rotates around the element center and then translates', () => {
    const p = toWorld({ x: 100, y: 50, rotation: 180 }, { x: 10, y: 5 })
    expect(p.x).toBeCloseTo(90)
    expect(p.y).toBeCloseTo(45)
  })
})

describe('boundsOf', () => {
  it('pads the box on every side', () => {
    expect(
      boundsOf(
        [
          { x: 1, y: 5 },
          { x: -3, y: 2 },
        ],
        2,
      ),
    ).toEqual({ minX: -5, minY: 0, maxX: 3, maxY: 7 })
  })

  it('returns a zero-size box for no points', () => {
    expect(boundsOf([], 10)).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
  })
})

describe('box helpers', () => {
  const box = rectFromPoints({ x: 10, y: 10 }, { x: 0, y: 0 })

  it('normalizes corners given in any order', () => {
    expect(box).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
    expect(cornersOf(box)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ])
  })

  it('treats touching edges as intersecting and contained', () => {
    expect(boundsIntersect(box, { minX: 10, minY: 10, maxX: 20, maxY: 20 })).toBe(true)
    expect(boundsIntersect(box, { minX: 11, minY: 0, maxX: 20, maxY: 10 })).toBe(false)
    expect(containsPoint(box, { x: 10, y: 0 })).toBe(true)
    expect(containsPoint(box, { x: 10.1, y: 0 })).toBe(false)
  })
})
