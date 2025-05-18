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
const brand_controller_1 = require("../controllers/brand.controller");
//routes
router.get(route_constant_1.ROUTES.BRAND.GET_BY_ID, auth_controller_1.isAuth, auth_controller_1.isAdmin, brand_controller_1.getBrand);
router.get(route_constant_1.ROUTES.BRAND.ACTIVE, brand_controller_1.getBrandCategories, brand_controller_1.listBrands);
router.get(route_constant_1.ROUTES.BRAND.LIST, brand_controller_1.listBrands);
router.get(route_constant_1.ROUTES.BRAND.LIST_FOR_ADMIN, auth_controller_1.isAuth, auth_controller_1.isAdmin, brand_controller_1.listBrands);
router.post(route_constant_1.ROUTES.BRAND.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.checkListCategoriesChild, brand_controller_1.checkBrand, brand_controller_1.createBrand);
router.put(route_constant_1.ROUTES.BRAND.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.checkListCategoriesChild, brand_controller_1.checkBrand, brand_controller_1.updateBrand);
router.delete(route_constant_1.ROUTES.BRAND.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, brand_controller_1.removeBrand);
router.get(route_constant_1.ROUTES.BRAND.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, brand_controller_1.restoreBrand);
//router params
router.param('brandId', brand_controller_1.getBrandById);
router.param('userId', user_controller_1.userById);
exports.default = router;
