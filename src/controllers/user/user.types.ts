import { Request } from 'express'

export interface UserRequest extends Request {
  user?: any
  filepaths?: string[]
  file?: any
  query: {
    index?: string
    search?: string
    sortBy?: string
    order?: string
    limit?: string
    page?: string
    createdAtFrom?: string
    createdAtTo?: string
    isEmailActive?: string
    searchField?: string
    [key: string]: any
  }
}

export interface FilterType {
  search?: string
  sortBy?: string
  order?: string
  limit?: number
  pageCurrent?: number
  pageCount?: number
  [key: string]: any
}
