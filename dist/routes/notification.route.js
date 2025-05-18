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
const notification_controller_1 = require("../controllers/notification.controller");
const email_controller_1 = require("../controllers/email.controller");
router.get(route_constant_1.ROUTES.NOTIFICATION.GET, notification_controller_1.getNotifications);
router.put(route_constant_1.ROUTES.NOTIFICATION.UPDATE_READ, notification_controller_1.updateRead);
router.delete(route_constant_1.ROUTES.NOTIFICATION.DELETE, notification_controller_1.deleteNotifications);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.BAN_STORE, email_controller_1.sendBanStoreEmail);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.CREATE_STORE, email_controller_1.sendCreateStoreEmail);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.ACTIVE_STORE, email_controller_1.sendActiveStoreEmail);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.BAN_PRODUCT, email_controller_1.sendBanProductEmail);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.ACTIVE_PRODUCT, email_controller_1.sendActiveProductEmail);
router.post(route_constant_1.ROUTES.NOTIFICATION.SEND.DELIVERY_SUCCESS, email_controller_1.sendDeliveryEmailEmail);
exports.default = router;
