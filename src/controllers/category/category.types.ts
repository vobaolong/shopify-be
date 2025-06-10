import { Request } from 'express'
import { ICategory } from '../../models/category.model'

export interface CategoryRequest extends Request {
  category?: ICategory
  filepaths?: string[]
  fields?: any
  loadedCategories?: any[]
  query: {
    search?: string
    sortBy?: string
    order?: string
    limit?: string
    page?: string
    categoryId?: string
    [key: string]: any
  }
}
