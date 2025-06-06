import { Store } from '../../models/index.model'
import { Response, NextFunction, RequestHandler } from 'express'
import {
  StoreRequest,
  StoreFilterType,
  safeCleanUser,
  safeCleanUserLess
} from './store.types'

// Store listing and search operations
export const getStoreCommissions = async (
  req: StoreRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commissions = await Store.distinct('commissionId', {})
    req.loadedCommissions = commissions
    next()
  } catch (error) {
    res.status(400).json({
      error: 'Commissions not found'
    })
  }
}

export const getStores = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search ? req.query.search : ''
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
    const order =
      req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'asc'

    const limit =
      req.query.limit && Number(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page && Number(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    let skip = limit * (page - 1)

    const commissionId = req.query.commissionId
      ? [req.query.commissionId]
      : req.loadedCommissions

    const filter: StoreFilterType = {
      search: search as string,
      sortBy: sortBy as string,
      sortMoreBy: sortMoreBy as string,
      order: order as string,
      commissionId: commissionId as string[],
      limit,
      pageCurrent: page
    }

    const filterArgs = {
      $or: [
        {
          name: {
            $regex: search,
            $options: 'i'
          }
        },
        { bio: { $regex: search, $options: 'i' } }
      ],
      isActive: true,
      commissionId: { $in: commissionId }
    }

    const count = await Store.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list stores successfully',
        filter,
        size,
        stores: []
      })
      return
    }

    const stores = await Store.find(filterArgs)
      .select('-e_wallet')
      .sort({
        [sortBy as string]: order,
        [sortMoreBy as string]: order,
        _id: 1
      })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    stores.forEach((store) => {
      store.ownerId = safeCleanUser(store.ownerId)
      store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
    })

    res.status(200).json({
      success: 'Load list stores successfully',
      filter,
      size,
      stores
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list stores failed'
    })
  }
}

export const getStoresByUser = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search ? req.query.search : ''

    let isActive: boolean[] = [true, false]
    if (req.query.isActive == 'true') isActive = [true]
    if (req.query.isActive == 'false') isActive = [false]

    const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
    const order =
      req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'asc'

    const limit =
      req.query.limit && Number(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page && Number(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    let skip = limit * (page - 1)

    const commissionId = req.query.commissionId
      ? [req.query.commissionId]
      : req.loadedCommissions

    const filter: StoreFilterType = {
      search: search as string,
      sortBy: sortBy as string,
      sortMoreBy: sortMoreBy as string,
      order: order as string,
      isActive,
      commissionId: commissionId as string[],
      limit,
      pageCurrent: page
    }

    const filterArgs = {
      $or: [
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
      ],
      isActive: { $in: isActive },
      commissionId: { $in: commissionId }
    }

    const count = await Store.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      res.status(200).json({
        success: 'Load list stores successfully',
        filter,
        size,
        stores: []
      })
      return
    }

    const stores = await Store.find(filterArgs)
      .select('-e_wallet')
      .sort({
        [sortBy as string]: order,
        [sortMoreBy as string]: order,
        _id: 1
      })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    stores.forEach((store) => {
      store.ownerId = safeCleanUser(store.ownerId)
      store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
    })

    res.status(200).json({
      success: 'Load list stores by user successfully',
      filter,
      size,
      stores
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list stores failed'
    })
  }
}

export const getStoresForAdmin = async (req: StoreRequest, res: Response) => {
  try {
    // 1. Parse query params
    const {
      search = '',
      isActive,
      sortBy = '_id',
      sortMoreBy = '_id',
      order = 'asc',
      limit = 6,
      page = 1,
      commissionId
    } = req.query

    const createdAtFrom = req.query.createdAtFrom as string | undefined
    const createdAtTo = req.query.createdAtTo as string | undefined
    const isActiveArr =
      isActive === 'true'
        ? [true]
        : isActive === 'false'
        ? [false]
        : [true, false]

    // 2. Build filter
    const filterArgs: any = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ],
      isActive: { $in: isActiveArr },
      commissionId: {
        $in: commissionId ? [commissionId] : req.loadedCommissions
      }
    }
    const rating = req.query.rating
    if (rating) {
      if (rating === '5') {
        filterArgs.rating = 5
      } else {
        filterArgs.rating = { $gte: Number(rating) }
      }
    }

    // 3. Count & pagination
    const total = await Store.countDocuments(filterArgs)
    const pageCount = Math.ceil(total / +limit) || 1
    const skip = +limit * (Math.min(+page, pageCount) - 1)

    if (total === 0) {
      res.status(200).json({
        success: 'Load list stores successfully',
        filter: { ...req.query, pageCount },
        size: 0,
        stores: []
      })
      return
    }
    if (createdAtFrom || createdAtTo) {
      filterArgs.createdAt = {}
      if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
    }
    const sortOrder = order === 'desc' ? -1 : 1
    // 4. Query data
    const stores = await Store.find(filterArgs)
      .select('-e_wallet')
      .sort({ [sortBy]: sortOrder, [sortMoreBy]: sortOrder, _id: 1 })
      .skip(skip)
      .limit(+limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    // 5. Clean data
    stores.forEach((store) => {
      store.ownerId = safeCleanUserLess(store.ownerId)
      store.staffIds = store.staffIds.map(safeCleanUserLess)
    })

    // 6. Response
    res.status(200).json({
      success: 'Load list stores successfully',
      filter: { ...req.query, pageCount },
      size: total,
      stores
    })
  } catch (err) {
    res.status(500).json({ error: 'Load list stores failed' })
  }
}
