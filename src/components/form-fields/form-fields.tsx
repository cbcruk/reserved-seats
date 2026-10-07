import * as stylex from '@stylexjs/stylex'
import { useId, useState, type ReactNode } from 'react'
import { colors, radii } from '../../styles/tokens.stylex'
import type {
  ColorFieldProps,
  FieldProps,
  FieldShellProps,
  InputProps,
  NumberFieldProps,
  SelectFieldProps,
  SelectProps,
  TextFieldProps,
} from './form-fields.types'

const styles = stylex.create({
  control: {
    width: '100%',
    minWidth: 0,
    paddingBlock: 6,
    paddingInline: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':focus': colors.accent },
    borderRadius: radii.sm,
    backgroundColor: { default: colors.surface, ':disabled': colors.bg },
    color: { default: colors.text, ':disabled': colors.muted },
    outlineStyle: { default: 'none', ':focus': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.accentSoft,
  },
  small: {
    paddingBlock: 3,
    paddingInline: 6,
    fontSize: 12,
  },
  color: {
    width: 40,
    height: 32,
    padding: 2,
    flexShrink: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: colors.muted,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  suffix: {
    color: colors.muted,
  },
  aside: {
    color: colors.text,
  },
  hint: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.muted,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
    gap: 10,
  },
})

/** A bare text-like input with the app's control styling. */
export function Input({ size = 'md', xstyle, ...rest }: InputProps): ReactNode {
  return (
    <input {...rest} {...stylex.props(styles.control, size === 'sm' && styles.small, xstyle)} />
  )
}

/** A bare dropdown with the app's control styling. */
export function Select({ size = 'md', xstyle, ...rest }: SelectProps): ReactNode {
  return (
    <select {...rest} {...stylex.props(styles.control, size === 'sm' && styles.small, xstyle)} />
  )
}

/** A bare color picker sized to sit next to other controls. */
export function ColorInput(props: Omit<InputProps, 'type' | 'xstyle'>): ReactNode {
  return <Input {...props} type="color" xstyle={styles.color} />
}

function Field({
  id,
  label,
  hint,
  children,
}: FieldProps & { id: string; children: ReactNode }): ReactNode {
  return (
    <div {...stylex.props(styles.field)}>
      <label htmlFor={id} {...stylex.props(styles.label)}>
        {label}
      </label>
      {children}
      {hint && <p {...stylex.props(styles.hint)}>{hint}</p>}
    </div>
  )
}

/** A numeric input that keeps partial typing local and only reports clamped, valid numbers. */
export function NumberField(props: NumberFieldProps): ReactNode {
  const { value, onChange, min = -Infinity, max = Infinity, step = 1, suffix } = props
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  if (syncedValue !== value) {
    setSyncedValue(value)
    if (Number(draft) !== value) setDraft(String(value))
  }

  const commit = (text: string): void => {
    setDraft(text)
    const n = Number(text)
    if (text.trim() === '' || !Number.isFinite(n)) return
    const clamped = Math.min(max, Math.max(min, n))
    if (clamped !== value) onChange(clamped)
  }

  return (
    <Field id={id} label={props.label} hint={props.hint}>
      <div {...stylex.props(styles.row)}>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={draft}
          min={Number.isFinite(min) ? min : undefined}
          max={Number.isFinite(max) ? max : undefined}
          step={step}
          disabled={props.disabled}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setDraft(String(value))}
        />
        {suffix && <span {...stylex.props(styles.suffix)}>{suffix}</span>}
      </div>
    </Field>
  )
}

/** A labelled single-line text input. */
export function TextField(props: TextFieldProps): ReactNode {
  const id = useId()
  return (
    <Field id={id} label={props.label} hint={props.hint}>
      <Input
        id={id}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </Field>
  )
}

/** A labelled dropdown over a fixed set of string values. */
export function SelectField<T extends string>(props: SelectFieldProps<T>): ReactNode {
  const id = useId()
  return (
    <Field id={id} label={props.label} hint={props.hint}>
      <Select
        id={id}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value as T)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  )
}

/** A labelled color picker. */
export function ColorField(props: ColorFieldProps): ReactNode {
  const id = useId()
  return (
    <Field id={id} label={props.label} hint={props.hint}>
      <ColorInput
        id={id}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </Field>
  )
}

/** Label-and-control layout for custom inputs that are not covered by the other fields. */
export function FieldShell({ label, htmlFor, aside, hint, children }: FieldShellProps): ReactNode {
  return (
    <div {...stylex.props(styles.field)}>
      <label htmlFor={htmlFor} {...stylex.props(styles.label, styles.labelRow)}>
        {label}
        {aside && <span {...stylex.props(styles.aside)}>{aside}</span>}
      </label>
      {children}
      {hint && <p {...stylex.props(styles.hint)}>{hint}</p>}
    </div>
  )
}

/** Responsive grid that packs several short fields per row. */
export function FieldGrid({ children }: { children: ReactNode }): ReactNode {
  return <div {...stylex.props(styles.grid)}>{children}</div>
}
