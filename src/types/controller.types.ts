import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

export interface FilterType {
  search: string
  sortBy: string
  order: string
  limit: number
  pageCurrent: number
  pageCount?: number
  categoryId?: mongoose.Types.ObjectId | string
  brandId?: mongoose.Types.ObjectId | string
  rating?: number | string
  minPrice?: number
  maxPrice?: number | string
  storeId?: mongoose.Types.ObjectId | string
  quantity?: number | string
  isActive?: boolean | string
  isSelling?: boolean | string
  [key: string]: any
}

export interface CategoryWithNestedId {
  categoryId?: {
    _id?: string | mongoose.Types.ObjectId
    categoryId?: {
      _id?: string | mongoose.Types.ObjectId
    }
  }
  _id: mongoose.Types.ObjectId
}

export type IdParam = { id: string }

export type ControllerFunction = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<Response | void> | Response | void

export type ParamControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
) => Promise<Response | void> | Response | void
