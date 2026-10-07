import type { StyleXStyles } from '@stylexjs/stylex'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

/** Props shared by every labelled form control. */
export interface FieldProps {
  /** Visible label text, also linked to the control for accessibility. */
  label: string
  /** Whether the control is disabled; defaults to `false`. */
  disabled?: boolean
  /** Muted helper text shown below the control. */
  hint?: ReactNode
}

/** Props of a numeric input that clamps and commits valid numbers only. */
export interface NumberFieldProps extends FieldProps {
  /** Current committed number; the input resyncs to it on blur. */
  value: number
  /** Called with the clamped number once the typed text is valid and differs from `value`. */
  onChange: (value: number) => void
  /** Inclusive lower bound used for clamping; unbounded when omitted. */
  min?: number
  /** Inclusive upper bound used for clamping; unbounded when omitted. */
  max?: number
  /** Increment applied by the input's stepper arrows; defaults to `1`. */
  step?: number
  /** Text shown after the input, such as `°` or `px`. */
  suffix?: string
}

/** Props of a single-line text input. */
export interface TextFieldProps extends FieldProps {
  /** Current text of the input. */
  value: string
  /** Called with the full new text on every keystroke. */
  onChange: (value: string) => void
}

/** One choice of a {@linkcode SelectFieldProps} dropdown. */
export interface SelectOption<T extends string> {
  /** Value reported to `onChange` when this option is chosen; must be unique within the list. */
  value: T
  /** Text shown for this option in the dropdown. */
  label: string
}

/** Props of a dropdown restricted to a fixed set of string values. */
export interface SelectFieldProps<T extends string> extends FieldProps {
  /** Currently selected option value. */
  value: T
  /** Choices listed in display order. */
  options: SelectOption<T>[]
  /** Called with the newly selected option value. */
  onChange: (value: T) => void
}

/** Props of a color picker. */
export interface ColorFieldProps extends FieldProps {
  /** Current color as a `#rrggbb` hex string. */
  value: string
  /** Called with the picked color as a `#rrggbb` hex string whenever it changes. */
  onChange: (value: string) => void
}

/** Props of the bare {@linkcode Input} control; `className` and `style` are replaced by `xstyle`. */
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'style' | 'size'
> {
  /** Control density; `sm` uses tighter padding and a smaller font, defaults to `md`. */
  size?: 'md' | 'sm'
  /** StyleX styles merged after the default control styles. */
  xstyle?: StyleXStyles
}

/** Props of the bare {@linkcode Select} control; `className` and `style` are replaced by `xstyle`. */
export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'style' | 'size'
> {
  /** Control density; `sm` uses tighter padding and a smaller font, defaults to `md`. */
  size?: 'md' | 'sm'
  /** StyleX styles merged after the default control styles. */
  xstyle?: StyleXStyles
}

/** Props of {@linkcode FieldShell}. */
export interface FieldShellProps {
  /** Visible label text. */
  label: string
  /** Id of the control the label points to; omit when there is no single focusable control. */
  htmlFor?: string
  /** Content shown at the end of the label row, such as the current value. */
  aside?: ReactNode
  /** Muted helper text shown below the control. */
  hint?: ReactNode
  /** The custom control rendered under the label. */
  children: ReactNode
}
