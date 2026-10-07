import * as stylex from '@stylexjs/stylex'
import { colors, radii, shadows } from '../../styles/tokens.stylex'

/** Styles shared by the editor and guest SVG canvases and their overlays. */
export const canvasStyles = stylex.create({
  frame: {
    position: 'relative',
    flexGrow: 1,
    minHeight: 0,
  },
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
    userSelect: 'none',
    touchAction: 'none',
  },
  cursor: (cursor: 'default' | 'grab' | 'crosshair') => ({ cursor }),
  venue: {
    stroke: colors.border,
  },
  marquee: {
    fill: 'rgb(79 70 229 / 0.08)',
    stroke: colors.accent,
    strokeDasharray: '4 3',
  },
  overlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    margin: 0,
    paddingBlock: 6,
    paddingInline: 10,
    borderRadius: radii.sm,
    backgroundColor: 'rgb(255 255 255 / 0.92)',
    boxShadow: shadows.raised,
    fontSize: 12,
    color: colors.muted,
    pointerEvents: 'none',
  },
  status: {
    color: colors.text,
  },
  warn: {
    backgroundColor: colors.warnSoft,
  },
})
