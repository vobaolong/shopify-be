import { Request, Response, NextFunction, RequestHandler, RequestParamHandler } from 'express'
import ProductModel, { IProduct } from '../models/product.model'
import Category, { ICategory } from '../models/category.model'
import { errorHandler, MongoError } from '../helpers/errorHandler'
import fs from 'fs'
import mongoose, { Document } from 'mongoose'

interface ProductRequest extends Request {
	product?: IProduct
	store?: any
	loadedCategories?: mongoose.Types.ObjectId[]
	loadedBrands?: mongoose.Types.ObjectId[]
	filepaths?: string[]
	fields?: any
	user?: any
}

type FilterType = {
	search: string
	sortBy: string
	order: string
	limit: number
	pageCurrent: number
	pageCount?: number
	categoryId?: mongoose.Types.ObjectId[] | string[]
	brandId?: mongoose.Types.ObjectId[] | string[]
	rating?: number | string
	minPrice?: number
	maxPrice?: number | string
	storeId?: mongoose.Types.ObjectId
	quantity?: number | string
	isActive?: boolean[] | string[]
	isSelling?: boolean[] | string[]
	[key: string]: any
}

export const getProductById: RequestParamHandler = (
	req: ProductRequest,
	res,
	next,
	id: string
) => {
	ProductModel.findById(id)
		.exec()
		.then((product) => {
			if (!product) {
				return res.status(404).json({
					error: 'Sản phẩm không tồn tại'
				})
			}
			req.product = product
			next()
		})
		.catch(() => {
			return res.status(404).json({
				error: 'Sản phẩm không tồn tại'
			})
		})
}

export const getProductForSeller: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	ProductModel.findOne({ _id: req.product?._id, storeId: req.store?._id })
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
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				return res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			return res.status(200).json({
				success: 'Get product successfully',
				product
			})
		})
		.catch(() => {
			return res.status(500).json({
				error: 'Sản phẩm không tồn tại'
			})
		})
}

export const getProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	if (!req.product?.isActive) {
		res.status(404).json({
			error: 'Sản phẩm đang tạm thời bị khoá'
		})
	} else if (!req.product?.isSelling) {
		res.status(404).json({
			error: 'Sản phẩm đang tạm thời bị ẩn'
		})
	}

	ProductModel.findOne({
		_id: req.product?._id,
		isSelling: true,
		isActive: true
	})
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
		.populate('storeId', '_id name avatar isActive isOpen ownerId')
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}
			res.status(200).json({
				success: 'Get product successfully',
				product
			})
		})
		.catch(() => {
			res.status(500).json({
				error: 'Sản phẩm không tồn tại'
			})
		})
}

