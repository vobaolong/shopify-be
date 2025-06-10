import express from 'express'

// Import route constants
import { ROUTES } from '../constants/route.constant'

// Controllers
import { getReports, createReport, deleteReport } from '../controllers/report'

const router = express.Router()

// ----------- GET ROUTES -----------

router.get(ROUTES.REPORT.LIST, getReports)

// ----------- POST ROUTES -----------
router.post(ROUTES.REPORT.CREATE, createReport)

// ----------- DELETE ROUTES -----------
router.delete(ROUTES.REPORT.DELETE, deleteReport)

export default router
