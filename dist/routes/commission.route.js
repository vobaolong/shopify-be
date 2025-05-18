"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import validators
const commission_validator_1 = __importDefault(require("../validators/commission.validator"));
const validateHandler_1 = require("../helpers/validateHandler");
// Import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const route_constant_1 = require("../constants/route.constant");
const commission_controller_1 = require("../controllers/commission.controller");
// Routes
router.get(route_constant_1.ROUTES.COMMISSION.LIST_BY_USER, auth_controller_1.isAuth, auth_controller_1.isAdmin, commission_controller_1.getCommissions);
router.get(route_constant_1.ROUTES.COMMISSION.ACTIVE_LIST, commission_controller_1.getActiveCommissions);
router.post(route_constant_1.ROUTES.COMMISSION.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, commission_validator_1.default.commission(), validateHandler_1.validateHandler, commission_controller_1.createCommission);
router.put(route_constant_1.ROUTES.COMMISSION.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, commission_validator_1.default.commission(), validateHandler_1.validateHandler, commission_controller_1.updateCommission);
router.delete(route_constant_1.ROUTES.COMMISSION.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, commission_controller_1.removeCommission);
router.get(route_constant_1.ROUTES.COMMISSION.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, commission_controller_1.restoreCommission);
// Params
router.param('userId', user_controller_1.userById);
exports.default = router;
