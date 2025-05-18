import express from 'express'
import { getAddress, getProvinces } from '../controllers/address.controller'
import { ROUTES } from '../constants/route.constant'

const router = express.Router()

router.get(ROUTES.ADDRESS.GET_ADDRESS, getAddress)
router.get(ROUTES.ADDRESS.GET_PROVINCES, getProvinces)

export default router
