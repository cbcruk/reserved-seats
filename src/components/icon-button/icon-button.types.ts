import type { ButtonHTMLAttributes } from 'react'

/** Props of {@linkcode IconButton}; an `aria-label` is required because the content is a glyph. */
export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> {
  'aria-label': string
}
