import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// IMPORT CONTROLLERS
import { isAuth } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getProductById } from '../controllers/product.controller'
import {
	getFavoriteCount,
	favoriteProduct,
	unFavoriteProduct,
	checkFavoriteProduct,
	listFavoriteProductsByUser
} from '../controllers/userFavoriteProduct.controller'


// GET NUMBER OF FOLLOWERS FOR PRODUCT
router.get(ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_COUNT, getFavoriteCount)

// FOLLOW PRODUCT
router.post(
	ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_PRODUCT,
	isAuth,
	favoriteProduct
)

// UNFOLLOW PRODUCT
router.delete(
	ROUTES.USER_FAVORITE_PRODUCT.UNFAVORITE_PRODUCT,
	isAuth,
	unFavoriteProduct
)

// LIST FOLLOWING PRODUCTS BY USER
router.get(
	ROUTES.USER_FAVORITE_PRODUCT.LIST_FAVORITE_PRODUCTS,
	isAuth,
	listFavoriteProductsByUser
)

// CHECK FOLLOWING PRODUCT
router.get(
	ROUTES.USER_FAVORITE_PRODUCT.CHECK_FAVORITE_PRODUCT,
	isAuth,
	checkFavoriteProduct
)

// ROUTER PARAMS
router.param('userId', userById)
router.param('productId', getProductById)

export default router
