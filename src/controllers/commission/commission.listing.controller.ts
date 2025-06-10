import { RequestHandler, Response } from 'express'
import { SortOrder } from 'mongoose'
import Commission from '../../models/commission.model'
import {
  CommissionRequest,
  CommissionSearchQuery,
  FilterType
} from './commission.types'

export const getCommissions: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const search = (req.query.search as string) || ''
    const sortBy = (req.query.sortBy as string) || '_id'
    const order =
      req.query.order && ['asc', 'desc'].includes(req.query.order as string)
        ? (req.query.order as string)
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit as string) > 0
        ? parseInt(req.query.limit as string)
        : 6
    const page =
      req.query.page && parseInt(req.query.page as string) > 0
        ? parseInt(req.query.page as string)
        : 1
    const createdAtFrom = req.query.createdAtFrom as string | undefined
    const createdAtTo = req.query.createdAtTo as string | undefined
    const status = req.query.status as string | undefined
    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page,
      createdAtFrom,
      createdAtTo
    }
    const searchQuery: CommissionSearchQuery = {
      name: { $regex: search as string, $options: 'i' }
    }
    if (createdAtFrom || createdAtTo) {
      searchQuery.createdAt = {}
      if (createdAtFrom) searchQuery.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) searchQuery.createdAt.$lte = new Date(createdAtTo)
    }
    if (status === 'active') searchQuery.isDeleted = false
    if (status === 'deleted') searchQuery.isDeleted = true
    const count = await Commission.countDocuments(searchQuery)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    let skip = limit * (page - 1)
    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list commissions successfully',
        filter,
        size,
        commissions: []
      })
      return
    }
    const commissions = await Commission.find(searchQuery)
      .sort({ [sortBy as string]: order as SortOrder, _id: 1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: 'Load list commissions successfully',
      filter,
      size,
      commissions
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list commissions failed'
    })
  }
}

export const getActiveCommissions: RequestHandler = async (req, res) => {
  try {
    const commissions = await Commission.find({ isDeleted: false })
    const sanitizedCommissions = commissions.map((commission) => {
      const commissionObj = commission.toObject()
      delete (commissionObj as any).isDeleted
      return commissionObj
    })
    res.status(200).json({
      success: 'Load list active commissions successfully',
      commissions: sanitizedCommissions
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list active commissions failed'
    })
  }
}
