import express from 'express'

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth, isAdmin } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user.controller'
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

// Middleware groups
const adminAuth = [isAuth, isAdmin]
const auth = [isAuth]

// ----------- GET ROUTES -----------
router.get(ROUTES.REVIEW.LIST, getReviews)

// ----------- POST ROUTES -----------
router.post(ROUTES.REVIEW.CHECK, ...auth, checkReview)
router.post(ROUTES.REVIEW.CREATE, ...auth, createReview, updateRating)

// ----------- PUT ROUTES -----------
router.put(ROUTES.REVIEW.UPDATE, ...auth, updateReview, updateRating)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.REVIEW.DELETE, ...auth, deleteReview, updateRating)

// ----------- ADMIN DELETE ROUTES -----------
router.delete(
  ROUTES.REVIEW.ADMIN_DELETE,
  ...adminAuth,
  deleteReviewByAdmin,
  updateRating
)

// ----------- PARAMS -----------
router.param('reviewId', getReviewById)
router.param('userId', getUserById)

export default router
