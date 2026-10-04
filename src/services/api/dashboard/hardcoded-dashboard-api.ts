import type { DashboardOperations } from '../../../types/dashboard'
import type { GetDashboardOperationsApi } from './types'

/** Stand-in for schedule, billing, services and stock until those modules exist. */
export function dashboardOperationsSnapshot(): DashboardOperations {
  return {
    appointmentsToday: 5,
    appointmentsDeltaPercent: 4,
    revenueDeltaPercent: 3,
    treatmentCompleted: 18,
    treatmentTotal: 24,
    appointments: [
      {
        id: 'apt-1',
        time: '09:00',
        clientName: 'Marina Albuquerque',
        service: 'color',
        chair: 1,
        current: false,
      },
      {
        id: 'apt-2',
        time: '10:00',
        clientName: 'Rafael Nunes',
        service: 'beard',
        chair: 2,
        current: true,
      },
      {
        id: 'apt-3',
        time: '11:00',
        clientName: 'Camila Prado',
        service: 'color',
        chair: 3,
        current: false,
      },
      {
        id: 'apt-4',
        time: '12:00',
        clientName: 'Helena Cardoso',
        service: 'cut',
        chair: 1,
        current: false,
      },
      {
        id: 'apt-5',
        time: '13:00',
        clientName: 'Diego Fontes',
        service: 'beard',
        chair: 2,
        current: false,
      },
    ],
    revenueByMonth: [
      { month: 1, amount: 2800 },
      { month: 2, amount: 3400 },
      { month: 3, amount: 3100 },
      { month: 4, amount: 4200 },
      { month: 5, amount: 6100 },
      { month: 6, amount: 5400 },
      { month: 7, amount: 3900 },
      { month: 8, amount: 4700 },
      { month: 9, amount: 4300 },
      { month: 10, amount: 4860 },
      { month: 11, amount: 5200 },
      { month: 12, amount: 6900 },
    ],
    stock: [
      { id: 'pomade', remaining: 8, capacity: 26, tone: 'warning' },
      { id: 'shaveCream', remaining: 3, capacity: 25, tone: 'danger' },
      { id: 'balm', remaining: 16, capacity: 24, tone: 'success' },
      { id: 'gel', remaining: 5, capacity: 25, tone: 'warning' },
    ],
  }
}

export class HardcodedDashboardApi implements GetDashboardOperationsApi {
  async getOperations(): Promise<DashboardOperations> {
    return dashboardOperationsSnapshot()
  }
}

export const hardcodedDashboardApi = new HardcodedDashboardApi()
