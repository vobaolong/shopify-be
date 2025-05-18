"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreCommission = exports.removeCommission = exports.updateCommission = exports.createCommission = exports.getActiveCommissions = exports.getCommissions = void 0;
const commission_model_1 = __importDefault(require("../models/commission.model"));
const errorHandler_1 = require("../helpers/errorHandler");
const getCommissions = async (req, res) => {
    try {
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || '_id';
        const order = req.query.order && ['asc', 'desc'].includes(req.query.order)
            ? req.query.order
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit) > 0
            ? parseInt(req.query.limit)
            : 6;
        const page = req.query.page && parseInt(req.query.page) > 0
            ? parseInt(req.query.page)
            : 1;
        const filter = {
            search,
            sortBy,
            order,
            limit,
            pageCurrent: page
        };
        const searchQuery = {
            name: { $regex: search, $options: 'i' }
        };
        const count = await commission_model_1.default.countDocuments(searchQuery);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = limit * (page - 1);
        if (page > pageCount && pageCount > 0) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list commissions successfully',
                filter,
                size,
                commissions: []
            });
        }
        const commissions = await commission_model_1.default.find(searchQuery)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: 'Load list commissions successfully',
            filter,
            size,
            commissions
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list commissions failed'
        });
    }
};
exports.getCommissions = getCommissions;
const getActiveCommissions = async (req, res) => {
    try {
        const commissions = await commission_model_1.default.find({ isDeleted: false });
        const sanitizedCommissions = commissions.map((commission) => {
            const commissionObj = commission.toObject();
            delete commissionObj.isDeleted;
            commissionObj;
        });
        res.status(200).json({
            success: 'Load list active commissions successfully',
            commissions: sanitizedCommissions
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list active commissions failed'
        });
    }
};
exports.getActiveCommissions = getActiveCommissions;
const createCommission = async (req, res) => {
    try {
        const { name, fee, description } = req.body;
        const commission = new commission_model_1.default({
            name,
            fee,
            description
        });
        await commission.save();
        res.status(200).json({
            success: 'Create commission successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createCommission = createCommission;
const updateCommission = async (req, res) => {
    try {
        const commissionId = req.params.commissionId;
        const { name, fee, description } = req.body;
        const commission = await commission_model_1.default.findOneAndUpdate({ _id: commissionId }, { $set: { name, fee, description } });
        if (!commission) {
            res.status(404).json({
                error: 'Commission not found'
            });
        }
        res.status(200).json({
            success: 'Update commission successfully'
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Commission not found'
        });
    }
};
exports.updateCommission = updateCommission;
const removeCommission = async (req, res) => {
    try {
        const commissionId = req.params.commissionId;
        const commission = await commission_model_1.default.findOneAndUpdate({ _id: commissionId }, { $set: { isDeleted: true } });
        if (!commission) {
            res.status(404).json({
                error: 'Commission not found'
            });
        }
        res.status(200).json({
            success: 'Remove commission successfully'
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Commission not found'
        });
    }
};
exports.removeCommission = removeCommission;
const restoreCommission = async (req, res) => {
    try {
        const commissionId = req.params.commissionId;
        const commission = await commission_model_1.default.findOneAndUpdate({ _id: commissionId }, { $set: { isDeleted: false } });
        if (!commission) {
            res.status(404).json({
                error: 'Commission not found'
            });
        }
        res.status(200).json({
            success: 'Restore commission successfully'
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Commission not found'
        });
    }
};
exports.restoreCommission = restoreCommission;
