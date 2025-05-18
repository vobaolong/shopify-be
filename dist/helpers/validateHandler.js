"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asRouteHandler = exports.validateHandler = void 0;
const express_validator_1 = require("express-validator");
const validateHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map((error) => error.msg)[0];
        res.status(400).json({ error: firstError });
        return;
    }
    next();
};
exports.validateHandler = validateHandler;
const asRouteHandler = (handler) => handler;
exports.asRouteHandler = asRouteHandler;
