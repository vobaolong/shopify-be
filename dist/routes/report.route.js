"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import route constants
const route_constant_1 = require("../constants/route.constant");
//import controllers
const report_controller_1 = require("../controllers/report.controller");
const router = express_1.default.Router();
// GET REPORTS
router.get(route_constant_1.ROUTES.REPORT.LIST, report_controller_1.getReports);
// CREATE REPORT
router.post(route_constant_1.ROUTES.REPORT.CREATE, report_controller_1.createReport);
// DELETE REPORT
router.delete(route_constant_1.ROUTES.REPORT.DELETE, report_controller_1.deleteReport);
exports.default = router;
