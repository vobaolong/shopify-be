"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
// Import middlewares
const auth_validator_1 = __importDefault(require("../validators/auth.validator"));
const validateHandler_1 = require("../helpers/validateHandler");
// Import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const email_controller_1 = require("../controllers/email.controller");
router.post(route_constant_1.ROUTES.AUTH.SIGNUP, auth_validator_1.default.signup(), validateHandler_1.validateHandler, auth_controller_1.signup);
router.post(route_constant_1.ROUTES.AUTH.SIGNIN, auth_validator_1.default.signin(), validateHandler_1.validateHandler, auth_controller_1.signin, auth_controller_1.createToken);
router.post(route_constant_1.ROUTES.AUTH.SOCIAL, auth_validator_1.default.authSocial(), validateHandler_1.validateHandler, auth_controller_1.authSocial, auth_controller_1.authUpdate, auth_controller_1.createToken);
router.post(route_constant_1.ROUTES.AUTH.SIGNOUT, auth_controller_1.signout);
router.post(route_constant_1.ROUTES.AUTH.REFRESH_TOKEN, auth_controller_1.refreshToken);
router.post(route_constant_1.ROUTES.AUTH.FORGOT_PASSWORD, auth_validator_1.default.forgotPassword(), validateHandler_1.validateHandler, auth_controller_1.forgotPassword, email_controller_1.sendChangePasswordEmail);
router.put(route_constant_1.ROUTES.AUTH.CHANGE_PASSWORD, auth_validator_1.default.changePassword(), validateHandler_1.validateHandler, auth_controller_1.changePassword);
router.get(route_constant_1.ROUTES.AUTH.CONFIRM_EMAIL, auth_controller_1.isAuth, email_controller_1.sendConfirmationEmail);
router.get(route_constant_1.ROUTES.AUTH.VERIFY_EMAIL, email_controller_1.verifyEmail);
router.param('userId', user_controller_1.userById);
exports.default = router;
