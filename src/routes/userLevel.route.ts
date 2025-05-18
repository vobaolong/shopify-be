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

//routes
router.get(ROUTES.USER_LEVEL.GET_LEVEL, getUserLevel)
router.get(ROUTES.USER_LEVEL.ACTIVE_LEVELS, getActiveUserLevels)
router.get(ROUTES.USER_LEVEL.LEVELS, isAuth, isAdmin, getUserLevels)
router.post(
	ROUTES.USER_LEVEL.CREATE,
	isAuth,
	isAdmin,
	levelValidator.level(),
	validateHandler,
	createUserLevel
)
router.put(
	ROUTES.USER_LEVEL.UPDATE,
	isAuth,
	isAdmin,
	levelValidator.level(),
	validateHandler,
	updateUserLevel
)
router.delete(ROUTES.USER_LEVEL.DELETE, isAuth, isAdmin, removeUserLevel)
router.get(ROUTES.USER_LEVEL.RESTORE, isAuth, isAdmin, restoreUserLevel)

//router params
router.param('userId', userById)
router.param('userLevelId', getUserLevelById)

export default router
