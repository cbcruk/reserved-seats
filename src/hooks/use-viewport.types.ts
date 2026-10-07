import type { PointerEvent as ReactPointerEvent, RefCallback } from 'react'
import type { Point } from '../seating/geometry.types'

/** Top-left corner and zoom level of the visible venue region. */
export interface ViewState {
  /** Venue x coordinate shown at the left edge of the canvas. */
  x: number
  /** Venue y coordinate shown at the top edge of the canvas. */
  y: number
  /** Screen pixels per venue unit, clamped between `0.2` and `6`. */
  zoom: number
}

/** Measured pixel size of the canvas element. */
export interface CanvasSize {
  /** Width in CSS pixels; `0` until the first measurement. */
  width: number
  /** Height in CSS pixels; `0` until the first measurement. */
  height: number
}

/** Pan and zoom controls for an SVG canvas, returned by {@linkcode useViewport}. */
export interface Viewport {
  /** Ref callback to attach to the SVG so its size and wheel events are tracked. */
  svgRef: RefCallback<SVGSVGElement>
  /** Value for the SVG's `viewBox` attribute describing the visible region. */
  viewBox: string
  /** Current screen pixels per venue unit, between `0.2` and `6`. */
  zoom: number
  /** Converts a pointer position to venue coordinates. */
  clientToWorld: (clientX: number, clientY: number) => Point
  /** Starts panning from a pointer-down event until the pointer is released. */
  beginPan: (event: ReactPointerEvent) => void
  /** Multiplies the zoom by a factor around the canvas center; values above `1` zoom in. */
  zoomBy: (factor: number) => void
  /** Returns to fitting the whole venue in the canvas, following later resizes again. */
  fit: () => void
}
