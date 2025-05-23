import { RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from '../models/index.model'
import { Role } from '../enums/index.enum'
import { AuthenticatedRequest } from '../types/auth.types'

export const isAuth: RequestHandler = async (
	req: AuthenticatedRequest,
	res,
	next
) => {
	const authHeader = req.headers && req.headers.authorization
	const token = authHeader && authHeader.split(' ')[1]
	if (!token) {
		res.status(401).json({
			error: 'No token provided! Please sign in again'
		})
		return
	}
	jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET as string,
		async (error: any, decoded: any) => {
			if (error) {
				res.status(401).json({
					error: 'Unauthorized! Token invalid or expired. Please sign in again'
				})
				return
			}

			const user = await User.findById(decoded._id)
			if (!user) {
				res.status(401).json({
					error: 'User associated with this token no longer exists'
				})
				return
			}
			req.user = user
			next()
		}
	)
}

export const isManager: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next
) => {
	const user = req.user
	const store = req.store as {
		ownerId: mongoose.Types.ObjectId
		staffIds: mongoose.Types.ObjectId[]
	}

	if (!store || !user) {
		res.status(403).json({
			error: 'Store or user not found',
			isManager: false
		})
		return
	}
	const isUserManager =
		user._id.equals(store.ownerId) ||
		store.staffIds.some((staffId) => staffId.equals(user._id))

	if (!isUserManager) {
		res.status(403).json({
			error: 'Store Manager resource! Access denied',
			isManager: false
		})
		return
	}
	next()
}

export const isOwner: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next
) => {
	const user = req.user
	const store = req.store as {
		ownerId: mongoose.Types.ObjectId
	}

	if (!store || !user) {
		res.status(403).json({
			error: 'Store or user not found',
			isOwner: false
		})
		return
	}

	if (!user._id.equals(store.ownerId)) {
		res.status(403).json({
			error: 'Store Owner resource! Access denied',
			isOwner: false
		})
		return
	}
	next()
}

export const isAdmin: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next
) => {
	if (req.user.role !== Role.ADMIN) {
		res.status(403).json({
			error: 'Admin resource! Access denied'
		})
		return
	}
	next()
}

export const verifyPassword: RequestHandler = async (req, res, next) => {
	try {
		const { currentPassword } = req.body
		const user = await User.findById(req.user?._id)

		if (!user) {
			res.status(404).json({
				error: 'User not found'
			})
			return
		}

		if (user.googleId) {
			next()
			return
		}

		if (!user.authenticate(currentPassword)) {
			res.status(401).json({
				error: "Current password doesn't match"
			})
			return
		}

		next()
	} catch (error) {
		res.status(500).json({
			error: 'Verification failed'
		})
	}
}
