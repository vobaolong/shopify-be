import { Request } from 'express'

export interface ReviewRequest extends Request {
  review?: any
  user?: any
  body: {
    content?: string
    rating?: number
    storeId?: string
    productId?: string
    orderId?: string
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  productId?: string
  storeId?: string
  userId?: string
  rating?: number
}
