import { User, Address } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { cleanUser, cleanUserLess } from '../helpers/userHandler'
import { deleteImage } from '../helpers/cloudinary'
import { Request, Response, RequestHandler, RequestParamHandler } from 'express'
import { FilterType } from '../types/controller.types'

interface UserRequest extends Request {
  user?: any
  filepaths?: string[]
  file?: any
  query: {
    index?: string
    search?: string
    sortBy?: string
    order?: string
    limit?: string
    page?: string
    createdAtFrom?: string
    createdAtTo?: string
    isEmailActive?: string
    searchField?: string
    [key: string]: any
  }
}

export const getUserById: RequestParamHandler = async (
  req: UserRequest,
  res,
  next,
  id: string
) => {
  try {
    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }
    req.user = user
    next()
  } catch (error) {
    res.status(404).json({
      error: 'User not found'
    })
  }
}

export const getUser: RequestHandler = (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(404).json({
      error: 'User not found'
    })
    return
  }
  res.status(200).json({
    success: 'Get user successfully',
    user: cleanUser(req.user.toObject ? req.user.toObject() : req.user)
  })
}

export const getUserProfile: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.user?._id) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    const user = await User.findOne({ _id: req.user._id })
    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: 'Get user profile successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(404).json({
      error: 'User not found'
    })
  }
}

