import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin, isManager } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
import { getCartById } from '../controllers/cart.controller'
import {
	updateEWallet,
	createTransaction
} from '../controllers/transaction.controller'
import {
	getOrderById,
	createOrder,
	createOrderItems,
	removeCart,
	removeAllCartItems,
	getOrdersForAdmin,
	getOrdersByStore,
	getOrdersByUser,
	checkOrderAuth,
	readOrder,
	updateStatusForUser,
	updateStatusForStore,
	updateQuantitySoldProduct,
	countOrders,
	getOrderItems,
	updatePoint,
	createReturnRequest,
	returnOrder,
	getReturnOrders
} from '../controllers/order.controller'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const managerAuth = [isAuth, isManager]
const userAuth = [isAuth]
const orderAuth = [checkOrderAuth]

// ----------- GET ROUTES -----------
router.get(ROUTES.ORDER.COUNT, countOrders)
router.get(ROUTES.ORDER.USER.ITEMS, ...userAuth, ...orderAuth, getOrderItems)
router.get(ROUTES.ORDER.RETURN.BY_STORE, ...managerAuth, getReturnOrders)
router.get(ROUTES.ORDER.STORE.ITEMS, ...managerAuth, ...orderAuth, getOrderItems)
router.get(ROUTES.ORDER.ADMIN.ITEMS, ...adminAuth, ...orderAuth, getOrderItems)
router.get(ROUTES.ORDER.USER.DETAIL, ...userAuth, ...orderAuth, readOrder)
router.get(ROUTES.ORDER.STORE.DETAIL, ...managerAuth, ...orderAuth, readOrder)
router.get(ROUTES.ORDER.ADMIN.DETAIL, ...adminAuth, ...orderAuth, readOrder)
router.get(ROUTES.ORDER.USER.LIST, ...userAuth, getOrdersByUser)
router.get(ROUTES.ORDER.STORE.LIST, ...managerAuth, getOrdersByStore)
router.get(ROUTES.ORDER.ADMIN.LIST, ...adminAuth, getOrdersForAdmin)

// ----------- POST ROUTES -----------
router.post(ROUTES.ORDER.RETURN.REQUEST, ...userAuth, ...orderAuth, createReturnRequest)
router.post(ROUTES.ORDER.RETURN.APPROVE, ...managerAuth, ...orderAuth, returnOrder)
router.post(ROUTES.ORDER.CREATE, ...userAuth, createOrder, createOrderItems, removeCart, removeAllCartItems)

// ----------- PUT ROUTES -----------
router.put(ROUTES.ORDER.USER.UPDATE, ...userAuth, ...orderAuth, updateStatusForUser, updateEWallet, createTransaction, updatePoint)
router.put(ROUTES.ORDER.STORE.UPDATE, ...managerAuth, ...orderAuth, updateStatusForStore, updateEWallet, createTransaction, updateQuantitySoldProduct, updatePoint)

// ----------- PARAMS -----------
router.param('orderId', getOrderById)
router.param('cartId', getCartById)
router.param('storeId', getStoreById)
router.param('userId', userById)

export default router
