export type DashboardServiceId = 'cut' | 'beard' | 'color'

export type DashboardStockId = 'pomade' | 'shaveCream' | 'balm' | 'gel'

export type DashboardStockTone = 'warning' | 'danger' | 'success'

export interface DashboardAppointment {
  id: string
  time: string
  clientName: string
  service: DashboardServiceId
  chair: number
  current: boolean
}

export interface DashboardRevenueMonth {
  month: number
  amount: number
}

export interface DashboardStockItem {
  id: DashboardStockId
  remaining: number
  capacity: number
  tone: DashboardStockTone
}

/** Snapshot of modules the app does not own yet: schedule, revenue, services, stock. */
export interface DashboardOperations {
  appointmentsToday: number
  appointmentsDeltaPercent: number
  revenueDeltaPercent: number
  treatmentCompleted: number
  treatmentTotal: number
  appointments: DashboardAppointment[]
  revenueByMonth: DashboardRevenueMonth[]
  stock: DashboardStockItem[]
}