export const createProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const {
		name,
		description,
		price,
		salePrice,
		quantity,
		categoryId,
		brandId,
		variantValueIds
	} = req.fields || {}
	const listImages = req.filepaths || []

	if (
		!name ||
		!description ||
		!price ||
		!salePrice ||
		!quantity ||
		!categoryId ||
		!listImages ||
		listImages.length <= 0
	) {
		try {
			listImages.forEach((image: string) => {
				fs.unlinkSync('public' + image)
			})
		} catch { }

		res.status(400).json({
			error: 'All fields are required'
		})
	}

	let variantValueIdsArray = variantValueIds ? variantValueIds.split('|') : []

	const product = new ProductModel({
		name,
		description,
		price,
		salePrice,
		quantity,
		categoryId,
		brandId,
		variantValueIds: variantValueIdsArray,
		isActive: req.store?.isActive,
		storeId: req.store?._id,
		listImages
	})

	product
		.save()
		.then((product) => {
			res.status(201).json({
				success: 'Creating product successfully',
				product
			})
		})
		.catch((error) => {
			try {
				listImages.forEach((image: string) => {
					fs.unlinkSync('public' + image)
				})
			} catch { }

			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const updateProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const {
		name,
		description,
		price,
		salePrice,
		quantity,
		brandId,
		categoryId,
		variantValueIds
	} = req.fields || {}

	if (
		!name ||
		!description ||
		!price ||
		!salePrice ||
		!quantity ||
		!categoryId
	) {
		res.status(400).json({
			error: 'All fields are required'
		})
	}

	let variantValueIdsArray = variantValueIds ? variantValueIds.split('|') : []

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{
			name,
			description,
			price,
			salePrice,
			quantity,
			brandId,
			categoryId,
			variantValueIds: variantValueIdsArray
		},
		{ new: true }
	)
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
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product)
				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})

			res.status(200).json({
				success: 'Update product successfully',
				product
			})
		})
		.catch((error) => {
			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const activeAllProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const { isActive } = req.body

	ProductModel.updateMany(
		{ storeId: req.store?._id },
		{ $set: { isActive } },
		{ new: true }
	)
		.exec()
		.then(() => {
			res.status(200).json({
				success: 'Active/InActive store & products successfully',
				store: req.store
			})
		})
		.catch((error) => {
			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const activeProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const { isActive } = req.body

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{ $set: { isActive } },
		{ new: true }
	)
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
		.populate('storeId', '_id name avatar isActive isOpen ownerId')
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			res.status(200).json({
				success: 'Active/InActive product status successfully',
				product
			})
		})
		.catch((error) => {
			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const sellingProduct: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const { isSelling } = req.body

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{ $set: { isSelling } },
		{ new: true }
	)
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
		.populate('brandId', '_id')
		.exec()
		.then((product) => {
			if (!product) {
				res.status(404).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			res.status(200).json({
				success: 'Update product status successfully',
				product
			})
		})
		.catch((error) => {
			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const addToListImages: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	let listImages = req.product?.listImages || []

	const index = listImages.length
	if (index >= 7) {
		try {
			if (req.filepaths && req.filepaths[0]) {
				fs.unlinkSync('public' + req.filepaths[0])
			}
		} catch { }

		res.status(400).json({
			error: 'Limit is 7 images'
		})
	}

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{ $push: { listImages: req.filepaths ? req.filepaths[0] : '' } },
		{ new: true }
	)
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
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				try {
					if (req.filepaths && req.filepaths[0]) {
						fs.unlinkSync('public' + req.filepaths[0])
					}
				} catch { }

				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			res.status(200).json({
				success: 'Add to list image successfully',
				product
			})
		})
		.catch((error) => {
			try {
				if (req.filepaths && req.filepaths[0]) {
					fs.unlinkSync('public' + req.filepaths[0])
				}
			} catch { }

			res.status(500).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const updateListImages: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const index = req.query.index ? parseInt(req.query.index as string) : -1
	const image = req.filepaths ? req.filepaths[0] : undefined

	if (index === -1 || !image)
		res.status(400).json({
			error: 'Update list image failed'
		})

	let listImages = req.product?.listImages || []
	if (index >= listImages.length) {
		try {
			fs.unlinkSync('public' + image)
		} catch { }

		res.status(404).json({
			error: 'Image not found'
		})
	}

	const oldpath = listImages[index]
	listImages[index] = image || ''

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{ $set: { listImages } },
		{ new: true }
	)
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
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				try {
					fs.unlinkSync('public' + image)
				} catch { }

				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			if (oldpath !== '/uploads/default.webp') {
				try {
					fs.unlinkSync('public' + oldpath)
				} catch { }
			}

			res.status(200).json({
				success: 'Update list images successfully',
				product
			})
		})
		.catch((error) => {
			try {
				fs.unlinkSync('public' + image)
			} catch { }

			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

export const removeFromListImages: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const index = req.query.index ? parseInt(req.query.index as string) : -1
	if (index === -1) {
		res.status(400).json({
			error: 'Remove from list images failed'
		})
	}

	let listImages = req.product?.listImages || []
	if (index >= listImages.length) {
		res.status(404).json({
			error: 'Images not found'
		})
	}

	if (listImages.length <= 1) {
		res.status(400).json({
			error: 'listImages must not be null'
		})
	}

	try {
		fs.unlinkSync('public' + listImages[index])
	} catch { }

	//update db
	listImages.splice(index, 1)

	ProductModel.findOneAndUpdate(
		{ _id: req.product?._id },
		{ $set: { listImages } },
		{ new: true }
	)
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
		.populate('brandId', '_id name')
		.exec()
		.then((product) => {
			if (!product) {
				res.status(500).json({
					error: 'Sản phẩm không tồn tại'
				})
			}

			res.status(200).json({
				success: 'Remove from list images successfully',
				product
			})
		})
		.catch((error) => {
			res.status(400).json({
				error: errorHandler(error as MongoError)
			})
		})
}

interface CategoryWithNestedId extends Document {
	categoryId?: {
		_id?: string | mongoose.Types.ObjectId
		categoryId?: {
			_id?: string | mongoose.Types.ObjectId
		}
	}
}

export const getProductCategories: RequestHandler = (
	req: ProductRequest,
	res,
	next
) => {
	ProductModel.distinct('categoryId', { isActive: true, isSelling: true })
		.exec()
		.then((categories) => {
			const categoryId = req.query.categoryId as string

			if (categoryId) {
				const filterCategories = categories.filter((category) =>
					category.equals(categoryId)
				)

				if (filterCategories.length > 0) {
					req.loadedCategories = filterCategories
					next()
				} else {
					Category.find({ _id: { $in: categories } })
						.populate({
							path: 'categoryId',
							populate: { path: 'categoryId' }
						})
						.exec()
						.then((newCategories: CategoryWithNestedId[]) => {
							const filterCategories = newCategories
								.filter(
									(category) =>
										(category.categoryId &&
											category.categoryId._id == categoryId) ||
										(category.categoryId &&
											category.categoryId.categoryId &&
											category.categoryId.categoryId._id == categoryId)
								)
								.map(
									(category) =>
										category._id as unknown as mongoose.Types.ObjectId
								)

							req.loadedCategories = filterCategories
							next()
						})
						.catch(() => {
							req.loadedCategories = []
							next()
						})
				}
			} else {
				req.loadedCategories = categories
				next()
			}
		})
		.catch((error) => {
			res.status(400).json({
				error: 'Category not found'
			})
		})
}

export const getProductCategoriesByStore: RequestHandler = (
	req: ProductRequest,
	res,
	next
) => {
	ProductModel.distinct('categoryId', {
		storeId: req.store?._id,
		isActive: true,
		isSelling: true
	})
		.exec()
		.then((categories) => {
			req.loadedCategories = categories
			next()
		})
		.catch(() => {
			res.status(400).json({
				error: 'Categories not found'
			})
		})
}

export const getProducts: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const search = req.query.search ? (req.query.search as string) : ''
	const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
	const order =
		req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && parseInt(req.query.limit as string) > 0
			? parseInt(req.query.limit as string)
			: 6
	const page =
		req.query.page && parseInt(req.query.page as string) > 0
			? parseInt(req.query.page as string)
			: 1
	let skip = limit * (page - 1)

	const categoryId = req.loadedCategories || []

	const rating =
		req.query.rating &&
			parseInt(req.query.rating as string) > 0 &&
			parseInt(req.query.rating as string) < 6
			? parseInt(req.query.rating as string)
			: -1
	const minPrice =
		req.query.minPrice && parseInt(req.query.minPrice as string) > 0
			? parseInt(req.query.minPrice as string)
			: -1
	const maxPrice =
		req.query.maxPrice && parseInt(req.query.maxPrice as string) > 0
			? parseInt(req.query.maxPrice as string)
			: -1
	const provinces = req.query.provinces as string[]

	const filter: FilterType = {
		search,
		sortBy,
		order,
		categoryId,
		limit,
		pageCurrent: page,
		rating: rating !== -1 ? rating : 'all',
		minPrice: minPrice !== -1 ? minPrice : 0,
		maxPrice: maxPrice !== -1 ? maxPrice : 'infinite'
	}

	const filterArgs: any = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				}
			}
		],
		categoryId: { $in: categoryId },
		isActive: true,
		isSelling: true,
		salePrice: { $gte: 0 },
		rating: { $gte: 0 }
	}

	if (rating !== -1) filterArgs.rating.$gte = rating
	if (minPrice !== -1) filterArgs.salePrice.$gte = minPrice
	if (maxPrice !== -1) filterArgs.salePrice.$lte = maxPrice

	// Use a more robust approach with a separate Promise chain
	ProductModel.countDocuments(filterArgs)
		.exec()
		.then((count: number) => {
			const size = count
			const pageCount = Math.ceil(size / limit)
			filter.pageCount = pageCount

			if (page > pageCount) {
				skip = Math.max(0, (pageCount - 1) * limit)
			}

			if (count <= 0) {
				res.status(200).json({
					success: 'Load list products successfully',
					filter,
					size,
					products: []
				})
			}

			ProductModel.find(filterArgs)
				.sort({ [sortBy]: order, _id: 1 })
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
				.populate('storeId', '_id name avatar isActive isOpen address')
				.populate('brandId', '_id name')
				.exec()
				.then((products: any) => {
					if (!products || products.length === 0) {
						res.status(200).json({
							success: 'Load list products successfully',
							filter,
							size: 0,
							products: []
						})
					}

					if (provinces) {
						const newProducts = products.filter((pr: any) => {
							for (let i = 0; i < provinces.length; i++) {
								if (pr.storeId.address.includes(provinces[i])) true
							}
							return false
						})

						const size1 = newProducts.length
						const pageCount1 = Math.ceil(size1 / limit)
						filter.pageCount = pageCount1

						res.status(200).json({
							success: 'Load list products successfully',
							filter,
							size,
							products: newProducts
						})
					}

					res.status(200).json({
						success: 'Load list products successfully',
						filter,
						size,
						products
					})
				})
				.catch((error) => {
					console.error('Error loading products:', error)
					res.status(500).json({
						error: 'Load list products failed'
					})
				})
		})
		.catch((error) => {
			console.error('Error counting products:', error)
			res.status(500).json({
				error: 'Count products failed'
			})
		})
}

