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

// Type assertion function to fix the TypeScript error
const asRouteHandler = (handler: any) => handler as express.RequestHandler

// GET NUMBER OF FOLLOWERS FOR PRODUCT
router.get(ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_COUNT, asRouteHandler(getFavoriteCount))

// FOLLOW PRODUCT
router.post(
	ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_PRODUCT,
	isAuth,
	asRouteHandler(favoriteProduct)
)

// UNFOLLOW PRODUCT
router.delete(
	ROUTES.USER_FAVORITE_PRODUCT.UNFAVORITE_PRODUCT,
	isAuth,
	asRouteHandler(unFavoriteProduct)
)

// LIST FOLLOWING PRODUCTS BY USER
router.get(
	ROUTES.USER_FAVORITE_PRODUCT.LIST_FAVORITE_PRODUCTS,
	isAuth,
	asRouteHandler(listFavoriteProductsByUser)
)

// CHECK FOLLOWING PRODUCT
router.get(
	ROUTES.USER_FAVORITE_PRODUCT.CHECK_FAVORITE_PRODUCT,
	isAuth,
	asRouteHandler(checkFavoriteProduct)
)

// ROUTER PARAMS
router.param('userId', userById)
router.param('productId', getProductById)

export default router
