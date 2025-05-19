import express, { Request, Response, NextFunction } from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// IMPORT CONTROLLERS
import { isAuth } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import { getProductById } from '../controllers/product.controller'
import {
  getFavoriteCount,
  favoriteProduct,
  unFavoriteProduct,
  checkFavoriteProduct,
  listFavoriteProductsByUser
} from '../controllers/userFavoriteProduct.controller'

// ---------- GET ROUTES -----------
router.get(ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_COUNT, getFavoriteCount)
router.get(
  ROUTES.USER_FAVORITE_PRODUCT.LIST_FAVORITE_PRODUCTS,
  isAuth,
  listFavoriteProductsByUser
)
router.get(
  ROUTES.USER_FAVORITE_PRODUCT.CHECK_FAVORITE_PRODUCT,
  isAuth,
  checkFavoriteProduct
)
// ---------- POST ROUTES -----------
router.post(
  ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_PRODUCT,
  isAuth,
  favoriteProduct
)
// ---------- DELETE ROUTES -----------
router.delete(
  ROUTES.USER_FAVORITE_PRODUCT.UNFAVORITE_PRODUCT,
  isAuth,
  unFavoriteProduct
)
// ROUTER PARAMS
router.param('userId', getUserById)
router.param('productId', getProductById)

export default router
