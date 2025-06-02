import { errorHandler, MongoError } from '../helpers/errorHandler'
import { UserLevel } from '../models/index.model'
import { RequestHandler } from 'express'
import { FilterType } from '../types/controller.types'

export const getUserLevelById: RequestHandler = async (req, res, next) => {
  try {
    console.log('Looking for user level with ID:', req.params.userLevelId)
    const userLevel = await UserLevel.findById(req.params.userLevelId)
    console.log('Found user level:', userLevel)

    if (!userLevel) {
      res.status(404).json({
        error: 'User level not found'
      })
      return
    }
    ;(req as any).userLevel = userLevel
    next()
  } catch (error) {
    console.error('Error in getUserLevelById:', error)
    res.status(404).json({
      error: 'User level not found'
    })
  }
}

export const getUserLevel: RequestHandler = async (req, res) => {
  try {
    const point = req.user!.point >= 0 ? req.user!.point : 0
    const lvs = await UserLevel.find({
      minPoint: { $lte: point },
      isDeleted: false
    })
      .sort('-minPoint')
      .limit(1)
    res.status(200).json({
      success: 'Get user level successfully',
      level: {
        point: req.user!.point,
        name: lvs[0].name,
        minPoint: lvs[0].minPoint,
        discount: lvs[0].discount,
        color: lvs[0].color
      }
    })
  } catch (error) {
    res.status(500).json({
      error: 'Get user level failed'
    })
  }
}

export const createUserLevel: RequestHandler = async (req, res) => {
  try {
    const { name, minPoint, discount, color } = req.body
    const level = new UserLevel({ name, minPoint, discount, color })
    await level.save()
    res.status(201).json({
      success: 'Create user level successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateUserLevel: RequestHandler = async (req, res) => {
  try {
    const { name, minPoint, discount, color } = req.body
    const level = await UserLevel.findOneAndUpdate(
      { _id: req.params.userLevelId },
      { $set: { name, minPoint, discount, color } }
    )
    if (!level) {
      res.status(404).json({
        error: 'User level not found'
      })
      return
    }
    res.status(200).json({
      success: 'Update user level successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeUserLevel: RequestHandler = async (req, res) => {
  try {
    console.log('Deleting user level with ID:', req.params.userLevelId)

    // First check if the level exists
    const existingLevel = await UserLevel.findById(req.params.userLevelId)
    console.log('Existing level found:', existingLevel)

    if (!existingLevel) {
      res.status(404).json({
        error: 'User level not found'
      })
      return
    }

    const level = await UserLevel.findOneAndUpdate(
      { _id: req.params.userLevelId },
      { $set: { isDeleted: true } },
      { new: true }
    )
    console.log('Updated level:', level)

    res.status(200).json({
      success: 'Remove user level successfully'
    })
  } catch (error) {
    console.error('Error in removeUserLevel:', error)
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const restoreUserLevel: RequestHandler = async (req, res) => {
  try {
    const level = await UserLevel.findOneAndUpdate(
      { _id: req.params.userLevelId },
      { $set: { isDeleted: false } }
    )
    if (!level) {
      res.status(404).json({
        error: 'User level not found'
      })
      return
    }
    res.status(200).json({
      success: 'Restore user level successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getUserLevels: RequestHandler = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.toString() : ''
    const status = req.query.status ? req.query.status.toString() : 'all'
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

    // Build query object
    const query: any = {}

    // Search filtering
    if (search) query.name = { $regex: search, $options: 'i' }

    // Status filtering
    if (status === 'active') {
      query.isDeleted = false
    } else if (status === 'deleted') {
      query.isDeleted = true
    }
    // Date range filtering
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
    res.status(500).json({
      error: 'Load list user levels failed'
    })
  }
}

export const getActiveUserLevels: RequestHandler = async (req, res) => {
  try {
    const levels = await UserLevel.find({ isDeleted: false })
    console.log('Active user levels:', levels)
    res.status(200).json({
      success: 'Load list active user levels successfully',
      levels
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list active user levels failed'
    })
  }
}

// Debug function to check all levels
export const getAllUserLevelsDebug: RequestHandler = async (req, res) => {
  try {
    const allLevels = await UserLevel.find({})
    console.log('All user levels in database:', allLevels)
    res.status(200).json({
      success: 'Debug: All user levels',
      levels: allLevels,
      count: allLevels.length
    })
  } catch (error) {
    console.error('Error getting all levels:', error)
    res.status(500).json({
      error: 'Failed to get all levels'
    })
  }
}
