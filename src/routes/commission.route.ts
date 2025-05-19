import express from 'express'
const router = express.Router()

// Import validators
import commissionValidator from '../validators/commission.validator'
import { validateHandler } from '../helpers/validateHandler'

// Import controllers
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
import { ROUTES } from '../constants/route.constant'
import {
	getCommissions,
	getActiveCommissions,
	createCommission,
	updateCommission,
	removeCommission,
	restoreCommission
} from '../controllers/commission.controller'

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const commissionValidatorGroup = [
	commissionValidator.commission(),
	validateHandler
]

// ----------- GET ROUTES -----------
router.get(ROUTES.COMMISSION.LIST, ...adminAuth, getCommissions)
router.get(ROUTES.COMMISSION.ACTIVE_LIST, getActiveCommissions)

// ----------- POST ROUTES -----------
router.post(
	ROUTES.COMMISSION.CREATE,
	...adminAuth,
	...commissionValidatorGroup,
	createCommission
)

// ----------- PUT ROUTES -----------
router.put(
	ROUTES.COMMISSION.UPDATE,
	...adminAuth,
	...commissionValidatorGroup,
	updateCommission
)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.COMMISSION.DELETE, ...adminAuth, removeCommission)

// ----------- RESTORE ROUTES -----------
router.get(ROUTES.COMMISSION.RESTORE, ...adminAuth, restoreCommission)

// ----------- PARAMS -----------
router.param('userId', getUserById)

export default router
