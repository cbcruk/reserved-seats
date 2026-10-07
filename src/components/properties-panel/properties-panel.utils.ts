import type { SelectOption } from '../form-fields/form-fields.types'
import type {
  LabelDirection,
  LabelScheme,
  RowLabelPosition,
  TicketCategory,
} from '../../seating/seating.types'

/** Select value meaning "no ticket category". */
export const NO_CATEGORY = ''

/** Builds dropdown options for picking a ticket category, led by a "none" entry. */
export function categoryOptions(
  categories: TicketCategory[],
  noneLabel = 'No ticket (not for sale)',
): SelectOption<string>[] {
  return [
    { value: NO_CATEGORY, label: noneLabel },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]
}

/** Dropdown options for {@linkcode LabelScheme}. */
export const SCHEME_OPTIONS: SelectOption<LabelScheme>[] = [
  { value: 'numbers', label: 'Numbers (1, 2, 3)' },
  { value: 'odd', label: 'Odd numbers (1, 3, 5)' },
  { value: 'even', label: 'Even numbers (2, 4, 6)' },
  { value: 'letters', label: 'Letters (A, B, C)' },
]

/** Dropdown options for {@linkcode LabelDirection}. */
export const DIRECTION_OPTIONS: SelectOption<LabelDirection>[] = [
  { value: 'forward', label: 'Left to right / clockwise' },
  { value: 'reverse', label: 'Right to left / counter-clockwise' },
]

/** Dropdown options for {@linkcode RowLabelPosition}. */
export const ROW_LABEL_POSITION_OPTIONS: SelectOption<RowLabelPosition>[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both sides' },
  { value: 'none', label: 'Hidden' },
]
