import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Import controllers
import { isAuth } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
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

// Routes
router.get(ROUTES.CART.COUNT, isAuth, countCartItems)
router.get(ROUTES.CART.LIST, isAuth, getListCarts)
router.get(ROUTES.CART.ITEMS, isAuth, getListCartItem)
router.post(ROUTES.CART.ADD, isAuth, createCart, createCartItem, removeCart)
router.put(ROUTES.CART.UPDATE, isAuth, updateCartItem)
router.delete(ROUTES.CART.REMOVE, isAuth, removeCartItem, removeCart)

// Params
router.param('cartId', getCartById)
router.param('cartItemId', getCartItemById)
router.param('userId', userById)

export default router
