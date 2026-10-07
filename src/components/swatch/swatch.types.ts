import type { StyleXStyles } from '@stylexjs/stylex'

/** Props of {@linkcode Swatch}. */
export interface SwatchProps {
  /** Any CSS color used as the dot's fill. */
  color: string
  /** StyleX styles merged after the default dot styles. */
  xstyle?: StyleXStyles
}
