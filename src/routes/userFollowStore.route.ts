import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
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
import { asRouteHandler } from '../helpers/validateHandler'


//routes
router.get(ROUTES.USER_FOLLOW_STORE.FOLLOWER_COUNT, asRouteHandler(getStoreFollowerCount))
router.post(ROUTES.USER_FOLLOW_STORE.FOLLOW_STORE, isAuth, asRouteHandler(followStore))
router.delete(ROUTES.USER_FOLLOW_STORE.UNFOLLOW_STORE, isAuth, asRouteHandler(unfollowStore))
router.get(ROUTES.USER_FOLLOW_STORE.FOLLOWING_STORES, isAuth, asRouteHandler(getFollowedStores))
router.get(
	ROUTES.USER_FOLLOW_STORE.CHECK_FOLLOWING_STORE,
	isAuth,
	asRouteHandler(checkFollowingStore)
)

//params
router.param('userId', userById)
router.param('storeId', getStoreById)

export default router
