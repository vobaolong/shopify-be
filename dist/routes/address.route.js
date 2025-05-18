"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const address_controller_1 = require("../controllers/address.controller");
const route_constant_1 = require("../constants/route.constant");
const router = express_1.default.Router();
router.get(route_constant_1.ROUTES.ADDRESS.GET_ADDRESS, address_controller_1.getAddress);
router.get(route_constant_1.ROUTES.ADDRESS.GET_PROVINCES, address_controller_1.getProvinces);
exports.default = router;
