import type { Employee } from '../../../types/employee'
import { api } from '../config'
import { mapApiEmployeeToEmployee } from './map-employee'
import type {
  GetOwnEmployeeApi,
  UpdateOwnEmployeeDataApi,
  UpdateOwnEmployeeDataParams,
  UpdateOwnEmployeeDataResult,
} from './types'

type OwnEmployeePayload = Employee.Entity & { token?: string }

function readOwnEmployee(payload: OwnEmployeePayload): UpdateOwnEmployeeDataResult {
  const { token, ...entity } = payload

  return {
    employee: mapApiEmployeeToEmployee(entity),
    ...(typeof token === 'string' ? { token } : {}),
  }
}

export class HttpOwnEmployeeApi implements GetOwnEmployeeApi, UpdateOwnEmployeeDataApi {
  async getOwnEmployee(): Promise<Employee.ListItem> {
    const { data } = await api.get<OwnEmployeePayload>('/api/employee/me')
    return readOwnEmployee(data).employee
  }

  async updateOwnEmployeeData(
    params: UpdateOwnEmployeeDataParams,
  ): Promise<UpdateOwnEmployeeDataResult> {
    const { data } = await api.patch<OwnEmployeePayload>('/api/employee/me', params)
    return readOwnEmployee(data)
  }
}

export const httpOwnEmployeeApi = new HttpOwnEmployeeApi()
