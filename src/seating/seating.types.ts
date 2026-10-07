/** Numbering scheme used to label rows and seats; `odd` and `even` are Wix's "alternate numbers". */
export type LabelScheme = 'numbers' | 'odd' | 'even' | 'letters'

/** Direction in which labels increase across a block of rows or around a table. */
export type LabelDirection = 'forward' | 'reverse'

/** Rules for generating a sequence of labels such as `1, 2, 3` or `A, B, C`. */
export interface LabelConfig {
  /** How each label is formatted: consecutive numbers, odd or even numbers, or letters. */
  scheme: LabelScheme
  /** First label in the sequence, e.g. `"1"` or `"A"`. Invalid values fall back to the scheme's default. */
  start: string
  /** `reverse` assigns the first label to the last position instead of the first. */
  direction: LabelDirection
}

/** Side of each row where the row label is drawn. */
export type RowLabelPosition = 'left' | 'right' | 'both' | 'none'

/** Discriminator for every element that can be placed on a seating map. */
export type ElementKind = 'rows' | 'rect-table' | 'round-table' | 'area' | 'shape' | 'text'

/** Properties shared by every map element. */
export interface ElementBase {
  /** Unique element id, also used as the prefix of its seat ids. */
  id: string
  /** Discriminator that selects the concrete element type. */
  kind: ElementKind
  /** Horizontal center of the element in venue coordinates. */
  x: number
  /** Vertical center of the element in venue coordinates. */
  y: number
  /** Clockwise rotation in degrees around the element center. */
  rotation: number
  /** Display name such as `Table 3`; for text elements, the text that is drawn. */
  label: string
}

/** A block of straight or curved rows of seats. */
export interface RowsElement extends ElementBase {
  /** Marks this element as a block of rows. */
  kind: 'rows'
  /** Ticket category for every seat in the block, or `null` when unassigned and not for sale. */
  categoryId: string | null
  /** Number of rows; values below `1` are treated as `1`. */
  rowCount: number
  /** Number of seats in each row; values below `1` are treated as `1`. */
  seatsPerRow: number
  /** Distance between neighboring seat centers along a row, in venue units. */
  seatSpacing: number
  /** Distance between consecutive rows, in venue units. */
  rowSpacing: number
  /** Arc angle in degrees: `0` is straight, `180` a half circle, `360` a full circle. */
  curve: number
  /** Labels assigned to rows, starting with the top row before rotation. */
  rowLabels: LabelConfig
  /** Where row labels are drawn; ignored for full-circle blocks, which have no row ends. */
  rowLabelPosition: RowLabelPosition
  /** Labels assigned to seats left to right before rotation, restarting on every row. */
  seatLabels: LabelConfig
}

/** Chair counts on each side of a rectangular table. */
export interface TableSides {
  /** Number of chairs along the top edge. */
  top: number
  /** Number of chairs along the right edge. */
  right: number
  /** Number of chairs along the bottom edge. */
  bottom: number
  /** Number of chairs along the left edge. */
  left: number
}

/** A rectangular table with chairs on up to four sides. */
export interface RectTableElement extends ElementBase {
  /** Marks this element as a rectangular table. */
  kind: 'rect-table'
  /** Ticket category for every chair, or `null` when unassigned and not for sale. */
  categoryId: string | null
  /** Width of the table top in venue units, excluding chairs. */
  width: number
  /** Height of the table top in venue units, excluding chairs. */
  height: number
  /** Chair count on each side of the table. */
  seats: TableSides
  /** Labels assigned to chairs clockwise, starting at the top-left chair. */
  seatLabels: LabelConfig
}

/** A round table with chairs spread evenly around it. */
export interface RoundTableElement extends ElementBase {
  /** Marks this element as a round table. */
  kind: 'round-table'
  /** Ticket category for every chair, or `null` when unassigned and not for sale. */
  categoryId: string | null
  /** Radius of the table top in venue units, excluding chairs. */
  radius: number
  /** Number of chairs around the table. */
  seatCount: number
  /** Labels assigned to chairs clockwise, starting at the top. */
  seatLabels: LabelConfig
}

/** A general admission zone sold by quantity instead of by seat. */
export interface AreaElement extends ElementBase {
  /** Marks this element as a general admission area. */
  kind: 'area'
  /** Ticket category admissions are sold under, or `null` when the area is not for sale. */
  categoryId: string | null
  /** Width of the area in venue units. */
  width: number
  /** Height of the area in venue units. */
  height: number
  /** Maximum number of admissions that can be sold. */
  capacity: number
}

/** Outline of a decorative {@linkcode ShapeElement}. */
export type ShapeType = 'rect' | 'ellipse'

