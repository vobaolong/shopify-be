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
const userFollowStore_controller_1 = require("../controllers/userFollowStore.controller");
const validateHandler_1 = require("../helpers/validateHandler");
//routes
router.get(route_constant_1.ROUTES.USER_FOLLOW_STORE.FOLLOWER_COUNT, (0, validateHandler_1.asRouteHandler)(userFollowStore_controller_1.getStoreFollowerCount));
router.post(route_constant_1.ROUTES.USER_FOLLOW_STORE.FOLLOW_STORE, auth_controller_1.isAuth, (0, validateHandler_1.asRouteHandler)(userFollowStore_controller_1.followStore));
router.delete(route_constant_1.ROUTES.USER_FOLLOW_STORE.UNFOLLOW_STORE, auth_controller_1.isAuth, (0, validateHandler_1.asRouteHandler)(userFollowStore_controller_1.unfollowStore));
router.get(route_constant_1.ROUTES.USER_FOLLOW_STORE.FOLLOWING_STORES, auth_controller_1.isAuth, (0, validateHandler_1.asRouteHandler)(userFollowStore_controller_1.getFollowedStores));
router.get(route_constant_1.ROUTES.USER_FOLLOW_STORE.CHECK_FOLLOWING_STORE, auth_controller_1.isAuth, (0, validateHandler_1.asRouteHandler)(userFollowStore_controller_1.checkFollowingStore));
//params
router.param('userId', user_controller_1.userById);
router.param('storeId', store_controller_1.getStoreById);
exports.default = router;
