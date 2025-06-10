import { RequestHandler } from 'express'
import { User, Store } from '../../models/index.model'
import { formatDate } from '../../helpers/formatDate'
import {
  createEmailTemplate,
  sendEmail,
  handleEmailResponse
} from './email.core'
import { EmailParamRequest } from './email.types'

export const sendActiveStoreEmail: RequestHandler = async (req, res) => {
  try {
    const paramReq = req as EmailParamRequest
    const user = await User.findById({ _id: paramReq.params.userId })
    const store = await Store.findById({ _id: paramReq.params.storeId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'THÔNG BÁO MỞ KHOÁ TÀI KHOẢN GIAN HÀNG'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin trân trọng thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của quý khách sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc đóng cửa đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`
    const html = createEmailTemplate(title, name, content)
    const response = handleEmailResponse(res)
    if (user.email) {
      await sendEmail(user.email, title, html)
        .then(response.success)
        .catch(response.error)
    }
  } catch (error) {
    res.status(500).json({ error: 'Send email failed' })
  }
}

export const sendBanStoreEmail: RequestHandler = async (req, res) => {
  try {
    const paramReq = req as EmailParamRequest
    const user = await User.findById({ _id: paramReq.params.userId })
    const store = await Store.findById({ _id: paramReq.params.storeId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'THÔNG BÁO KHOÁ TÀI KHOẢN GIAN HÀNG'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của bạn đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</p>`
    const html = createEmailTemplate(title, name, content)
    const response = handleEmailResponse(res)
    if (user.email) {
      await sendEmail(user.email, title, html)
        .then(response.success)
        .catch(response.error)
    }
  } catch (error) {
    console.error('SendBanStoreEmail error:', error)
    res.status(500).json({ error: 'Send email failed' })
  }
}

export const sendCreateStoreEmail: RequestHandler = async (req, res) => {
  console.log('sendCreateStoreEmail called with params:', req.params)
  try {
    const user = await User.findById({ _id: req.params.userId })
    const store = await Store.findById({ _id: req.params.storeId })
    console.log('User found:', user ? user.userName : 'not found')
    console.log('Store found:', store ? store.name : 'not found')
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const title = 'THÔNG BÁO MỞ GIAN HÀNG THÀNH CÔNG'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin trân trọng thông báo rằng gian hàng <strong style="color: #2266cc">${store?.name}</strong> của Quý khách đã được mở thành công trên hệ thống của chúng tôi.<br/>Đội ngũ hỗ trợ của chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất để hướng dẫn và hỗ trợ trong quá trình vận hành gian hàng.<br/>
    <br/>
    Chúng tôi rất mong gian hàng của Quý khách sẽ đem lại nhiều cơ hội kinh doanh thành công trên nền tảng của chúng tôi.</p>`
    const html = createEmailTemplate(title, name, content)
    const response = handleEmailResponse(res)
    if (user.email) {
      console.log('Sending email to:', user.email)
      await sendEmail(user.email, title, html)
        .then(() => {
          console.log('Email sent successfully')
          response.success()
        })
        .catch((error) => {
          console.log('Email sending failed:', error)
          response.error(error)
        })
    } else {
      console.log('User email not found')
      res.status(400).json({ error: 'User email is missing' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Send email failed' })
  }
}

export const sendReportStoreEmail: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.userId })
    const store = await Store.findById({ _id: req.params.storeId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'BÁO CÁO GIAN HÀNG'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`
    const html = createEmailTemplate(title, name, content)
    if (user.email) {
      await sendEmail(user.email, title, html)
        .then(() =>
          res.status(200).json({ success: 'Send email successfully' })
        )
        .catch((error) => {
          console.log('Send email failed', error)
          res.status(500).json({ error: 'Send email failed' })
        })
    }
  } catch (error) {
    res.status(500).json({ error: 'Send email failed' })
  }
}