/** A non-seating object such as a stage, bar or dance floor. */
export interface ShapeElement extends ElementBase {
  /** Marks this element as a decorative shape. */
  kind: 'shape'
  /** Outline drawn for the shape. */
  shape: ShapeType
  /** Width of the shape in venue units. */
  width: number
  /** Height of the shape in venue units. */
  height: number
  /** CSS fill color, e.g. `#475569`. */
  fill: string
}

/** A free-standing text label such as "Entrance". */
export interface TextElement extends ElementBase {
  /** Marks this element as a text label. */
  kind: 'text'
  /** Font size in venue units. */
  fontSize: number
  /** CSS text color, e.g. `#334155`. */
  color: string
}

/** Any element that can be placed on a seating map. */
export type SeatingElement =
  | RowsElement
  | RectTableElement
  | RoundTableElement
  | AreaElement
  | ShapeElement
  | TextElement

/** Elements that contain individually reservable seats. */
export type SeatedElement = RowsElement | RectTableElement | RoundTableElement

/** Elements that can be assigned a ticket category. */
export type TicketedElement = SeatedElement | AreaElement

/** One price tier of a ticket category, e.g. "Adult" or "Student". */
export interface PriceOption {
  /** Unique id of the price option. */
  id: string
  /** Name shown to guests when choosing a price, e.g. `Adult`. */
  name: string
  /** Price in the smallest display unit of the venue currency. */
  amount: number
}

/** A ticket type assigned to rows, tables, areas or individual seats. */
export interface TicketCategory {
  /** Unique id referenced by `categoryId` on elements and seat overrides. */
  id: string
  /** Name shown in the legend and on order lines, e.g. `VIP`. */
  name: string
  /** CSS color used to paint seats and areas in this category. */
  color: string
  /** Always holds at least one option. */
  priceOptions: PriceOption[]
}

/** Per-seat settings that take precedence over the owning element. */
export interface SeatOverride {
  /** `undefined` inherits the element category; `null` removes the seat from sale. */
  categoryId?: string | null
  /** Whether the seat is marked as wheelchair accessible; absent means not accessible. */
  accessible?: boolean
}

/** The full editable venue: geometry, ticket categories and seat properties. */
export interface SeatingMap {
  /** Venue or event name shown in the app. */
  name: string
  /** Width of the venue canvas in venue units. */
  width: number
  /** Height of the venue canvas in venue units. */
  height: number
  /** CSS color filling the venue canvas behind all elements. */
  background: string
  /** Elements in drawing order, from back to front. */
  elements: SeatingElement[]
  /** Ticket categories available on this map. */
  categories: TicketCategory[]
  /** Keyed by seat id (see {@linkcode SeatGeometry.id}). */
  seatOverrides: Record<string, SeatOverride>
}

/** A purchased ticket line stored on an {@linkcode Order}. */
export interface OrderLine {
  /** Whether the line buys a single seat or admissions to an area. */
  kind: 'seat' | 'area'
  /** Seat id for seat lines, element id for area lines. */
  targetId: string
  /** Human-readable name of the seat or area at the time of purchase. */
  label: string
  /** Name of the ticket category at the time of purchase. */
  categoryName: string
  /** Name of the chosen price option at the time of purchase. */
  priceOptionName: string
  /** Price of one ticket in KRW. */
  unitAmount: number
  /** Number of tickets; always `1` for seat lines. */
  quantity: number
}

/** A completed checkout. */
export interface Order {
  /** Unique order id, referenced by {@linkcode SalesState.soldSeats}. */
  id: string
  /** Checkout time as an ISO 8601 string. */
  createdAt: string
  /** Purchased tickets, one line per seat or area. */
  lines: OrderLine[]
  /** Sum of `unitAmount × quantity` over all lines, in KRW. */
  total: number
}

/** Everything sold so far for the event. */
export interface SalesState {
  /** Maps a sold seat id to the id of the order that bought it. */
  soldSeats: Record<string, string>
  /** Maps an area element id to the number of admissions sold. */
  areaSold: Record<string, number>
  /** Completed orders in checkout order. */
  orders: Order[]
}

/** A seat's position and labels in the local coordinates of its element. */
export interface SeatGeometry {
  /** Stable id in the form `elementId:row:seat`. */
  id: string
  /** Id of the element that owns the seat. */
  elementId: string
  /** Horizontal seat center relative to the element center, before rotation. */
  x: number
  /** Vertical seat center relative to the element center, before rotation. */
  y: number
  /** Label of the seat's row, or `null` for table seats. */
  rowLabel: string | null
  /** Label of the seat within its row or table. */
  seatLabel: string
}

/** A row label drawn next to a row, in element-local coordinates. */
export interface RowLabelMark {
  /** Key unique within the element, in the form `row:l` or `row:r`. */
  key: string
  /** Horizontal center of the label relative to the element center. */
  x: number
  /** Vertical center of the label relative to the element center. */
  y: number
  /** Row label text to draw. */
  text: string
}
