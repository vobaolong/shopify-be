import { RequestHandler } from 'express'
import { User } from '../../models/index.model'
import { formatDate } from '../../helpers/formatDate'
import {
  createEmailTemplate,
  sendEmail,
  handleEmailResponse
} from './email.core'

export const sendActiveProductEmail: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.userId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'THÔNG BÁO MỞ KHOÁ SẢN PHẨM'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin trân trọng thông báo rằng sản phẩm của cửa hàng sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc khoá sản phẩm đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`
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

export const sendBanProductEmail: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.userId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'THÔNG BÁO KHOÁ SẢN PHẨM'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin thông báo rằng sản phẩm của shop đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</p>`
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

export const sendReportProductEmail: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.userId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'BÁO CÁO SẢN PHẨM'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin thông báo rằng sản phẩm shop của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`
    const html = createEmailTemplate(title, name, content)
    if (user.email) {
      await sendEmail(user.email, title, html)
        .then(() =>
          res.status(200).json({ success: 'Send email successfully' })
        )
        .catch((error) => {
          res.status(500).json({ error: 'Send email failed' })
        })
    }
  } catch (error) {
    res.status(500).json({ error: 'Send email failed' })
  }
}
