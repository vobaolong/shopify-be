import { Request } from 'express'

export interface VariantValueRequest extends Request {
  variantValue?: any
  user?: any
  body: {
    name?: string
    value?: string
    variantId?: string
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  variantId?: string
}
