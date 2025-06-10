import { RequestHandler } from 'express'
import { AuthenticatedRequest } from './email.types'
import { getClientUrl, createEmailTemplate, sendEmail } from './email.core'

export const sendChangePasswordEmail: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest
  const { email, phone, name, title, text, code } = authReq.msg || {}
  if (!email && phone) {
    if (next) next()
    return
  } else if (!email && !phone) {
    return
  }
  const clientUrl = getClientUrl()
  const buttonUrl = code ? `${clientUrl}/change/password/${code}` : null
  const html = createEmailTemplate(
    title || '',
    name || '',
    `<p>${text || ''}</p>`,
    code ? 'Thay đổi mật khẩu!' : null,
    buttonUrl
  )
  sendEmail(email || '', title || '', html)
    .then(() => console.log('Send email successfully'))
    .catch((error) => console.log('Send email failed', error))
}
