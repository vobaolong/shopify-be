import { cleanUser, cleanUserLess } from '../../helpers/userHandler'
import { Request } from 'express'
import { FilterType } from '../../types/controller.types'
import mongoose from 'mongoose'
import { IUser } from '../../models/user.model'

export function safeCleanUser(user: any): any {
  return cleanUser(user as IUser)
}

export function safeCleanUserLess(user: any): any {
  return cleanUserLess(user as IUser)
}

export interface StoreRequest extends Request {
  store?: any
  user?: any
  filepaths?: string[]
  loadedCommissions?: mongoose.Types.ObjectId[]
  query: {
    search?: string
    sortBy?: string
    sortMoreBy?: string
    order?: string
    limit?: string
    page?: string
    isActive?: string
    commissionId?: string
    index?: string
    createdAtFrom?: string
    createdAtTo?: string
    [key: string]: any
  }
  fields?: {
    name?: string
    bio?: string
    address?: string
    commissionId?: string
    addressDetail?: string
    [key: string]: any
  }
}

export interface StoreFilterType extends Omit<FilterType, 'isActive'> {
  search: string
  sortBy: string
  sortMoreBy: string
  order: string
  isActive?: boolean[] | string | boolean
  commissionId: mongoose.Types.ObjectId[] | string[]
  limit: number
  pageCurrent: number
  pageCount?: number
}

export interface AddressDetailType {
  _id?: string
  province: string
  provinceName: string
  district: string
  districtName: string
  ward: string
  wardName: string
  street: string
}

export const buildStoreFilterArgs = (
  req: StoreRequest,
  loadedCommissions?: string[]
): any => {
  const search = req.query.search || ''
  const commissionId = req.query.commissionId
    ? [req.query.commissionId]
    : loadedCommissions || []

  const filterArgs: any = {
    $or: [
      {
        name: {
          $regex: search,
          $options: 'i'
        }
      },
      { bio: { $regex: search, $options: 'i' } }
    ]
  }

  // Handle isActive filter
  if (req.query.isActive !== undefined) {
    if (req.query.isActive === 'true') {
      filterArgs.isActive = true
    } else if (req.query.isActive === 'false') {
      filterArgs.isActive = false
    } else {
      filterArgs.isActive = { $in: [true, false] }
    }
  } else {
    filterArgs.isActive = { $in: [true, false] }
  }

  // Handle commission filter
  if (commissionId.length > 0) {
    filterArgs.commissionId = { $in: commissionId }
  }

  // Handle rating filter
  if (req.query.rating) {
    const rating = req.query.rating
    if (rating === '5') {
      filterArgs.rating = 5
    } else {
      filterArgs.rating = { $gte: Number(rating) }
    }
  }

  // Handle date range filter
  const createdAtFrom = req.query.createdAtFrom as string | undefined
  const createdAtTo = req.query.createdAtTo as string | undefined
  if (createdAtFrom || createdAtTo) {
    filterArgs.createdAt = {}
    if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
    if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
  }

  // Handle user-specific filters
  if (req.user) {
    // For user's own stores or stores they staff
    filterArgs.$or = [
      {
        name: {
          $regex: search,
          $options: 'i'
        },
        ownerId: req.user._id
      },
      {
        name: {
          $regex: search,
          $options: 'i'
        },
        staffIds: req.user._id
      },
      {
        bio: {
          $regex: search,
          $options: 'i'
        },
        ownerId: req.user._id
      },
      {
        bio: {
          $regex: search,
          $options: 'i'
        },
        staffIds: req.user._id
      }
    ]
  }

  return filterArgs
}
