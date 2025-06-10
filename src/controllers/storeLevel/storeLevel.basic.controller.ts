import { RequestHandler, RequestParamHandler } from 'express'
import { StoreLevel } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { StoreLevelRequest } from './storeLevel.types'

export const storeLevelById: RequestParamHandler = async (
  req,
  res,
  next,
  id: string
) => {
  try {
    const storeLevel = await StoreLevel.findById(id).exec()
    if (!storeLevel) {
      res.status(404).json({ error: 'Store level not found' })
      return
    }
    req.storeLevel = storeLevel
    next()
  } catch (error) {
    res.status(404).json({ error: 'Store level not found' })
  }
}

export const getStoreLevel: RequestHandler = async (req, res) => {
  try {
    const point = Math.max(req.store?.point || 0, 0)
    const [level] = await StoreLevel.find({
      minPoint: { $lte: point },
      isDeleted: false
    })
      .sort('-minPoint')
      .limit(1)
      .exec()
    if (!level) {
      res.status(404).json({ error: 'No matching store level found' })
      return
    }
    res.status(200).json({
      success: 'Get store level successfully',
      level: {
        point: req.store?.point,
        name: level.name,
        minPoint: level.minPoint,
        discount: level.discount,
        color: level.color
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Get store level failed' })
  }
}

export const createStoreLevel: RequestHandler = async (req, res) => {
  try {
    const { name, minPoint, discount, color } = req.body
    const storeLevel = new StoreLevel({ name, minPoint, discount, color })
    const level = await storeLevel.save()
    res.status(201).json({ success: 'Create store level successfully', level })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateStoreLevel: RequestHandler = async (req, res) => {
  try {
    const { name, minPoint, discount, color } = req.body
    const level = await StoreLevel.findOneAndUpdate(
      { _id: req.storeLevel?._id },
      { $set: { name, minPoint, discount, color } },
      { new: true }
    ).exec()
    if (!level) {
      res.status(500).json({ error: 'Store level not found' })
      return
    }
    res.status(200).json({ success: 'Update store level successfully', level })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const removeStoreLevel: RequestHandler = async (req, res) => {
  try {
    const level = await StoreLevel.findOneAndUpdate(
      { _id: req.storeLevel?._id },
      { $set: { isDeleted: true } },
      { new: true }
    ).exec()
    if (!level) {
      res.status(500).json({ error: 'Store level not found' })
      return
    }
    res.status(200).json({ success: 'Remove store level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const restoreStoreLevel: RequestHandler = async (req, res) => {
  try {
    const level = await StoreLevel.findOneAndUpdate(
      { _id: req.storeLevel?._id },
      { $set: { isDeleted: false } },
      { new: true }
    ).exec()
    if (!level) {
      res.status(500).json({ error: 'Store level not found' })
      return
    }
    res.status(200).json({ success: 'Restore store level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}
