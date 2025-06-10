import { Request } from 'express'

export interface VariantRequest extends Request {
  variant?: any
  user?: any
  body: {
    name?: string
    categoryIds?: string[]
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  categoryId?: string
}
