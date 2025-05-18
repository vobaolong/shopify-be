"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
// Import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const store_controller_1 = require("../controllers/store.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const category_controller_1 = require("../controllers/category.controller");
const product_controller_1 = require("../controllers/product.controller");
// Routes
router.get(route_constant_1.ROUTES.CATEGORY.GET_BY_ID, category_controller_1.getCategory);
router.get(route_constant_1.ROUTES.CATEGORY.ACTIVE, category_controller_1.getActiveCategories);
router.get(route_constant_1.ROUTES.CATEGORY.LIST_BY_STORE, product_controller_1.getProductCategoriesByStore, category_controller_1.getCategoriesByStore);
router.get(route_constant_1.ROUTES.CATEGORY.LIST_BY_USER, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.getCategories);
router.post(route_constant_1.ROUTES.CATEGORY.CREATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, upload_controller_1.uploadSingleImage, category_controller_1.checkCategory, category_controller_1.createCategory);
router.put(route_constant_1.ROUTES.CATEGORY.UPDATE, auth_controller_1.isAuth, auth_controller_1.isAdmin, upload_controller_1.uploadSingleImage, category_controller_1.checkCategory, category_controller_1.updateCategory);
router.delete(route_constant_1.ROUTES.CATEGORY.DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.removeCategory);
router.get(route_constant_1.ROUTES.CATEGORY.RESTORE, auth_controller_1.isAuth, auth_controller_1.isAdmin, category_controller_1.restoreCategory);
// Params
router.param('categoryId', category_controller_1.getCategoryById);
router.param('userId', user_controller_1.userById);
router.param('storeId', store_controller_1.getStoreById);
exports.default = router;
