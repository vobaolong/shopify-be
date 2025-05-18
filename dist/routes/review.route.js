"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import route constants
const route_constant_1 = require("../constants/route.constant");
//import controllers
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const review_controller_1 = require("../controllers/review.controller");
const router = express_1.default.Router();
// LIST REVIEWS
router.get(route_constant_1.ROUTES.REVIEW.LIST, review_controller_1.getReviews);
// CHECK REVIEW
router.post(route_constant_1.ROUTES.REVIEW.CHECK, auth_controller_1.isAuth, review_controller_1.checkReview);
// CREATE REVIEW
router.post(route_constant_1.ROUTES.REVIEW.CREATE, auth_controller_1.isAuth, review_controller_1.createReview, review_controller_1.updateRating);
// UPDATE REVIEW
router.put(route_constant_1.ROUTES.REVIEW.UPDATE, auth_controller_1.isAuth, review_controller_1.updateReview, review_controller_1.updateRating);
// DELETE REVIEW
router.delete(route_constant_1.ROUTES.REVIEW.DELETE, auth_controller_1.isAuth, review_controller_1.deleteReview, review_controller_1.updateRating);
// ADMIN DELETE REVIEW
router.delete(route_constant_1.ROUTES.REVIEW.ADMIN_DELETE, auth_controller_1.isAuth, auth_controller_1.isAdmin, review_controller_1.deleteReviewByAdmin, review_controller_1.updateRating);
// ROUTER PARAMS
router.param('reviewId', review_controller_1.getReviewById);
router.param('userId', user_controller_1.userById);
exports.default = router;
