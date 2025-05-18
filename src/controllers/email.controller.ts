import { User, Store, Order } from '../models/index.model'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { formatDate } from '../helpers/formatDate'
import { Request, Response, NextFunction, RequestHandler } from 'express'

interface AuthenticatedRequest extends Request {
	user?: any
	msg?: {
		email?: string
		phone?: string
		name?: string
		title?: string
		text?: string
		code?: string
	}
}

interface EmailParamRequest extends Request {
	params: {
		userId: string
		storeId?: string
		emailCode?: string
	}
}

interface EmailMessage {
	from: string | undefined
	to: string
	subject: string
	html: string
}

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.ADMIN_EMAIL,
		pass: process.env.ADMIN_EMAIL_PASSWORD
	}
})

const createEmailTemplate = (
	title: string,
	name: string,
	content: string,
	buttonText: string | null = null,
	buttonUrl: string | null = null
): string => {
	const buttonHtml =
		buttonText && buttonUrl
			? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
        <a style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
           href='${buttonUrl}'>
          ${buttonText}
        </a>
      </button>`
			: ''

	return `<div style="line-height: 2.5">
    <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
    <hr/>
    <b>Xin chào ${name},</b>
    <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
    ${content}
    ${buttonHtml}
    ${!buttonHtml
			? `
    <p>Trân trọng,</p>
    <i>Đội ngũ hỗ trợ khách hàng</i>
    <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>`
			: ''
		}
  </div>`
}

const sendEmail = (to: string, subject: string, html: string): Promise<any> => {
	const message: EmailMessage = {
		from: process.env.ADMIN_EMAIL,
		to,
		subject: `Zenpii E-commerce - ${subject}`,
		html
	}
	return transport.sendMail(message)
}

interface EmailResponse {
	success: () => void
	error: (error: any) => void | Response
}

const handleEmailResponse = (
	res?: Response,
	next?: NextFunction
): EmailResponse => {
	return {
		success: () => {
			console.log('Send email successfully')
			if (next) {
				next()
			} else if (res) {
				res.status(200).json({ success: 'Send email successfully' })
			}
		},
		error: (error: unknown) => {
			console.log('Send email failed', error)
			if (res) {
				res.status(500).json({ error: 'Send email failed' })
			}
		}
	}
}

export const sendChangePasswordEmail: RequestHandler = (req, res, next) => {
	console.log('Send email to change password')
	const authReq = req as AuthenticatedRequest
	const { email, phone, name, title, text, code } = authReq.msg || {}

	if (!email && phone) {
		if (next) next()
		return
	} else if (!email && !phone) {
		console.log('No email provided')
		return
	}

	const clientUrl = `http://localhost:${process.env.CLIENT_PORT_1 || 5173}`
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

export const sendConfirmationEmail: RequestHandler = (req, res) => {
	const authReq = req as AuthenticatedRequest

	if (!authReq.user?.email) {
		res.status(400).json({ error: 'No email provided' })
	}

	if (authReq.user.isEmailActive) {
		res.status(400).json({ error: 'Email Verified' })
	}

	const email_code = jwt.sign(
		{ email: req.body.email },
		process.env.JWT_EMAIL_CONFIRM_SECRET || ''
	)
	User.findOneAndUpdate(
		{ _id: authReq.user?._id },
		{ $set: { email_code } },
		{ new: true }
	)
		.exec()
		.then((user) => {
			if (!user) {
				res.status(500).json({ error: 'User not found' })
				return
			}

			const title = 'Xác minh địa chỉ email của bạn'
			const text =
				'Để có quyền truy cập vào tài khoản của bạn, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết bên dưới.'
			const name = `${user.firstName} ${user.lastName}`
			const clientUrl = `http://localhost:${process.env.CLIENT_PORT_1 || 5173}`
			const buttonUrl = `${clientUrl}/verify/email/${email_code}`
			const html = createEmailTemplate(
				title,
				name,
				`<p>${text}</p>`,
				'Xác thực ngay!',
				buttonUrl
			)

			const response = handleEmailResponse(res)
			authReq.user?.email &&
				sendEmail(authReq.user.email, title, html)
					.then(response.success)
					.catch(response.error)
		})
		.catch((error) => {
			res.status(500).json({ error: 'Send email failed' })
		})
}

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
		const name = `${user.firstName} ${user.lastName}`
		const content = `<p style="fontSize:30px">Chúng tôi xin trân trọng thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của quý khách sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc đóng cửa đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`
		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)
		user.email &&
			(await sendEmail(user.email, title, html)
				.then(response.success)
				.catch(response.error))
	} catch (error) {
		res.status(500).json({ error: 'Send email failed' })
	}
}

