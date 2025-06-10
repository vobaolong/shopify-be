import { RequestHandler } from 'express'
import { UserLevel } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'

export const getUserLevelById: RequestHandler = async (req, res, next) => {
  try {
    const userLevel = await UserLevel.findById(req.params.userLevelId)
    if (!userLevel) {
      res.status(404).json({ error: 'User level not found' })
      return
    }
    ;(req as any).userLevel = userLevel
    next()
  } catch (error) {
    res.status(404).json({ error: 'User level not found' })
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
    res.status(500).json({ error: 'Get user level failed' })
  }
}

export const createUserLevel: RequestHandler = async (req, res) => {
  try {
    const { name, minPoint, discount, color } = req.body
    const level = new UserLevel({ name, minPoint, discount, color })
    await level.save()
    res.status(201).json({ success: 'Create user level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
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
      res.status(404).json({ error: 'User level not found' })
      return
    }
    res.status(200).json({ success: 'Update user level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const removeUserLevel: RequestHandler = async (req, res) => {
  try {
    const existingLevel = await UserLevel.findById(req.params.userLevelId)
    if (!existingLevel) {
      res.status(404).json({ error: 'User level not found' })
      return
    }
    const level = await UserLevel.findOneAndUpdate(
      { _id: req.params.userLevelId },
      { $set: { isDeleted: true } },
      { new: true }
    )
    res.status(200).json({ success: 'Remove user level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const restoreUserLevel: RequestHandler = async (req, res) => {
  try {
    const level = await UserLevel.findOneAndUpdate(
      { _id: req.params.userLevelId },
      { $set: { isDeleted: false } }
    )
    if (!level) {
      res.status(404).json({ error: 'User level not found' })
      return
    }
    res.status(200).json({ success: 'Restore user level successfully' })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}
