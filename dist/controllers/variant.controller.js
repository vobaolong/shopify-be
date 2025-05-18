"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariants = exports.getActiveVariants = exports.restoreVariant = exports.removeVariant = exports.updateVariant = exports.createVariant = exports.checkVariant = exports.getVariant = exports.getVariantById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
const getVariantById = async (req, res, next) => {
    try {
        const variant = await index_model_1.Variant.findById(req.params.id);
        if (!variant) {
            res.status(404).json({ error: 'Variant not found' });
            return;
        }
        req.variant = variant;
        next();
    }
    catch (error) {
        res.status(404).json({ error: 'Variant not found' });
    }
};
exports.getVariantById = getVariantById;
const getVariant = async (req, res) => {
    try {
        const variant = await index_model_1.Variant.findOne({ _id: req.variant._id }).populate({
            path: 'categoryIds',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        });
        if (!variant) {
            res.status(500).json({ error: 'Load variant failed' });
            return;
        }
        res.status(200).json({ success: 'Load variant successfully', variant });
    }
    catch (error) {
        res.status(500).json({ error: 'Load variant failed' });
    }
};
exports.getVariant = getVariant;
const checkVariant = async (req, res, next) => {
    try {
        const { name, categoryIds } = req.body;
        const variantId = req.variant ? req.variant._id : null;
        const existingVariant = await index_model_1.Variant.findOne({
            _id: { $ne: variantId },
            name,
            categoryIds
        });
        if (existingVariant) {
            res.status(400).json({ error: 'Variant already exists' });
            return;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.checkVariant = checkVariant;
const createVariant = async (req, res) => {
    try {
        const { name, categoryIds } = req.body;
        if (!name || !categoryIds) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const variant = new index_model_1.Variant({ name, categoryIds });
        const savedVariant = await variant.save();
        res.status(200).json({ success: 'Create variant successfully', variant: savedVariant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.createVariant = createVariant;
const updateVariant = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const variant = await index_model_1.Variant.findOneAndUpdate({ _id: req.variant._id }, { $set: { name } }, { new: true });
        if (!variant) {
            res.status(500).json({ error: 'variant not found' });
            return;
        }
        res.status(200).json({ success: 'Update variant successfully', variant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.updateVariant = updateVariant;
const removeVariant = async (req, res, next) => {
    try {
        const variant = await index_model_1.Variant.findOneAndUpdate({ _id: req.variant._id }, { $set: { isDeleted: true } }, { new: true });
        if (!variant) {
            res.status(500).json({ error: 'Variant not found' });
            return;
        }
        req.body.variantId = req.variant._id;
        next();
        res.status(200).json({ success: 'remove variant successfully', variant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.removeVariant = removeVariant;
const restoreVariant = async (req, res, next) => {
    try {
        const variant = await index_model_1.Variant.findOneAndUpdate({ _id: req.variant._id }, { $set: { isDeleted: false } }, { new: true });
        if (!variant) {
            res.status(500).json({ error: 'Variant not found' });
            return;
        }
        req.body.variantId = req.variant._id;
        next();
        res.status(200).json({ success: 'restore variant successfully', variant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.restoreVariant = restoreVariant;
const getActiveVariants = async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.toString() : '';
        const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id';
        const order = req.query.order && (req.query.order.toString() === 'asc' || req.query.order.toString() === 'desc')
            ? req.query.order.toString()
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0 ? parseInt(req.query.limit.toString()) : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0 ? parseInt(req.query.page.toString()) : 1;
        let skip = limit * (page - 1);
        const categoryId = req.query.categoryId ? req.query.categoryId.toString() : null;
        const filter = {
            search,
            categoryId,
            sortBy,
            order,
            limit,
            pageCurrent: page
        };
        const filterArgs = {
            name: { $regex: search, $options: 'i' },
            isDeleted: false
        };
        if (categoryId) {
            filterArgs.categoryIds = categoryId;
        }
        const count = await index_model_1.Variant.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list active variants successfully',
                filter,
                size,
                variants: []
            });
            return;
        }
        const sortObj = { _id: 1 };
        sortObj[sortBy] = order === 'asc' ? 1 : -1;
        const variants = await index_model_1.Variant.find(filterArgs)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: 'Load list active variants successfully',
            filter,
            size,
            variants
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Load list active variants failed' });
    }
};
exports.getActiveVariants = getActiveVariants;
const getVariants = async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.toString() : '';
        const sortBy = req.query.sortBy ? req.query.sortBy.toString() : '_id';
        const order = req.query.order && (req.query.order.toString() === 'asc' || req.query.order.toString() === 'desc')
            ? req.query.order.toString()
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0 ? parseInt(req.query.limit.toString()) : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0 ? parseInt(req.query.page.toString()) : 1;
        let skip = limit * (page - 1);
        const filter = {
            search,
            sortBy,
            order,
            limit,
            pageCurrent: page
        };
        const filterArgs = {
            name: { $regex: search, $options: 'i' }
        };
        if (req.query.categoryId) {
            filter.categoryId = req.query.categoryId.toString();
            filterArgs.categoryIds = req.query.categoryId.toString();
        }
        const count = await index_model_1.Variant.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list variants successfully',
                filter,
                size,
                variants: []
            });
            return;
        }
        const sortObj = { _id: 1 };
        sortObj[sortBy] = order === 'asc' ? 1 : -1;
        const variants = await index_model_1.Variant.find(filterArgs)
            .sort(sortObj)
            .populate({
            path: 'categoryIds',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: 'Load list variants successfully',
            filter,
            size,
            variants
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Load list variants failed' });
    }
};
exports.getVariants = getVariants;
