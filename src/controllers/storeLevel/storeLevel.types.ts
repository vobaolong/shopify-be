import { Request } from 'express'

export interface StoreLevelRequest extends Request {
  storeLevel?: any
  store?: any
  params: {
    storeLevelId?: string
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  status?: string
  createdAtFrom?: string
  createdAtTo?: string
}