export const getProductsByStore: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const search = req.query.search ? (req.query.search as string) : ''
	const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
	const order =
		req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && parseInt(req.query.limit as string) > 0
			? parseInt(req.query.limit as string)
			: 6
	const page =
		req.query.page && parseInt(req.query.page as string) > 0
			? parseInt(req.query.page as string)
			: 1
	let skip = limit * (page - 1)

	const categoryId = req.query.categoryId
		? [req.query.categoryId as string]
		: req.loadedCategories

	const brandId = req.query.brandId
		? [req.query.brandId as string]
		: req.loadedBrands

	const rating =
		req.query.rating &&
			parseInt(req.query.rating as string) > 0 &&
			parseInt(req.query.rating as string) < 6
			? parseInt(req.query.rating as string)
			: -1
	const minPrice =
		req.query.minPrice && parseInt(req.query.minPrice as string) > 0
			? parseInt(req.query.minPrice as string)
			: -1
	const maxPrice =
		req.query.maxPrice && parseInt(req.query.maxPrice as string) > 0
			? parseInt(req.query.maxPrice as string)
			: -1

	const quantity = req.query.quantity === '0' ? 0 : -1

	const filter: FilterType = {
		search,
		sortBy,
		order,
		categoryId,
		brandId,
		limit,
		pageCurrent: page,
		rating: rating !== -1 ? rating : 'all',
		minPrice: minPrice !== -1 ? minPrice : 0,
		maxPrice: maxPrice !== -1 ? maxPrice : 'infinite',
		storeId: req.store._id,
		quantity: quantity !== -1 ? quantity : 'all'
	}

	const filterArgs: any = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				}
			}
		],
		categoryId: { $in: categoryId },
		brandId: { $in: brandId },
		isSelling: true,
		isActive: true,
		storeId: req.store._id,
		salePrice: { $gte: 0 },
		rating: { $gte: 0 }
	}
	if (rating !== -1) filterArgs.rating.$gte = rating
	if (minPrice !== -1) filterArgs.salePrice.$gte = minPrice
	if (maxPrice !== -1) filterArgs.salePrice.$lte = maxPrice

	ProductModel.countDocuments(filterArgs)
		.exec()
		.then((count) => {
			const size = count
			const pageCount = Math.ceil(size / limit)
			filter.pageCount = pageCount

			if (page > pageCount) {
				skip = Math.max(0, (pageCount - 1) * limit)
			}

			if (count <= 0) {
				res.status(200).json({
					success: 'Load list products successfully',
					filter,
					size,
					products: []
				})
			}

			// Use a separate Promise chain for better type handling
			ProductModel.find(filterArgs)
				.sort({ [sortBy]: order, _id: 1 })
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
				.populate('brandId', '_id name')
				.exec()
				.then((products: any) => {
					if (!products || products.length === 0) {
						res.status(200).json({
							success: 'Load list products successfully',
							filter,
							size: 0,
							products: []
						})
					}

					res.status(200).json({
						success: 'Load list products successfully',
						filter,
						size,
						products
					})
				})
				.catch((error) => {
					console.error('Error fetching products:', error)
					res.status(500).json({
						error: 'Load list products failed'
					})
				})
			return
		})
		.catch((error) => {
			res.status(500).json({
				error: 'Count products failed'
			})
		})
}

