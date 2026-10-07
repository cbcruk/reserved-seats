import * as stylex from '@stylexjs/stylex'
import { Fragment, type ReactNode } from 'react'
import { layoutElement } from '../../seating/seat-layout'
import { colors } from '../../styles/tokens.stylex'
import type { ElementViewProps } from './element-view.types'

const NEUTRAL = '#94a3b8'

const styles = stylex.create({
  interactive: {
    cursor: 'pointer',
  },
  hitArea: {
    fill: 'transparent',
  },
  outline: {
    fill: 'none',
    stroke: colors.accent,
    strokeWidth: 1.5,
    strokeDasharray: '5 3',
    pointerEvents: 'none',
  },
  centered: {
    textAnchor: 'middle',
    pointerEvents: 'none',
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: 600,
    fill: colors.muted,
  },
  table: {
    fill: '#fff',
    strokeWidth: 2,
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: 600,
    fill: colors.muted,
  },
  area: {
    fillOpacity: 0.12,
    strokeWidth: 2,
    strokeDasharray: '6 4',
  },
  areaActive: {
    fillOpacity: 0.28,
    strokeDasharray: 'none',
  },
  areaLabel: {
    fontSize: 15,
    fontWeight: 700,
  },
  areaCaption: {
    fontSize: 11,
    fill: colors.muted,
  },
  shapeLabel: {
    fontSize: 14,
    fontWeight: 600,
    fill: '#fff',
    letterSpacing: '0.04em',
  },
})

/** Renders a map element and its seats inside a group positioned and rotated in venue coordinates. */
export function ElementView(props: ElementViewProps): ReactNode {
  const { element, categoryColor, selected, renderSeat, areaCaption, areaActive } = props
  const layout = layoutElement(element)
  const { bounds } = layout
  const tint = categoryColor ?? NEUTRAL

  let body: ReactNode = null
  switch (element.kind) {
    case 'rows':
      body = layout.rowLabels.map((mark) => (
        <text
          key={mark.key}
          x={mark.x}
          y={mark.y}
          dy="0.35em"
          {...stylex.props(styles.centered, styles.rowLabel)}
        >
          {mark.text}
        </text>
      ))
      break
    case 'rect-table':
      body = (
        <>
          <rect
            x={-element.width / 2}
            y={-element.height / 2}
            width={element.width}
            height={element.height}
            rx={6}
            stroke={tint}
            {...stylex.props(styles.table)}
          />
          <text dy="0.35em" {...stylex.props(styles.centered, styles.tableLabel)}>
            {element.label}
          </text>
        </>
      )
      break
    case 'round-table':
      body = (
        <>
          <circle r={element.radius} stroke={tint} {...stylex.props(styles.table)} />
          <text dy="0.35em" {...stylex.props(styles.centered, styles.tableLabel)}>
            {element.label}
          </text>
        </>
      )
      break
    case 'area':
      body = (
        <>
          <rect
            x={-element.width / 2}
            y={-element.height / 2}
            width={element.width}
            height={element.height}
            rx={10}
            fill={tint}
            stroke={tint}
            {...stylex.props(styles.area, areaActive && styles.areaActive)}
          />
          <text
            y={areaCaption ? -8 : 0}
            dy="0.35em"
            fill={tint}
            {...stylex.props(styles.centered, styles.areaLabel)}
          >
            {element.label}
          </text>
          {areaCaption && (
            <text y={12} dy="0.35em" {...stylex.props(styles.centered, styles.areaCaption)}>
              {areaCaption}
            </text>
          )}
        </>
      )
      break
    case 'shape': {
      const { width: w, height: h } = element
      body = (
        <>
          {element.shape === 'rect' ? (
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={element.fill} />
          ) : (
            <ellipse rx={w / 2} ry={h / 2} fill={element.fill} />
          )}
          <text dy="0.35em" {...stylex.props(styles.centered, styles.shapeLabel)}>
            {element.label}
          </text>
        </>
      )
      break
    }
    case 'text':
      body = (
        <text
          dy="0.35em"
          fontSize={element.fontSize}
          fill={element.color}
          {...stylex.props(styles.centered)}
        >
          {element.label}
        </text>
      )
      break
  }

  return (
    <g
      data-kind={element.kind}
      transform={`translate(${element.x} ${element.y}) rotate(${element.rotation})`}
      onPointerDown={props.onPointerDown}
      {...stylex.props(props.onPointerDown !== undefined && styles.interactive)}
    >
      {element.kind === 'rows' && (
        <rect
          x={bounds.minX}
          y={bounds.minY}
          width={bounds.maxX - bounds.minX}
          height={bounds.maxY - bounds.minY}
          {...stylex.props(styles.hitArea)}
        />
      )}
      {body}
      {layout.seats.map((seat) => (
        <Fragment key={seat.id}>{renderSeat(seat)}</Fragment>
      ))}
      {selected && (
        <rect
          x={bounds.minX - 4}
          y={bounds.minY - 4}
          width={bounds.maxX - bounds.minX + 8}
          height={bounds.maxY - bounds.minY + 8}
          vectorEffect="non-scaling-stroke"
          {...stylex.props(styles.outline)}
        />
      )}
    </g>
  )
}
