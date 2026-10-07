import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Point } from '../seating/geometry.types'
import type { CanvasSize, Viewport, ViewState } from './use-viewport.types'
import { clampZoom, fitView } from './use-viewport.utils'

/**
 * Manages pan and zoom for an SVG that displays a venue of the given size.
 *
 * Pinch or Ctrl/⌘ + wheel zooms around the cursor; a plain wheel or trackpad scroll pans.
 * The view keeps fitting the venue as the canvas or venue resizes, until the user pans or zooms.
 */
export function useViewport(contentWidth: number, contentHeight: number): Viewport {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 })
  const [manualView, setManualView] = useState<ViewState | null>(null)
  const view = manualView ?? fitView(size, contentWidth, contentHeight)
  const svgElementRef = useRef<SVGSVGElement | null>(null)
  const sizeRef = useRef(size)
  sizeRef.current = size
  const viewRef = useRef(view)
  viewRef.current = view

  const updateView = useCallback((next: (current: ViewState) => ViewState): void => {
    setManualView((manual) => next(manual ?? viewRef.current))
  }, [])

  const zoomAround = useCallback(
    (factor: number, anchor: Point | null): void => {
      updateView((v) => {
        const zoom = clampZoom(v.zoom * factor)
        const { width, height } = sizeRef.current
        const ax = anchor?.x ?? v.x + width / v.zoom / 2
        const ay = anchor?.y ?? v.y + height / v.zoom / 2
        return { zoom, x: ax - ((ax - v.x) * v.zoom) / zoom, y: ay - ((ay - v.y) * v.zoom) / zoom }
      })
    },
    [updateView],
  )

  const clientToWorld = useCallback((clientX: number, clientY: number): Point => {
    const matrix = svgElementRef.current?.getScreenCTM()
    if (!matrix) return { x: 0, y: 0 }
    const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
    return { x: p.x, y: p.y }
  }, [])

  const svgRef = useCallback(
    (svg: SVGSVGElement): (() => void) => {
      svgElementRef.current = svg
      const observer = new ResizeObserver(([entry]) => {
        if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      })
      const onWheel = (event: WheelEvent): void => {
        event.preventDefault()
        if (event.ctrlKey || event.metaKey) {
          zoomAround(Math.exp(-event.deltaY * 0.01), clientToWorld(event.clientX, event.clientY))
        } else {
          updateView((v) => ({
            ...v,
            x: v.x + event.deltaX / v.zoom,
            y: v.y + event.deltaY / v.zoom,
          }))
        }
      }
      observer.observe(svg)
      svg.addEventListener('wheel', onWheel, { passive: false })
      return () => {
        observer.disconnect()
        svg.removeEventListener('wheel', onWheel)
        svgElementRef.current = null
      }
    },
    [zoomAround, clientToWorld, updateView],
  )

  const beginPan = useCallback((event: ReactPointerEvent): void => {
    const startX = event.clientX
    const startY = event.clientY
    const o = viewRef.current
    const onMove = (e: PointerEvent): void => {
      setManualView({
        zoom: o.zoom,
        x: o.x - (e.clientX - startX) / o.zoom,
        y: o.y - (e.clientY - startY) / o.zoom,
      })
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const zoomBy = useCallback((factor: number): void => zoomAround(factor, null), [zoomAround])

  const fit = useCallback((): void => setManualView(null), [])

  const viewBox = `${view.x} ${view.y} ${Math.max(1, size.width) / view.zoom} ${Math.max(1, size.height) / view.zoom}`

  return { svgRef, viewBox, zoom: view.zoom, clientToWorld, beginPan, zoomBy, fit }
}
