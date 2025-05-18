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
} from '../controllers/auth.controller'
import { userById, getUserProfile } from '../controllers/user.controller'
import { getStoreById, getStoreProfile } from '../controllers/store.controller'
import {
	requestTransaction,
	updateEWallet,
	createTransaction,
	getTransactions
} from '../controllers/transaction.controller'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const managerAuth = [isAuth, isManager]
const ownerAuth = [isAuth, isOwner]
const userAuth = [isAuth]
const verifyAuth = [isAuth, verifyPassword]

// ----------- GET ROUTES -----------
router.get(ROUTES.TRANSACTION.BY_USER, ...userAuth, getTransactions)
router.get(ROUTES.TRANSACTION.BY_STORE, ...managerAuth, getTransactions)
router.get(ROUTES.TRANSACTION.FOR_ADMIN, ...adminAuth, getTransactions)

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
router.param('userId', userById)

export default router
