import { Store } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { Response } from 'express'
import { StoreRequest, safeCleanUser } from './store.types'
import { deleteImage } from '../../helpers/cloudinary'

export const updateAvatar = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.store?._id) {
      res.status(400).json({
        error: 'Store ID is required'
      })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    const oldAvatar = req.store.avatar || ''
    let oldPublicId = null
    if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
      const matches = oldAvatar.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }
    const avatarUrl = req.file.path
    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { avatar: avatarUrl } },
      { new: true }
    )
      .populate('avatar')
      .exec()
    if (!store) {
      res.status(404).json({
        error: 'Store not found'
      })
      return
    }
    if (
      oldPublicId &&
      oldPublicId !== 'default' &&
      !oldAvatar.includes('/uploads/default.webp')
    ) {
      try {
        await deleteImage(oldPublicId)
      } catch (error) {
        console.error('Error deleting old avatar image:', error)
      }
    }
    if (store.ownerId) {
      store.ownerId = safeCleanUser(store.ownerId)
    }
    if (store.staffIds?.length) {
      store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
    }
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
    if (!req.store?._id) {
      res.status(400).json({
        error: 'Store ID is required'
      })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    const oldCover = req.store.cover || ''
    let oldPublicId = null
    if (oldCover && oldCover.includes('cloudinary.com')) {
      const matches = oldCover.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }
    const coverUrl = req.file.path
    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { cover: coverUrl } },
      { new: true }
    )
      .populate('address')
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(404).json({
        error: 'Store not found'
      })
      return
    }

    if (
      oldPublicId &&
      oldPublicId !== 'default' &&
      !oldCover.includes('/uploads/default.webp')
    ) {
      try {
        await deleteImage(oldPublicId)
      } catch (error) {
        console.error('Error deleting old cover image:', error)
      }
    }

    if (store.ownerId) {
      store.ownerId = safeCleanUser(store.ownerId)
    }

    if (store.staffIds?.length) {
      store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
    }

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
    if (!req.store?._id) {
      res.status(400).json({
        error: 'Store ID is required'
      })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const featured_images = req.store.featured_images

    const index = featured_images.length
    if (index >= 7) {
      res.status(400).json({
        error: 'Limit is 7 images'
      })
      return
    }

    const imageUrl = req.file.path

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $push: { featured_images: imageUrl } },
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
    if (!req.store?._id) {
      res.status(400).json({
        error: 'Store ID is required'
      })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const index = req.query.index ? parseInt(req.query.index as string) : 0
    const featured_images = [...req.store.featured_images]

    if (index < 0 || index >= featured_images.length) {
      res.status(400).json({
        error: 'Feature image not found'
      })
      return
    }

    // Lưu thông tin ảnh cũ để xóa sau
    const oldPath = featured_images[index]
    let oldPublicId = null
    if (oldPath && oldPath.includes('cloudinary.com')) {
      const matches = oldPath.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    // Lấy đường dẫn mới từ req.file.path
    const imageUrl = req.file.path
    featured_images[index] = imageUrl

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
    if (store.ownerId) {
      store.ownerId = safeCleanUser(store.ownerId)
    }

    if (store.staffIds?.length) {
      store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff))
    }

    // Xóa ảnh cũ nếu có
    if (
      oldPublicId &&
      oldPublicId !== 'default' &&
      !oldPath.includes('/uploads/default.webp')
    ) {
      try {
        await deleteImage(oldPublicId)
      } catch (error) {
        console.error('Error deleting old featured image:', error)
      }
    }

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
