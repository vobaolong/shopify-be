"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoint = exports.countOrders = exports.returnOrder = exports.getReturnOrders = exports.createReturnRequest = exports.updateQuantitySoldProduct = exports.updateStatusForStore = exports.updateStatusForUser = exports.readOrder = exports.checkOrderAuth = exports.removeAllCartItems = exports.removeCart = exports.createOrderItems = exports.createOrder = exports.getOrdersForAdmin = exports.getOrdersByStore = exports.getOrdersByUser = exports.getOrderItems = exports.getOrderItemById = exports.getOrderById = void 0;
const index_model_1 = require("../models/index.model");
const userHandler_1 = require("../helpers/userHandler");
const errorHandler_1 = require("../helpers/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const index_enum_1 = require("../enums/index.enum");
const ObjectId = mongoose_1.default.Types.ObjectId;
const getOrderById = async (req, res, next, id) => {
    try {
        const order = await index_model_1.Order.findById(id);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
        }
        req.order = order;
        next();
    }
    catch (error) {
        res.status(404).json({ error: 'Order not found' });
    }
};
exports.getOrderById = getOrderById;
const getOrderItemById = async (req, res, next, id) => {
    try {
        const orderItem = await index_model_1.OrderItem.findById(id);
        if (!orderItem) {
            res.status(404).json({ error: 'OrderItem not found' });
            return;
        }
        req.orderItem = orderItem;
        next();
    }
    catch (error) {
        res.status(404).json({ error: 'OrderItem not found' });
    }
};
exports.getOrderItemById = getOrderItemById;
const getOrderItems = async (req, res) => {
    var _a;
    try {
        const items = await index_model_1.OrderItem.find({ orderId: (_a = req.order) === null || _a === void 0 ? void 0 : _a._id })
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
                        address: 1,
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
        });
        res.status(200).json({
            success: 'Load list order items successfully',
            items
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list order items failed'
        });
    }
};
exports.getOrderItems = getOrderItems;
const setupPaginationAndFilter = (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    const regex = '.*' + search + '.*';
    const sortBy = ((_b = req.query.sortBy) === null || _b === void 0 ? void 0 : _b.toString()) || 'createdAt';
    const order = ['asc', 'desc'].includes(((_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString()) || '')
        ? ((_d = req.query.order) === null || _d === void 0 ? void 0 : _d.toString()) || 'desc'
        : 'desc';
    const limit = parseInt(((_e = req.query.limit) === null || _e === void 0 ? void 0 : _e.toString()) || '0') > 0
        ? parseInt(((_f = req.query.limit) === null || _f === void 0 ? void 0 : _f.toString()) || '0')
        : 6;
    const page = parseInt(((_g = req.query.page) === null || _g === void 0 ? void 0 : _g.toString()) || '0') > 0
        ? parseInt(((_h = req.query.page) === null || _h === void 0 ? void 0 : _h.toString()) || '0')
        : 1;
    const filter = {
        search,
        sortBy,
        order,
        limit,
        pageCurrent: page
    };
    const filterArgs = {
        tempId: { $regex: regex, $options: 'i' }
    };
    if (req.query.status) {
        filter.status = req.query.status.toString().split('|');
        filterArgs.status = {
            $in: req.query.status.toString().split('|')
        };
    }
    return { filter, filterArgs, limit, page };
};
const processOrderResults = async (res, result, filter, limit, page, additionalFilters = {}) => {
    const size = result.reduce((p, c) => p + c.count, 0);
    const pageCount = Math.ceil(size / limit);
    filter.pageCount = pageCount;
    let skip = limit * (page - 1);
    if (page > pageCount) {
        skip = (pageCount - 1) * limit;
    }
    if (size <= 0) {
        res.status(200).json({
            success: 'Load list orders successfully',
            filter,
            size,
            orders: []
        });
    }
    try {
        const orders = await index_model_1.Order.find({
            _id: { $in: result.map((r) => r._id) },
            ...additionalFilters
        })
            .sort({ [filter.sortBy]: filter.order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name address avatar isActive isOpen')
            .populate('commissionId');
        res.status(200).json({
            success: 'Load list orders successfully',
            filter,
            size,
            orders
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list orders failed'
        });
    }
};
const getOrdersByUser = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(400).json({
                error: 'User not found'
            });
            return;
        }
        const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req);
        filterArgs.userId = userId;
        const result = await index_model_1.Order.aggregate([
            {
                $addFields: {
                    tempId: { $toString: '$_id' }
                }
            },
            {
                $match: filterArgs
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 }
                }
            }
        ]);
        await processOrderResults(res, result, filter, limit, page);
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list orders by user failed'
        });
    }
};
exports.getOrdersByUser = getOrdersByUser;
const getOrdersByStore = async (req, res) => {
    var _a;
    try {
        const storeId = (_a = req.store) === null || _a === void 0 ? void 0 : _a._id;
        if (!storeId) {
            res.status(400).json({
                error: 'Store not found'
            });
        }
        const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req);
        filterArgs.storeId = storeId;
        const result = await index_model_1.Order.aggregate([
            {
                $addFields: {
                    tempId: { $toString: '$_id' }
                }
            },
            {
                $match: filterArgs
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 }
                }
            }
        ]);
        await processOrderResults(res, result, filter, limit, page);
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list orders by store failed'
        });
    }
};
exports.getOrdersByStore = getOrdersByStore;
const getOrdersForAdmin = async (req, res) => {
    try {
        const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req);
        const result = await index_model_1.Order.aggregate([
            {
                $addFields: {
                    tempId: { $toString: '$_id' }
                }
            },
            {
                $match: filterArgs
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 }
                }
            }
        ]);
        await processOrderResults(res, result, filter, limit, page);
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list orders failed'
        });
    }
};
exports.getOrdersForAdmin = getOrdersForAdmin;
const createOrder = async (req, res, next) => {
    var _a;
    if (!next)
        return;
    try {
        const cart = req.cart;
        if (!cart) {
            res.status(400).json({
                error: 'Cart not found'
            });
        }
        const { userId, storeId } = cart;
        const body = req.body;
        const { commissionId, address, phone, firstName, shippingFee, lastName, amountFromUser, amountFromStore, amountToStore, amountToPlatform, isPaidBefore = false } = body;
        if (!userId ||
            !storeId ||
            !commissionId ||
            !address ||
            !shippingFee ||
            !phone ||
            !firstName ||
            !lastName ||
            !amountFromUser ||
            !amountFromStore ||
            !amountToStore ||
            !amountToPlatform) {
            res.status(400).json({
                error: 'All fields are required'
            });
        }
        if (!userId.equals((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(400).json({
                error: 'This is not right cart!'
            });
        }
        const order = new index_model_1.Order({
            userId,
            storeId,
            firstName,
            lastName,
            phone,
            address,
            shippingFee,
            commissionId,
            amountFromUser,
            amountFromStore,
            amountToStore,
            amountToPlatform,
            isPaidBefore
        });
        const savedOrder = await order.save();
        req.order = savedOrder;
        next();
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createOrder = createOrder;
const createOrderItems = async (req, res, next) => {
    if (!next)
        return;
    try {
        if (!req.cart || !req.order) {
            res.status(400).json({
                error: 'Cart or order not found'
            });
        }
        const items = await index_model_1.CartItem.find({ cartId: req.cart._id });
        const newItems = items.map((item) => ({
            orderId: req.order._id,
            productId: item.productId,
            variantValueIds: item.variantValueIds,
            count: item.count,
            isDeleted: item.isDeleted
        }));
        await index_model_1.OrderItem.insertMany(newItems);
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Create order items failed'
        });
    }
};
exports.createOrderItems = createOrderItems;
const removeCart = async (req, res, next) => {
    var _a;
    if (!next)
        return;
    try {
        if (!req.cart) {
            res.status(400).json({
                error: 'Cart not found'
            });
        }
        const cart = await index_model_1.Cart.findOneAndUpdate({ _id: (_a = req.cart) === null || _a === void 0 ? void 0 : _a._id }, { isDeleted: true }, { new: true });
        if (!cart) {
            res.status(400).json({
                error: 'Remove cart failed'
            });
        }
        next();
    }
    catch (error) {
        res.status(400).json({
            error: 'Remove cart failed'
        });
    }
};
exports.removeCart = removeCart;
const removeAllCartItems = async (req, res) => {
    var _a;
    try {
        if (!req.cart || !req.user || !req.order) {
            res.status(400).json({
                error: 'Cart, user, or order not found'
            });
        }
        await index_model_1.CartItem.deleteMany({ cartId: (_a = req.cart) === null || _a === void 0 ? void 0 : _a._id });
        res.status(200).json({
            success: 'Create order successfully',
            order: req.order,
            user: (0, userHandler_1.cleanUserLess)(req.user)
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Remove all cart items failed'
        });
    }
};
exports.removeAllCartItems = removeAllCartItems;
const checkOrderAuth = async (req, res, next) => {
    var _a;
    if (!next)
        return;
    if (!req.user || !req.order) {
        res.status(401).json({
            error: 'User or order not found'
        });
    }
    if (req.user.role === 'admin') {
        next();
    }
    else if (req.user._id.equals(req.order.userId) ||
        ((_a = req.store) === null || _a === void 0 ? void 0 : _a._id.equals(req.order.storeId))) {
        next();
    }
    else {
        res.status(401).json({
            error: 'That is not right order!'
        });
    }
};
exports.checkOrderAuth = checkOrderAuth;
const readOrder = async (req, res) => {
    try {
        if (!req.order) {
            res.status(404).json({
                error: 'Order not found'
            });
        }
        const order = await index_model_1.Order.findOne({ _id: req.order._id })
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name address avatar isActive isOpen')
            .populate('commissionId');
        if (!order) {
            res.status(501).json({
                error: 'Not found!'
            });
        }
        res.status(200).json({
            success: 'read order successfully',
            order
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Not found!'
        });
    }
};
exports.readOrder = readOrder;
const updateStatusForUser = async (req, res, next) => {
    if (!next)
        return;
    try {
        if (!req.order) {
            res.status(404).json({
                error: 'Order not found'
            });
        }
        const currentStatus = req.order.status;
        if (currentStatus !== 'Not processed') {
            res.status(401).json({
                error: 'This order is already processed!'
            });
        }
        const time = new Date().getTime() - new Date(req.order.createdAt).getTime();
        const hours = Math.floor(time / 1000) / 3600;
        if (hours >= 1) {
            res.status(401).json({
                error: 'This order is not within the time allowed!'
            });
        }
        const status = req.body.status;
        if (status !== 'Cancelled') {
            res.status(401).json({
                error: 'This status value is invalid!'
            });
        }
        const order = await index_model_1.Order.findOneAndUpdate({ _id: req.order._id }, { $set: { status } }, { new: true })
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name address avatar isActive isOpen')
            .populate('commissionId');
        if (!order) {
            res.status(500).json({
                error: 'Not found!'
            });
        }
        if ((order === null || order === void 0 ? void 0 : order.status) === index_enum_1.OrderStatus.CANCELLED) {
            req.updatePoint = {
                userId: req.order.userId,
                storeId: req.order.storeId,
                point: -1
            };
            if (order.isPaidBefore === true) {
                req.createTransaction = {
                    userId: order.userId,
                    isUp: true,
                    amount: Number(order.amountFromUser)
                };
            }
            next();
            return;
        }
        res.status(200).json({
            success: 'update order successfully',
            order,
            user: req.user ? (0, userHandler_1.cleanUserLess)(req.user) : null
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'update order failed'
        });
    }
};
exports.updateStatusForUser = updateStatusForUser;
const updateStatusForStore = async (req, res, next) => {
    if (!next)
        return;
    try {
        if (!req.order) {
            res.status(404).json({
                error: 'Order not found'
            });
        }
        const currentStatus = req.order.status;
        const status = req.body.status;
        if (![
            index_enum_1.OrderStatus.NOT_PROCESSED,
            index_enum_1.OrderStatus.PROCESSING,
            index_enum_1.OrderStatus.SHIPPED,
            index_enum_1.OrderStatus.DELIVERED,
            index_enum_1.OrderStatus.CANCELLED
        ].includes(status)) {
            res.status(400).json({
                error: 'This status value is invalid!'
            });
        }
        if ((currentStatus === index_enum_1.OrderStatus.NOT_PROCESSED &&
            [index_enum_1.OrderStatus.DELIVERED, index_enum_1.OrderStatus.SHIPPED].includes(status)) ||
            (currentStatus === index_enum_1.OrderStatus.PROCESSING &&
                [index_enum_1.OrderStatus.NOT_PROCESSED, index_enum_1.OrderStatus.DELIVERED].includes(status)) ||
            (currentStatus === index_enum_1.OrderStatus.SHIPPED &&
                [index_enum_1.OrderStatus.NOT_PROCESSED, index_enum_1.OrderStatus.PROCESSING].includes(status)) ||
            (currentStatus === index_enum_1.OrderStatus.DELIVERED &&
                status !== index_enum_1.OrderStatus.DELIVERED)) {
            res.status(401).json({
                error: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.'
            });
        }
        const order = await index_model_1.Order.findOneAndUpdate({ _id: req.order._id }, { $set: { status } }, { new: true })
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name address avatar isActive isOpen')
            .populate('commissionId');
        if (!order) {
            res.status(500).json({
                error: 'Not found!'
            });
        }
        if (status === index_enum_1.OrderStatus.CANCELLED) {
            req.updatePoint = {
                userId: req.order.userId,
                storeId: req.order.storeId,
                point: -1
            };
            if ((order === null || order === void 0 ? void 0 : order.isPaidBefore) === true) {
                req.createTransaction = {
                    userId: order.userId,
                    isUp: true,
                    amount: Number(order.amountFromUser)
                };
            }
            next();
        }
        else if (status === 'Delivered') {
            req.updatePoint = {
                userId: req.order.userId,
                storeId: req.order.storeId,
                point: 1
            };
            req.createTransaction = {
                storeId: order === null || order === void 0 ? void 0 : order.storeId,
                isUp: (order === null || order === void 0 ? void 0 : order.isPaidBefore) === true,
                amount: (order === null || order === void 0 ? void 0 : order.isPaidBefore) === true
                    ? Number(order === null || order === void 0 ? void 0 : order.amountToStore)
                    : Number(order === null || order === void 0 ? void 0 : order.amountToPlatform)
            };
            next();
        }
        else {
            res.status(200).json({
                success: 'update order successfully',
                order
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'update order failed'
        });
    }
};
exports.updateStatusForStore = updateStatusForStore;
const updateQuantitySoldProduct = async (req, res, next) => {
    var _a;
    try {
        if (!req.order) {
            res.status(404).json({
                error: 'Order not found'
            });
        }
        const items = await index_model_1.OrderItem.find({ orderId: (_a = req.order) === null || _a === void 0 ? void 0 : _a._id });
        const productMap = new Map();
        items.forEach((item) => {
            const productId = item.productId.toString();
            const currentCount = productMap.get(productId) || 0;
            productMap.set(productId, currentCount + item.count);
        });
        const bulkOps = Array.from(productMap).map(([productId, count]) => ({
            updateOne: {
                filter: { _id: productId },
                update: {
                    $inc: {
                        quantity: -count,
                        sold: +count
                    }
                }
            }
        }));
        await index_model_1.Product.bulkWrite(bulkOps);
        res.status(200).json({
            success: 'Order successfully, update product successfully',
            order: req.order
        });
    }
    catch (error) {
        res.status(400).json({
            error: 'Could not update product quantity, sold'
        });
    }
};
exports.updateQuantitySoldProduct = updateQuantitySoldProduct;
const createReturnRequest = async (req, res) => {
    try {
        const reason = req.body.reason;
        const orderId = req.params.orderId;
        if (!reason) {
            res.status(400).json({
                error: 'Reason is required'
            });
        }
        const returnRequest = {
            reason,
            status: index_enum_1.ReturnStatus.PENDING,
            createdAt: new Date(),
            userId: new ObjectId(req.params.userId),
            _id: new ObjectId()
        };
        const order = await index_model_1.Order.findByIdAndUpdate(orderId, { $set: { returnRequests: returnRequest } }, { new: true });
        if (!order) {
            res.status(500).json({
                error: 'Could not create return request'
            });
        }
        res.status(200).json({
            success: 'Return request created successfully',
            order
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Could not create return request'
        });
    }
};
exports.createReturnRequest = createReturnRequest;
const getReturnOrders = async (req, res) => {
    var _a;
    try {
        if (!req.store) {
            res.status(400).json({
                error: 'Store not found'
            });
        }
        const storeId = (_a = req.store) === null || _a === void 0 ? void 0 : _a._id;
        const { filter, filterArgs, limit, page } = setupPaginationAndFilter(req);
        filterArgs.storeId = storeId;
        filterArgs.returnRequests = { $exists: true, $ne: [] };
        if (req.query.status) {
            filter.status = req.query.status;
            filterArgs['returnRequests.status'] = {
                $in: req.query.status
                    .toString()
                    .split(',')
                    .map((status) => status)
            };
        }
        const result = await index_model_1.Order.aggregate([
            {
                $addFields: {
                    tempId: { $toString: '$_id' }
                }
            },
            {
                $match: filterArgs
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 }
                }
            }
        ]);
        return await processOrderResults(res, result, filter, limit, page);
    }
    catch (error) {
        console.error('Error in getReturnOrders:', error);
        res.status(500).json({
            error: 'Load list orders by store failed'
        });
    }
};
exports.getReturnOrders = getReturnOrders;
const handleApprovedReturn = async (order) => {
    try {
        const items = await index_model_1.OrderItem.find({ orderId: order._id });
        const productMap = new Map();
        items.forEach((item) => {
            const productId = item.productId.toString();
            const currentCount = productMap.get(productId) || 0;
            productMap.set(productId, currentCount + item.count);
        });
        const bulkOps = Array.from(productMap).map(([productId, count]) => ({
            updateOne: {
                filter: { _id: productId },
                update: {
                    $inc: {
                        quantity: +count,
                        sold: -count
                    }
                }
            }
        }));
        await index_model_1.Product.bulkWrite(bulkOps);
        const sum = parseFloat(order.amountToStore.toString()) +
            parseFloat(order.amountFromStore.toString());
        const transaction1 = new index_model_1.Transaction({
            storeId: order.storeId,
            isUp: false,
            amount: sum
        });
        await index_model_1.Store.findOneAndUpdate({ _id: order.storeId }, {
            $inc: {
                point: -1,
                e_wallet: -sum
            }
        });
        const transaction2 = new index_model_1.Transaction({
            userId: order.userId,
            isUp: true,
            amount: order.amountFromUser
        });
        await index_model_1.User.findByIdAndUpdate({ _id: order.userId }, {
            $inc: { point: -1, e_wallet: +order.amountFromUser }
        });
        await Promise.all([transaction1.save(), transaction2.save()]);
        console.log('Products and wallets updated successfully');
    }
    catch (error) {
        console.error('Error in handleApprovedReturn:', error);
        throw new Error('Could not handle approved return');
    }
};
const returnOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const status = req.body.status;
        if (!status) {
            res.status(400).json({
                error: 'Status is required'
            });
        }
        const order = await index_model_1.Order.findOneAndUpdate({ _id: orderId }, { $set: { 'returnRequests.status': status } }, { new: true });
        if (!order) {
            res.status(500).json({
                error: 'Could not update return request'
            });
        }
        if (status === index_enum_1.ReturnStatus.APPROVED) {
            try {
                await handleApprovedReturn(order);
                order.status = index_enum_1.OrderStatus.RETURNED;
                await (order === null || order === void 0 ? void 0 : order.save());
                res.status(200).json({
                    success: 'Return request approved successfully',
                    order
                });
            }
            catch (err) {
                res.status(500).json({
                    error: 'Failed to handle approved return'
                });
            }
        }
        else {
            res.status(200).json({
                success: 'Return request updated successfully',
                order
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Could not update return request'
        });
    }
};
exports.returnOrder = returnOrder;
const countOrders = async (req, res) => {
    try {
        const filterArgs = {};
        if (req.query.status) {
            filterArgs.status = {
                $in: req.query.status.toString().split('|')
            };
        }
        if (req.query.userId)
            filterArgs.userId = req.query.userId;
        if (req.query.storeId)
            filterArgs.storeId = req.query.storeId;
        const count = await index_model_1.Order.countDocuments(filterArgs);
        res.status(200).json({
            success: 'Count order successfully',
            count
        });
    }
    catch (error) {
        res.status(200).json({
            success: 'Count order successfully',
            count: 0
        });
    }
};
exports.countOrders = countOrders;
const updatePoint = async (req, res, next) => {
    if (!next)
        return;
    try {
        if (!req.updatePoint) {
            next();
            return;
        }
        const { userId, storeId, point } = req.updatePoint;
        await Promise.all([
            index_model_1.User.findOneAndUpdate({ _id: userId }, { $inc: { point: +point } }),
            index_model_1.Store.findOneAndUpdate({ _id: storeId }, { $inc: { point: +point } })
        ]);
        res.status(200).json({
            success: 'Update point successfully'
        });
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Update point failed'
        });
        next();
    }
};
exports.updatePoint = updatePoint;
