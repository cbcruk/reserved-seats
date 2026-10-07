# Reserved Seats

A reserved seating map builder and guest booking flow, modeled on
[Wix Events seating maps](https://support.wix.com/en/article/wix-events-creating-a-seating-map).

Organizers lay out a venue and assign ticket categories; guests pick seats on the same map and check out.

## Features

### Editor (`#/editor`)

- **Elements**
  - Rows of seats, straight or curved up to a full circle.
  - Rectangular tables with chairs on each side, and round tables.
  - General admission areas sold by capacity.
  - Decorative shapes and text labels.
- **Labels**: rows and seats can be numbered, odd, even or lettered, from any start value, in either direction.
- **Tickets**: categories each have a color and one or more price options, such as Adult and Student.
- **Per-seat settings**: with the seat tool you can change a single seat's ticket, take it off sale or mark it wheelchair accessible.
- **Editing**:
  - Move, rotate, duplicate and delete elements.
  - Select several elements with a marquee.
  - Undo and redo changes.
- **Sold seats**: once a seat has sold, its labels are locked so sold tickets keep the label they were bought with.

| Shortcut       | Action                |
| -------------- | --------------------- |
| `V` / `S`      | Selection / seat tool |
| `⌘Z` / `⇧⌘Z`   | Undo / redo           |
| `⌘D`           | Duplicate             |
| `⌘A`           | Select all            |
| `Del`          | Delete                |
| Arrows         | Nudge (`⇧` for ×10)   |
| `[` / `]`      | Rotate 15°            |
| `Space` + drag | Pan                   |
| `⌘` + wheel    | Zoom                  |

### Guest booking (`#/guest`)

- **Choosing tickets**: guests click available seats, or add standing tickets from an area by quantity.
- **Order limit**: up to 10 tickets per order.
- **Cart**: when a category has several prices, each ticket has a price selector.
- **Checkout**: confirming the order records the sale, and those seats show as sold.
