import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//controllers
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

// ORDER COUNT
router.get(ROUTES.ORDER.COUNT, countOrders)

// ORDER ITEMS BY USER
router.get(ROUTES.ORDER.USER.ITEMS, isAuth, checkOrderAuth, getOrderItems)

// ORDER RETURN
router.post(
	ROUTES.ORDER.RETURN.REQUEST,
	isAuth,
	checkOrderAuth,
	createReturnRequest
)
router.get(ROUTES.ORDER.RETURN.BY_STORE, isAuth, isManager, getReturnOrders)

// ORDER RETURN APPROVE
router.post(
	ROUTES.ORDER.RETURN.APPROVE,
	isAuth,
	isManager,
	checkOrderAuth,
	returnOrder
)

// ORDER ITEMS BY STORE
router.get(
	ROUTES.ORDER.STORE.ITEMS,
	isAuth,
	isManager,
	checkOrderAuth,
	getOrderItems
)

// ORDER ITEMS FOR ADMIN
router.get(
	ROUTES.ORDER.ADMIN.ITEMS,
	isAuth,
	isAdmin,
	checkOrderAuth,
	getOrderItems
)

// ORDER BY USER
router.get(ROUTES.ORDER.USER.DETAIL, isAuth, checkOrderAuth, readOrder)

// ORDER BY STORE
router.get(
	ROUTES.ORDER.STORE.DETAIL,
	isAuth,
	isManager,
	checkOrderAuth,
	readOrder
)

// ORDER FOR ADMIN
router.get(
	ROUTES.ORDER.ADMIN.DETAIL,
	isAuth,
	isAdmin,
	checkOrderAuth,
	readOrder
)

// LIST ORDER BY USER
router.get(ROUTES.ORDER.USER.LIST, isAuth, getOrdersByUser)

// LIST ORDER BY STORE
router.get(ROUTES.ORDER.STORE.LIST, isAuth, isManager, getOrdersByStore)

// LIST ORDER FOR ADMIN
router.get(ROUTES.ORDER.ADMIN.LIST, isAuth, isAdmin, getOrdersForAdmin)

// ORDER CREATE
router.post(
	ROUTES.ORDER.CREATE,
	isAuth,
	createOrder,
	createOrderItems,
	removeCart,
	removeAllCartItems
)

// ORDER UPDATE BY USER
router.put(
	ROUTES.ORDER.USER.UPDATE,
	isAuth,
	checkOrderAuth,
	updateStatusForUser,
	updateEWallet,
	createTransaction,
	updatePoint
)

// ORDER UPDATE BY STORE
router.put(
	ROUTES.ORDER.STORE.UPDATE,
	isAuth,
	isManager,
	checkOrderAuth,
	updateStatusForStore,
	updateEWallet,
	createTransaction,
	updateQuantitySoldProduct,
	updatePoint
)

//params
router.param('orderId', getOrderById)
router.param('cartId', getCartById)
router.param('storeId', getStoreById)
router.param('userId', userById)

export default router
