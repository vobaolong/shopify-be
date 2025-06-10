import { Request } from 'express'

export interface UserFavoriteProductRequest extends Request {
  user?: any
  product?: any
  params: {
    userId?: string
    productId?: string
  }
}

export interface FilterType {
  limit: number
  pageCurrent: number
  pageCount?: number
}
