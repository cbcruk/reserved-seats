import type { ReactNode } from 'react'

/** Props of {@linkcode PanelHeader}. */
export interface PanelHeaderProps {
  /** Heading content rendered as the panel's `h2`. */
  title: ReactNode
  /** Buttons shown on the right of the title. */
  children?: ReactNode
}

/** Props of {@linkcode Fieldset}. */
export interface FieldsetProps {
  /** Caption shown in the fieldset's border. */
  legend: string
  /** Fields grouped inside the fieldset. */
  children: ReactNode
}
