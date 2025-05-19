import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import levelValidator from '../validators/level.validator'
import { validateHandler } from '../helpers/validateHandler'
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import {
  getUserLevelById,
  getUserLevel,
  createUserLevel,
  updateUserLevel,
  removeUserLevel,
  restoreUserLevel,
  getUserLevels,
  getActiveUserLevels
} from '../controllers/userLevel.controller'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const levelValidatorGroup = [levelValidator.level(), validateHandler]

// ----------- GET ROUTES -----------
router.get(ROUTES.USER_LEVEL.GET_LEVEL, getUserLevel)
router.get(ROUTES.USER_LEVEL.ACTIVE_LEVELS, getActiveUserLevels)
router.get(ROUTES.USER_LEVEL.LEVELS, ...adminAuth, getUserLevels)

// ----------- POST ROUTES -----------
router.post(
  ROUTES.USER_LEVEL.CREATE,
  ...adminAuth,
  ...levelValidatorGroup,
  createUserLevel
)

// ----------- PUT ROUTES -----------
router.put(
  ROUTES.USER_LEVEL.UPDATE,
  ...adminAuth,
  ...levelValidatorGroup,
  updateUserLevel
)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.USER_LEVEL.DELETE, ...adminAuth, removeUserLevel)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.USER_LEVEL.RESTORE, ...adminAuth, restoreUserLevel)

// ----------- PARAMS -----------
router.param('userId', getUserById)
router.param('userLevelId', getUserLevelById)

export default router
