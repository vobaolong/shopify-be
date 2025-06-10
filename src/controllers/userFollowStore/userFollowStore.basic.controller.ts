import { RequestHandler } from 'express'
import { UserFollowStore, Store } from '../../models/index.model'
import { cleanStore } from '../../helpers/storeHandler'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { UserFollowStoreRequest, FilterType } from './userFollowStore.types'

export const followStore: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const storeId = req.store!._id
    const follow = await UserFollowStore.findOneAndUpdate(
      { userId, storeId },
      { isDeleted: false },
      { upsert: true, new: true }
    )
    if (!follow) {
      res.status(400).json({ error: 'Follow is already exists' })
    }
    const store = await Store.findOne({ _id: storeId })
      .select('-e_wallet')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .populate('address')
    if (!store) {
      res.status(404).json({ error: 'Store not found' })
    }
    res.status(200).json({
      success: 'Follow store successfully',
      store: cleanStore(store)
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const unfollowStore: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const storeId = req.store!._id
    const follow = await UserFollowStore.findOneAndUpdate(
      { userId, storeId },
      { isDeleted: true },
      { new: true }
    )
    if (!follow) {
      res.status(400).json({ error: 'Unfollow is already exists' })
    }
    const store = await Store.findOne({ _id: storeId })
      .select('-e_wallet')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .populate('address')
    if (!store) {
      res.status(404).json({ error: 'Store not found' })
    }
    res.status(200).json({
      success: 'Unfollow store successfully',
      store: cleanStore(store)
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const checkFollowingStore: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id
    const storeId = req.store!._id
    const follow = await UserFollowStore.findOne({
      userId,
      storeId,
      isDeleted: false
    })
    if (!follow) {
      res.status(200).json({ error: 'Following store not found' })
    }
    res.status(200).json({ success: 'Following store' })
  } catch (error) {
    res.status(404).json({ error: 'Following store not found' })
  }
}

export const getStoreFollowerCount: RequestHandler = async (req, res) => {
  try {
    const storeId = req.store!._id
    const count = await UserFollowStore.countDocuments({
      storeId,
      isDeleted: false
    })
    res.status(200).json({
      success: 'get store number of followers successfully',
      count
    })
  } catch (error) {
    res.status(404).json({ error: 'Following stores not found' })
  }
}
