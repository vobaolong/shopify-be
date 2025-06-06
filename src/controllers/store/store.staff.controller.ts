import { Store, User } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { Response } from 'express'
import { StoreRequest, safeCleanUser } from './store.types'
import { IUser } from '../../models/user.model'

// Staff management operations
export const getStaffs = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const store = await Store.findOne({ _id: req.store._id })
      .select('staffIds')
      .populate(
        'staffIds',
        '_id userName name slug email phone id_card point avatar cover'
      )
      .exec()

    if (!store) {
      res.status(500).json({
        error: 'Store not found'
      })
      return
    }

    // Create a properly typed copy of the populated staff data
    const staffWithMaskedInfo = store.staffIds.map((staff) => {
      const staffObj = staff as unknown as IUser
      // Create a copy to avoid modifying the original
      const maskedStaff = {
        ...(staffObj.toObject ? staffObj.toObject() : staffObj)
      }

      if (maskedStaff.email)
        maskedStaff.email = maskedStaff.email.slice(0, 6) + '******'
      if (maskedStaff.phone)
        maskedStaff.phone = '*******' + maskedStaff.phone.slice(-3)
      if (maskedStaff.id_card)
        maskedStaff.id_card = maskedStaff.id_card.slice(0, 3) + '******'
      return maskedStaff
    })
    res.status(200).json({
      success: 'Load list staff successfully',
      staff: staffWithMaskedInfo
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list staff failed'
    })
  }
}

export const addStaff = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const { staff } = req.body as { staff: string[] }
    const staffIds = req.store.staffIds

    if (staff.length > 6 - staffIds.length) {
      res.status(400).json({
        error: 'The limit is 6 staff'
      })
    }

    const count = await User.countDocuments({
      _id: { $in: staff },
      role: 'user'
    })

    if (count !== staff.length) {
      res.status(400).json({
        error: 'User is invalid'
      })
    }

    // Add unique staff IDs
    const newStaffIds = [...staffIds]
    for (const staffId of staff) {
      if (!newStaffIds.includes(staffId)) {
        newStaffIds.push(staffId)
      }
    }

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { staffIds: newStaffIds } },
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

    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff) => {
      staff = safeCleanUser(staff)
    })

    res.status(200).json({
      success: 'Add staff successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const cancelStaff = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id
    const staffIds = [...req.store.staffIds]

    const index = staffIds.indexOf(userId)
    if (index === -1) {
      res.status(400).json({
        error: 'User is not staff'
      })
      return
    }

    staffIds.splice(index, 1)

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { staffIds } },
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

    res.status(200).json({
      success: 'Cancel staff successfully'
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeStaff = async (
  req: StoreRequest,
  res: Response
): Promise<void> => {
  try {
    const { staff } = req.body as { staff: string }
    if (!staff) {
      res.status(400).json({
        error: 'Staff is required'
      })
      return
    }

    const staffIds = [...req.store.staffIds]
    const index = staffIds.indexOf(staff)
    if (index === -1) {
      res.status(400).json({
        error: 'User is not staff'
      })
      return
    }

    staffIds.splice(index, 1)

    const store = await Store.findOneAndUpdate(
      { _id: req.store._id },
      { $set: { staffIds } },
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

    store.ownerId = safeCleanUser(store.ownerId)
    store.staffIds.forEach((staff) => {
      staff = safeCleanUser(staff)
    })
    res.status(200).json({
      success: 'Remove staff successfully',
      store
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}
