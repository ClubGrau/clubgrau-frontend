import { describe, expect, it } from 'vitest'
import {
  barPercent,
  formatEuro,
  formatSignedPercent,
  revenueForMonth,
  sharePercent,
} from './dashboard'

describe('dashboard figures', () => {
  it('rounds a share of the total', () => {
    expect(sharePercent(18, 24)).toBe(75)
    expect(sharePercent(0, 0)).toBe(0)
  })

  it('scales a bar against the tallest month', () => {
    expect(barPercent(3450, 6900)).toBe(50)
    expect(barPercent(0, 0)).toBe(0)
  })

  it('formats euro without cents and keeps the sign on a delta', () => {
    expect(formatEuro(4860, 'pt-PT')).toMatch(/4[\s.\u00a0]?860/)
    expect(formatEuro(4860, 'pt-PT')).toContain('€')
    expect(formatSignedPercent(3)).toBe('+3%')
    expect(formatSignedPercent(-2)).toBe('-2%')
  })

  it('reads the amount of one calendar month', () => {
    expect(revenueForMonth([{ month: 10, amount: 4860 }], 10)).toBe(4860)
    expect(revenueForMonth([{ month: 10, amount: 4860 }], 1)).toBe(0)
  })
})
