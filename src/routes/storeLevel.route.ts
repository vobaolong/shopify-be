import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import validators
import levelValidator from '../validators/level.validator'
import { validateHandler } from '../helpers/validateHandler'

//import controllers
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

//routes
router.get(ROUTES.STORE_LEVEL.GET_LEVEL, getStoreLevel)
router.get(ROUTES.STORE_LEVEL.ACTIVE_LEVELS, getActiveStoreLevels)
router.get(ROUTES.STORE_LEVEL.LEVELS, isAuth, isAdmin, getStoreLevels)
router.post(
  ROUTES.STORE_LEVEL.CREATE,
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  createStoreLevel
)
router.put(
  ROUTES.STORE_LEVEL.UPDATE,
  isAuth,
  isAdmin,
  levelValidator.level(),
  validateHandler,
  updateStoreLevel
)
router.delete(ROUTES.STORE_LEVEL.DELETE, isAuth, isAdmin, removeStoreLevel)
router.get(ROUTES.STORE_LEVEL.RESTORE, isAuth, isAdmin, restoreStoreLevel)

//router params
router.param('userId', userById)
router.param('storeId', getStoreById)
router.param('storeLevelId', storeLevelById)

export default router
