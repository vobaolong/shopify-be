import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import {
  getCartById,
  getCartItemById,
  createCart,
  createCartItem,
  getListCarts,
  getListCartItem,
  updateCartItem,
  removeCartItem,
  removeCart,
  countCartItems
} from '../controllers/cart.controller'

// Middleware groups
const auth = [isAuth]

// ----------- GET ROUTES -----------
router.get(ROUTES.CART.COUNT, ...auth, countCartItems)
router.get(ROUTES.CART.LIST, ...auth, getListCarts)
router.get(ROUTES.CART.ITEMS, ...auth, getListCartItem)

// ----------- POST ROUTES -----------
router.post(ROUTES.CART.ADD, ...auth, createCart, createCartItem, removeCart)

// ----------- PUT ROUTES -----------
router.put(ROUTES.CART.UPDATE, ...auth, updateCartItem)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.CART.REMOVE, ...auth, removeCartItem, removeCart)

// ----------- PARAMS -----------
router.param('cartId', getCartById)
router.param('cartItemId', getCartItemById)
router.param('userId', getUserById)

export default router
