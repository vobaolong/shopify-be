"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const route_constant_1 = require("../constants/route.constant");
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const variant_controller_1 = require("../controllers/variant.controller");
const variantValue_controller_1 = require("../controllers/variantValue.controller");
router.get(route_constant_1.ROUTES.VARIANT_VALUE.ACTIVE, variantValue_controller_1.getActiveVariantValues);
router.get(route_constant_1.ROUTES.VARIANT_VALUE.LIST, auth_controller_1.isAuth, auth_controller_1.isAdmin, variantValue_controller_1.getVariantValues);
router.post(route_constant_1.ROUTES.VARIANT_VALUE.CREATE, auth_controller_1.isAuth, variantValue_controller_1.createValue);
router.put(route_constant_1.ROUTES.VARIANT_VALUE.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, variantValue_controller_1.updateValue);
router.delete(route_constant_1.ROUTES.VARIANT_VALUE.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, variantValue_controller_1.removeValue);
router.get(route_constant_1.ROUTES.VARIANT_VALUE.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, variantValue_controller_1.restoreValue);
//router params
router.param('variantValueId', variantValue_controller_1.getValueById);
router.param('variantId', variant_controller_1.getVariantById);
router.param('userId', user_controller_1.userById);
exports.default = router;