export const sendDeliveryEmailEmail: RequestHandler = async (req, res) => {
	console.log('Send delivery email')
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
		const name = `${user.firstName} ${user.lastName}`
		const content = `<p style="fontSize:30px">Chúng tôi xin trân trọng thông báo rằng đơn hàng <strong style="color: #2266cc">${order?._id}</strong> của quý khách đã được giao thành công vào lúc: <strong>${time}</strong>.<br/></p>`

		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)

		user.email &&
			(await sendEmail(user.email, title, html)
				.then(response.success)
				.catch(response.error))
	} catch (error) {
		console.log('Send email failed', error)
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
		}
		const time = formatDate(Date.now())
		const title = 'THÔNG BÁO KHOÁ TÀI KHOẢN GIAN HÀNG'
		const name = `${user?.firstName} ${user?.lastName}`
		const content = `<span>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của bạn đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</span>`
		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)
		user?.email &&
			(await sendEmail(user.email, title, html)
				.then(response.success)
				.catch(response.error))
	} catch (error) {
		res.status(500).json({ error: 'Send email failed' })
	}
}

export const sendCreateStoreEmail: RequestHandler = async (req, res) => {
	console.log('Send create store email')
	try {
		const user = await User.findById({ _id: req.params.userId })
		const store = await Store.findById({ _id: req.params.storeId })

		if (!user) {
			res.status(400).json({ error: 'User information is missing' })
		}
		const title = 'THÔNG BÁO MỞ GIAN HÀNG THÀNH CÔNG'
		const name = `${user?.firstName} ${user?.lastName}`
		const content = `<span>Chúng tôi xin trân trọng thông báo rằng gian hàng <strong style="color: #2266cc">${store?.name}</strong> của Quý khách đã được mở thành công trên hệ thống của chúng tôi.<br/>Đội ngũ hỗ trợ của chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất để hướng dẫn và hỗ trợ trong quá trình vận hành gian hàng.<br/>
    <br/>
    Chúng tôi rất mong gian hàng của Quý khách sẽ đem lại nhiều cơ hội kinh doanh thành công trên nền tảng của chúng tôi.</span>`
		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)
		user?.email &&
			(await sendEmail(user?.email, title, html)
				.then(response.success)
				.catch(response.error))
	} catch (error) {
		res.status(500).json({ error: 'Send email failed' })
	}
}

export const sendActiveProductEmail: RequestHandler = async (req, res) => {
	try {
		const user = await User.findById({ _id: req.params.userId })

		if (!user) {
			res.status(400).json({ error: 'User information is missing' })
			return
		}
		const time = formatDate(Date.now())
		const title = 'THÔNG BÁO MỞ KHOÁ SẢN PHẨM'
		const name = `${user?.firstName} ${user?.lastName}`
		const content = `<p>Chúng tôi xin trân trọng thông báo rằng sản phẩm của cửa hàng sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc khoá sản phẩm đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`
		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)
		user?.email &&
			(await sendEmail(user?.email, title, html)
				.then(response.success)
				.catch(response.error))
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
		const name = `${user.firstName} ${user.lastName}`
		const content = `<p>Chúng tôi xin thông báo rằng sản phẩm của shop đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</p>`
		const html = createEmailTemplate(title, name, content)
		const response = handleEmailResponse(res)
		user.email &&
			(await sendEmail(user.email, title, html)
				.then(response.success)
				.catch(response.error))
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
		const name = `${user?.firstName} ${user?.lastName}`
		const content = `<p>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store?.name}</strong> của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`
		const html = createEmailTemplate(title, name, content)
		user?.email &&
			(await sendEmail(user?.email, title, html)
				.then(() => console.log('Send email successfully'))
				.catch((error) => console.log('Send email failed', error)))
	} catch (error) {
		res.status(500).json({ error: 'Send email failed' })
	}
}

export const sendReportProductEmail: RequestHandler = async (req, res) => {
	console.log('Send report product email')
	try {
		const user = await User.findById({ _id: req.params.userId })
		if (!user) {
			res.status(400).json({ error: 'User information is missing' })
			return
		}
		const time = formatDate(Date.now())
		const title = 'BÁO CÁO SẢN PHẨM'
		const name = `${user.firstName} ${user.lastName}`
		const content = `<p>Chúng tôi xin thông báo rằng sản phẩm shop của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`
		const html = createEmailTemplate(title, name, content)
		user.email &&
			(await sendEmail(user.email, title, html)
				.then(() => console.log('Send email successfully'))
				.catch((error) => console.log('Send email failed', error)))
	} catch (error) {
		res.status(500).json({ error: 'Send email failed' })
	}
}

export const verifyEmail: RequestHandler = (req, res) => {
	User.findOneAndUpdate(
		{ email_code: req.params.emailCode },
		{ $set: { isEmailActive: true }, $unset: { email_code: '' } }
	)
		.exec()
		.then((user) => {
			if (!user) {
				res.status(500).json({
					error: 'User not found'
				})
				return
			}

			res.status(200).json({
				success: 'Confirm email successfully'
			})
		})
		.catch((error) => {
			res.status(500).json({
				error: errorHandler(error as MongoError)
			})
		})
}
