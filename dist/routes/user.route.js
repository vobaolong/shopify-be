"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import route constants
const route_constant_1 = require("../constants/route.constant");
// IMPORT VALIDATORS
const userValidator = __importStar(require("../validators/user.validator"));
const validateHandler_1 = require("../helpers/validateHandler");
// IMPORT CONTROLLERS
const auth_controller_1 = require("../controllers/auth.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const user_controller_1 = require("../controllers/user.controller");
// GET USER
router.get(route_constant_1.ROUTES.USER.GET_USER, user_controller_1.getUser);
// GET USER PROFILE
router.get(route_constant_1.ROUTES.USER.PROFILE, auth_controller_1.isAuth, user_controller_1.getUserProfile);
// UPDATE USER PROFILE
router.put(route_constant_1.ROUTES.USER.PROFILE_UPDATE, auth_controller_1.isAuth, userValidator.updateProfile(), validateHandler_1.validateHandler, user_controller_1.updateProfile);
// UPDATE USER PASSWORD
router.put(route_constant_1.ROUTES.USER.PASSWORD_UPDATE, auth_controller_1.isAuth, userValidator.updateAccount(), validateHandler_1.validateHandler, auth_controller_1.verifyPassword, user_controller_1.updatePassword);
// LIST USER
router.get(route_constant_1.ROUTES.USER.LIST_USERS, user_controller_1.listUser);
// LIST USER FOR ADMIN
router.get(route_constant_1.ROUTES.USER.LIST_USERS_ADMIN, auth_controller_1.isAuth, auth_controller_1.isAdmin, user_controller_1.listUserForAdmin);
// ADD USER ADDRESS
router.post(route_constant_1.ROUTES.USER.ADDRESS_ADD, auth_controller_1.isAuth, userValidator.userAddress(), validateHandler_1.validateHandler, user_controller_1.addAddress);
// UPDATE USER ADDRESS
router.put(route_constant_1.ROUTES.USER.ADDRESS_UPDATE, auth_controller_1.isAuth, userValidator.userAddress(), validateHandler_1.validateHandler, user_controller_1.updateAddress);
// DELETE USER ADDRESS
router.delete(route_constant_1.ROUTES.USER.ADDRESS_DELETE, auth_controller_1.isAuth, user_controller_1.removeAddress);
// UPDATE USER AVATAR
router.put(route_constant_1.ROUTES.USER.AVATAR_UPDATE, auth_controller_1.isAuth, upload_controller_1.uploadSingleImage, user_controller_1.updateAvatar);
// UPDATE USER COVER
router.put(route_constant_1.ROUTES.USER.COVER_UPDATE, auth_controller_1.isAuth, upload_controller_1.uploadSingleImage, user_controller_1.updateCover);
// ROUTER PARAMS
router.param('userId', user_controller_1.userById);
exports.default = router;
