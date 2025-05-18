"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveStoreLevels = exports.getStoreLevels = exports.restoreStoreLevel = exports.removeStoreLevel = exports.updateStoreLevel = exports.createStoreLevel = exports.getStoreLevel = exports.storeLevelById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
/**
 * Find store level by ID and attach to request object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @param id - Store level ID
 */
const storeLevelById = async (req, res, next, id) => {
    try {
        const storeLevel = await index_model_1.StoreLevel.findById(id).exec();
        if (!storeLevel) {
            return res.status(404).json({
                error: 'Store level not found'
            });
        }
        req.storeLevel = storeLevel;
        next();
    }
    catch (error) {
        return res.status(404).json({
            error: 'Store level not found'
        });
    }
};
exports.storeLevelById = storeLevelById;
/**
 * Get store level based on store points
 * @param req - Express request object
 * @param res - Express response object
 */
const getStoreLevel = async (req, res) => {
    var _a, _b;
    try {
        const point = Math.max(((_a = req.store) === null || _a === void 0 ? void 0 : _a.point) || 0, 0);
        const [level] = await index_model_1.StoreLevel.find({
            minPoint: { $lte: point },
            isDeleted: false
        })
            .sort('-minPoint')
            .limit(1)
            .exec();
        if (!level) {
            return res.status(404).json({
                error: 'No matching store level found'
            });
        }
        return res.status(200).json({
            success: 'Get store level successfully',
            level: {
                point: (_b = req.store) === null || _b === void 0 ? void 0 : _b.point,
                name: level.name,
                minPoint: level.minPoint,
                discount: level.discount,
                color: level.color
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Get store level failed'
        });
    }
};
exports.getStoreLevel = getStoreLevel;
/**
 * Create a new store level
 * @param req - Express request object
 * @param res - Express response object
 */
const createStoreLevel = async (req, res) => {
    try {
        const { name, minPoint, discount, color } = req.body;
        const storeLevel = new index_model_1.StoreLevel({ name, minPoint, discount, color });
        const level = await storeLevel.save();
        return res.status(200).json({
            success: 'Create store level successfully',
            level
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createStoreLevel = createStoreLevel;
/**
 * Update an existing store level
 * @param req - Express request object
 * @param res - Express response object
 */
const updateStoreLevel = async (req, res) => {
    var _a;
    try {
        const { name, minPoint, discount, color } = req.body;
        const level = await index_model_1.StoreLevel.findOneAndUpdate({ _id: (_a = req.storeLevel) === null || _a === void 0 ? void 0 : _a._id }, { $set: { name, minPoint, discount, color } }, { new: true }).exec();
        if (!level) {
            return res.status(500).json({
                error: 'Store level not found'
            });
        }
        return res.status(200).json({
            success: 'Update store level successfully',
            level
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateStoreLevel = updateStoreLevel;
/**
 * Soft delete a store level by setting isDeleted to true
 * @param req - Express request object
 * @param res - Express response object
 */
const removeStoreLevel = async (req, res) => {
    var _a;
    try {
        const level = await index_model_1.StoreLevel.findOneAndUpdate({ _id: (_a = req.storeLevel) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: true } }, { new: true }).exec();
        if (!level) {
            return res.status(500).json({
                error: 'Store level not found'
            });
        }
        return res.status(200).json({
            success: 'Remove store level successfully'
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.removeStoreLevel = removeStoreLevel;
/**
 * Restore a soft-deleted store level
 * @param req - Express request object
 * @param res - Express response object
 */
const restoreStoreLevel = async (req, res) => {
    var _a;
    try {
        const level = await index_model_1.StoreLevel.findOneAndUpdate({ _id: (_a = req.storeLevel) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: false } }, { new: true }).exec();
        if (!level) {
            return res.status(500).json({
                error: 'Store level not found'
            });
        }
        return res.status(200).json({
            success: 'Restore store level successfully'
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.restoreStoreLevel = restoreStoreLevel;
/**
 * List store levels with pagination, sorting and search
 * @param req - Express request object
 * @param res - Express response object
 */
const getStoreLevels = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const sortBy = ((_b = req.query.sortBy) === null || _b === void 0 ? void 0 : _b.toString()) || '_id';
        const order = ((_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString()) && ['asc', 'desc'].includes((_d = req.query.order) === null || _d === void 0 ? void 0 : _d.toString())
            ? (_e = req.query.order) === null || _e === void 0 ? void 0 : _e.toString()
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0
            ? parseInt(req.query.limit.toString())
            : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0
            ? parseInt(req.query.page.toString())
            : 1;
        const filter = {
            search,
            sortBy,
            order,
            limit,
            pageCurrent: page
        };
        const searchQuery = { name: { $regex: search, $options: 'i' } };
        const count = await index_model_1.StoreLevel.countDocuments(searchQuery);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = limit * (page - 1);
        if (page > pageCount && pageCount > 0) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            return res.status(200).json({
                success: 'Load list store levels successfully',
                filter,
                size,
                levels: []
            });
        }
        const levels = await index_model_1.StoreLevel.find(searchQuery)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return res.status(200).json({
            success: 'Load list store levels successfully',
            filter,
            size,
            levels
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Load list store levels failed'
        });
    }
};
exports.getStoreLevels = getStoreLevels;
/**
 * List all active (non-deleted) store levels
 * @param req - Express request object
 * @param res - Express response object
 */
const getActiveStoreLevels = async (req, res) => {
    try {
        const levels = await index_model_1.StoreLevel.find({ isDeleted: false })
            .sort('minPoint')
            .exec();
        return res.status(200).json({
            success: 'Load list active store levels successfully',
            levels
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Load list active store levels failed'
        });
    }
};
exports.getActiveStoreLevels = getActiveStoreLevels;
