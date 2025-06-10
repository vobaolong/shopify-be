import { RequestHandler } from 'express'
import { User, Store } from '../../models/index.model'

export const updatePoint: RequestHandler = async (req, res, next) => {
  if (!next) return
  try {
    if (!req.updatePoint) {
      next()
      return
    }
    const { userId, storeId, point } = req.updatePoint
    await Promise.all([
      User.findOneAndUpdate({ _id: userId }, { $inc: { point: +point } }),
      Store.findOneAndUpdate({ _id: storeId }, { $inc: { point: +point } })
    ])
    res.status(200).json({ success: 'Update point successfully' })
    next()
  } catch (error) {
    res.status(500).json({ error: 'Update point failed' })
    next()
  }
}
