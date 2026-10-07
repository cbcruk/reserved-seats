import type { CanvasSize, ViewState } from './use-viewport.types'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 6
const FIT_PADDING = 40

/** Limits a zoom level to the range the viewport supports. */
export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

/**
 * Computes the view that centers a venue of the given size in the canvas with padding.
 *
 * @returns The identity view while the canvas has not been measured yet.
 */
export function fitView(size: CanvasSize, contentWidth: number, contentHeight: number): ViewState {
  const { width, height } = size
  if (width === 0 || height === 0) return { x: 0, y: 0, zoom: 1 }
  const zoom = clampZoom(
    Math.min(width / (contentWidth + FIT_PADDING * 2), height / (contentHeight + FIT_PADDING * 2)),
  )
  return {
    zoom,
    x: contentWidth / 2 - width / zoom / 2,
    y: contentHeight / 2 - height / zoom / 2,
  }
}
