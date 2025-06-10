import { Request } from 'express'
import { IBrand } from '../../models/brand.model'

export interface BrandRequest extends Request {
  brand?: IBrand
  query: {
    search?: string
    sortBy?: string
    order?: string
    limit?: string
    page?: string
    categoryId?: string
    brandId?: string
    [key: string]: any
  }
}
