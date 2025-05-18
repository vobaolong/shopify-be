import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//controllers
import {
  isAuth,
  isAdmin,
  isManager,
  isOwner,
  verifyPassword
} from '../controllers/auth.controller'
import { userById, getUserProfile } from '../controllers/user.controller'
import { getStoreById, getStoreProfile } from '../controllers/store.controller'
import {
  requestTransaction,
  updateEWallet,
  createTransaction,
  getTransactions
} from '../controllers/transaction.controller'

//routes
router.get(ROUTES.TRANSACTION.BY_USER, isAuth, getTransactions)
router.get(ROUTES.TRANSACTION.BY_STORE, isAuth, isManager, getTransactions)
router.get(ROUTES.TRANSACTION.FOR_ADMIN, isAuth, isAdmin, getTransactions)
router.post(
  ROUTES.TRANSACTION.CREATE_BY_USER,
  isAuth,
  verifyPassword,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getUserProfile
)
router.post(
  ROUTES.TRANSACTION.CREATE_BY_STORE,
  isAuth,
  verifyPassword,
  isOwner,
  requestTransaction,
  updateEWallet,
  createTransaction,
  getStoreProfile
)
// router.post(
//     '/transaction/create/for/admin/:userId',
//     isAuth,
//     verifyPassword,
//     isAdmin,
//     requestTransaction,
//     updateEWallet,
//     createTransaction,
// );

//params
router.param('storeId', getStoreById)
router.param('userId', userById)

export default router
