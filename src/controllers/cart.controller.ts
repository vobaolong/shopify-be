import {
	Request,
	Response,
	NextFunction,
	RequestHandler,
	RequestParamHandler
} from 'express'
import { Cart, CartItem } from '../models/index.model'
import { cleanUserLess } from '../helpers/userHandler'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import { CustomRequest, FilterOptions } from '../types/cart.type'

export const getCartById: RequestParamHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
	id: string
) => {
	try {
		const cart = await Cart.findById(id).exec()
		if (!cart) {
			res.status(404).json({
				error: 'Cart not found'
			})
			return
		}
		req.cart = cart
		next()
	} catch (error) {
		res.status(404).json({
			error: 'Cart not found'
		})
	}
}

export const getCartItemById: RequestParamHandler = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
	id: string
) => {
	try {
		const cartItem = await CartItem.findById(id).exec()
		if (!cartItem) {
			res.status(404).json({
				error: 'CartItem not found'
			})
			return
		}
		req.cartItem = cartItem
		next()
	} catch (error) {
		res.status(404).json({
			error: 'CartItem not found'
		})
	}
}

export const createCart: RequestHandler = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { storeId } = req.body
		if (!storeId) {
			res.status(400).json({
				error: 'Store not found'
			})
			return
		}
		const cart = await Cart.findOneAndUpdate(
			{ userId: req.user?._id, storeId },
			{ isDeleted: false },
			{ upsert: true, new: true }
		).exec()
		if (!cart) {
			res.status(400).json({
				error: 'Create cart failed'
			})
			return
		}

		req.cart = cart
		next()
	} catch (error) {
		res.status(400).json({
			error: 'Create cart failed'
		})
	}
}

export const createCartItem: RequestHandler = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { productId, variantValueIds, count } = req.body

		if (!productId || !count) {
			const cartId = req.cartItem?.cartId
			const itemCount = await CartItem.countDocuments({ cartId }).exec()
			if (itemCount <= 0) {
				req.cartId = cartId
				next()
				return
			} else {
				res.status(400).json({
					error: 'All fields are required'
				})
				return
			}
		}
		let variantValueIdsArray: string[] = []
		if (variantValueIds) {
			variantValueIdsArray = variantValueIds.split('|')
		}
		const item = await CartItem.findOneAndUpdate(
			{
				productId,
				variantValueIds: variantValueIdsArray,
				cartId: (req as any).cart?._id
			},
			{ $inc: { count: +count } },
			{ upsert: true, new: true }
		)
			.populate({
				path: 'productId',
				populate: [
					{
						path: 'categoryId',
						populate: {
							path: 'categoryId',
							populate: { path: 'categoryId' }
						}
					},
					{
						path: 'storeId',
						select: {
							_id: 1,
							name: 1,
							avatar: 1,
							isActive: 1,
							isOpen: 1
						}
					}
				]
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.exec()

		if (!item) {
			res.status(400).json({
				error: 'Create cart item failed'
			})
			return
		}

		res.status(200).json({
			success: 'Add to cart successfully',
			item,
			user: cleanUserLess((req as any).user)
		})
	} catch (error) {
		res.status(400).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const getListCarts: RequestHandler = async (
	req: CustomRequest,
	res: Response
) => {
	try {
		const userId = req.user?._id
		const limit =
			req.query.limit && parseInt(req.query.limit.toString()) > 0
				? parseInt(req.query.limit.toString())
				: 6
		const page =
			req.query.page && parseInt(req.query.page.toString()) > 0
				? parseInt(req.query.page.toString())
				: 1
		let skip = (page - 1) * limit

		const filter: FilterOptions = {
			limit,
			pageCurrent: page
		}

		const count = await Cart.countDocuments({ userId, isDeleted: false }).exec()

		const size = count
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount

		if (page > pageCount && pageCount > 0) {
			skip = (pageCount - 1) * limit
		}

		if (count <= 0) {
			res.status(200).json({
				success: 'Load list carts successfully',
				filter,
				size,
				carts: []
			})
			return
		}

		const carts = await Cart.find({ userId, isDeleted: false })
			.populate('storeId', '_id name avatar isActive isOpen address')
			.sort({ name: 1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.exec()

		res.status(200).json({
			success: 'Load list carts successfully',
			filter,
			size,
			carts
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list carts failed'
		})
	}
}

export const getListCartItem: RequestHandler = async (
	req: CustomRequest,
	res: Response
) => {
	try {
		const items = await CartItem.find({ cartId: req.cart?._id })
			.populate({
				path: 'productId',
				populate: [
					{
						path: 'categoryId',
						populate: {
							path: 'categoryId',
							populate: { path: 'categoryId' }
						}
					},
					{
						path: 'storeId',
						select: {
							_id: 1,
							name: 1,
							avatar: 1,
							isActive: 1,
							isOpen: 1
						}
					}
				]
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.exec()

		res.status(200).json({
			success: 'Load list cart items successfully',
			items
		})
	} catch (error) {
		res.status(500).json({
			error: 'Load list cart items failed'
		})
	}
}

export const updateCartItem: RequestHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const { count } = req.body

		const item = await CartItem.findOneAndUpdate(
			{ _id: (req as any).cartItem._id },
			{ $set: { count } },
			{ new: true }
		)
			.populate({
				path: 'productId',
				populate: [
					{
						path: 'categoryId',
						populate: {
							path: 'categoryId',
							populate: { path: 'categoryId' }
						}
					},
					{
						path: 'storeId',
						select: {
							_id: 1,
							name: 1,
							avatar: 1,
							isActive: 1,
							isOpen: 1
						}
					}
				]
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.exec()

		res.status(200).json({
			success: 'Update cart item successfully',
			item,
			user: cleanUserLess((req as any).user)
		})
	} catch (error) {
		res.status(500).json({
			error: 'Update cart item failed'
		})
	}
}

export const removeCartItem: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await CartItem.deleteOne({ _id: (req as any).cartItem._id }).exec()

		const cartId = (req as any).cartItem.cartId
		const count = await CartItem.countDocuments({ cartId }).exec()

		if (count <= 0) {
			; (req as any).cartId = cartId
			next()
			return
		} else {
			res.status(200).json({
				success: 'Remove cart item successfully',
				user: cleanUserLess((req as any).user)
			})
		}
	} catch (error) {
		res.status(500).json({
			error: 'Remove cart item failed'
		})
	}
}

export const removeCart: RequestHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const cart = await Cart.findOneAndUpdate(
			{ _id: (req as any).cartId },
			{ isDeleted: true },
			{ new: true }
		).exec()

		if (!cart) {
			res.status(400).json({
				error: 'Remove cart failed'
			})
			return
		}

		res.status(200).json({
			success: 'Remove cart successfully',
			cart,
			user: cleanUserLess((req as any).user)
		})
	} catch (error) {
		res.status(400).json({
			error: 'Remove cart failed'
		})
	}
}

export const countCartItems: RequestHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const result = await CartItem.aggregate([
			{
				$lookup: {
					from: 'carts',
					localField: 'cartId',
					foreignField: '_id',
					as: 'carts'
				}
			},
			{
				$group: {
					_id: '$carts.userId',
					count: {
						$sum: 1
					}
				}
			}
		]).exec()

		const foundResult = result.find(
			(r) => r._id && r._id[0] && r._id[0].equals((req as any).user._id)
		)
		const count = foundResult ? foundResult.count : 0

		res.status(200).json({
			success: 'Count cart items successfully',
			count
		})
	} catch (error) {
		res.status(500).json({
			error: 'Count cart items failed'
		})
	}
}
