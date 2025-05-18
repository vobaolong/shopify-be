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
const store_controller_1 = require("../controllers/store.controller");
const storeLevel_controller_1 = require("../controllers/storeLevel.controller");
//routes
router.get(route_constant_1.ROUTES.STORE_LEVEL.GET_LEVEL, storeLevel_controller_1.getStoreLevel);
router.get(route_constant_1.ROUTES.STORE_LEVEL.ACTIVE_LEVELS, storeLevel_controller_1.getActiveStoreLevels);
router.get(route_constant_1.ROUTES.STORE_LEVEL.LEVELS, auth_controller_1.isAuth, auth_controller_1.isAdmin, storeLevel_controller_1.getStoreLevels);
router.post(route_constant_1.ROUTES.STORE_LEVEL.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, level_validator_1.default.level(), validateHandler_1.validateHandler, storeLevel_controller_1.createStoreLevel);
router.put(route_constant_1.ROUTES.STORE_LEVEL.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, level_validator_1.default.level(), validateHandler_1.validateHandler, storeLevel_controller_1.updateStoreLevel);
router.delete(route_constant_1.ROUTES.STORE_LEVEL.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, storeLevel_controller_1.removeStoreLevel);
router.get(route_constant_1.ROUTES.STORE_LEVEL.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, storeLevel_controller_1.restoreStoreLevel);
//router params
router.param('userId', user_controller_1.userById);
router.param('storeId', store_controller_1.getStoreById);
router.param('storeLevelId', storeLevel_controller_1.storeLevelById);
exports.default = router;
