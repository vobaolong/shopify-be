import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import {
  isAuth,
  isAdmin,
  isManager,
  isOwner,
  verifyPassword
} from '../middlewares/auth.middleware'
import { getUserById, getUserProfile } from '../controllers/user.controller'
import { getStoreById, getStoreProfile } from '../controllers/store'
import {
  requestTransaction,
  updateEWallet,
  createTransaction,
  getTransactions
} from '../controllers/transaction.controller'
import { adminAuth } from './user.route'
import { managerAuth, ownerAuth } from './store.route'

// Middleware groups
const verifyAuth = [isAuth, verifyPassword]

// ----------- GET ROUTES -----------
router.get(ROUTES.TRANSACTION.BY_USER, isAuth, getTransactions)
router.get(ROUTES.TRANSACTION.BY_STORE, ...managerAuth, getTransactions)
router.get(ROUTES.TRANSACTION.BY_ADMIN, ...adminAuth, getTransactions)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.TRANSACTION.CREATE_BY_USER,
  ...verifyAuth,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getUserProfile
)
router.post(
  ROUTES.TRANSACTION.CREATE_BY_STORE,
  ...verifyAuth,
  ...ownerAuth,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getStoreProfile
)

// ----------- PARAMS -----------
router.param('storeId', getStoreById)
router.param('userId', getUserById)

export default router