export const updateProfile: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const { firstName, lastName, id_card, email, phone } = req.body as {
      firstName?: string
      lastName?: string
      id_card?: string
      email?: string
      phone?: string
    }

    if (!req.user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    if (email && req.user.googleId) {
      res.status(400).json({
        error: 'Can not update Google email address'
      })
      return
    }

    const isEmailActive =
      email && req.user.email !== email ? false : req.user.isEmailActive
    const isPhoneActive =
      phone && req.user.phone !== phone ? false : req.user.isPhoneActive

    try {
      const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            firstName,
            lastName,
            id_card,
            email,
            phone,
            isEmailActive,
            isPhoneActive
          }
        },
        { new: true }
      )

      if (!user) {
        res.status(500).json({
          error: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: 'Update user successfully.',
        user: cleanUserLess(user.toObject ? user.toObject() : user)
      })
    } catch (error) {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    }
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updatePassword: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const { newPassword } = req.body as { newPassword: string }

    if (!req.user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    const user = req.user
    const encryptedPassword = user.encryptPassword(newPassword, user.salt)

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { hashed_password: encryptedPassword } }
      )

      if (!updatedUser) {
        res.status(500).json({
          error: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: 'Update new password successfully'
      })
    } catch (error) {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    }
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const addAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    let addresses = req.user.addresses
    if (addresses.length >= 10) {
      res.status(400).json({
        error: 'The limit is 10 addresses'
      })
      return
    }

    const addressData = req.body.address as string
    if (!addressData) {
      res.status(400).json({
        error: 'Address is required'
      })
      return
    }

    addresses.push(addressData.trim())
    addresses = [...new Set(addresses)]

    try {
      const address = new Address({
        ...req.body
      })

      await address.save()

      const user = await User.findOneAndUpdate(
        { _id: req.user?._id },
        { $set: { addresses } },
        { new: true }
      )

      if (!user) {
        res.status(500).json({
          error: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: 'Add address successfully',
        user: cleanUserLess(user.toObject ? user.toObject() : user)
      })
    } catch (error) {
      res.status(400).json({
        error: errorHandler(error as MongoError)
      })
    }
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const addressIndex =
      req.query.index &&
      !isNaN(parseInt(req.query.index as string)) &&
      parseInt(req.query.index as string) >= 0 &&
      parseInt(req.query.index as string) <= 10
        ? parseInt(req.query.index as string)
        : -1

    if (addressIndex == -1)
      res.status(400).json({
        error: 'index not found'
      })

    let addresses = req.user.addresses
    if (addresses.length <= addressIndex)
      res.status(404).json({
        error: 'Address not found'
      })

    const index = addresses.indexOf(req.body.address.trim())
    if (index != -1 && index != addressIndex)
      res.status(400).json({
        error: 'Address already exists'
      })

    const addressDetail = req.body.addressDetail

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
      await newAddress.save()
    }

    addresses.splice(addressIndex, 1, req.body.address.trim())

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { addresses } },
      { new: true }
    )

    if (!user) {
      res.status(500).json({
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: 'Update address successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const removeAddress: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const addressIndex =
      req.query.index &&
      !isNaN(parseInt(req.query.index as string)) &&
      parseInt(req.query.index as string) >= 0 &&
      parseInt(req.query.index as string) <= 10
        ? parseInt(req.query.index as string)
        : -1

    if (addressIndex == -1)
      res.status(400).json({
        error: 'index not found'
      })

    let addresses = req.user.addresses
    if (addresses.length <= addressIndex)
      res.status(404).json({
        error: 'Address not found'
      })

    addresses.splice(addressIndex, 1)

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { addresses } },
      { new: true }
    )

    if (!user) {
      res.status(500).json({
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: 'Remove address successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateAvatar: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded'
      })
      return
    }

    // Lấy public_id từ old avatar URL nếu là hình ảnh cloudinary
    const oldAvatar = req.user.avatar || ''
    let oldPublicId = null
    if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
      const matches = oldAvatar.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    // File đã được upload bởi middleware uploadAvatarSingle
    const avatarUrl = req.file.path

    // Cập nhật URL mới vào user
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { avatar: avatarUrl } },
      { new: true }
    )

    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }

    // Xóa ảnh cũ trên Cloudinary nếu có
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

    res.status(200).json({
      success: 'Update avatar successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    console.error('Avatar update error:', error)
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const updateCover: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded'
      })
      return
    }

    // Lấy public_id từ old cover URL nếu là hình ảnh cloudinary
    const oldCover = req.user.cover || ''
    let oldPublicId = null
    if (oldCover && oldCover.includes('cloudinary.com')) {
      const matches = oldCover.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    // File đã được upload bởi middleware uploadCoverSingle
    const coverUrl = req.file.path

    // Cập nhật URL mới vào user
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { cover: coverUrl } },
      { new: true }
    )

    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }
    // Xóa ảnh cũ trên Cloudinary nếu có
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

    res.status(200).json({
      success: 'Update cover successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    console.error('Cover update error:', error)
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const listUser: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const search = req.query.search ? (req.query.search as string) : ''
    const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
    const order =
      req.query.order &&
      (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc'
    const limit =
      req.query.limit &&
      !isNaN(parseInt(req.query.limit as string)) &&
      parseInt(req.query.limit as string) > 0
        ? parseInt(req.query.limit as string)
        : 6
    const page =
      req.query.page &&
      !isNaN(parseInt(req.query.page as string)) &&
      parseInt(req.query.page as string) > 0
        ? parseInt(req.query.page as string)
        : 1

    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const searchField = req.query.searchField as string | undefined
    let filterArgs: any = { role: { $ne: 'admin' } }
    if (searchField && search) {
      if (searchField === 'name') {
        filterArgs.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      } else {
        filterArgs[searchField] = { $regex: search, $options: 'i' }
      }
    } else if (search) {
      filterArgs.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const count = await User.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    let skip = (page - 1) * limit
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
    }
    const users = await User.find(filterArgs)
      .lean()
      .sort({ [sortBy as string]: order, _id: 1 })
      .limit(limit)
      .skip(skip)
    const cleanedUsers = users.map((user: any) => cleanUser(user))
    res.status(200).json({
      success: 'Load list users successfully',
      filter,
      size,
      users: cleanedUsers
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list users failed'
    })
  }
}

export const listUserForAdmin: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const search = req.query.search ? (req.query.search as string) : ''
    const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
    const order =
      req.query.order &&
      (req.query.order === 'asc' || req.query.order === 'desc')
        ? req.query.order
        : 'asc'
    const limit =
      req.query.limit && parseInt(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6
    const page =
      req.query.page && parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1
    const createdAtFrom = req.query.createdAtFrom as string | undefined
    const createdAtTo = req.query.createdAtTo as string | undefined
    const filter: FilterType = {
      search,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }
    const searchField = req.query.searchField as string | undefined
    let filterArgs: any = { role: { $ne: 'admin' } }
    if (searchField && search) {
      if (searchField === 'name') {
        filterArgs.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      } else {
        filterArgs[searchField] = { $regex: search, $options: 'i' }
      }
    } else if (search) {
      filterArgs.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    if (typeof req.query.isEmailActive !== 'undefined') {
      filterArgs.isEmailActive = req.query.isEmailActive === 'true'
    }
    if (createdAtFrom || createdAtTo) {
      filterArgs.createdAt = {}
      if (createdAtFrom) filterArgs.createdAt.$gte = new Date(createdAtFrom)
      if (createdAtTo) filterArgs.createdAt.$lte = new Date(createdAtTo)
    }
    const count = await User.countDocuments(filterArgs)
    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount
    let skip = (page - 1) * limit
    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }
    if (count <= 0) {
      res.status(200).json({
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
      return
    }
    const users = await User.find(filterArgs)
      .lean()
      .sort({ [sortBy as string]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
    const cleanedUsers = users.map((user: any) => cleanUserLess(user))
    res.status(200).json({
      success: 'Load list users successfully',
      filter,
      size,
      users: cleanedUsers
    })
  } catch (error) {
    res.status(500).json({
      error: 'Load list users failed'
    })
  }
}
