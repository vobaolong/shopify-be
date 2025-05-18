import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import levelValidator from '../validators/level.validator'
import { validateHandler } from '../helpers/validateHandler'
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
import {
	storeLevelById,
	getStoreLevel,
	getStoreLevels,
	getActiveStoreLevels,
	createStoreLevel,
	updateStoreLevel,
	removeStoreLevel,
	restoreStoreLevel
} from '../controllers/storeLevel.controller'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const levelValidatorGroup = [levelValidator.level(), validateHandler]

// ----------- GET ROUTES -----------
router.get(ROUTES.STORE_LEVEL.GET_LEVEL, getStoreLevel)
router.get(ROUTES.STORE_LEVEL.ACTIVE_LEVELS, getActiveStoreLevels)
router.get(ROUTES.STORE_LEVEL.LEVELS, ...adminAuth, getStoreLevels)

// ----------- POST ROUTES -----------
router.post(ROUTES.STORE_LEVEL.CREATE, ...adminAuth, ...levelValidatorGroup, createStoreLevel)

// ----------- PUT ROUTES -----------
router.put(ROUTES.STORE_LEVEL.UPDATE, ...adminAuth, ...levelValidatorGroup, updateStoreLevel)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.STORE_LEVEL.DELETE, ...adminAuth, removeStoreLevel)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.STORE_LEVEL.RESTORE, ...adminAuth, restoreStoreLevel)

// ----------- PARAMS -----------
router.param('userId', userById)
router.param('storeId', getStoreById)
router.param('storeLevelId', storeLevelById)

export default router
