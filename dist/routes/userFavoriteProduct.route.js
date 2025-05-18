"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
// IMPORT CONTROLLERS
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const product_controller_1 = require("../controllers/product.controller");
const userFavoriteProduct_controller_1 = require("../controllers/userFavoriteProduct.controller");
// Type assertion function to fix the TypeScript error
const asRouteHandler = (handler) => handler;
// GET NUMBER OF FOLLOWERS FOR PRODUCT
router.get(route_constant_1.ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_COUNT, asRouteHandler(userFavoriteProduct_controller_1.getFavoriteCount));
// FOLLOW PRODUCT
router.post(route_constant_1.ROUTES.USER_FAVORITE_PRODUCT.FAVORITE_PRODUCT, auth_controller_1.isAuth, asRouteHandler(userFavoriteProduct_controller_1.favoriteProduct));
// UNFOLLOW PRODUCT
router.delete(route_constant_1.ROUTES.USER_FAVORITE_PRODUCT.UNFAVORITE_PRODUCT, auth_controller_1.isAuth, asRouteHandler(userFavoriteProduct_controller_1.unFavoriteProduct));
// LIST FOLLOWING PRODUCTS BY USER
router.get(route_constant_1.ROUTES.USER_FAVORITE_PRODUCT.LIST_FAVORITE_PRODUCTS, auth_controller_1.isAuth, asRouteHandler(userFavoriteProduct_controller_1.listFavoriteProductsByUser));
// CHECK FOLLOWING PRODUCT
router.get(route_constant_1.ROUTES.USER_FAVORITE_PRODUCT.CHECK_FAVORITE_PRODUCT, auth_controller_1.isAuth, asRouteHandler(userFavoriteProduct_controller_1.checkFavoriteProduct));
// ROUTER PARAMS
router.param('userId', user_controller_1.userById);
router.param('productId', product_controller_1.getProductById);
exports.default = router;
