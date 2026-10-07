import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { SEAT_RADIUS } from '../../seating/seat-layout'
import { colors } from '../../styles/tokens.stylex'
import type { SeatMarkProps } from './seat-mark.types'

const styles = stylex.create({
  interactive: {
    cursor: 'pointer',
  },
  body: {
    stroke: '#fff',
    strokeWidth: 1,
  },
  bodyInteractive: {
    stroke: {
      default: '#fff',
      [stylex.when.ancestor(':hover')]: colors.text,
    },
    strokeWidth: {
      default: 1,
      [stylex.when.ancestor(':hover')]: 1.5,
    },
  },
  muted: {
    opacity: 0.55,
  },
  ring: {
    fill: 'none',
    stroke: colors.accent,
    strokeWidth: 2,
  },
  label: {
    fill: '#fff',
    fontWeight: 600,
    textAnchor: 'middle',
    pointerEvents: 'none',
  },
})

/** Draws one seat as a numbered circle, with an accessibility glyph and selection ring when needed. */
export function SeatMark(props: SeatMarkProps): ReactNode {
  const { x, y, fill, label, accessible, selected, muted, title } = props
  const interactive = props.onPointerDown !== undefined
  return (
    <g
      transform={`translate(${x} ${y})`}
      onPointerDown={props.onPointerDown}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      {...stylex.props(stylex.defaultMarker(), interactive && styles.interactive)}
    >
      {title && <title>{title}</title>}
      {selected && <circle r={SEAT_RADIUS + 3} {...stylex.props(styles.ring)} />}
      <circle
        r={SEAT_RADIUS}
        fill={fill}
        {...stylex.props(styles.body, interactive && styles.bodyInteractive, muted && styles.muted)}
      />
      {label !== null && (
        <text
          dy="0.35em"
          fontSize={accessible ? 10 : label.length > 2 ? 6.5 : 8}
          {...stylex.props(styles.label)}
        >
          {accessible ? '♿' : label}
        </text>
      )}
    </g>
  )
}
