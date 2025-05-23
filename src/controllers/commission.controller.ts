import { RequestHandler, Response } from 'express'
import Commission, { ICommission } from '../models/commission.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import {
  CommissionRequest,
  CommissionSearchQuery
} from '../types/commission.type'
import { FilterType } from '../types/controller.types'

export const getCommissions: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const search = req.query.search || ''
    const sortBy = req.query.sortBy || '_id'
    const order =
      req.query.order && ['asc', 'desc'].includes(req.query.order)
        ? req.query.order
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    const createdAtFrom = req.query.createdAtFrom as string | undefined
    const createdAtTo = req.query.createdAtTo as string | undefined
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
      name: { $regex: search, $options: 'i' }
    }
    if (createdAtFrom || createdAtTo) {
      searchQuery.createdAt = {}
      if (createdAtFrom) searchQuery.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) searchQuery.createdAt.$lte = new Date(createdAtTo)
    }
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
      .sort({ [sortBy]: order, _id: 1 })
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
    const sanitizedCommissions = commissions.map((commission: ICommission) => {
      const commissionObj = commission.toObject()
      delete commissionObj.isDeleted
      commissionObj
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

export const createCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const { name, fee, description } = req.body
    const commission = new Commission({
      name,
      fee,
      description
    })
    await commission.save()
    res.status(201).json({
      success: 'Create commission successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId
    const { name, fee, description } = req.body
    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { name, fee, description } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Update commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}

export const removeCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId

    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { isDeleted: true } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Remove commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}

export const restoreCommission: RequestHandler = async (
  req: CommissionRequest,
  res: Response
) => {
  try {
    const commissionId = req.params.commissionId
    const commission = await Commission.findOneAndUpdate(
      { _id: commissionId },
      { $set: { isDeleted: false } }
    )
    if (!commission) {
      res.status(404).json({
        error: 'Commission not found'
      })
      return
    }
    res.status(200).json({
      success: 'Restore commission successfully'
    })
  } catch (error) {
    res.status(404).json({
      error: 'Commission not found'
    })
  }
}
