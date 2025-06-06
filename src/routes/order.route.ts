import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin, isManager } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store'
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
import { managerAuth } from './store.route'
import { adminAuth } from './user.route'

// ----------- GET ROUTES -----------
router.get(ROUTES.ORDER.COUNT, countOrders)
router.get(ROUTES.ORDER.USER.ITEMS, isAuth, checkOrderAuth, getOrderItems)
router.get(ROUTES.ORDER.RETURN.BY_STORE, ...managerAuth, getReturnOrders)
router.get(
  ROUTES.ORDER.STORE.ITEMS,
  ...managerAuth,
  checkOrderAuth,
  getOrderItems
)
router.get(
  ROUTES.ORDER.ADMIN.ITEMS,
  ...adminAuth,
  checkOrderAuth,
  getOrderItems
)
router.get(ROUTES.ORDER.USER.DETAIL, isAuth, checkOrderAuth, readOrder)
router.get(ROUTES.ORDER.STORE.DETAIL, ...managerAuth, checkOrderAuth, readOrder)
router.get(ROUTES.ORDER.ADMIN.DETAIL, ...adminAuth, checkOrderAuth, readOrder)
router.get(ROUTES.ORDER.USER.LIST, isAuth, getOrdersByUser)
router.get(ROUTES.ORDER.STORE.LIST, ...managerAuth, getOrdersByStore)
router.get(ROUTES.ORDER.ADMIN.LIST, ...adminAuth, getOrdersForAdmin)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.ORDER.RETURN.REQUEST,
  isAuth,
  checkOrderAuth,
  createReturnRequest
)
router.post(
  ROUTES.ORDER.RETURN.APPROVE,
  ...managerAuth,
  checkOrderAuth,
  returnOrder
)
router.post(
  ROUTES.ORDER.CREATE,
  isAuth,
  createOrder,
  createOrderItems,
  removeCart,
  removeAllCartItems
)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.ORDER.USER.UPDATE,
  isAuth,
  checkOrderAuth,
  updateStatusForUser,
  updateEWallet,
  createTransaction,
  updatePoint
)
router.put(
  ROUTES.ORDER.STORE.UPDATE,
  ...managerAuth,
  checkOrderAuth,
  updateStatusForStore,
  updateEWallet,
  createTransaction,
  updateQuantitySoldProduct,
  updatePoint
)

// ----------- PARAMS -----------
router.param('orderId', getOrderById)
router.param('cartId', getCartById)
router.param('storeId', getStoreById)
router.param('userId', getUserById)

export default router
