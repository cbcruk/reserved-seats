import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { colors, radii } from '../../styles/tokens.stylex'
import type { IconButtonProps } from './icon-button.types'

const styles = stylex.create({
  root: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 26,
    height: 26,
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.4 },
    lineHeight: 1,
  },
})

/** A small square button holding a single glyph such as `×` or `+`. */
export function IconButton({ type = 'button', ...rest }: IconButtonProps): ReactNode {
  return <button type={type} {...rest} {...stylex.props(styles.root)} />
}
