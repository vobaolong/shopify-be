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
const store_controller_1 = require("../controllers/store.controller");
const category_controller_1 = require("../controllers/category.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const product_controller_1 = require("../controllers/product.controller");
// GET PRODUCT
router.get(route_constant_1.ROUTES.PRODUCT.GET_PRODUCT, product_controller_1.getProduct);
// GET PRODUCT FOR MANAGER
router.get(route_constant_1.ROUTES.PRODUCT.PRODUCT_FOR_MANAGER, auth_controller_1.isAuth, auth_controller_1.isManager, product_controller_1.getProductForSeller);
// GET ACTIVE PRODUCT LIST
router.get(route_constant_1.ROUTES.PRODUCT.ACTIVE, product_controller_1.getProductCategories, product_controller_1.getProducts);
// GET SELLING PRODUCT LIST BY STORE
router.get(route_constant_1.ROUTES.PRODUCT.PRODUCTS_BY_STORE, product_controller_1.getProductCategoriesByStore, product_controller_1.getProductsByStore);
// GET PRODUCT LIST BY STORE FOR MANAGER
router.get(route_constant_1.ROUTES.PRODUCT.PRODUCTS_BY_STORE_FOR_MANAGER, auth_controller_1.isAuth, auth_controller_1.isManager, product_controller_1.getProductCategoriesByStore, product_controller_1.getStoreProductsForSeller);
// GET PRODUCT LIST FOR ADMIN
router.get(route_constant_1.ROUTES.PRODUCT.PRODUCTS_FOR_ADMIN, auth_controller_1.isAuth, auth_controller_1.isAdmin, product_controller_1.getProductsForAdmin);
// CREATE PRODUCT
router.post(route_constant_1.ROUTES.PRODUCT.CREATE, auth_controller_1.isAuth, auth_controller_1.isManager, upload_controller_1.uploadSingleImage, category_controller_1.checkCategoryChild, product_controller_1.createProduct);
// UPDATE PRODUCT
router.put(route_constant_1.ROUTES.PRODUCT.UPDATE, auth_controller_1.isAuth, auth_controller_1.isManager, upload_controller_1.uploadSingleImage, category_controller_1.checkCategoryChild, product_controller_1.updateProduct);
// SELLING PRODUCT
router.put(route_constant_1.ROUTES.PRODUCT.SELLING, auth_controller_1.isAuth, auth_controller_1.isManager, product_controller_1.sellingProduct);
// ACTIVE PRODUCT
router.put(route_constant_1.ROUTES.PRODUCT.ACTIVE, auth_controller_1.isAuth, auth_controller_1.isAdmin, product_controller_1.activeProduct);
// ADD PRODUCT IMAGE
router.post(route_constant_1.ROUTES.PRODUCT.IMAGES_ADD, auth_controller_1.isAuth, auth_controller_1.isManager, upload_controller_1.uploadMultipleImagesController, product_controller_1.addToListImages);
// UPDATE PRODUCT IMAGE
router.put(route_constant_1.ROUTES.PRODUCT.IMAGES_UPDATE, auth_controller_1.isAuth, auth_controller_1.isManager, upload_controller_1.uploadMultipleImagesController, product_controller_1.updateListImages);
// REMOVE PRODUCT IMAGE
router.delete(route_constant_1.ROUTES.PRODUCT.IMAGES_REMOVE, auth_controller_1.isAuth, auth_controller_1.isManager, product_controller_1.removeFromListImages);
// ROUTER PARAMS
router.param('productId', product_controller_1.getProductById);
router.param('userId', user_controller_1.userById);
router.param('storeId', store_controller_1.getStoreById);
exports.default = router;
