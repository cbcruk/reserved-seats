import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import type { SwatchProps } from './swatch.types'

const styles = stylex.create({
  root: {
    display: 'inline-block',
    width: 12,
    height: 12,
    flexShrink: 0,
    borderRadius: '50%',
  },
  color: (color: string) => ({ backgroundColor: color }),
})

/** A small colored dot identifying a ticket category or legend entry. */
export function Swatch({ color, xstyle }: SwatchProps): ReactNode {
  return <span {...stylex.props(styles.root, styles.color(color), xstyle)} />
}
