import type { ReactNode } from 'react'
import { render, type RenderResult } from 'vitest-browser-react'
import '../index.css'
import { SeatingProvider } from '../seating/seating-store'

/**
 * Renders UI under a fresh {@linkcode SeatingProvider} seeded with the sample venue.
 *
 * Clears `localStorage` first so state saved by an earlier test does not leak in.
 */
export async function renderWithSeating(ui: ReactNode): Promise<RenderResult> {
  localStorage.clear()
  return render(
    <div style={{ height: 760 }}>
      <SeatingProvider>{ui}</SeatingProvider>
    </div>,
  )
}

/** Finds the SVG group of a seat or element by the text of its `<title>`. */
export function bySvgTitle(text: string): SVGGElement {
  const title = [...document.querySelectorAll('title')].find((t) => t.textContent === text)
  if (!title?.parentElement) throw new Error(`No SVG element titled "${text}"`)
  return title.parentElement as unknown as SVGGElement
}
