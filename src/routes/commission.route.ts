import express from 'express'
const router = express.Router()

// Import validators
import commissionValidator from '../validators/commission.validator'
import { validateHandler } from '../helpers/validateHandler'

// Import controllers
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { ROUTES } from '../constants/route.constant'
import {
	getCommissions,
	getActiveCommissions,
	createCommission,
	updateCommission,
	removeCommission,
	restoreCommission
} from '../controllers/commission.controller'

// Routes
router.get(ROUTES.COMMISSION.LIST_BY_USER, isAuth, isAdmin, getCommissions)
router.get(ROUTES.COMMISSION.ACTIVE_LIST, getActiveCommissions)
router.post(
	ROUTES.COMMISSION.CREATE,
	isAuth,
	isAdmin,
	commissionValidator.commission(),
	validateHandler,
	createCommission
)
router.put(
	ROUTES.COMMISSION.UPDATE,
	isAuth,
	isAdmin,
	commissionValidator.commission(),
	validateHandler,
	updateCommission
)
router.delete(ROUTES.COMMISSION.DELETE, isAuth, isAdmin, removeCommission)
router.get(ROUTES.COMMISSION.RESTORE, isAuth, isAdmin, restoreCommission)

// Params
router.param('userId', userById)

export default router
