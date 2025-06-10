import { Response } from 'express'
import { Order } from '../../models/index.model'
import { OrderRequest, FilterType } from './order.types'
import mongoose from 'mongoose'

export const setupPaginationAndFilter = (req: OrderRequest) => {
  const search = req.query.search?.toString() || ''
  const regex = '.*' + search + '.*'
  const sortBy = req.query.sortBy?.toString() || 'createdAt'
  const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
    ? req.query.order?.toString() || 'desc'
    : 'desc'
  const current = parseInt(req.query.current?.toString() || '1')
  const pageSize = parseInt(req.query.pageSize?.toString() || '10')
  const page = current || parseInt(req.query.page?.toString() || '1')
  const limit = pageSize || parseInt(req.query.limit?.toString() || '10')
  const filter: FilterType = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }
  const filterArgs: Record<string, any> = {
    tempId: { $regex: regex, $options: 'i' }
  }
  if (req.query.status) {
    filter.status = req.query.status.toString().split('|')
    filterArgs.status = {
      $in: req.query.status.toString().split('|')
    }
  }
  if (req.query.isPaidBefore && req.query.isPaidBefore !== 'all') {
    const isPaid = req.query.isPaidBefore === 'true'
    filter.isPaidBefore = isPaid
    filterArgs.isPaidBefore = isPaid
  }
  const createdAtFrom = req.query.createdAtFrom as string | undefined
  const createdAtTo = req.query.createdAtTo as string | undefined
  if (createdAtFrom || createdAtTo) {
    filterArgs.createdAt = {}
    if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
    if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
  }
  return { filter, filterArgs, limit, page }
}

export const processOrderResults = async (
  res: Response,
  result: Array<{ _id: mongoose.Types.ObjectId; count: number }>,
  filter: FilterType,
  limit: number,
  page: number,
  additionalFilters: Record<string, any> = {}
) => {
  const total = result.reduce(
    (p: number, c: { count: number }) => p + c.count,
    0
  )
  const pageCount = Math.ceil(total / limit)
  filter.pageCount = pageCount

  let skip = limit * (page - 1)
  if (page > pageCount) {
    skip = (pageCount - 1) * limit
  }

  if (total <= 0) {
    res.status(200).json({
      success: 'Load list orders successfully',
      filter,
      pagination: {
        current: page,
        pageSize: limit,
        total: 0
      },
      orders: []
    })
    return
  }

  try {
    const sortOrder = filter.order === 'asc' ? 1 : -1
    const sortObj: Record<string, 1 | -1> = {}
    sortObj[filter.sortBy as string] = sortOrder
    sortObj._id = 1
    const orders = await Order.find({
      _id: { $in: result.map((r) => r._id) },
      ...additionalFilters
    })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('userId', '_id userName name avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')

    res.status(200).json({
      success: 'Load list orders successfully',
      filter,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} of ${total} items`
      },
      orders
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list orders failed'
    })
  }
}
