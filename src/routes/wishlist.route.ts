import express from 'express'
const router = express.Router()
import { ROUTES } from '../constants/route.constant'
import { isAuth } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user'
import { getProductById } from '../controllers/product'
import {
  getWishlistCount,
  wishlist,
  unWishlist,
  checkWishlist,
  listWishlist
} from '../controllers/wishlist'

// ---------- GET ROUTES -----------
router.get(ROUTES.WISHLIST.COUNT, getWishlistCount)
router.get(ROUTES.WISHLIST.LIST, isAuth, listWishlist)
router.get(ROUTES.WISHLIST.CHECK_WISHLIST, isAuth, checkWishlist)
// ---------- POST ROUTES -----------
router.post(ROUTES.WISHLIST.WISHLIST, isAuth, wishlist)
// ---------- DELETE ROUTES -----------
router.delete(ROUTES.WISHLIST.UN_WISHLIST, isAuth, unWishlist)
// ROUTER PARAMS
router.param('userId', getUserById)
router.param('productId', getProductById)

export default router
