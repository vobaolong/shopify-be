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
const transaction_controller_1 = require("../controllers/transaction.controller");
//routes
router.get(route_constant_1.ROUTES.TRANSACTION.BY_USER, auth_controller_1.isAuth, transaction_controller_1.getTransactions);
router.get(route_constant_1.ROUTES.TRANSACTION.BY_STORE, auth_controller_1.isAuth, auth_controller_1.isManager, transaction_controller_1.getTransactions);
router.get(route_constant_1.ROUTES.TRANSACTION.FOR_ADMIN, auth_controller_1.isAuth, auth_controller_1.isAdmin, transaction_controller_1.getTransactions);
router.post(route_constant_1.ROUTES.TRANSACTION.CREATE_BY_USER, auth_controller_1.isAuth, auth_controller_1.verifyPassword, transaction_controller_1.requestTransaction, transaction_controller_1.updateEWallet, transaction_controller_1.createTransaction, user_controller_1.getUserProfile);
router.post(route_constant_1.ROUTES.TRANSACTION.CREATE_BY_STORE, auth_controller_1.isAuth, auth_controller_1.verifyPassword, auth_controller_1.isOwner, transaction_controller_1.requestTransaction, transaction_controller_1.updateEWallet, transaction_controller_1.createTransaction, store_controller_1.getStoreProfile);
// router.post(
//     '/transaction/create/for/admin/:userId',
//     isAuth,
//     verifyPassword,
//     isAdmin,
//     requestTransaction,
//     updateEWallet,
//     createTransaction,
// );
//params
router.param('storeId', store_controller_1.getStoreById);
router.param('userId', user_controller_1.userById);
exports.default = router;
