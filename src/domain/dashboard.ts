export function sharePercent(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

export function barPercent(amount: number, max: number): number {
  if (max <= 0) return 0
  return Math.round((amount / max) * 100)
}

export function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}

export function revenueForMonth(
  months: readonly { month: number; amount: number }[],
  month: number,
): number {
  return months.find((item) => item.month === month)?.amount ?? 0
}
