import express from 'express'

// Import route constants
import { ROUTES } from '../constants/route.constant'

//import controllers
import {
	getReports,
	createReport,
	deleteReport
} from '../controllers/report.controller'

const router = express.Router()

// GET REPORTS
router.get(ROUTES.REPORT.LIST, getReports)

// CREATE REPORT
router.post(ROUTES.REPORT.CREATE, createReport)

// DELETE REPORT
router.delete(ROUTES.REPORT.DELETE, deleteReport)

export default router
