import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Middlewares
import { isAuth } from '../controllers/auth.controller'
import { userById } from '../controllers/user.controller'
import { getStoreById } from '../controllers/store.controller'
import {
	getStoreFollowerCount,
	followStore,
	unfollowStore,
	getFollowedStores,
	checkFollowingStore
} from '../controllers/userFollowStore.controller'

// Middleware groups
const auth = [isAuth]

// ----------- USER FOLLOW STORE ROUTES -----------
router.get(ROUTES.USER_FOLLOW_STORE.FOLLOWER_COUNT, getStoreFollowerCount)
router.post(ROUTES.USER_FOLLOW_STORE.FOLLOW_STORE, ...auth, followStore)
router.delete(ROUTES.USER_FOLLOW_STORE.UNFOLLOW_STORE, ...auth, unfollowStore)
router.get(ROUTES.USER_FOLLOW_STORE.FOLLOWING_STORES, ...auth, getFollowedStores)
router.get(ROUTES.USER_FOLLOW_STORE.CHECK_FOLLOWING_STORE, ...auth, checkFollowingStore)

// ----------- PARAMS -----------
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
