import type { IndicationOriginResult } from '../../../types/indication'
import { api } from '../config'
import { mapIndicationCatalog } from './map-indication-catalog'
import { mapLinkableIndicationOrigins } from './map-linkable-indication-origins'
import type {
  CorrectIndicationOriginNameApi,
  CorrectIndicationOriginNameParams,
  CreateIndicationOriginApi,
  CreateIndicationOriginParams,
  EndIndicationOriginApi,
  EndIndicationOriginParams,
  GetIndicationCatalogApi,
  GetLinkableIndicationOriginsApi,
  ReopenIndicationOriginApi,
  ReopenIndicationOriginParams,
} from './types'

export class HttpIndicationsApi
  implements
    GetIndicationCatalogApi,
    GetLinkableIndicationOriginsApi,
    CreateIndicationOriginApi,
    CorrectIndicationOriginNameApi,
    EndIndicationOriginApi,
    ReopenIndicationOriginApi
{
  async getCatalog() {
    const { data } = await api.get<unknown>('/api/indication-catalog')
    return mapIndicationCatalog(data)
  }

  async getLinkableOrigins() {
    const { data } = await api.get<unknown>('/api/indication-linkable-origins')
    return mapLinkableIndicationOrigins(data)
  }

  async create(params: CreateIndicationOriginParams): Promise<IndicationOriginResult> {
    const { data } = await api.post<IndicationOriginResult>('/api/indication-origin', {
      categoryId: params.categoryId,
      name: params.name,
    })
    return data
  }

  async correctName(
    params: CorrectIndicationOriginNameParams,
  ): Promise<IndicationOriginResult> {
    const { data } = await api.patch<IndicationOriginResult>(
      `/api/indication-origin/${params.id}`,
      { name: params.name },
    )
    return data
  }

  async end(params: EndIndicationOriginParams): Promise<IndicationOriginResult> {
    const { data } = await api.post<IndicationOriginResult>(
      `/api/indication-origin/${params.id}/end`,
    )
    return data
  }

  async reopen(params: ReopenIndicationOriginParams): Promise<IndicationOriginResult> {
    const { data } = await api.post<IndicationOriginResult>(
      `/api/indication-origin/${params.id}/reopen`,
    )
    return data
  }
}

export const httpIndicationsApi = new HttpIndicationsApi()
