import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth } from '../middlewares/auth.middleware'
import { getUserById } from '../controllers/user'
import { getStoreById } from '../controllers/store'
import {
  getStoreFollowerCount,
  followStore,
  unfollowStore,
  getFollowedStores,
  checkFollowingStore
} from '../controllers/userFollowStore'

// ----------- USER FOLLOW STORE ROUTES -----------
router.get(ROUTES.FOLLOW_STORE.FOLLOWER_COUNT, getStoreFollowerCount)
router.post(ROUTES.FOLLOW_STORE.FOLLOW_STORE, isAuth, followStore)
router.delete(ROUTES.FOLLOW_STORE.UNFOLLOW_STORE, isAuth, unfollowStore)
router.get(ROUTES.FOLLOW_STORE.FOLLOWING_STORES, isAuth, getFollowedStores)
router.get(
  ROUTES.FOLLOW_STORE.CHECK_FOLLOWING_STORE,
  isAuth,
  checkFollowingStore
)

// ----------- PARAMS -----------
router.param('userId', getUserById)
router.param('storeId', getStoreById)

export default router
