import { Request, Response, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { User, RefreshToken } from '../models/index.model'
import {
	AuthRequest,
	SignoutRequest,
	RefreshTokenRequest,
	ForgotPasswordRequest,
	SocialAuthRequest,
	AuthUpdateRequest
} from '../types/auth.types'

export const signup = async (req: AuthRequest, res: Response) => {
	try {
		const { firstName, lastName, email, phone, password } = req.body
		const user = new User({ firstName, lastName, email, phone, password })
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
		const { email, phone, password } = req.body
		const query = {
			$or: [
				{
					email: { $exists: true, $ne: null, $eq: email },
					googleId: { $exists: false, $eq: null }
				},
				{
					phone: { $exists: true, $ne: null, $eq: phone },
					googleId: { $exists: false, $eq: null }
				}
			]
		}
		const user = await User.findOne(query).exec()
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
		; (req as any).auth = user
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
		const { _id, role } = user
		const accessToken = jwt.sign(
			{ _id },
			process.env.ACCESS_TOKEN_SECRET as string,
			{
				expiresIn: '48h'
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
			error: 'Sign out and remove refresh token failed'
		})
	}
}

export const refreshToken: RequestHandler = async (
	req: RefreshTokenRequest,
	res: Response
) => {
	try {
		const { refreshToken } = req.body
		if (!refreshToken) {
			res.status(401).json({ error: 'refreshToken is required' })
			return
		}
		const token = await RefreshToken.findOne({ jwt: refreshToken }).exec()
		if (!token) {
			res.status(404).json({
				error: 'refreshToken is invalid'
			})
			return
		}
		const decoded = jwt.decode(token.jwt) as { _id: string }
		const { _id } = decoded
		const accessToken = jwt.sign(
			{ _id },
			process.env.ACCESS_TOKEN_SECRET as string,
			{
				expiresIn: '48h'
			}
		)
		const newRefreshToken = jwt.sign(
			{ _id },
			process.env.REFRESH_TOKEN_SECRET as string,
			{ expiresIn: '9999 days' }
		)
		const updatedToken = await RefreshToken.findOneAndUpdate(
			{ jwt: refreshToken },
			{ $set: { jwt: newRefreshToken } },
			{ new: true }
		).exec()
		if (!updatedToken) {
			res.status(500).json({
				error: 'Create JWT failed, try again later'
			})
			return
		}
		res.status(200).json({
			success: 'Refresh token successfully',
			accessToken,
			refreshToken: newRefreshToken
		})
	} catch (error) {
		res.status(401).json({
			error: 'refreshToken is invalid'
		})
	}
}

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
		; (req as any).msg = {
			email: email || '',
			phone: phone || '',
			name: `${user.firstName} ${user.lastName}`,
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
		const { firstName, lastName, email, googleId } = req.body
		if (googleId) {
			const user = await User.findOneAndUpdate(
				{ email: { $exists: true, $ne: null, $eq: email } },
				{ $set: { googleId } },
				{ new: true }
			).exec()
			if (!user) {
				const newUser = new User({
					firstName,
					lastName,
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
