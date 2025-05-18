"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
//controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const store_controller_1 = require("../controllers/store.controller");
const cart_controller_1 = require("../controllers/cart.controller");
const transaction_controller_1 = require("../controllers/transaction.controller");
const order_controller_1 = require("../controllers/order.controller");
// ORDER COUNT
router.get(route_constant_1.ROUTES.ORDER.COUNT, order_controller_1.countOrders);
// ORDER ITEMS BY USER
router.get(route_constant_1.ROUTES.ORDER.USER.ITEMS, auth_controller_1.isAuth, order_controller_1.checkOrderAuth, order_controller_1.getOrderItems);
// ORDER RETURN
router.post(route_constant_1.ROUTES.ORDER.RETURN.REQUEST, auth_controller_1.isAuth, order_controller_1.checkOrderAuth, order_controller_1.createReturnRequest);
router.get(route_constant_1.ROUTES.ORDER.RETURN.BY_STORE, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.getReturnOrders);
// ORDER RETURN APPROVE
router.post(route_constant_1.ROUTES.ORDER.RETURN.APPROVE, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.checkOrderAuth, order_controller_1.returnOrder);
// ORDER ITEMS BY STORE
router.get(route_constant_1.ROUTES.ORDER.STORE.ITEMS, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.checkOrderAuth, order_controller_1.getOrderItems);
// ORDER ITEMS FOR ADMIN
router.get(route_constant_1.ROUTES.ORDER.ADMIN.ITEMS, auth_controller_1.isAuth, auth_controller_1.isAdmin, order_controller_1.checkOrderAuth, order_controller_1.getOrderItems);
// ORDER BY USER
router.get(route_constant_1.ROUTES.ORDER.USER.DETAIL, auth_controller_1.isAuth, order_controller_1.checkOrderAuth, order_controller_1.readOrder);
// ORDER BY STORE
router.get(route_constant_1.ROUTES.ORDER.STORE.DETAIL, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.checkOrderAuth, order_controller_1.readOrder);
// ORDER FOR ADMIN
router.get(route_constant_1.ROUTES.ORDER.ADMIN.DETAIL, auth_controller_1.isAuth, auth_controller_1.isAdmin, order_controller_1.checkOrderAuth, order_controller_1.readOrder);
// LIST ORDER BY USER
router.get(route_constant_1.ROUTES.ORDER.USER.LIST, auth_controller_1.isAuth, order_controller_1.getOrdersByUser);
// LIST ORDER BY STORE
router.get(route_constant_1.ROUTES.ORDER.STORE.LIST, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.getOrdersByStore);
// LIST ORDER FOR ADMIN
router.get(route_constant_1.ROUTES.ORDER.ADMIN.LIST, auth_controller_1.isAuth, auth_controller_1.isAdmin, order_controller_1.getOrdersForAdmin);
// ORDER CREATE
router.post(route_constant_1.ROUTES.ORDER.CREATE, auth_controller_1.isAuth, order_controller_1.createOrder, order_controller_1.createOrderItems, order_controller_1.removeCart, order_controller_1.removeAllCartItems);
// ORDER UPDATE BY USER
router.put(route_constant_1.ROUTES.ORDER.USER.UPDATE, auth_controller_1.isAuth, order_controller_1.checkOrderAuth, order_controller_1.updateStatusForUser, transaction_controller_1.updateEWallet, transaction_controller_1.createTransaction, order_controller_1.updatePoint);
// ORDER UPDATE BY STORE
router.put(route_constant_1.ROUTES.ORDER.STORE.UPDATE, auth_controller_1.isAuth, auth_controller_1.isManager, order_controller_1.checkOrderAuth, order_controller_1.updateStatusForStore, transaction_controller_1.updateEWallet, transaction_controller_1.createTransaction, order_controller_1.updateQuantitySoldProduct, order_controller_1.updatePoint);
//params
router.param('orderId', order_controller_1.getOrderById);
router.param('cartId', cart_controller_1.getCartById);
router.param('storeId', store_controller_1.getStoreById);
router.param('userId', user_controller_1.userById);
exports.default = router;
