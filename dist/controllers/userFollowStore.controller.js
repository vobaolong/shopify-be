"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowedStores = exports.getStoreFollowerCount = exports.checkFollowingStore = exports.unfollowStore = exports.followStore = void 0;
const index_model_1 = require("../models/index.model");
const storeHandler_1 = require("../helpers/storeHandler");
const followStore = async (req, res) => {
    try {
        const userId = req.user._id;
        const storeId = req.store._id;
        const follow = await index_model_1.UserFollowStore.findOneAndUpdate({ userId, storeId }, { isDeleted: false }, { upsert: true, new: true });
        if (!follow) {
            return res.status(400).json({
                error: 'Follow is already exists'
            });
        }
        const store = await index_model_1.Store.findOne({ _id: storeId })
            .select('-e_wallet')
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee');
        if (!store) {
            return res.status(404).json({
                error: 'Store not found'
            });
        }
        return res.status(200).json({
            success: 'Follow store successfully',
            store: (0, storeHandler_1.cleanStore)(store)
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Follow store failed'
        });
    }
};
exports.followStore = followStore;
const unfollowStore = async (req, res) => {
    try {
        const userId = req.user._id;
        const storeId = req.store._id;
        const follow = await index_model_1.UserFollowStore.findOneAndUpdate({ userId, storeId }, { isDeleted: true }, { new: true });
        if (!follow) {
            return res.status(400).json({
                error: 'Unfollow is already exists'
            });
        }
        const store = await index_model_1.Store.findOne({ _id: storeId })
            .select('-e_wallet')
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee');
        if (!store) {
            return res.status(404).json({
                error: 'Store not found'
            });
        }
        return res.status(200).json({
            success: 'Unfollow store successfully',
            store: (0, storeHandler_1.cleanStore)(store)
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Unfollow store failed'
        });
    }
};
exports.unfollowStore = unfollowStore;
const checkFollowingStore = async (req, res) => {
    try {
        const userId = req.user._id;
        const storeId = req.store._id;
        const follow = await index_model_1.UserFollowStore.findOne({
            userId,
            storeId,
            isDeleted: false
        });
        if (!follow) {
            return res.status(200).json({
                error: 'Following store not found'
            });
        }
        return res.status(200).json({
            success: 'Following store'
        });
    }
    catch (error) {
        return res.status(404).json({
            error: 'Following store not found'
        });
    }
};
exports.checkFollowingStore = checkFollowingStore;
const getStoreFollowerCount = async (req, res) => {
    try {
        const storeId = req.store._id;
        const count = await index_model_1.UserFollowStore.countDocuments({
            storeId,
            isDeleted: false
        });
        return res.status(200).json({
            success: 'get store number of followers successfully',
            count
        });
    }
    catch (error) {
        return res.status(404).json({
            error: 'Following stores not found'
        });
    }
};
exports.getStoreFollowerCount = getStoreFollowerCount;
const getFollowedStores = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = req.query.limit && typeof req.query.limit === 'string' && parseInt(req.query.limit) > 0
            ? parseInt(req.query.limit)
            : 6;
        const page = req.query.page && typeof req.query.page === 'string' && parseInt(req.query.page) > 0
            ? parseInt(req.query.page)
            : 1;
        let skip = (page - 1) * limit;
        const filter = {
            limit,
            pageCurrent: page
        };
        const follows = await index_model_1.UserFollowStore.find({ userId, isDeleted: false });
        const storeIds = follows.map((follow) => follow.storeId);
        const count = await index_model_1.Store.countDocuments({
            _id: { $in: storeIds },
            isActive: true
        });
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            return res.status(200).json({
                success: 'Load list following stores successfully',
                filter,
                size,
                stores: []
            });
        }
        const stores = await index_model_1.Store.find({ _id: { $in: storeIds }, isActive: true })
            .select('-e_wallet')
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee');
        const cleanStores = stores.map((store) => (0, storeHandler_1.cleanStore)(store));
        return res.status(200).json({
            success: 'Load list following stores successfully',
            filter,
            size,
            stores: cleanStores
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Load list followings stores failed'
        });
    }
};
exports.getFollowedStores = getFollowedStores;
