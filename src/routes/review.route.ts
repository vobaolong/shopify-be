import express from 'express'

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import { isAuth, isAdmin } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import {
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  updateRating,
  getReviews,
  checkReview,
  deleteReviewByAdmin
} from '../controllers/review.controller'

const router = express.Router()

// LIST REVIEWS
router.get(ROUTES.REVIEW.LIST, getReviews)

// CHECK REVIEW
router.post(ROUTES.REVIEW.CHECK, isAuth, checkReview)

// CREATE REVIEW
router.post(ROUTES.REVIEW.CREATE, isAuth, createReview, updateRating)

// UPDATE REVIEW
router.put(ROUTES.REVIEW.UPDATE, isAuth, updateReview, updateRating)

// DELETE REVIEW
router.delete(ROUTES.REVIEW.DELETE, isAuth, deleteReview, updateRating)

// ADMIN DELETE REVIEW
router.delete(
  ROUTES.REVIEW.ADMIN_DELETE,
  isAuth,
  isAdmin,
  deleteReviewByAdmin,
  updateRating
)

// ROUTER PARAMS
router.param('reviewId', getReviewById)
router.param('userId', userById)

export default router