export const getStoreProductsForSeller: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const search = req.query.search ? (req.query.search as string) : ''
	const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
	const order =
		req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && parseInt(req.query.limit as string) > 0
			? parseInt(req.query.limit as string)
			: 6
	const page =
		req.query.page && parseInt(req.query.page as string) > 0
			? parseInt(req.query.page as string)
			: 1
	let skip = limit * (page - 1)

	let isSelling = [true, false]
	if (req.query.isSelling === 'true') isSelling = [true]
	if (req.query.isSelling === 'false') isSelling = [false]

	let isActive = [true, false]
	if (req.query.isActive === 'true') isActive = [true]
	if (req.query.isActive === 'false') isActive = [false]

	const quantity = req.query.quantity === '0' ? 0 : -1

	const filter: FilterType = {
		search,
		sortBy,
		order,
		isSelling,
		isActive,
		limit,
		pageCurrent: page,
		storeId: req.store._id,
		quantity: quantity !== -1 ? quantity : 'all'
	}

	const filterArgs: any = {
		$or: [
			{
				name: {
					$regex: search,
					$options: 'i'
				}
			}
		],
		isSelling: { $in: isSelling },
		isActive: { $in: isActive },
		storeId: req.store._id
	}

	if (quantity === 0) filterArgs.quantity = quantity

	ProductModel.countDocuments(filterArgs)
		.exec()
		.then((count) => {
			const size = count
			const pageCount = Math.ceil(size / limit)
			filter.pageCount = pageCount

			if (page > pageCount) {
				skip = Math.max(0, (pageCount - 1) * limit)
			}

			if (count <= 0) {
				res.status(200).json({
					success: 'Load list products successfully',
					filter,
					size,
					products: []
				})
			}

			// Use a separate Promise chain for better type handling
			ProductModel.find(filterArgs)
				.sort({ [sortBy]: order, _id: 1 })
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
				.populate('brandId', '_id name')
				.exec()
				.then((products: any) => {
					if (!products || products.length === 0) {
						res.status(200).json({
							success: 'Load list products successfully',
							filter,
							size: 0,
							products: []
						})
					}

					res.status(200).json({
						success: 'Load list products successfully',
						filter,
						size,
						products
					})
				})
				.catch((error) => {
					res.status(500).json({
						error: 'Load list products failed'
					})
				})
			return
			// End outer promise chain
		})
		.catch((error) => {
			res.status(500).json({
				error: 'Count products failed'
			})
		})
}

