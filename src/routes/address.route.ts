import express from 'express'
import {
  getAddress,
  getAddressById,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getProvinces,
  getDistricts,
  getWards
} from '../controllers/address'
import { ROUTES } from '../constants/route.constant'
import { isAuth } from '../middlewares/auth.middleware'

const router = express.Router()

router.get(ROUTES.ADDRESS.GET_ADDRESS, getAddress)
router.get(ROUTES.ADDRESS.GET_ADDRESS_BY_ID, getAddressById)
router.get(ROUTES.ADDRESS.GET_ADDRESSES, getAddresses)
router.get(ROUTES.ADDRESS.GET_PROVINCES, getProvinces)
router.get(ROUTES.ADDRESS.GET_DISTRICTS, getDistricts)
router.get(ROUTES.ADDRESS.GET_WARDS, getWards)

router.post(ROUTES.ADDRESS.CREATE_ADDRESS, isAuth, createAddress)
router.put(ROUTES.ADDRESS.UPDATE_ADDRESS, isAuth, updateAddress)
router.delete(ROUTES.ADDRESS.DELETE_ADDRESS, isAuth, deleteAddress)

export default router
