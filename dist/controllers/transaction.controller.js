"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.createTransaction = exports.updateEWallet = exports.requestTransaction = exports.readTransaction = exports.getTransactionById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
const getTransactionById = async (req, res, next, id) => {
    try {
        const transaction = await index_model_1.Transaction.findById(id);
        if (!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }
        req.transaction = transaction;
        next();
    }
    catch (error) {
        res.status(404).json({ error: 'Transaction not found' });
    }
};
exports.getTransactionById = getTransactionById;
const readTransaction = async (req, res) => {
    var _a;
    try {
        const transaction = await index_model_1.Transaction.findOne({ _id: (_a = req.transaction) === null || _a === void 0 ? void 0 : _a._id })
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name avatar isOpen isActive')
            .exec();
        if (!transaction) {
            res.status(500).json({ error: 'Transaction not found' });
            return;
        }
        res.status(200).json({
            success: 'Read transaction successfully',
            transaction
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Transaction not found' });
    }
};
exports.readTransaction = readTransaction;
const requestTransaction = async (req, res, next) => {
    const { isUp, code, amount } = req.body;
    if ((!req.store && !req.user) ||
        (isUp !== 'true' && isUp !== 'false') ||
        !amount) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    req.createTransaction = {
        isUp: isUp === 'true',
        code,
        amount: Number(amount)
    };
    if (!req.store && req.user) {
        req.createTransaction.userId = req.user._id;
    }
    else if (req.store) {
        req.createTransaction.storeId = req.store._id;
    }
    if (next)
        next();
};
exports.requestTransaction = requestTransaction;
const updateEWallet = async (req, res, next) => {
    if (!req.createTransaction) {
        res.status(400).json({ error: 'Transaction data missing' });
        return;
    }
    const { userId, storeId, isUp, amount } = req.createTransaction;
    if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
        res.status(400).json({ error: 'All fields are required!' });
        return;
    }
    const updateAmount = isUp ? +amount : -amount;
    const updateQuery = { $inc: { e_wallet: updateAmount } };
    try {
        if (userId) {
            const user = await index_model_1.User.findOneAndUpdate({ _id: userId }, updateQuery, {
                new: true
            });
            if (!user) {
                res.status(500).json({ error: 'User not found' });
            }
        }
        else if (storeId) {
            const store = await index_model_1.Store.findOneAndUpdate({ _id: storeId }, updateQuery, { new: true });
            if (!store) {
                res.status(500).json({ error: 'Store not found' });
            }
        }
        if (next)
            next();
    }
    catch (error) {
        res.status(500).json({
            error: userId
                ? 'Update user e_wallet failed'
                : 'Update store e_wallet failed'
        });
    }
};
exports.updateEWallet = updateEWallet;
const createTransaction = async (req, res, next) => {
    if (!req.createTransaction) {
        res.status(400).json({ error: 'Transaction data missing' });
        return;
    }
    const { userId, storeId, isUp, code, amount } = req.createTransaction;
    if ((!userId && !storeId) || typeof isUp !== 'boolean' || !amount) {
        res.status(400).json({ error: 'All fields are required!' });
        return;
    }
    try {
        const transaction = new index_model_1.Transaction({
            userId,
            storeId,
            isUp,
            code,
            amount
        });
        await transaction.save();
        if (next)
            next();
    }
    catch (error) {
        res.status(500).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const sortBy = ((_a = req.query.sortBy) === null || _a === void 0 ? void 0 : _a.toString()) || 'createdAt';
        const order = ['asc', 'desc'].includes(((_b = req.query.order) === null || _b === void 0 ? void 0 : _b.toString()) || '')
            ? (_c = req.query.order) === null || _c === void 0 ? void 0 : _c.toString()
            : 'desc';
        const limit = Math.max(parseInt(((_d = req.query.limit) === null || _d === void 0 ? void 0 : _d.toString()) || '6'), 1);
        const page = Math.max(parseInt(((_e = req.query.page) === null || _e === void 0 ? void 0 : _e.toString()) || '1'), 1);
        const filter = {
            search: '',
            sortBy: sortBy || 'createdAt',
            order: order || 'desc',
            limit,
            pageCurrent: page
        };
        if (!req.store && !req.user) {
            res.status(404).json({ error: 'List transactions not found' });
        }
        let filterArgs = {};
        if (!req.store && req.user && req.user.role === 'user') {
            filterArgs = { userId: req.user._id };
        }
        else if (req.store) {
            filterArgs = { storeId: req.store._id };
        }
        const count = await index_model_1.Transaction.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit) || 1;
        filter.pageCount = pageCount;
        const skip = limit * (Math.min(page, pageCount) - 1);
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list transactions successfully',
                filter,
                size,
                transactions: []
            });
        }
        const transactions = await index_model_1.Transaction.find(filterArgs)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', '_id firstName lastName avatar')
            .populate('storeId', '_id name avatar isActive isOpen')
            .exec();
        res.status(200).json({
            success: 'Load list transactions successfully',
            filter,
            size,
            transactions
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Load list transactions failed' });
    }
};
exports.getTransactions = getTransactions;
