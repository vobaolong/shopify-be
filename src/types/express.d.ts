import { Request } from 'express'
import { IProduct } from '../models/product.model'
import { IUser } from '../models/user.model'
import { IStore } from '../models/store.model'
import { ITransaction } from '../models/transaction.model'
import { IOrder, IOrderItem } from '../models/order.model'
import { ICart } from '../models/cart.model'
import { IBrand } from '../models/brand.model'
import { IReview } from '../models/review.model'
import { IStoreLevel } from '../models/storeLevel.model'
import mongoose from 'mongoose'

declare global {
	namespace Express {
		interface Request {
			product?: IProduct
			user?: IUser
			store?: IStore
			transaction?: ITransaction
			order?: IOrder
			orderItem?: IOrderItem
			cart?: ICart
			brand?: IBrand
			review?: IReview
			storeLevel?: IStoreLevel
			filepaths?: string[]
			fields?: any
			loadedCategories?: mongoose.Types.ObjectId[]
			loadedBrands?: mongoose.Types.ObjectId[]
			loadedCommissions?: mongoose.Types.ObjectId[]
			msg?: {
				email?: string
				phone?: string
				name?: string
				title?: string
				text?: string
				code?: string
			}
			createTransaction?: {
				userId?: mongoose.Types.ObjectId
				storeId?: mongoose.Types.ObjectId
				isUp: boolean
				code?: string
				amount: number
			}
			updatePoint?: {
				userId: mongoose.Types.ObjectId
				storeId: mongoose.Types.ObjectId
				point: number
			}
		}
	}
}
