import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { colors, radii } from '../../styles/tokens.stylex'
import type { FieldsetProps, PanelHeaderProps } from './panel.types'

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 15,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  hint: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.muted,
  },
  notice: {
    margin: 0,
    paddingBlock: 8,
    paddingInline: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.warnSoft,
    fontSize: 12,
  },
  fieldset: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    margin: 0,
    paddingTop: 10,
    paddingInline: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  legend: {
    paddingInline: 4,
    fontSize: 12,
    fontWeight: 600,
  },
})

/** Vertical stack that lays out the contents of a side panel. */
export function Panel({ children }: { children: ReactNode }): ReactNode {
  return <div {...stylex.props(styles.panel)}>{children}</div>
}

/** Panel heading with optional actions aligned to the right. */
export function PanelHeader({ title, children }: PanelHeaderProps): ReactNode {
  return (
    <header {...stylex.props(styles.header)}>
      <h2 {...stylex.props(styles.title)}>{title}</h2>
      {children && <div {...stylex.props(styles.actions)}>{children}</div>}
    </header>
  )
}

/** Horizontal row of panel buttons. */
export function PanelActions({ children }: { children: ReactNode }): ReactNode {
  return <div {...stylex.props(styles.actions)}>{children}</div>
}

/** Muted helper text. */
export function Hint({ children }: { children: ReactNode }): ReactNode {
  return <p {...stylex.props(styles.hint)}>{children}</p>
}

/** Highlighted warning text. */
export function Notice({ children }: { children: ReactNode }): ReactNode {
  return <p {...stylex.props(styles.notice)}>{children}</p>
}

/** Bordered group of related fields with a legend. */
export function Fieldset({ legend, children }: FieldsetProps): ReactNode {
  return (
    <fieldset {...stylex.props(styles.fieldset)}>
      <legend {...stylex.props(styles.legend)}>{legend}</legend>
      {children}
    </fieldset>
  )
}
