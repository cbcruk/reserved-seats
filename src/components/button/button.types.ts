import type { StyleXStyles } from '@stylexjs/stylex'
import type { ButtonHTMLAttributes } from 'react'

/** Visual treatment of a {@linkcode Button}. */
export type ButtonVariant = 'solid' | 'ghost' | 'danger'

/** Props of {@linkcode Button}; `className` and `style` are replaced by `xstyle`. */
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  /** Stretches the button to the full width with emphasized text, for primary calls to action. */
  block?: boolean
  xstyle?: StyleXStyles
}
