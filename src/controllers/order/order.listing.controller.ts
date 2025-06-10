import { RequestHandler, Response } from 'express'
import { Order } from '../../models/index.model'
import { OrderRequest, FilterType, ReturnStatus } from './order.types'
import { setupPaginationAndFilter, processOrderResults } from './order.helpers'
import mongoose from 'mongoose'

export const getOrdersByUser: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id as mongoose.Types.ObjectId | undefined
    if (!userId) {
      res.status(400).json({ error: 'User not found' })
      return
    }
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.userId = userId
    const result = await Order.aggregate([
      { $addFields: { tempId: { $toString: '$_id' } } },
      { $match: filterArgs },
      { $group: { _id: '$_id', count: { $sum: 1 } } }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({ error: 'Load list orders by user failed' })
  }
}

export const getOrdersByStore: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const storeId = req.store?._id as mongoose.Types.ObjectId | undefined
    if (!storeId) {
      res.status(400).json({ error: 'Store not found' })
      return
    }
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.storeId = storeId
    const result = await Order.aggregate([
      { $addFields: { tempId: { $toString: '$_id' } } },
      { $match: filterArgs },
      { $group: { _id: '$_id', count: { $sum: 1 } } }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({ error: 'Load list orders by store failed' })
  }
}

export const getOrdersForAdmin: RequestHandler = async (
  req: OrderRequest,
  res: Response
) => {
  try {
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    const result = await Order.aggregate([
      { $addFields: { tempId: { $toString: '$_id' } } },
      { $match: filterArgs },
      { $group: { _id: '$_id', count: { $sum: 1 } } }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({ error: 'Load list orders failed' })
  }
}

export const getReturnOrders: RequestHandler = async (req, res) => {
  try {
    if (!req.store) {
      res.status(400).json({ error: 'Store not found' })
      return
    }
    const storeId = req.store?._id
    const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req)
    filterArgs.storeId = storeId as mongoose.Types.ObjectId
    filterArgs.returnRequests = { $exists: true, $ne: [] }
    if (req.query.status) {
      const statusValue = req.query.status as string
      filter.status = [statusValue]
      filterArgs['returnRequests.status'] = {
        $in: statusValue.split(',').map((status) => status as ReturnStatus)
      }
    }
    const result = await Order.aggregate([
      { $addFields: { tempId: { $toString: '$_id' } } },
      { $match: filterArgs },
      { $group: { _id: '$_id', count: { $sum: 1 } } }
    ])
    await processOrderResults(res, result, filter, limit, page)
  } catch (error) {
    res.status(500).json({ error: 'Load list orders by store failed' })
  }
}

export const countOrders: RequestHandler = async (req, res) => {
  try {
    const filterArgs: Record<string, any> = {}
    if (req.query.status) {
      filterArgs.status = {
        $in: req.query.status.toString().split('|')
      }
    }
    if (req.query.userId) filterArgs.userId = req.query.userId
    if (req.query.storeId) filterArgs.storeId = req.query.storeId
    const count = await Order.countDocuments(filterArgs)
    res.status(200).json({
      success: 'Count order successfully',
      count
    })
  } catch (error) {
    res.status(200).json({
      success: 'Count order successfully',
      count: 0
    })
  }
}
