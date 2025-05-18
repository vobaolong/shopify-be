import express from 'express'
const router = express.Router()

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import {
	getNotifications,
	updateRead,
	deleteNotifications
} from '../controllers/notification.controller'

import {
	sendBanStoreEmail,
	sendActiveStoreEmail,
	sendBanProductEmail,
	sendActiveProductEmail,
	sendCreateStoreEmail,
	sendDeliveryEmailEmail
} from '../controllers/email.controller'

router.get(ROUTES.NOTIFICATION.GET, getNotifications)
router.put(ROUTES.NOTIFICATION.UPDATE_READ, updateRead)
router.delete(ROUTES.NOTIFICATION.DELETE, deleteNotifications)

router.post(ROUTES.NOTIFICATION.SEND.BAN_STORE, sendBanStoreEmail)
router.post(ROUTES.NOTIFICATION.SEND.CREATE_STORE, sendCreateStoreEmail)
router.post(ROUTES.NOTIFICATION.SEND.ACTIVE_STORE, sendActiveStoreEmail)

router.post(ROUTES.NOTIFICATION.SEND.BAN_PRODUCT, sendBanProductEmail)
router.post(ROUTES.NOTIFICATION.SEND.ACTIVE_PRODUCT, sendActiveProductEmail)

router.post(ROUTES.NOTIFICATION.SEND.DELIVERY_SUCCESS, sendDeliveryEmailEmail)

export default router
