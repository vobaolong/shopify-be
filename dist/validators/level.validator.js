"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const level = () => [
    (0, express_validator_1.check)('name')
        .not()
        .isEmpty()
        .withMessage('Level name is required')
        .isLength({ max: 32 })
        .withMessage('Level name can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage("Level name must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)"),
    (0, express_validator_1.check)('minPoint')
        .not()
        .isEmpty()
        .withMessage('Level minPoint is required')
        .isInt({ min: 0 })
        .withMessage('Level minPoint must be int and greater than zero'),
    (0, express_validator_1.check)('discount')
        .not()
        .isEmpty()
        .withMessage('Level discount is required')
        .isFloat({ min: 0 })
        .withMessage('Level discount must be decimal and greater than zero')
];
exports.default = {
    level
};
