import { Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { errorHandler, MongoError } from '../../helpers/errorHandler'
import { User, RefreshToken } from '../../models/index.model'
import { AuthRequest, SignoutRequest, RefreshTokenRequest } from './auth.types'

export const signup = async (req: AuthRequest, res: Response) => {
  try {
    if (req.body.email) req.body.email = req.body.email.toLowerCase()
    const { userName, email, phone } = req.body

    if (email) {
      const existedEmail = await User.findOne({ email })
      if (existedEmail) {
        return res.status(400).json({ error: 'Email đã được sử dụng!' })
      }
    }

    if (userName) {
      const existedUser = await User.findOne({ userName })
      if (existedUser) {
        return res.status(400).json({ error: 'Tên đăng nhập đã được sử dụng!' })
      }
    }

    if (phone) {
      const existedPhone = await User.findOne({ phone })
      if (existedPhone) {
        return res.status(400).json({ error: 'Số điện thoại đã được sử dụng!' })
      }
    }
    const user = new User({
      ...req.body,
      isEmailActive: req.body.email ? true : false
    })
    await user.save()
    res.status(201).json({
      success: 'Signing up successfully, you can sign in now',
      user
    })
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error as MongoError)
    })
  }
}

export const signin = async (req: any, res: any, next: any) => {
  try {
    const { email, phone, userName, password } = req.body
    const query = {
      $or: [
        email
          ? {
              email: { $exists: true, $ne: null, $eq: email },
              googleId: { $exists: false, $eq: null }
            }
          : null,
        phone
          ? {
              phone: { $exists: true, $ne: null, $eq: phone },
              googleId: { $exists: false, $eq: null }
            }
          : null,
        userName
          ? {
              userName: { $exists: true, $ne: null, $eq: userName },
              googleId: { $exists: false, $eq: null }
            }
          : null
      ].filter(Boolean)
    }
    const user = await User.findOne(query as any)
    if (!user) {
      res.status(404).json({
        error: 'User not found! Please try again'
      })
      return
    }
    if (!user.authenticate(password)) {
      res.status(401).json({
        error: 'Password does not match! Please try again'
      })
      return
    }
    ;(req as any).auth = user
    next()
  } catch (error) {
    res.status(404).json({
      error: 'User not found'
    })
  }
}

export const createToken: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthRequest
  try {
    const user = authReq.auth
    if (!user) {
      throw new Error('User not found')
    }
    const { _id, role } = user
    const accessToken = jwt.sign(
      { _id },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '7days'
      }
    )
    const refreshToken = jwt.sign(
      { _id },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '9999 days'
      }
    )
    const token = new RefreshToken({ jwt: refreshToken })
    await token.save()
    res.status(201).json({
      success: 'Sign in successfully',
      accessToken,
      refreshToken,
      _id,
      role
    })
  } catch (error) {
    res.status(500).json({
      error: 'Create JWT failed, please try sign in again'
    })
  }
}

export const signout: RequestHandler = async (
  req: SignoutRequest,
  res: Response
) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(401).json({ error: 'refreshToken is required' })
      return
    }
    await RefreshToken.deleteOne({ jwt: refreshToken }).exec()
    res.status(200).json({
      success: 'Sign out successfully'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Sign out failed'
    })
  }
}

export const refreshToken: RequestHandler = async (
  req: RefreshTokenRequest,
  res: Response
) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(401).json({ error: 'refreshToken is required' })
    return
  }

  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          res.status(401).json({ error: 'refreshToken is not valid' })
          return
        }

        const token = await RefreshToken.findOne({ jwt: refreshToken }).exec()
        if (!token) {
          res.status(401).json({ error: 'refreshToken not found' })
          return
        }

        const user = await User.findById(decoded._id).exec()
        if (!user) {
          res.status(401).json({ error: 'User not found' })
          return
        }

        const newAccessToken = jwt.sign(
          { _id: user._id },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: '7days' }
        )

        res.status(200).json({
          success: 'Refresh token successfully',
          accessToken: newAccessToken,
          _id: user._id,
          role: user.role
        })
      }
    )
  } catch (error) {
    res.status(500).json({
      error: 'Refresh token failed'
    })
  }
}
