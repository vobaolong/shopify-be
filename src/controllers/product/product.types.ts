import { Request } from 'express'
import mongoose, { Document } from 'mongoose'
import { IProduct } from '../../models/product.model'

export interface ProductRequest extends Request {
  product?: IProduct
  productLevel?: any
  store?: any
  loadedCategories?: mongoose.Types.ObjectId[]
  loadedBrands?: mongoose.Types.ObjectId[]
  filepaths?: string[]
  fields?: any
  user?: any
  query: {
    search?: string
    sortBy?: string
    sortMoreBy?: string
    order?: string
    limit?: string
    page?: string
    isActive?: string
    isSelling?: string
    categoryId?: string
    brandId?: string
    rating?: string
    minPrice?: string
    maxPrice?: string
    quantity?: string
    provinces?: string[]
    [key: string]: any
  }
}

export type FilterType = {
  search: string
  sortBy: string
  order: string
  limit: number
  pageCurrent: number
  pageCount?: number
  categoryId?: mongoose.Types.ObjectId[] | string[]
  brandId?: mongoose.Types.ObjectId[] | string[]
  rating?: number | string
  minPrice?: number
  maxPrice?: number | string
  storeId?: mongoose.Types.ObjectId
  quantity?: number | string
  isActive?: boolean[] | string[]
  isSelling?: boolean[] | string[]
  [key: string]: any
}

export interface CategoryWithNestedId extends Document {
  categoryId?: {
    _id?: string | mongoose.Types.ObjectId
    categoryId?: {
      _id?: string | mongoose.Types.ObjectId
    }
  }
}
