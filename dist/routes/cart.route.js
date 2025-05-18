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
const cart_controller_1 = require("../controllers/cart.controller");
// Routes
router.get(route_constant_1.ROUTES.CART.COUNT, auth_controller_1.isAuth, cart_controller_1.countCartItems);
router.get(route_constant_1.ROUTES.CART.LIST, auth_controller_1.isAuth, cart_controller_1.getListCarts);
router.get(route_constant_1.ROUTES.CART.ITEMS, auth_controller_1.isAuth, cart_controller_1.getListCartItem);
router.post(route_constant_1.ROUTES.CART.ADD, auth_controller_1.isAuth, cart_controller_1.createCart, cart_controller_1.createCartItem, cart_controller_1.removeCart);
router.put(route_constant_1.ROUTES.CART.UPDATE, auth_controller_1.isAuth, cart_controller_1.updateCartItem);
router.delete(route_constant_1.ROUTES.CART.REMOVE, auth_controller_1.isAuth, cart_controller_1.removeCartItem, cart_controller_1.removeCart);
// Params
router.param('cartId', cart_controller_1.getCartById);
router.param('cartItemId', cart_controller_1.getCartItemById);
router.param('userId', user_controller_1.userById);
exports.default = router;
