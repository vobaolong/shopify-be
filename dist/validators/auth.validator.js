"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const express_validator_1 = require("express-validator");
const regex_constant_1 = require("../constants/regex.constant");
// --- Validators ---
const checkNameValidity = (val) => {
    for (const pattern of regex_constant_1.INVALID_NAME_PATTERNS) {
        if (pattern.test(val)) {
            return Promise.reject('Name contains marketing or promotional terms');
        }
    }
    return true;
};
const nameValidator = (field) => (0, express_validator_1.check)(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ max: 32 })
    .withMessage(`${field} can contain up to 32 characters`)
    .matches(regex_constant_1.NAME_REGEX)
    .withMessage(`${field} contains invalid characters`)
    .custom(checkNameValidity);
const emailValidator = () => (0, express_validator_1.check)('email')
    .notEmpty()
    .withMessage('Email is required')
    .matches(regex_constant_1.EMAIL_REGEX)
    .withMessage('Must provide a valid email address');
const phoneValidator = () => (0, express_validator_1.check)('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(regex_constant_1.PHONE_REGEX)
    .withMessage('Must be a valid Vietnamese phone number');
const emailOrPhoneValidator = () => [
    (0, express_validator_1.check)('email')
        .optional()
        .matches(regex_constant_1.EMAIL_REGEX)
        .withMessage('Invalid email format'),
    (0, express_validator_1.check)('phone')
        .optional()
        .matches(regex_constant_1.PHONE_REGEX)
        .withMessage('Invalid phone format'),
    (0, express_validator_1.check)().custom((_, { req }) => {
        const { email, phone } = req.body;
        if (email && phone)
            throw new Error('Only one of email or phone should be provided');
        if (!email && !phone)
            throw new Error('Either email or phone must be provided');
        return true;
    })
];
const strongPasswordValidator = () => (0, express_validator_1.check)('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Must contain at least one special character');
const loginPasswordValidator = () => (0, express_validator_1.check)('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(/^[A-Za-z\d@$!%*?&]*$/)
    .withMessage('Password contains invalid characters');
// --- Exported Validators ---
const signup = () => [
    nameValidator('firstName'),
    nameValidator('lastName'),
    ...emailOrPhoneValidator(),
    strongPasswordValidator()
];
exports.signup = signup;
const signin = () => [
    ...emailOrPhoneValidator(),
    loginPasswordValidator()
];
const forgotPassword = () => [...emailOrPhoneValidator()];
const changePassword = () => [strongPasswordValidator()];
const authSocial = () => [
    nameValidator('firstName'),
    nameValidator('lastName'),
    emailValidator()
];
exports.default = {
    signup: exports.signup,
    signin,
    forgotPassword,
    changePassword,
    authSocial
};
