import { Store, Address, Notification } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { cleanStore } from '../../helpers/storeHandler'
import {
  Response,
  NextFunction,
  RequestHandler,
  RequestParamHandler
} from 'express'
import { StoreRequest, AddressDetailType, safeCleanUser } from './store.types'

// Basic store operations
export const getStoreById: RequestParamHandler = async (
  req: StoreRequest,
  res: Response,
  next: NextFunction,
  id: string
) => {
  try {
    const store = await Store.findById(id).exec()
    if (!store) {
      res.status(404).json({
        error: 'Store not found'
      })
      return
    }
    req.store = store
    next()
  } catch (error) {
    res.status(404).json({
      error: 'Store not found'
    })
    return
  }
}

export const getStore: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const store = await Store.findOne({ _id: req.store._id })
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(404).json({
        error: 'Store not found'
      })
      return
    }

    res.status(200).json({
      success: 'Get store successfully',
      store: cleanStore(store)
    })
  } catch (error) {
    res.status(404).json({
      error: 'Store not found'
    })
    return
  }
}

export const getStoreProfile: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const store = await Store.findOne({ _id: req.store._id })
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')
      .exec()

    if (!store) {
      res.status(404).json({
        error: 'Stores not found'
      })
      return
    }

    // Cast to IUser before using cleanUser
    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Get store profile successfully',
      store
    })
  } catch (error) {
    res.status(404).json({
      error: 'Store not found'
    })
    return
  }
}

export const createStore: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const { name, bio, address, commissionId, addressDetail } = req.fields || {}
    const avatar = req.filepaths ? req.filepaths[0] : undefined
    const cover = req.filepaths ? req.filepaths[1] : undefined

    if (!name || !bio || !address || !commissionId || !avatar || !cover) {
      res.status(400).json({
        error: 'All fields are required'
      })
      return
    }

    const {
      province,
      provinceName,
      district,
      districtName,
      ward,
      wardName,
      street
    } = JSON.parse(addressDetail as string) as AddressDetailType

    const addressObj = new Address({
      provinceID: province,
      provinceName,
      districtID: district,
      districtName,
      wardID: ward,
      wardName,
      address: street
    })

    await addressObj.save()

    const store = new Store({
      name,
      bio,
      address: addressObj,
      commissionId,
      avatar,
      cover,
      ownerId: req.user._id
    })

    const savedStore = await store.save()

    const adminId = process.env.ADMIN_ID
    const adminNotification = new Notification({
      message: `Có cửa hàng mới: ${store.name}`,
      userId: adminId,
      isRead: false,
      objectId: savedStore._id
    })

    await adminNotification.save()

    res.status(200).json({
      success: 'Creating store successfully',
      storeId: savedStore._id
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateStore: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const { name, bio, address, addressDetail } = req.body as {
      name?: string
      bio?: string
      address?: string
      addressDetail: AddressDetailType
    }

    let addressId = null
    if (addressDetail._id) {
      await Address.findByIdAndUpdate(addressDetail._id, {
        provinceID: addressDetail.province,
        provinceName: addressDetail.provinceName,
        districtID: addressDetail.district,
        districtName: addressDetail.districtName,
        wardID: addressDetail.ward,
        wardName: addressDetail.wardName,
        address: addressDetail.street
      })
      addressId = addressDetail._id
    } else {
      const newAddress = new Address({
        provinceID: addressDetail.province,
        provinceName: addressDetail.provinceName,
        districtID: addressDetail.district,
        districtName: addressDetail.districtName,
        wardID: addressDetail.ward,
        wardName: addressDetail.wardName,
        address: addressDetail.street
      })
      const savedAddress = await newAddress.save()
      addressId = savedAddress._id
    }

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { name, bio, address: addressId } },
      { new: true }
    )
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')

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
      success: 'Update store successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const activeStore: RequestHandler = async (
  req: StoreRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive } = req.body as { isActive: boolean }

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { isActive } },
      { new: true }
    )
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name fee')

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

    // Pass to activeAllProducts middleware
    req.store = store
    next()
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const getCommission: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const store = await Store.findOne({ _id: req.store._id })
      .populate('commissionId')
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    res.status(200).json({
      success: 'Get commission successfully',
      commission: store.commissionId
    })
  } catch (error) {
    res.status(500).json({
      error: 'Store not found'
    })
  }
}

export const updateCommission: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const { commissionId } = req.body as { commissionId: string }

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { commissionId } },
      { new: true }
    )
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
      success: 'Update store commission successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const openStore: RequestHandler = async (
  req: StoreRequest,
  res: Response
) => {
  try {
    const { isOpen } = req.body as { isOpen: boolean }

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { isOpen } },
      { new: true }
    )
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

    // Cast to IUser before using cleanUser
    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff, index) => {
      store.staffIds[index] = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Update store status successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}
