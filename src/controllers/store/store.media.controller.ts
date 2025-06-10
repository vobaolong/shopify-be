import { Store } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { Response } from 'express'
import { StoreRequest, safeCleanUser } from './store.types'

// Media management operations (avatar, cover, featured images)
export const updateAvatar = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const oldpath = req.store.avatar

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { avatar: req.filepaths ? req.filepaths[0] : '' } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }
    // Cast to IUser before using cleanUser
    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })
    res.status(200).json({
      success: 'Update avatar successfully',
      store
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateCover = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const oldpath = req.store.cover

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { cover: req.filepaths ? req.filepaths[0] : '' } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    // Cast to IUser before using cleanUser
    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Update cover successfully',
      store
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getListFeatureImages = (
  req: StoreRequest,
  res: Response
): void => {
  const featured_images = req.store.featured_images
  res.status(200).json({
    success: 'load cover successfully',
    featured_images
  })
}

export const addFeatureImage = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const featured_images = req.store.featured_images

    const index = featured_images.length
    if (index >= 7) {
      res.status(400).json({
        error: 'Limit is 7 images'
      })
      return
    }
    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $push: { featured_images: req.filepaths ? req.filepaths[0] : '' } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    // Cast to IUser before using cleanUser
    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Add featured image successfully',
      store
    })
  } catch (error) {
    res.status(500).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateFeatureImage = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const index = req.query.index ? parseInt(req.query.index as string) : 0
    const featured_images = [...req.store.featured_images]

    if (index < 0 || index >= featured_images.length) {
      res.status(400).json({
        error: 'Feature image not found'
      })
      return
    }
    const oldpath = featured_images[index]
    featured_images[index] = req.filepaths ? req.filepaths[0] : ''

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { featured_images } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Update featured image successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeFeaturedImage = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const index = req.query.index ? parseInt(req.query.index as string) : 0
    const featured_images = [...req.store.featured_images]

    if (index < 0 || index >= featured_images.length) {
      res.status(400).json({
        error: 'Feature image not found'
      })
      return
    }
    featured_images.splice(index, 1)

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { featured_images } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Remove featured image successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}
