import { RequestHandler } from 'express'
import { User, Order } from '../../models/index.model'
import { formatDate } from '../../helpers/formatDate'
import { EmailParamRequest } from './email.types'
import {
  createEmailTemplate,
  sendEmail,
  handleEmailResponse
} from './email.core'

export const sendDeliveryEmailEmail: RequestHandler = async (req, res) => {
  try {
    const paramReq = req as EmailParamRequest
    const user = await User.findById({ _id: paramReq.params.userId })
    const order = await Order.findById({ _id: paramReq.params.storeId })
    if (!user) {
      res.status(400).json({ error: 'User information is missing' })
      return
    }
    const time = formatDate(Date.now())
    const title = 'THÔNG BÁO GIAO HÀNG THÀNH CÔNG'
    const name = `${user.userName}`
    const content = `<p>Chúng tôi xin trân trọng thông báo rằng đơn hàng <strong style=\"color: #2266cc\">${order?._id}</strong> của quý khách đã được giao thành công vào lúc: <strong>${time}</strong>.</p>`
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
