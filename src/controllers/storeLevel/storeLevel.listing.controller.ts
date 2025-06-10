import { RequestHandler } from 'express'
import { StoreLevel } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { FilterType } from './storeLevel.types'

export const getStoreLevels: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search?.toString() || ''
    const status = req.query.status?.toString() || 'all'
    const createdAtFrom = req.query.createdAtFrom?.toString()
    const createdAtTo = req.query.createdAtTo?.toString()
    const sortBy = req.query.sortBy?.toString() || '_id'
    const order =
      req.query.order?.toString() &&
      ['asc', 'desc'].includes(req.query.order?.toString())
        ? req.query.order?.toString()
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1
    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }
    const query: any = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    if (status === 'active') {
      query.isDeleted = false
    } else if (status === 'deleted') {
      query.isDeleted = true
    }
    if (createdAtFrom || createdAtTo) {
      query.createdAt = {}
      if (createdAtFrom) {
        query.createdAt.$gte = new Date(createdAtFrom)
      }
      if (createdAtTo) {
        query.createdAt.$lte = new Date(createdAtTo)
      }
    }
    const count = await StoreLevel.countDocuments(query)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    let skip = limit * (page - 1)
    if (page > pageCount && pageCount > 0) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list store levels successfully',
        filter,
        size,
        levels: []
      })
      return
    }
    const levels = await StoreLevel.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
    res.status(200).json({
      success: 'Load list store levels successfully',
      filter,
      size,
      levels
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list store levels failed' })
  }
}

export const getActiveStoreLevels: RequestHandler = async (req, res) => {
  try {
    const levels = await StoreLevel.find({ isDeleted: false })
      .sort('minPoint')
      .exec()
    res.status(200).json({
      success: 'Load list active store levels successfully',
      levels
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list active store levels failed' })
  }
}