export const getProductsForAdmin: RequestHandler = (
	req: ProductRequest,
	res: Response
) => {
	const search = req.query.search ? (req.query.search as string) : ''
	const sortBy = req.query.sortBy ? (req.query.sortBy as string) : '_id'
	const order =
		req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')
			? req.query.order
			: 'asc'

	const limit =
		req.query.limit && parseInt(req.query.limit as string) > 0
			? parseInt(req.query.limit as string)
			: 6
	const page =
		req.query.page && parseInt(req.query.page as string) > 0
			? parseInt(req.query.page as string)
			: 1
	let skip = limit * (page - 1)

	let isActive = [true, false]
	if (req.query.isActive === 'true') isActive = [true]
	if (req.query.isActive === 'false') isActive = [false]

	const filter: FilterType = {
		search,
		sortBy,
		order,
		isActive,
		limit,
		pageCurrent: page
	}

	const filterArgs: any = {
		name: { $regex: search, $options: 'i' },
		isActive: { $in: isActive }
	}

	ProductModel.countDocuments(filterArgs)
		.exec()
		.then((count: number) => {
			const size = count
			const pageCount = Math.ceil(size / limit)
			filter.pageCount = pageCount

			if (page > pageCount) {
				skip = Math.max(0, (pageCount - 1) * limit)
			}

			if (count <= 0) {
				res.status(200).json({
					success: 'Load list products successfully',
					filter,
					size,
					products: []
				})
			}

			// Use a separate Promise chain for better type handling
			ProductModel.find(filterArgs)
				.sort({ [sortBy]: order, _id: 1 })
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
				.populate('storeId', '_id name avatar isActive isOpen ownerId')
				.populate('brandId', '_id name')
				.exec()
				.then((products: any) => {
					if (!products || products.length === 0) {
						res.status(200).json({
							success: 'Load list products successfully',
							filter,
							size: 0,
							products: []
						})
					}
					res.status(200).json({
						success: 'Load list products successfully',
						filter,
						size,
						products
					})
				})
				.catch((error) => {
					console.error('Error fetching products:', error)
					res.status(500).json({
						error: 'Load list products failed'
					})
				})
			return
		})
		.catch((error) => {
			res.status(404).json({
				error: 'Products not found'
			})
		})
}
