"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCartItems = exports.removeCart = exports.removeCartItem = exports.updateCartItem = exports.getListCartItem = exports.getListCarts = exports.createCartItem = exports.createCart = exports.getCartItemById = exports.getCartById = void 0;
const index_model_1 = require("../models/index.model");
const userHandler_1 = require("../helpers/userHandler");
const errorHandler_1 = require("../helpers/errorHandler");
const getCartById = async (req, res, next, id) => {
    try {
        const cart = await index_model_1.Cart.findById(id).exec();
        if (!cart) {
            res.status(404).json({
                error: 'Cart not found'
            });
            return;
        }
        req.cart = cart;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'Cart not found'
        });
    }
};
exports.getCartById = getCartById;
const getCartItemById = async (req, res, next, id) => {
    try {
        const cartItem = await index_model_1.CartItem.findById(id).exec();
        if (!cartItem) {
            res.status(404).json({
                error: 'CartItem not found'
            });
            return;
        }
        req.cartItem = cartItem;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'CartItem not found'
        });
    }
};
exports.getCartItemById = getCartItemById;
const createCart = async (req, res, next) => {
    var _a;
    try {
        const { storeId } = req.body;
        if (!storeId) {
            res.status(400).json({
                error: 'Store not found'
            });
            return;
        }
        const cart = await index_model_1.Cart.findOneAndUpdate({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, storeId }, { isDeleted: false }, { upsert: true, new: true }).exec();
        if (!cart) {
            res.status(400).json({
                error: 'Create cart failed'
            });
            return;
        }
        req.cart = cart;
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Create cart failed'
        });
    }
};
exports.createCart = createCart;
const createCartItem = async (req, res, next) => {
    var _a, _b;
    try {
        const { productId, variantValueIds, count } = req.body;
        if (!productId || !count) {
            const cartId = (_a = req.cartItem) === null || _a === void 0 ? void 0 : _a.cartId;
            const itemCount = await index_model_1.CartItem.countDocuments({ cartId }).exec();
            if (itemCount <= 0) {
                req.cartId = cartId;
                next();
                return;
            }
            else {
                res.status(400).json({
                    error: 'All fields are required'
                });
                return;
            }
        }
        let variantValueIdsArray = [];
        if (variantValueIds) {
            variantValueIdsArray = variantValueIds.split('|');
        }
        const item = await index_model_1.CartItem.findOneAndUpdate({
            productId,
            variantValueIds: variantValueIdsArray,
            cartId: (_b = req.cart) === null || _b === void 0 ? void 0 : _b._id
        }, { $inc: { count: +count } }, { upsert: true, new: true })
            .populate({
            path: 'productId',
            populate: [
                {
                    path: 'categoryId',
                    populate: {
                        path: 'categoryId',
                        populate: { path: 'categoryId' }
                    }
                },
                {
                    path: 'storeId',
                    select: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        isActive: 1,
                        isOpen: 1
                    }
                }
            ]
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .exec();
        if (!item) {
            res.status(400).json({
                error: 'Create cart item failed'
            });
            return;
        }
        res.status(200).json({
            success: 'Add to cart successfully',
            item,
            user: (0, userHandler_1.cleanUserLess)(req.user)
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createCartItem = createCartItem;
const getListCarts = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const limit = req.query.limit && parseInt(req.query.limit.toString()) > 0
            ? parseInt(req.query.limit.toString())
            : 6;
        const page = req.query.page && parseInt(req.query.page.toString()) > 0
            ? parseInt(req.query.page.toString())
            : 1;
        let skip = (page - 1) * limit;
        const filter = {
            limit,
            pageCurrent: page
        };
        const count = await index_model_1.Cart.countDocuments({ userId, isDeleted: false }).exec();
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount && pageCount > 0) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list carts successfully',
                filter,
                size,
                carts: []
            });
            return;
        }
        const carts = await index_model_1.Cart.find({ userId, isDeleted: false })
            .populate('storeId', '_id name avatar isActive isOpen address')
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        res.status(200).json({
            success: 'Load list carts successfully',
            filter,
            size,
            carts
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list carts failed'
        });
    }
};
exports.getListCarts = getListCarts;
const getListCartItem = async (req, res) => {
    var _a;
    try {
        const items = await index_model_1.CartItem.find({ cartId: (_a = req.cart) === null || _a === void 0 ? void 0 : _a._id })
            .populate({
            path: 'productId',
            populate: [
                {
                    path: 'categoryId',
                    populate: {
                        path: 'categoryId',
                        populate: { path: 'categoryId' }
                    }
                },
                {
                    path: 'storeId',
                    select: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        isActive: 1,
                        isOpen: 1
                    }
                }
            ]
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .exec();
        res.status(200).json({
            success: 'Load list cart items successfully',
            items
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list cart items failed'
        });
    }
};
exports.getListCartItem = getListCartItem;
const updateCartItem = async (req, res) => {
    try {
        const { count } = req.body;
        const item = await index_model_1.CartItem.findOneAndUpdate({ _id: req.cartItem._id }, { $set: { count } }, { new: true })
            .populate({
            path: 'productId',
            populate: [
                {
                    path: 'categoryId',
                    populate: {
                        path: 'categoryId',
                        populate: { path: 'categoryId' }
                    }
                },
                {
                    path: 'storeId',
                    select: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                        isActive: 1,
                        isOpen: 1
                    }
                }
            ]
        })
            .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
        })
            .exec();
        res.status(200).json({
            success: 'Update cart item successfully',
            item,
            user: (0, userHandler_1.cleanUserLess)(req.user)
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Update cart item failed'
        });
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (req, res, next) => {
    try {
        await index_model_1.CartItem.deleteOne({ _id: req.cartItem._id }).exec();
        const cartId = req.cartItem.cartId;
        const count = await index_model_1.CartItem.countDocuments({ cartId }).exec();
        if (count <= 0) {
            ;
            req.cartId = cartId;
            next();
            return;
        }
        else {
            res.status(200).json({
                success: 'Remove cart item successfully',
                user: (0, userHandler_1.cleanUserLess)(req.user)
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Remove cart item failed'
        });
    }
};
exports.removeCartItem = removeCartItem;
const removeCart = async (req, res) => {
    try {
        const cart = await index_model_1.Cart.findOneAndUpdate({ _id: req.cartId }, { isDeleted: true }, { new: true }).exec();
        if (!cart) {
            res.status(400).json({
                error: 'Remove cart failed'
            });
            return;
        }
        res.status(200).json({
            success: 'Remove cart successfully',
            cart,
            user: (0, userHandler_1.cleanUserLess)(req.user)
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Remove cart failed'
        });
    }
};
exports.removeCart = removeCart;
const countCartItems = async (req, res) => {
    try {
        const result = await index_model_1.CartItem.aggregate([
            {
                $lookup: {
                    from: 'carts',
                    localField: 'cartId',
                    foreignField: '_id',
                    as: 'carts'
                }
            },
            {
                $group: {
                    _id: '$carts.userId',
                    count: {
                        $sum: 1
                    }
                }
            }
        ]).exec();
        const foundResult = result.find((r) => r._id && r._id[0] && r._id[0].equals(req.user._id));
        const count = foundResult ? foundResult.count : 0;
        res.status(200).json({
            success: 'Count cart items successfully',
            count
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Count cart items failed'
        });
    }
};
exports.countCartItems = countCartItems;
