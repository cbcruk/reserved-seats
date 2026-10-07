import type { SeatingElement, SeatingMap, SeatOverride, TicketCategory } from './seating.types'

/** Partial update for a single element; `id` and `kind` are never changed. */
export type ElementPatch = Partial<Omit<SeatingElement, 'id' | 'kind'>> & Record<string, unknown>

/** Venue-level settings editable from the map panel. */
export type MapSettingsPatch = Partial<Pick<SeatingMap, 'name' | 'width' | 'height' | 'background'>>

/** An edit applied to the seating map. */
export type MapAction =
  | {
      /** Appends elements on top of the existing ones. */
      type: 'add-elements'
      /** Fully formed elements with unique ids. */
      elements: SeatingElement[]
    }
  | {
      /** Merges a patch into one element. */
      type: 'update-element'
      /** Id of the element to update. */
      id: string
      /** Fields to overwrite. */
      patch: ElementPatch
    }
  | {
      /** Shifts elements by an offset. */
      type: 'move-elements'
      /** Ids of the elements to move. */
      ids: string[]
      /** Horizontal offset in venue units. */
      dx: number
      /** Vertical offset in venue units. */
      dy: number
    }
  | {
      /** Removes elements together with their seat overrides. */
      type: 'delete-elements'
      /** Ids of the elements to delete. */
      ids: string[]
    }
  | {
      /** Sets the category of ticketed elements and clears their per-seat category overrides. */
      type: 'assign-category'
      /** Ids of the elements to assign; non-ticketed elements are skipped. */
      elementIds: string[]
      /** Category to assign, or `null` to take the elements off sale. */
      categoryId: string | null
    }
  | {
      /** Merges a patch into the overrides of individual seats. */
      type: 'update-seats'
      /** Ids of the seats to update. */
      seatIds: string[]
      /** Override fields to set. */
      patch: SeatOverride
    }
  | {
      /** Removes all overrides from seats so they inherit from their element again. */
      type: 'reset-seats'
      /** Ids of the seats to reset. */
      seatIds: string[]
    }
  | {
      /** Replaces a category with the same id, or adds it when under the category limit. */
      type: 'upsert-category'
      /** Category to store. */
      category: TicketCategory
    }
  | {
      /** Deletes a category and unassigns it from elements and seat overrides. */
      type: 'delete-category'
      /** Id of the category to delete. */
      id: string
    }
  | {
      /** Merges venue-level settings into the map. */
      type: 'update-settings'
      /** Settings to overwrite. */
      patch: MapSettingsPatch
    }
  | {
      /** Replaces the whole map. */
      type: 'replace-map'
      /** New map to use. */
      map: SeatingMap
    }

/**
 * An action understood by {@linkcode historyReducer}.
 *
 * Set `record: false` on a map action to change the map without adding an undo step,
 * e.g. while dragging after a `checkpoint`.
 */
export type HistoryAction =
  | (MapAction & {
      /** `false` applies the edit without pushing an undo step; defaults to recording. */
      record?: boolean
    })
  | {
      /** Restores the previous map. */
      type: 'undo'
    }
  | {
      /** Reapplies the most recently undone map. */
      type: 'redo'
    }
  | {
      /** Pushes the current map as an undo step, e.g. before an unrecorded drag. */
      type: 'checkpoint'
    }

/** The current map plus undo and redo stacks. */
export interface HistoryState {
  /** Earlier maps, oldest first, capped at 100 entries. */
  past: SeatingMap[]
  /** Map currently shown and edited. */
  present: SeatingMap
  /** Undone maps, next redo first. */
  future: SeatingMap[]
}
