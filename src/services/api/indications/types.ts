import type { Indication, IndicationOriginResult } from '../../../types/indication'

export interface GetIndicationCatalogApi {
  getCatalog(): Promise<Indication.Catalog>
}

export interface GetLinkableIndicationOriginsApi {
  getLinkableOrigins(): Promise<Indication.LinkableOrigin[]>
}

export interface CreateIndicationOriginParams {
  categoryId: string
  name: string
}

export interface CreateIndicationOriginApi {
  create(params: CreateIndicationOriginParams): Promise<IndicationOriginResult>
}

export interface CorrectIndicationOriginNameParams {
  id: string
  name: string
}

export interface CorrectIndicationOriginNameApi {
  correctName(params: CorrectIndicationOriginNameParams): Promise<IndicationOriginResult>
}

export interface EndIndicationOriginParams {
  id: string
}

export interface EndIndicationOriginApi {
  end(params: EndIndicationOriginParams): Promise<IndicationOriginResult>
}

export interface ReopenIndicationOriginParams {
  id: string
}

export interface ReopenIndicationOriginApi {
  reopen(params: ReopenIndicationOriginParams): Promise<IndicationOriginResult>
}
