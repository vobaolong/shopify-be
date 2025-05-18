"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
//import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const category_controller_1 = require("../controllers/category.controller");
const variant_controller_1 = require("../controllers/variant.controller");
const variantValue_controller_1 = require("../controllers/variantValue.controller");
//routes
router.get(route_constant_1.ROUTES.VARIANT.BY_ID, auth_controller_1.isAuth, auth_controller_1.isAdmin, variant_controller_1.getVariant);
router.get(route_constant_1.ROUTES.VARIANT.ACTIVE, variant_controller_1.getActiveVariants);
router.get(route_constant_1.ROUTES.VARIANT.LIST, auth_controller_1.isAuth, auth_controller_1.isAdmin, variant_controller_1.getVariants);
router.post(route_constant_1.ROUTES.VARIANT.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.checkListCategoriesChild, variant_controller_1.checkVariant, variant_controller_1.createVariant);
router.put(route_constant_1.ROUTES.VARIANT.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.checkListCategoriesChild, variant_controller_1.checkVariant, variant_controller_1.updateVariant);
router.delete(route_constant_1.ROUTES.VARIANT.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, variant_controller_1.removeVariant, variantValue_controller_1.removeAllValues);
router.get(route_constant_1.ROUTES.VARIANT.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, variant_controller_1.restoreVariant, variantValue_controller_1.restoreAllValues);
//router params
router.param('variantId', variant_controller_1.getVariantById);
router.param('userId', user_controller_1.userById);
exports.default = router;
