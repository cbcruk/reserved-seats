import type { Bounds, Placement, Point } from './geometry.types'

/** Rotates a point clockwise around the origin by the given number of degrees. */
export function rotatePoint(point: Point, degrees: number): Point {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos }
}

/** Converts an element-local point to venue coordinates. */
export function toWorld(placement: Placement, point: Point): Point {
  const rotated = rotatePoint(point, placement.rotation)
  return { x: rotated.x + placement.x, y: rotated.y + placement.y }
}

/**
 * Computes the bounding box of a set of points.
 *
 * @param pad Distance added on every side of the box.
 * @returns A zero-size box at the origin when `points` is empty.
 */
export function boundsOf(points: Point[], pad = 0): Bounds {
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
}

/** Returns the four corners of a bounding box, clockwise from the top left. */
export function cornersOf(bounds: Bounds): Point[] {
  return [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ]
}

/** Builds the bounding box spanned by two opposite corners, in any order. */
export function rectFromPoints(a: Point, b: Point): Bounds {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y),
  }
}

/** Checks whether two bounding boxes overlap or touch. */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

/** Checks whether a point lies inside or on the edge of a bounding box. */
export function containsPoint(bounds: Bounds, point: Point): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  )
}
