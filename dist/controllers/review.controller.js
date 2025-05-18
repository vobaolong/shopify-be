"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.updateRating = exports.deleteReviewByAdmin = exports.deleteReview = exports.updateReview = exports.createReview = exports.checkReview = exports.getReviewById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
const getReviewById = async (req, res, next) => {
    try {
        const review = await index_model_1.Review.findById(req.params.id);
        if (!review) {
            res.status(404).json({
                error: 'Review not found'
            });
            return;
        }
        req.review = review;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'Review not found'
        });
    }
};
exports.getReviewById = getReviewById;
const checkReview = async (req, res) => {
    var _a;
    try {
        const { orderId, productId } = req.body;
        const review = await index_model_1.Review.findOne({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            orderId,
            productId
        });
        if (!review) {
            res.status(404).json({
                error: 'Review not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Reviewed',
            review
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Review not found'
        });
    }
};
exports.checkReview = checkReview;
const createReview = async (req, res, next) => {
    var _a;
    try {
        const { content, rating, storeId, productId, orderId } = req.body;
        if (!rating || !storeId || !productId || !orderId) {
            res.status(400).json({
                error: 'All fields are required'
            });
            return;
        }
        const review = new index_model_1.Review({
            content,
            rating,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            storeId,
            productId,
            orderId
        });
        const savedReview = await review.save();
        if (next)
            next();
        res.status(200).json({
            success: 'Review successfully',
            review: savedReview
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createReview = createReview;
const updateReview = async (req, res, next) => {
    var _a, _b;
    try {
        const { content, rating } = req.body;
        if (!content || !rating) {
            res.status(400).json({
                error: 'All fields are required'
            });
            return;
        }
        const review = await index_model_1.Review.findOneAndUpdate({ _id: (_a = req.review) === null || _a === void 0 ? void 0 : _a._id, userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id }, { $set: { content, rating } }, { new: true });
        if (!review) {
            res.status(400).json({
                error: 'Update review failed'
            });
            return;
        }
        if (next)
            next();
        res.status(200).json({
            success: 'Update review successfully',
            review
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    var _a, _b, _c, _d;
    try {
        const result = await index_model_1.Review.deleteOne({
            _id: (_a = req.review) === null || _a === void 0 ? void 0 : _a._id,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        req.body = {
            ...req.body,
            productId: (_c = req.review) === null || _c === void 0 ? void 0 : _c.productId,
            storeId: (_d = req.review) === null || _d === void 0 ? void 0 : _d.storeId
        };
        if (next)
            next();
        res.status(200).json({
            success: 'Remove review successfully',
            review: result
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.deleteReview = deleteReview;
const deleteReviewByAdmin = async (req, res, next) => {
    var _a, _b, _c, _d, _e;
    try {
        const isAdmin = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin';
        const deleteCondition = {
            _id: (_b = req.review) === null || _b === void 0 ? void 0 : _b._id,
            ...(isAdmin ? {} : { userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id })
        };
        const result = await index_model_1.Review.deleteOne(deleteCondition);
        if (result.deletedCount === 0) {
            res.status(404).json({
                error: 'Review not found or you do not have permission to delete this review'
            });
            return;
        }
        req.body = {
            ...req.body,
            productId: (_d = req.review) === null || _d === void 0 ? void 0 : _d.productId,
            storeId: (_e = req.review) === null || _e === void 0 ? void 0 : _e.storeId
        };
        res.status(200).json({
            success: 'Remove review successfully',
            result
        });
        if (next)
            next();
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.deleteReviewByAdmin = deleteReviewByAdmin;
const updateRating = async (req, res) => {
    try {
        const { productId, storeId } = req.body;
        const productResults = await index_model_1.Review.aggregate([
            { $match: { rating: { $gt: 0 } } },
            {
                $group: {
                    _id: '$productId',
                    rating: { $sum: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const productRatingData = productResults.find((r) => r._id.equals(productId));
        const productRating = productRatingData
            ? (parseFloat(productRatingData.rating.toString()) /
                parseFloat(productRatingData.count.toString())).toFixed(1)
            : '4';
        try {
            await index_model_1.Product.findOneAndUpdate({ _id: productId }, { $set: { rating: productRating } });
        }
        catch (error) { }
        const storeResults = await index_model_1.Review.aggregate([
            {
                $group: {
                    _id: '$storeId',
                    rating: { $sum: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const storeRatingData = storeResults.find((r) => r._id.equals(storeId));
        const storeRating = storeRatingData
            ? (parseFloat(storeRatingData.rating.toString()) /
                parseFloat(storeRatingData.count.toString())).toFixed(1)
            : '4';
        try {
            await index_model_1.Store.findOneAndUpdate({ _id: storeId }, { $set: { rating: storeRating } });
        }
        catch (error) { }
    }
    catch (error) { }
};
exports.updateRating = updateRating;
const getReviews = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const sortBy = ((_a = req.query.sortBy) === null || _a === void 0 ? void 0 : _a.toString()) || 'createdAt';
        const order = ((_b = req.query.order) === null || _b === void 0 ? void 0 : _b.toString()) && ['asc', 'desc'].includes((_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString())
            ? (_d = req.query.order) === null || _d === void 0 ? void 0 : _d.toString()
            : 'desc';
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0
            ? parseInt(req.query.limit.toString())
            : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0
            ? parseInt(req.query.page.toString())
            : 1;
        const filter = {
            search: '',
            sortBy,
            order,
            limit,
            pageCurrent: page
        };
        const filterArgs = {};
        if (req.query.productId) {
            filter.productId = req.query.productId.toString();
            filterArgs.productId = req.query.productId.toString();
        }
        if (req.query.storeId) {
            filter.storeId = req.query.storeId.toString();
            filterArgs.storeId = req.query.storeId.toString();
        }
        if (req.query.userId) {
            filter.userId = req.query.userId.toString();
            filterArgs.userId = req.query.userId.toString();
        }
        if (req.query.rating && parseInt(req.query.rating.toString()) > 0 && parseInt(req.query.rating.toString()) < 6) {
            filter.rating = parseInt(req.query.rating.toString());
            filterArgs.rating = parseInt(req.query.rating.toString());
        }
        const count = await index_model_1.Review.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list reviews successfully',
                filter,
                size,
                reviews: []
            });
            return;
        }
        let skip = limit * (page - 1);
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        const reviews = await index_model_1.Review.find(filterArgs)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', '_id firstName lastName avatar')
            .populate('productId', '_id name listImages isActive isSelling')
            .populate('storeId', '_id name avatar isActive isOpen')
            .populate('orderId', '_id updatedAt');
        res.status(200).json({
            success: 'Load list reviews successfully',
            filter,
            size,
            reviews
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list reviews failed'
        });
    }
};
exports.getReviews = getReviews;
