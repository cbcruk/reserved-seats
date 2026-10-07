const PALETTE = [
  '#7c3aed',
  '#2563eb',
  '#0d9488',
  '#ea580c',
  '#db2777',
  '#65a30d',
  '#ca8a04',
  '#0891b2',
  '#dc2626',
  '#4f46e5',
]

/** Picks a category color not used yet, cycling through a fixed palette. */
export function nextCategoryColor(used: string[]): string {
  return PALETTE.find((c) => !used.includes(c)) ?? PALETTE[used.length % PALETTE.length]!
}
