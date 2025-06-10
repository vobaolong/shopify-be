import { RequestHandler, RequestParamHandler, Response } from 'express'
import { User } from '../../models/index.model'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { cleanUserLess } from '../../helpers/userHandler'
import { deleteImage } from '../../helpers/cloudinary'
import { UserRequest } from './user.types'

export const getUserById: RequestParamHandler = async (
  req: UserRequest,
  res,
  next,
  id: string
) => {
  try {
    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    req.user = user
    next()
  } catch (error) {
    res.status(404).json({ error: 'User not found' })
  }
}

export const getUser: RequestHandler = (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.status(200).json({
    success: 'Get user successfully',
    user: cleanUserLess(req.user.toObject ? req.user.toObject() : req.user)
  })
}

export const getUserProfile: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.user?._id) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const user = await User.findOne({ _id: req.user._id })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.status(200).json({
      success: 'Get user profile successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(404).json({ error: 'User not found' })
  }
}

export const updateProfile: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const { userName, name, gender, dateOfBirth, id_card, email, phone } =
      req.body as {
        userName?: string
        name?: string
        gender?: string
        dateOfBirth?: string
        id_card?: string
        email?: string
        phone?: string
      }

    if (!req.user) {
      res.status(404).json({ error: 'User not found' })
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
            userName,
            name,
            gender,
            dateOfBirth,
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
        res.status(500).json({ error: 'User not found' })
        return
      }

      res.status(200).json({
        success: 'Update user successfully.',
        user: cleanUserLess(user.toObject ? user.toObject() : user)
      })
    } catch (error) {
      res.status(400).json({ error: errorHandler(error as MongoError) })
    }
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updatePassword: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const { newPassword } = req.body as { newPassword: string }

    if (!req.user) {
      res.status(404).json({ error: 'User not found' })
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
        res.status(500).json({ error: 'User not found' })
        return
      }

      res.status(200).json({ success: 'Update new password successfully' })
    } catch (error) {
      res.status(400).json({ error: errorHandler(error as MongoError) })
    }
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateAvatar: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    if (!req.user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const oldAvatar = req.user.avatar || ''
    let oldPublicId = null
    if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
      const matches = oldAvatar.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    const avatarUrl = req.file.path

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { avatar: avatarUrl } },
      { new: true }
    )

    if (!user) {
      res.status(404).json({ error: 'User not found' })
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

    res.status(200).json({
      success: 'Update avatar successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(500).json({ error: errorHandler(error as MongoError) })
  }
}

export const updateCover: RequestHandler = async (
  req: UserRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const oldCover = req.user.cover || ''
    let oldPublicId = null
    if (oldCover && oldCover.includes('cloudinary.com')) {
      const matches = oldCover.match(/\/upload\/v\d+\/([^/]+)\.\w+$/)
      if (matches && matches[1]) {
        oldPublicId = matches[1]
      }
    }

    const coverUrl = req.file.path

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { cover: coverUrl } },
      { new: true }
    )

    if (!user) {
      res.status(404).json({ error: 'User not found' })
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

    res.status(200).json({
      success: 'Update cover successfully',
      user: cleanUserLess(user.toObject ? user.toObject() : user)
    })
  } catch (error) {
    res.status(400).json({ error: errorHandler(error as MongoError) })
  }
}
