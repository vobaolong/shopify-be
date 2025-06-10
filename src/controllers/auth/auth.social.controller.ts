import { RequestHandler } from 'express'
import { User } from '../../models/index.model'
import {
  SocialAuthRequest,
  AuthUpdateRequest as BaseAuthUpdateRequest
} from './auth.types'

interface AuthUpdateRequest extends BaseAuthUpdateRequest {
  body: BaseAuthUpdateRequest['body'] & {
    name?: string
    gender?: string
    dateOfBirth?: string
    email?: string
    googleId?: string
  }
}

export const authSocial: RequestHandler = async (
  req: SocialAuthRequest,
  res,
  next
) => {
  try {
    const { googleId } = req.body
    if (!googleId) {
      res.status(400).json({
        error: 'googleId is required'
      })
      return
    }
    const user = await User.findOne({
      googleId: { $exists: true, $ne: null, $eq: googleId }
    }).exec()
    if (user) req.auth = user
    next()
  } catch (error) {
    res.status(500).json({
      error: 'Signing in with Google failed'
    })
  }
}

export const authUpdate: RequestHandler = async (
  req: AuthUpdateRequest,
  res,
  next
) => {
  if (req.auth) {
    next()
    return
  }
  try {
    const { userName, name, gender, dateOfBirth, email, googleId } = req.body
    if (googleId) {
      const user = await User.findOneAndUpdate(
        { email: { $exists: true, $ne: null, $eq: email } },
        { $set: { googleId } },
        { new: true }
      ).exec()
      if (!user) {
        const newUser = new User({
          userName,
          name,
          gender,
          dateOfBirth,
          email,
          googleId,
          isEmailActive: true
        })
        const savedUser = await newUser.save()
        req.auth = savedUser
      } else {
        req.auth = user
      }
    }
    next()
  } catch (error) {
    next()
  }
}
