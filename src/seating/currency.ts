const formatter = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })

/** Formats a ticket amount in the venue currency (KRW). */
export function formatPrice(amount: number): string {
  return formatter.format(amount)
}
