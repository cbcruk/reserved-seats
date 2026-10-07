import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { colors, radii } from '../../styles/tokens.stylex'
import type { ButtonProps } from './button.types'

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBlock: 6,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: radii.sm,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.45 },
    whiteSpace: 'nowrap',
  },
  solid: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    color: '#fff',
  },
  ghost: {
    borderColor: colors.border,
    backgroundColor: {
      default: colors.surface,
      ':hover': colors.bg,
    },
    color: colors.text,
  },
  danger: {
    borderColor: colors.dangerBorder,
    backgroundColor: '#fff',
    color: colors.danger,
  },
  sm: {
    paddingBlock: 3,
    paddingInline: 8,
    fontSize: 12,
  },
  block: {
    width: '100%',
    padding: 10,
    fontWeight: 600,
  },
})

/** A text button in one of the app's standard variants. */
export function Button({
  variant = 'solid',
  size = 'md',
  block = false,
  xstyle,
  type = 'button',
  ...rest
}: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      {...rest}
      {...stylex.props(
        styles.base,
        styles[variant],
        size === 'sm' && styles.sm,
        block && styles.block,
        xstyle,
      )}
    />
  )
}
