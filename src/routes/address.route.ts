import express from 'express'
import { getAddress, getProvinces } from '../controllers/address.controller'
import { ROUTES } from '../constants/route.constant'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: Address
 *     description: Các API quản lý địa chỉ
 */
// ----------- GET ROUTES -----------
/**
 * @swagger
 * /address:
 *   get:
 *     summary: Lấy địa chỉ của user
 *     tags:
 *       - Address
 *     responses:
 *       200:
 *         description: Danh sách địa chỉ
 */
router.get(ROUTES.ADDRESS.GET_ADDRESS, getAddress)

/**
 * @swagger
 * /address/provinces:
 *   get:
 *     summary: Lấy danh sách tỉnh/thành phố
 *     tags:
 *       - Address
 *     responses:
 *       200:
 *         description: Danh sách tỉnh/thành phố
 */
router.get(ROUTES.ADDRESS.GET_PROVINCES, getProvinces)

// ----------- PARAMS -----------
// (No params for address routes)

export default router
