import * as stylex from '@stylexjs/stylex'
import { colors, radii, shadows } from '../../styles/tokens.stylex'

/** Styles for a pill-shaped segmented control made of buttons or links. */
export const segmentedStyles = stylex.create({
  root: {
    display: 'inline-flex',
    padding: 3,
    gap: 2,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
  },
  item: {
    flexGrow: 1,
    paddingBlock: 6,
    paddingInline: 12,
    borderWidth: 0,
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
    color: colors.muted,
    textAlign: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  active: {
    backgroundColor: colors.surface,
    color: colors.text,
    boxShadow: shadows.subtle,
  },
})
