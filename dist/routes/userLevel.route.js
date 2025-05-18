"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
//import validators
const level_validator_1 = __importDefault(require("../validators/level.validator"));
const validateHandler_1 = require("../helpers/validateHandler");
//import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const userLevel_controller_1 = require("../controllers/userLevel.controller");
//routes
router.get(route_constant_1.ROUTES.USER_LEVEL.GET_LEVEL, userLevel_controller_1.getUserLevel);
router.get(route_constant_1.ROUTES.USER_LEVEL.ACTIVE_LEVELS, userLevel_controller_1.getActiveUserLevels);
router.get(route_constant_1.ROUTES.USER_LEVEL.LEVELS, auth_controller_1.isAuth, auth_controller_1.isAdmin, userLevel_controller_1.getUserLevels);
router.post(route_constant_1.ROUTES.USER_LEVEL.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, level_validator_1.default.level(), validateHandler_1.validateHandler, userLevel_controller_1.createUserLevel);
router.put(route_constant_1.ROUTES.USER_LEVEL.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, level_validator_1.default.level(), validateHandler_1.validateHandler, userLevel_controller_1.updateUserLevel);
router.delete(route_constant_1.ROUTES.USER_LEVEL.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, userLevel_controller_1.removeUserLevel);
router.get(route_constant_1.ROUTES.USER_LEVEL.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, userLevel_controller_1.restoreUserLevel);
//router params
router.param('userId', user_controller_1.userById);
router.param('userLevelId', userLevel_controller_1.getUserLevelById);
exports.default = router;
