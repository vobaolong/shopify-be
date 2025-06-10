import { Request, Response, RequestHandler } from 'express'
import { sendEmail } from '../email'
import { User } from '../../models/index.model'

const otpStore = new Map<string, string>()

export const sendOTPEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      res.status(400).json({ error: 'Email không hợp lệ' })
      return
    }
    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(email, otp)
    // Gửi email thực tế
    const subject = 'Mã OTP xác thực đăng ký tài khoản'
    const html = `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong vài phút.</p>`
    await sendEmail(email, subject, html)
    res.json({ success: true, message: 'Đã gửi mã OTP về email!' })
  } catch (error) {
    res.status(500).json({ error: 'Gửi OTP thất bại!' })
  }
}

export const verifyOTP: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      res.status(400).json({ error: 'Thiếu email hoặc mã OTP' })
      return
    }
    const validOtp = otpStore.get(email)
    if (validOtp && otp === validOtp) {
      otpStore.delete(email)
      res.json({ success: true, message: 'OTP hợp lệ' })
      return
    }
    res.status(400).json({ error: 'OTP không đúng hoặc đã hết hạn' })
  } catch (error) {
    res.status(500).json({ error: 'Xác thực OTP thất bại!' })
  }
}

export const checkEmailExists: RequestHandler = async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ exists: false, error: 'Email is required' })
    return
  }

  const existed = await User.findOne({ email })

  const result = { exists: !!existed }
  res.json(result)
}
