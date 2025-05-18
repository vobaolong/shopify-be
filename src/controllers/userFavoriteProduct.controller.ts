import { RequestHandler } from 'express'
import { UserFavoriteProduct, Product } from '../models/index.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'

export const favoriteProduct: RequestHandler = async (req, res) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id

		const favorite = await UserFavoriteProduct.findOneAndUpdate(
			{ userId, productId },
			{ isDeleted: false },
			{ upsert: true, new: true }
		)
		if (!favorite) {
			res.status(400).json({
				error: 'Favorite already exists'
			})
			return
		}
		const product = await Product.findOne({ _id: productId })
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')

		if (!product) {
			res.status(404).json({
				error: 'Product not found'
			})
			return
		}
		res.status(200).json({
			success: 'Favorite product',
			product
		})
	} catch (error) {
		res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const unFavoriteProduct: RequestHandler = async (req, res) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id

		const favorite = await UserFavoriteProduct.findOneAndUpdate(
			{ userId, productId },
			{ isDeleted: true },
			{ upsert: true, new: true }
		)

		if (!favorite) {
			res.status(400).json({
				error: 'Favorite does not exist'
			})
		}

		const product = await Product.findOne({ _id: productId })
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')

		if (!product) {
			res.status(404).json({
				error: 'Product not found'
			})
		}
		res.status(200).json({
			success: 'Product unfavorite',
			product
		})
	} catch (error) {
		res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}

export const checkFavoriteProduct: RequestHandler = async (req, res) => {
	try {
		const userId = req.user!._id
		const productId = req.product!._id
		const favorite = await UserFavoriteProduct.findOne({
			userId,
			productId,
			isDeleted: false
		})
		if (!favorite) {
			res.status(200).json({
				error: 'Favorite product not found'
			})
		}
		res.status(200).json({
			success: 'Favorite product'
		})
	} catch (error) {
		res.status(404).json({
			error: 'Favorite product not found'
		})
	}
}

export const getFavoriteCount: RequestHandler = async (req, res) => {
	try {
		const productId = req.product!._id
		const count = await UserFavoriteProduct.countDocuments({
			productId,
			isDeleted: false
		})
		res.status(200).json({
			success: 'Get product number of favorites successfully',
			count
		})
	} catch (error) {
		res.status(404).json({
			error: 'Favorite product not found'
		})
	}
}

export const listFavoriteProductsByUser: RequestHandler = async (req, res) => {
	try {
		const userId = req.user!._id

		const limit =
			req.query.limit &&
				typeof req.query.limit === 'string' &&
				parseInt(req.query.limit) > 0
				? parseInt(req.query.limit)
				: 6
		const page =
			req.query.page &&
				typeof req.query.page === 'string' &&
				parseInt(req.query.page) > 0
				? parseInt(req.query.page)
				: 1
		const filter: {
			limit: number
			pageCurrent: number
			pageCount?: number
		} = {
			limit,
			pageCurrent: page
		}
		const favorites = await UserFavoriteProduct.find({
			userId,
			isDeleted: false
		})
		const productIds = favorites.map((favorite) => favorite.productId)
		const size = await Product.countDocuments({
			_id: { $in: productIds },
			isActive: true,
			isSelling: true
		})
		const pageCount = Math.ceil(size / limit)
		filter.pageCount = pageCount
		let skip = (page > pageCount ? pageCount - 1 : page - 1) * limit
		if (skip < 0) skip = 0
		if (size <= 0) {
			res.status(200).json({
				success: 'Load list Favorite products successfully',
				filter,
				size,
				products: []
			})
		}
		const products = await Product.find({
			_id: { $in: productIds },
			isActive: true,
			isSelling: true
		})
			.sort({ name: 1, _id: 1 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: 'categoryId',
				populate: {
					path: 'categoryId',
					populate: { path: 'categoryId' }
				}
			})
			.populate({
				path: 'variantValueIds',
				populate: { path: 'variantId' }
			})
			.populate('storeId', '_id name avatar isActive isOpen')
		res.status(200).json({
			success: 'Load list favorite products successfully',
			filter,
			size,
			products
		})
	} catch (error) {
		res.status(500).json({
			error: errorHandler(error as MongoError)
		})
	}
}
