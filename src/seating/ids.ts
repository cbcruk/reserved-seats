/** Generates a short random id that is unique enough for client-side records. */
export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 10)}`
}
