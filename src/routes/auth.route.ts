import express, { RequestHandler } from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'
// Import middlewares
import authValidator from '../validators/auth.validator'
import { validateHandler } from '../helpers/validateHandler'
// Import controllers
import {
	signup,
	signin,
	forgotPassword,
	changePassword,
	isAuth,
	refreshToken,
	signout,
	authSocial,
	createToken,
	authUpdate
} from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import {
	sendChangePasswordEmail,
	sendConfirmationEmail,
	verifyEmail
} from '../controllers/email.controller'

router.post(ROUTES.AUTH.SIGNUP, authValidator.signup(), validateHandler, signup as unknown as RequestHandler)
router.post(
	ROUTES.AUTH.SIGNIN,
	authValidator.signin(),
	validateHandler,
	signin,
	createToken
)
router.post(
	ROUTES.AUTH.SOCIAL,
	authValidator.authSocial(),
	validateHandler,
	authSocial,
	authUpdate,
	createToken
)
router.post(ROUTES.AUTH.SIGNOUT, signout)
router.post(ROUTES.AUTH.REFRESH_TOKEN, refreshToken)
router.post(
	ROUTES.AUTH.FORGOT_PASSWORD,
	authValidator.forgotPassword(),
	validateHandler,
	forgotPassword,
	sendChangePasswordEmail
)
router.put(
	ROUTES.AUTH.CHANGE_PASSWORD,
	authValidator.changePassword(),
	validateHandler,
	changePassword
)
router.get(ROUTES.AUTH.CONFIRM_EMAIL, isAuth, sendConfirmationEmail)
router.get(ROUTES.AUTH.VERIFY_EMAIL, verifyEmail)
router.param('userId', userById)

export default router
