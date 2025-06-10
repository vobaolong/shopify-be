import { Request } from 'express'

export interface UserFollowStoreRequest extends Request {
  user?: any
  store?: any
  params: {
    userId?: string
    storeId?: string
  }
}

export interface FilterType {
  limit: number
  pageCurrent: number
  pageCount?: number
}
