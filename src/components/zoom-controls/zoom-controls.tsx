import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { colors, radii, shadows } from '../../styles/tokens.stylex'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'
import type { ZoomControlsProps } from './zoom-controls.types'

const styles = stylex.create({
  root: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    boxShadow: shadows.raised,
  },
  value: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
  },
})

/** Floating zoom in, zoom out and fit-to-screen buttons for a canvas. */
export function ZoomControls({ viewport }: ZoomControlsProps): ReactNode {
  return (
    <div {...stylex.props(styles.root)}>
      <IconButton aria-label="Zoom out" onClick={() => viewport.zoomBy(1 / 1.25)}>
        −
      </IconButton>
      <span {...stylex.props(styles.value)}>{Math.round(viewport.zoom * 100)}%</span>
      <IconButton aria-label="Zoom in" onClick={() => viewport.zoomBy(1.25)}>
        +
      </IconButton>
      <Button variant="ghost" onClick={viewport.fit}>
        Fit
      </Button>
    </div>
  )
}
