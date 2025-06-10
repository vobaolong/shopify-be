import { Request, Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../../models/index.model'
import { ForgotPasswordRequest } from './auth.types'

export const forgotPassword: RequestHandler = async (
  req: ForgotPasswordRequest,
  res,
  next
) => {
  try {
    const { email, phone } = req.body

    const forgot_password_code = jwt.sign(
      { email, phone },
      process.env.JWT_FORGOT_PASSWORD_SECRET as string
    )
    const query = {
      $or: [
        { email: { $exists: true, $ne: null, $eq: email } },
        { phone: { $exists: true, $ne: null, $eq: phone } }
      ]
    }
    const user = await User.findOneAndUpdate(
      query,
      { $set: { forgot_password_code } },
      { new: true }
    ).exec()
    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }
    ;(req as any).msg = {
      email: email || '',
      phone: phone || '',
      name: `${user.userName} ${user.name}`,
      title: 'Request to reset password',
      text: 'Please click the link below to change your password.',
      code: forgot_password_code
    }
    next()
    res.status(200).json({
      success: 'Request successfully, please wait for email'
    })
  } catch (error) {
    res.status(500).json({
      error: 'User not found'
    })
  }
}

export const changePassword: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const forgot_password_code = req.params.forgotPasswordCode
    const { password } = req.body
    const user = await User.findOneAndUpdate(
      { forgot_password_code },
      { $unset: { forgot_password_code: '' } }
    )
    if (!user) {
      res.status(404).json({
        error: 'User not found'
      })
      return
    }
    user.hashed_password = user.encryptPassword(password, user.salt)
    await user.save()
    res.status(200).json({
      success: 'Update password successfully'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Update password failed, please request to send email again'
    })
  }
}
