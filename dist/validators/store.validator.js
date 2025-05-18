"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const commission_model_1 = __importDefault(require("../models/commission.model"));
const regex_constant_1 = require("../constants/regex.constant");
// --- Custom Validators ---
const checkStoreName = (val) => {
    for (const pattern of regex_constant_1.INVALID_NAME_PATTERNS) {
        if (pattern.test(val)) {
            return Promise.reject('Store name contains invalid marketing terms');
        }
    }
    return true;
};
const checkCommission = async (val) => {
    const commission = await commission_model_1.default.findOne({ _id: val, isDeleted: false });
    if (!commission) {
        return Promise.reject('Commission not found');
    }
};
// --- Reusable Field Validators ---
const storeNameValidator = () => (0, express_validator_1.check)('name')
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name can contain up to 100 characters')
    .matches(regex_constant_1.NAME_REGEX)
    .withMessage("Store name must contain at least one letter (letters, numbers, spaces, _, ', - allowed)")
    .custom(checkStoreName);
const bioValidator = () => (0, express_validator_1.check)('bio')
    .notEmpty()
    .withMessage('Store bio is required')
    .isLength({ max: 3000 })
    .withMessage('Store bio can contain up to 3000 characters');
const commissionValidator = () => (0, express_validator_1.check)('commissionId')
    .notEmpty()
    .withMessage('CommissionId is required')
    .custom(checkCommission);
const booleanFieldValidator = (field) => (0, express_validator_1.check)(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isBoolean()
    .withMessage(`${field} must be boolean`);
// --- Main Validators ---
const createStore = () => [
    storeNameValidator(),
    bioValidator(),
    commissionValidator()
];
const updateStore = () => [
    storeNameValidator(),
    bioValidator()
];
const activeStore = () => [booleanFieldValidator('isActive')];
const openStore = () => [booleanFieldValidator('isOpen')];
const updateCommission = () => [commissionValidator()];
exports.default = {
    createStore,
    updateStore,
    activeStore,
    openStore,
    updateCommission
};
