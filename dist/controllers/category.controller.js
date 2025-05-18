"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesByStore = exports.getCategories = exports.getActiveCategories = exports.restoreCategory = exports.removeCategory = exports.updateCategory = exports.createCategory = exports.checkListCategoriesChild = exports.checkCategoryChild = exports.checkCategory = exports.getCategory = exports.getCategoryById = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../helpers/errorHandler");
const getCategoryById = async (req, res, next, id) => {
    try {
        const category = await category_model_1.default.findById(id);
        if (!category) {
            res.status(404).json({
                error: 'Category not found'
            });
        }
        req.category = category;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'Category not found'
        });
    }
};
exports.getCategoryById = getCategoryById;
const getCategory = async (req, res) => {
    var _a;
    try {
        const category = await category_model_1.default.findOne({
            _id: (_a = req.category) === null || _a === void 0 ? void 0 : _a._id
        }).populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        if (!category) {
            res.status(500).json({
                error: 'Load category failed'
            });
        }
        res.status(200).json({
            success: 'Load category successfully',
            category
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load category failed'
        });
    }
};
exports.getCategory = getCategory;
const deleteUploadedFile = (filepath) => {
    try {
        if (filepath) {
            fs_1.default.unlinkSync('public' + filepath);
        }
    }
    catch (error) {
        // Silently fail if file deletion fails
    }
};
const deleteUploadedFiles = (filepaths = []) => {
    filepaths.forEach((path) => deleteUploadedFile(path));
};
const checkCategory = async (req, res, next) => {
    var _a, _b;
    const { categoryId } = req.fields || {};
    if (!categoryId)
        next();
    try {
        const category = await category_model_1.default.findOne({ _id: categoryId }).populate('categoryId');
        if (!category ||
            (category.categoryId && category.categoryId.categoryId)) {
            deleteUploadedFile((_a = req.filepaths) === null || _a === void 0 ? void 0 : _a[0]);
            res.status(400).json({
                error: 'CategoryId invalid'
            });
        }
        next();
    }
    catch (error) {
        deleteUploadedFile((_b = req.filepaths) === null || _b === void 0 ? void 0 : _b[0]);
        res.status(400).json({
            error: 'CategoryId invalid'
        });
    }
};
exports.checkCategory = checkCategory;
const checkCategoryChild = async (req, res, next) => {
    let categoryId = req.body.categoryId;
    try {
        if (!categoryId && req.fields) {
            categoryId = req.fields.categoryId;
        }
        const category = await category_model_1.default.findOne({ categoryId });
        if (category) {
            deleteUploadedFiles(req.filepaths || []);
            res.status(400).json({
                error: 'CategoryId invalid'
            });
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.checkCategoryChild = checkCategoryChild;
const checkListCategoriesChild = async (req, res, next) => {
    const { categoryIds } = req.body;
    try {
        const category = await category_model_1.default.findOne({
            categoryId: { $in: categoryIds }
        });
        if (category) {
            res.status(400).json({
                error: 'categoryIds invalid'
            });
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.checkListCategoriesChild = checkListCategoriesChild;
const createCategory = async (req, res) => {
    var _a;
    const { name, categoryId } = req.fields || {};
    const image = (_a = req.filepaths) === null || _a === void 0 ? void 0 : _a[0];
    if (!name) {
        deleteUploadedFile(image);
        res.status(400).json({
            error: 'All fields are required'
        });
    }
    try {
        const category = new category_model_1.default({
            name,
            categoryId,
            image
        });
        const savedCategory = await category.save();
        res.status(200).json({
            success: 'Creating category successfully',
            category: savedCategory
        });
    }
    catch (error) {
        deleteUploadedFile(image);
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let { name, categoryId } = req.fields || {};
    const image = ((_a = req.filepaths) === null || _a === void 0 ? void 0 : _a[0]) ? req.filepaths[0] : (_b = req.category) === null || _b === void 0 ? void 0 : _b.image;
    if (!categoryId) {
        categoryId = null;
    }
    else if (categoryId == ((_c = req.category) === null || _c === void 0 ? void 0 : _c._id)) {
        deleteUploadedFile((_d = req.filepaths) === null || _d === void 0 ? void 0 : _d[0]);
        res.status(400).json({
            error: 'categoryId invalid'
        });
    }
    if (!name || !image) {
        deleteUploadedFile((_e = req.filepaths) === null || _e === void 0 ? void 0 : _e[0]);
        res.status(400).json({
            error: 'All fields are required'
        });
    }
    try {
        const category = await category_model_1.default.findOneAndUpdate({ _id: (_f = req.category) === null || _f === void 0 ? void 0 : _f._id }, { $set: { name, image, categoryId } }, { new: true }).populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        if (!category) {
            deleteUploadedFile((_g = req.filepaths) === null || _g === void 0 ? void 0 : _g[0]);
            res.status(400).json({
                error: 'Update category failed'
            });
        }
        res.status(200).json({
            success: 'Update category successfully',
            category
        });
    }
    catch (error) {
        deleteUploadedFile((_h = req.filepaths) === null || _h === void 0 ? void 0 : _h[0]);
        res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateCategory = updateCategory;
const removeCategory = async (req, res) => {
    var _a;
    try {
        const category = await category_model_1.default.findOneAndUpdate({ _id: (_a = req.category) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: true } }, { new: true }).populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        if (!category) {
            res.status(404).json({
                error: 'category not found'
            });
        }
        res.status(200).json({
            success: 'Remove category successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'category not found'
        });
    }
};
exports.removeCategory = removeCategory;
const restoreCategory = async (req, res) => {
    var _a;
    try {
        const category = await category_model_1.default.findOneAndUpdate({ _id: (_a = req.category) === null || _a === void 0 ? void 0 : _a._id }, { $set: { isDeleted: false } }, { new: true }).populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        if (!category) {
            res.status(404).json({
                error: 'category not found'
            });
        }
        res.status(200).json({
            success: 'Restore category successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'category not found'
        });
    }
};
exports.restoreCategory = restoreCategory;
const getActiveCategories = async (req, res) => {
    var _a, _b;
    const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    const sortBy = ((_b = req.query.sortBy) === null || _b === void 0 ? void 0 : _b.toString()) || '_id';
    const order = req.query.order && ['asc', 'desc'].includes(req.query.order.toString())
        ? req.query.order.toString()
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
    const filterArgs = {
        name: {
            $regex: search,
            $options: 'i'
        },
        isDeleted: false
    };
    if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId.toString();
        filterArgs.categoryId =
            req.query.categoryId === 'null' ? null : req.query.categoryId;
    }
    try {
        const count = await category_model_1.default.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = limit * (page - 1);
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list active categories successfully',
                filter,
                size,
                categories: []
            });
        }
        const categories = await category_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        res.status(200).json({
            success: 'Load list active categories successfully',
            filter,
            size,
            categories
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list active categories failed'
        });
    }
};
exports.getActiveCategories = getActiveCategories;
const getCategories = async (req, res) => {
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
    const filterArgs = {
        name: {
            $regex: search,
            $options: 'i'
        }
    };
    if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId;
        filterArgs.categoryId =
            req.query.categoryId === 'null' ? null : req.query.categoryId;
    }
    try {
        const count = await category_model_1.default.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = limit * (page - 1);
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list categories successfully',
                filter,
                size,
                categories: []
            });
        }
        const categories = await category_model_1.default.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' }
        });
        res.status(200).json({
            success: 'Load list categories successfully',
            filter,
            size,
            categories
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list categories failed'
        });
    }
};
exports.getCategories = getCategories;
const getCategoriesByStore = async (req, res) => {
    try {
        const categories = await category_model_1.default.find({
            _id: { $in: req.loadedCategories || [] },
            isDeleted: false
        }).populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId'
            }
        });
        res.status(200).json({
            success: 'Load list categories of store successfully',
            categories
        });
    }
    catch (error) {
        res.status(500).json({
            success: 'Load list categories of store failed'
        });
    }
};
exports.getCategoriesByStore = getCategoriesByStore;
