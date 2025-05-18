import { Transaction, User, Store } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { FilterType } from '../types/controller.types'
import mongoose from 'mongoose'
import {
	NextFunction,
	Request,
	RequestHandler,
	RequestParamHandler,
	Response
} from 'express'

export const getTransactionById: RequestParamHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
	id: string
) => {
	try {
		const transaction = await Transaction.findById(id)
		if (!transaction) {
			res.status(404).json({ error: 'Transaction not found' })
			return
		}
		req.transaction = transaction
		next()
	} catch (error) {
		res.status(404).json({ error: 'Transaction not found' })
	}
}

export const readTransaction: RequestHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const transaction = await Transaction.findOne({ _id: req.transaction?._id })
			.populate('userId', '_id firstName lastName avatar')
			.populate('storeId', '_id name avatar isOpen isActive')
			.exec()
		if (!transaction) {
			res.status(500).json({ error: 'Transaction not found' })
			return
		}
		res.status(200).json({
			success: 'Read transaction successfully',
			transaction
		})
	} catch (error) {
		res.status(500).json({ error: 'Transaction not found' })
	}
}

export const requestTransaction: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { isUp, code, amount } = req.body
	if (
		(!req.store && !req.user) ||
		(isUp !== 'true' && isUp !== 'false') ||
		!amount
	) {
		res.status(400).json({ error: 'All fields are required' })
		return
	}
	req.createTransaction = {
		isUp: isUp === 'true',
		code,
		amount: Number(amount)
	}
	if (!req.store && req.user) {
		req.createTransaction.userId = req.user._id
	} else if (req.store) {
		req.createTransaction.storeId = req.store._id as mongoose.Types.ObjectId
	}
	if (next) next()
}

export const updateEWallet: RequestHandler = async (req, res, next) => {
	if (!req.createTransaction) {
		res.status(400).json({ error: 'Transaction data missing' })
		return
	}
	const { userId, storeId, isUp, amount } = req.createTransaction
	if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
		res.status(400).json({ error: 'All fields are required!' })
		return
	}
	const updateAmount = isUp ? +amount : -amount
	const updateQuery = { $inc: { e_wallet: updateAmount } }
	try {
		if (userId) {
			const user = await User.findOneAndUpdate({ _id: userId }, updateQuery, {
				new: true
			})
			if (!user) {
				res.status(500).json({ error: 'User not found' })
			}
		} else if (storeId) {
			const store = await Store.findOneAndUpdate(
				{ _id: storeId },
				updateQuery,
				{ new: true }
			)
			if (!store) {
				res.status(500).json({ error: 'Store not found' })
			}
		}
		if (next) next()
	} catch (error) {
		res.status(500).json({
			error: userId
				? 'Update user e_wallet failed'
				: 'Update store e_wallet failed'
		})
	}
}

export const createTransaction: RequestHandler = async (req, res, next) => {
	if (!req.createTransaction) {
		res.status(400).json({ error: 'Transaction data missing' })
		return
	}
	const { userId, storeId, isUp, code, amount } = req.createTransaction
	if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
		res.status(400).json({ error: 'All fields are required!' })
		return
	}
	try {
		const transaction = new Transaction({
			userId,
			storeId,
			isUp,
			code,
			amount
		})
		await transaction.save()
		if (next) next()
	} catch (error) {
		res.status(500).json({ error: errorHandler(error as MongoError) })
	}
}

export const getTransactions: RequestHandler = async (req, res) => {
	try {
		const sortBy = req.query.sortBy?.toString() || 'createdAt'
		const order = ['asc', 'desc'].includes(req.query.order?.toString() || '')
			? req.query.order?.toString()
			: 'desc'
		const limit = Math.max(parseInt(req.query.limit?.toString() || '6'), 1)
		const page = Math.max(parseInt(req.query.page?.toString() || '1'), 1)

		const filter: FilterType = {
			search: '',
			sortBy: sortBy || 'createdAt',
			order: order || 'desc',
			limit,
			pageCurrent: page
		}
		if (!req.store && !req.user) {
			res.status(404).json({ error: 'List transactions not found' })
		}
		let filterArgs: Record<string, any> = {}
		if (!req.store && req.user && req.user.role === 'user') {
			filterArgs = { userId: req.user._id }
		} else if (req.store) {
			filterArgs = { storeId: req.store._id }
		}
		const count = await Transaction.countDocuments(filterArgs)
		const size = count
		const pageCount = Math.ceil(size / limit) || 1
		filter.pageCount = pageCount
		const skip = limit * (Math.min(page, pageCount) - 1)
		if (count <= 0) {
			res.status(200).json({
				success: 'Load list transactions successfully',
				filter,
				size,
				transactions: []
			})
		}
		const transactions = await Transaction.find(filterArgs)
			.sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate('userId', '_id firstName lastName avatar')
			.populate('storeId', '_id name avatar isActive isOpen')
			.exec()
		res.status(200).json({
			success: 'Load list transactions successfully',
			filter,
			size,
			transactions
		})
	} catch (error) {
		res.status(500).json({ error: 'Load list transactions failed' })
	}
}
