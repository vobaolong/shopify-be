import { RequestHandler } from 'express'
import { UserFollowStore, Store } from '../../models/index.model'
import { cleanStore } from '../../helpers/storeHandler'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UserFollowStoreRequest, FilterType } from './userFollowStore.types'

export const getFollowedStores: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const limit =
      req.query.limit &&
      typeof req.query.limit === 'string' &&
      parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page &&
      typeof req.query.page === 'string' &&
      parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    let skip = (page - 1) * limit
    const filter: FilterType = {
      limit,
      pageCurrent: page
    }
    const follows = await UserFollowStore.find({ userId, isDeleted: false })
    const storeIds = follows.map((follow) => follow.storeId)
    const count = await Store.countDocuments({
      _id: { $in: storeIds },
      isActive: true
    })
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list following stores successfully',
        filter,
        size,
        stores: []
      })
    }
    const stores = await Store.find({ _id: { $in: storeIds }, isActive: true })
      .select('-e_wallet')
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .populate('address')
    const cleanStores = stores.map((store) => cleanStore(store))
    res.status(200).json({
      success: 'Load list following stores successfully',
      filter,
      size,
      stores: cleanStores
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}
