"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrands = exports.getBrandCategories = exports.restoreBrand = exports.removeBrand = exports.updateBrand = exports.createBrand = exports.checkBrand = exports.getBrand = exports.getBrandById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
const getBrandById = async (req, res, next, id) => {
    try {
        const brand = await index_model_1.Brand.findById(id).exec();
        if (!brand) {
            res.status(404).json({
                error: 'Brand not found'
            });
        }
        req.brand = brand || undefined;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'Brand not found'
        });
    }
};
exports.getBrandById = getBrandById;
const getBrand = async (req, res) => {
    var _a;
    try {
        const brand = await index_model_1.Brand.findOne({ _id: (_a = req.brand) === null || _a === void 0 ? void 0 : _a._id })
            .populate({
            path: 'categoryIds',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId'
                }
            }
        })
            .exec();
        if (!brand) {
            res.status(500).json({
                error: 'Load brand failed'
            });
        }
        res.status(200).json({
            success: 'Load brand successfully',
            brand
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load brand failed'
        });
    }
};
exports.getBrand = getBrand;
const checkBrand = async (req, res, next) => {
    try {
        const { name, categoryIds } = req.body;
        const brandId = req.brand ? req.brand._id : null;
        const existingBrand = await index_model_1.Brand.findOne({
            _id: { $ne: brandId },
            name,
            categoryIds
        }).exec();
        if (!existingBrand) {
            if (next)
                next();
            return;
        }
        res.status(400).json({
            error: 'Brand already exists'
        });
    }
    catch (error) {
        if (next)
            next();
    }
};
exports.checkBrand = checkBrand;
const createBrand = async (req, res) => {
    try {
        const { name, categoryIds } = req.body;
        if (!name || !categoryIds) {
            res.status(400).json({
                error: 'All fields are required'
            });
        }
        const brand = new index_model_1.Brand({
            name,
            categoryIds
        });
        const savedBrand = await brand.save();
        res.status(200).json({
            success: 'Create brand successfully',
            brand: savedBrand
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createBrand = createBrand;
const updateBrand = async (req, res) => {
    var _a;
    try {
        const { name, categoryIds } = req.body;
        if (!name || !categoryIds) {
            res.status(400).json({
                error: 'All fields are required'
            });
        }
        const brand = await index_model_1.Brand.findOneAndUpdate({ _id: (_a = req.brand) === null || _a === void 0 ? void 0 : _a._id }, { $set: { name, categoryIds } }, { new: true }).exec();
        if (!brand) {
            res.status(500).json({
                error: 'Brand not found'
            });
        }
        res.status(200).json({
            success: 'Update brand successfully',
            brand
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateBrand = updateBrand;
const removeBrand = async (req, res, next) => {
    var _a;
    try {
        const brand = await index_model_1.Brand.findOneAndUpdate({ _id: (_a = req.brand) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: true } }, { new: true }).exec();
        if (!brand) {
            res.status(500).json({
                error: 'Brand not found'
            });
        }
        req.brand = brand || undefined;
        if (next)
            next();
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.removeBrand = removeBrand;
const restoreBrand = async (req, res, next) => {
    var _a;
    try {
        const brand = await index_model_1.Brand.findOneAndUpdate({ _id: (_a = req.brand) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: false } }, { new: true }).exec();
        if (!brand) {
            res.status(500).json({
                error: 'Brand not found'
            });
        }
        req.brand = brand || undefined;
        if (next)
            next();
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.restoreBrand = restoreBrand;
const getBrandCategories = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const sortBy = ((_b = req.query.sortBy) === null || _b === void 0 ? void 0 : _b.toString()) || '_id';
        const order = ((_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString()) &&
            ['asc', 'desc'].includes((_d = req.query.order) === null || _d === void 0 ? void 0 : _d.toString())
            ? (_e = req.query.order) === null || _e === void 0 ? void 0 : _e.toString()
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0
            ? parseInt(req.query.limit.toString())
            : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0
            ? parseInt(req.query.page.toString())
            : 1;
        const categoryId = (_f = req.query.categoryId) === null || _f === void 0 ? void 0 : _f.toString();
        let skip = limit * (page - 1);
        const filter = {
            search,
            sortBy,
            categoryId,
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
        const count = await index_model_1.Brand.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount && pageCount > 0) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list active brands successfully',
                filter,
                size,
                brands: []
            });
        }
        const brands = await index_model_1.Brand.find(filterArgs)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        res.status(200).json({
            success: 'Load list active brands successfully',
            filter,
            size,
            brands
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list active brands failed'
        });
    }
};
exports.getBrandCategories = getBrandCategories;
const listBrands = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const sortBy = ((_b = req.query.sortBy) === null || _b === void 0 ? void 0 : _b.toString()) || '_id';
        const order = ((_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString()) &&
            ['asc', 'desc'].includes((_d = req.query.order) === null || _d === void 0 ? void 0 : _d.toString())
            ? (_e = req.query.order) === null || _e === void 0 ? void 0 : _e.toString()
            : 'asc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0
            ? parseInt(req.query.limit.toString())
            : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0
            ? parseInt(req.query.page.toString())
            : 1;
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
        const count = await index_model_1.Brand.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount && pageCount > 0) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list brands successfully',
                filter,
                size,
                brands: []
            });
        }
        const brands = await index_model_1.Brand.find(filterArgs)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .populate({
            path: 'categoryIds',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
            }
        })
            .skip(skip)
            .limit(limit)
            .exec();
        res.status(200).json({
            success: 'Load list brands successfully',
            filter,
            size,
            brands
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list brands failed'
        });
    }
};
exports.listBrands = listBrands;
