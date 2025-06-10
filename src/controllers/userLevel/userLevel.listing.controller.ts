import { RequestHandler } from 'express'
import { UserLevel } from '../../models/index.model'
import { FilterType } from './userLevel.types'

export const getUserLevels: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.toString() : ''
    const status = req.query.status ? req.query.status.toString() : 'all'
    const isDeleted = req.query.isDeleted
    const createdAtFrom = req.query.createdAtFrom
      ? req.query.createdAtFrom.toString()
      : undefined
    const createdAtTo = req.query.createdAtTo
      ? req.query.createdAtTo.toString()
      : undefined
    const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id'
    const order =
      req.query.order &&
      (req.query.order.toString() === 'asc' ||
        req.query.order.toString() === 'desc')
        ? req.query.order.toString()
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit.toString()) > 0
        ? parseInt(req.query.limit.toString())
        : 6
    const page =
      req.query.page && parseInt(req.query.page.toString()) > 0
        ? parseInt(req.query.page.toString())
        : 1
    let skip = limit * (page - 1)
    let filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }
    const query: any = {}
    if (search) query.name = { $regex: search, $options: 'i' }
    if (status === 'active') {
      query.isDeleted = false
    } else if (status === 'deleted') {
      query.isDeleted = true
    }
    if (typeof isDeleted !== 'undefined') {
      if (isDeleted === 'false') query.isDeleted = false
      else if (isDeleted === 'true') query.isDeleted = true
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
    const count = await UserLevel.countDocuments(query)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter = { ...filter, pageCount }
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list user levels successfully',
        filter,
        size,
        levels: []
      })
      return
    }
    const levels = await UserLevel.find(query)
      .sort({ [sortBy as string]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip(skip)
      .limit(limit)
    res.status(200).json({
      success: 'Load list user levels successfully',
      filter,
      size,
      levels
    })
  } catch (error) {
    res.status(500).json({ error: 'Load list user levels failed' })
  }
}
