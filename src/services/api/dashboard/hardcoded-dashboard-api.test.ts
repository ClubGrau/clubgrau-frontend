import { describe, expect, it } from 'vitest'
import { HardcodedDashboardApi } from './hardcoded-dashboard-api'

describe('HardcodedDashboardApi', () => {
  it('returns the schedule, revenue, treatment and stock snapshot', async () => {
    const operations = await new HardcodedDashboardApi().getOperations()

    expect(operations.appointments).toHaveLength(operations.appointmentsToday)
    expect(operations.appointments.filter((item) => item.current)).toHaveLength(1)
    expect(operations.revenueByMonth).toHaveLength(12)
    expect(operations.treatmentCompleted).toBeLessThanOrEqual(operations.treatmentTotal)
    expect(operations.stock.map((item) => item.id)).toEqual([
      'pomade',
      'shaveCream',
      'balm',
      'gel',
    ])
  })
})
