/** A 2D point in venue or element-local coordinates. */
export interface Point {
  /** Horizontal coordinate, increasing to the right. */
  x: number
  /** Vertical coordinate, increasing downward. */
  y: number
}

/** An axis-aligned bounding box. */
export interface Bounds {
  /** Left edge. */
  minX: number
  /** Top edge. */
  minY: number
  /** Right edge. */
  maxX: number
  /** Bottom edge. */
  maxY: number
}

/** Position and rotation that place element-local coordinates in the venue. */
export interface Placement {
  /** Venue x coordinate that the local origin maps to. */
  x: number
  /** Venue y coordinate that the local origin maps to. */
  y: number
  /** Clockwise rotation in degrees applied around the local origin. */
  rotation: number
}
