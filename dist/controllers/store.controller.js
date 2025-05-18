"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoresForAdmin = exports.getStoresByUser = exports.getStores = exports.getStoreCommissions = exports.removeStaff = exports.cancelStaff = exports.addStaff = exports.getStaffs = exports.removeFeaturedImage = exports.updateFeatureImage = exports.addFeatureImage = exports.getListFeatureImages = exports.updateCover = exports.updateAvatar = exports.openStore = exports.updateCommission = exports.getCommission = exports.activeStore = exports.updateStore = exports.createStore = exports.getStoreProfile = exports.getStore = exports.getStoreById = void 0;
const index_model_1 = require("../models/index.model");
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../helpers/errorHandler");
const userHandler_1 = require("../helpers/userHandler");
const storeHandler_1 = require("../helpers/storeHandler");
function safeCleanUser(user) {
    return (0, userHandler_1.cleanUser)(user);
}
function safeCleanUserLess(user) {
    return (0, userHandler_1.cleanUserLess)(user);
}
// GET STORE BY ID
const getStoreById = async (req, res, next, id) => {
    try {
        const store = await index_model_1.Store.findById(id).exec();
        if (!store) {
            res.status(404).json({
                error: 'Store not found'
            });
            return;
        }
        req.store = store;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'Store not found'
        });
    }
};
exports.getStoreById = getStoreById;
// GET STORE
const getStore = async (req, res) => {
    try {
        const store = await index_model_1.Store.findOne({ _id: req.store._id })
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            res.status(404).json({
                error: 'Store not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Get store successfully',
            store: (0, storeHandler_1.cleanStore)(store)
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Store not found'
        });
    }
};
exports.getStore = getStore;
// GET STORE PROFILE
const getStoreProfile = async (req, res) => {
    try {
        const store = await index_model_1.Store.findOne({ _id: req.store._id })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            res.status(404).json({
                error: 'Stores not found'
            });
            return;
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        res.status(200).json({
            success: 'Get store profile successfully',
            store
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'Store not found'
        });
    }
};
exports.getStoreProfile = getStoreProfile;
// CREATE STORE
const createStore = async (req, res) => {
    try {
        const { name, bio, address, commissionId, addressDetail } = req.fields || {};
        const avatar = req.filepaths ? req.filepaths[0] : undefined;
        const cover = req.filepaths ? req.filepaths[1] : undefined;
        if (!name || !bio || !address || !commissionId || !avatar || !cover) {
            try {
                if (req.filepaths) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                    fs_1.default.unlinkSync('public' + req.filepaths[1]);
                }
            }
            catch { }
            res.status(400).json({
                error: 'All fields are required'
            });
            return;
        }
        const { province, provinceName, district, districtName, ward, wardName, street } = JSON.parse(addressDetail);
        const addressObj = new index_model_1.Address({
            provinceID: province,
            provinceName,
            districtID: district,
            districtName,
            wardID: ward,
            wardName,
            address: street
        });
        await addressObj.save();
        const store = new index_model_1.Store({
            name,
            bio,
            address: addressObj,
            commissionId,
            avatar,
            cover,
            ownerId: req.user._id
        });
        const savedStore = await store.save();
        const adminId = process.env.ADMIN_ID;
        const adminNotification = new index_model_1.Notification({
            message: `Có cửa hàng mới: ${store.name}`,
            userId: adminId,
            isRead: false,
            objectId: savedStore._id
        });
        await adminNotification.save();
        res.status(200).json({
            success: 'Creating store successfully',
            storeId: savedStore._id
        });
    }
    catch (error) {
        try {
            if (req.filepaths) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
                fs_1.default.unlinkSync('public' + req.filepaths[1]);
            }
        }
        catch { }
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.createStore = createStore;
// UPDATE STORE
const updateStore = async (req, res) => {
    try {
        const { name, bio, address, addressDetail } = req.body;
        let addressId = null;
        if (addressDetail._id) {
            await index_model_1.Address.findByIdAndUpdate(addressDetail._id, {
                provinceID: addressDetail.province,
                provinceName: addressDetail.provinceName,
                districtID: addressDetail.district,
                districtName: addressDetail.districtName,
                wardID: addressDetail.ward,
                wardName: addressDetail.wardName,
                address: addressDetail.street
            });
            addressId = addressDetail._id;
        }
        else {
            const newAddress = new index_model_1.Address({
                provinceID: addressDetail.province,
                provinceName: addressDetail.provinceName,
                districtID: addressDetail.district,
                districtName: addressDetail.districtName,
                wardID: addressDetail.ward,
                wardName: addressDetail.wardName,
                address: addressDetail.street
            });
            const savedAddress = await newAddress.save();
            addressId = savedAddress._id;
        }
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { name, bio, address: addressId } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee');
        if (!store) {
            res.status(500).json({
                error: 'Store not found'
            });
            return;
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        res.status(200).json({
            success: 'Update store successfully',
            store
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateStore = updateStore;
// ACTIVE STORE
const activeStore = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { isActive } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee');
        if (!store) {
            res.status(500).json({
                error: 'Store not found'
            });
            return;
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        // Pass to activeAllProducts middleware
        req.store = store;
        next();
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.activeStore = activeStore;
// GET COMMISSION
const getCommission = async (req, res) => {
    try {
        const store = await index_model_1.Store.findOne({ _id: req.store._id })
            .populate('commissionId')
            .exec();
        if (!store) {
            res.status(500).json({
                error: 'Store not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Get commission successfully',
            commission: store.commissionId
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Store not found'
        });
    }
};
exports.getCommission = getCommission;
// UPDATE COMMISSION
const updateCommission = async (req, res) => {
    try {
        const { commissionId } = req.body;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { commissionId } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            res.status(500).json({
                error: 'Store not found'
            });
            return;
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        res.status(200).json({
            success: 'Update store commission successfully',
            store
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateCommission = updateCommission;
// OPEN STORE
const openStore = async (req, res) => {
    try {
        const { isOpen } = req.body;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { isOpen } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            res.status(404).json({
                error: 'Store not found'
            });
            return;
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        res.status(200).json({
            success: 'Update store status successfully',
            store
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.openStore = openStore;
// UPDATE AVATAR
const updateAvatar = async (req, res) => {
    try {
        const oldpath = req.store.avatar;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { avatar: req.filepaths ? req.filepaths[0] : '' } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            try {
                if (req.filepaths) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                }
            }
            catch { }
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        if (oldpath && oldpath !== '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Update avatar successfully',
            store
        });
    }
    catch (error) {
        try {
            if (req.filepaths) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        return res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateAvatar = updateAvatar;
// UPDATE COVER
const updateCover = async (req, res) => {
    try {
        const oldpath = req.store.cover;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { cover: req.filepaths ? req.filepaths[0] : '' } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            try {
                if (req.filepaths) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                }
            }
            catch { }
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        if (oldpath && oldpath !== '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Update cover successfully',
            store
        });
    }
    catch (error) {
        try {
            if (req.filepaths) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        return res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateCover = updateCover;
// GET LIST FEATURE IMAGES
const getListFeatureImages = (req, res) => {
    const featured_images = req.store.featured_images;
    return res.status(200).json({
        success: 'load cover successfully',
        featured_images
    });
};
exports.getListFeatureImages = getListFeatureImages;
// ADD FEATURE IMAGE
const addFeatureImage = async (req, res) => {
    try {
        const featured_images = req.store.featured_images;
        const index = featured_images.length;
        if (index >= 7) {
            try {
                if (req.filepaths) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                }
            }
            catch { }
            return res.status(400).json({
                error: 'Limit is 7 images'
            });
        }
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $push: { featured_images: req.filepaths ? req.filepaths[0] : '' } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            try {
                if (req.filepaths) {
                    fs_1.default.unlinkSync('public' + req.filepaths[0]);
                }
            }
            catch { }
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Add featured image successfully',
            store
        });
    }
    catch (error) {
        try {
            if (req.filepaths) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        return res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.addFeatureImage = addFeatureImage;
// UPDATE FEATURE IMAGE
const updateFeatureImage = async (req, res) => {
    try {
        const index = req.query.index ? parseInt(req.query.index) : -1;
        const image = req.filepaths ? req.filepaths[0] : undefined;
        if (index === -1 || !image) {
            return res.status(400).json({
                error: 'Update feature image failed'
            });
        }
        const featured_images = req.store.featured_images;
        if (index >= featured_images.length) {
            try {
                fs_1.default.unlinkSync('public' + image);
            }
            catch { }
            return res.status(404).json({
                error: 'Feature image not found'
            });
        }
        const oldpath = featured_images[index];
        featured_images[index] = image;
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { featured_images } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            try {
                fs_1.default.unlinkSync('public' + image);
            }
            catch { }
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        if (oldpath && oldpath !== '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Update feature image successfully',
            store
        });
    }
    catch (error) {
        try {
            if (req.filepaths) {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
        }
        catch { }
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateFeatureImage = updateFeatureImage;
// REMOVE FEATURED IMAGE
const removeFeaturedImage = async (req, res) => {
    try {
        const index = req.query.index ? parseInt(req.query.index) : -1;
        if (index === -1) {
            return res.status(400).json({
                error: 'Update feature image failed'
            });
        }
        const featured_images = req.store.featured_images;
        if (index >= featured_images.length) {
            return res.status(404).json({
                error: 'Feature image not found'
            });
        }
        try {
            fs_1.default.unlinkSync('public' + featured_images[index]);
        }
        catch { }
        featured_images.splice(index, 1);
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { featured_images } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        // Cast to IUser before using cleanUser
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff, index) => {
            store.staffIds[index] = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Remove featured image successfully',
            store
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.removeFeaturedImage = removeFeaturedImage;
// GET LIST STAFF
const getStaffs = async (req, res) => {
    try {
        const store = await index_model_1.Store.findOne({ _id: req.store._id })
            .select('staffIds')
            .populate('staffIds', '_id firstName lastName slug email phone id_card point avatar cover')
            .exec();
        if (!store) {
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        // Create a properly typed copy of the populated staff data
        const staffWithMaskedInfo = store.staffIds.map((staff) => {
            const staffObj = staff;
            // Create a copy to avoid modifying the original
            const maskedStaff = {
                ...(staffObj.toObject ? staffObj.toObject() : staffObj)
            };
            if (maskedStaff.email)
                maskedStaff.email = maskedStaff.email.slice(0, 6) + '******';
            if (maskedStaff.phone)
                maskedStaff.phone = '*******' + maskedStaff.phone.slice(-3);
            if (maskedStaff.id_card)
                maskedStaff.id_card = maskedStaff.id_card.slice(0, 3) + '******';
            return maskedStaff;
        });
        return res.status(200).json({
            success: 'Load list staff successfully',
            staff: staffWithMaskedInfo
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Load list staff failed'
        });
    }
};
exports.getStaffs = getStaffs;
// ADD STAFF
const addStaff = async (req, res) => {
    try {
        const { staff } = req.body;
        const staffIds = req.store.staffIds;
        if (staff.length > 6 - staffIds.length) {
            return res.status(400).json({
                error: 'The limit is 6 staff'
            });
        }
        const count = await index_model_1.User.countDocuments({
            _id: { $in: staff },
            role: 'user'
        });
        if (count !== staff.length) {
            return res.status(400).json({
                error: 'User is invalid'
            });
        }
        // Add unique staff IDs
        const newStaffIds = [...staffIds];
        for (const staffId of staff) {
            if (!newStaffIds.includes(staffId)) {
                newStaffIds.push(staffId);
            }
        }
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { staffIds: newStaffIds } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff) => {
            staff = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Add staff successfully',
            store
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.addStaff = addStaff;
// CANCEL STAFF
const cancelStaff = async (req, res) => {
    try {
        const userId = req.user._id;
        const staffIds = [...req.store.staffIds];
        const index = staffIds.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({
                error: 'User is not staff'
            });
        }
        staffIds.splice(index, 1);
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { staffIds } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        return res.status(200).json({
            success: 'Cancel staff successfully'
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.cancelStaff = cancelStaff;
// REMOVE STAFF
const removeStaff = async (req, res) => {
    try {
        const { staff } = req.body;
        if (!staff) {
            return res.status(400).json({
                error: 'Staff is required'
            });
        }
        const staffIds = [...req.store.staffIds];
        const index = staffIds.indexOf(staff);
        if (index === -1) {
            return res.status(400).json({
                error: 'User is not staff'
            });
        }
        staffIds.splice(index, 1);
        const store = await index_model_1.Store.findOneAndUpdate({ _id: req.store._id }, { $set: { staffIds } }, { new: true })
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec();
        if (!store) {
            return res.status(500).json({
                error: 'Store not found'
            });
        }
        store.ownerId = safeCleanUser(store.ownerId);
        store.staffIds.forEach((staff) => {
            staff = safeCleanUser(staff);
        });
        return res.status(200).json({
            success: 'Remove staff successfully',
            store
        });
    }
    catch (error) {
        return res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.removeStaff = removeStaff;
// GET STORE COMMISSIONS
const getStoreCommissions = (req, res, next) => {
    index_model_1.Store.distinct('commissionId', {}, (error, commissions) => {
        if (error) {
            return res.status(400).json({
                error: 'Commissions not found'
            });
        }
        req.loadedCommissions = commissions;
        next();
    });
};
exports.getStoreCommissions = getStoreCommissions;
// GET STORES
const getStores = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id';
    const order = req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && Number(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);
    const commissionId = req.query.commissionId
        ? [req.query.commissionId]
        : req.loadedCommissions;
    const filter = {
        search: search,
        sortBy: sortBy,
        sortMoreBy: sortMoreBy,
        order: order,
        commissionId: commissionId,
        limit,
        pageCurrent: page
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            },
            { bio: { $regex: search, $options: 'i' } }
        ],
        isActive: true,
        commissionId: { $in: commissionId }
    };
    index_model_1.Store.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Stores not found'
            });
        }
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            return res.status(200).json({
                success: 'Load list stores successfully',
                filter,
                size,
                stores: []
            });
        }
        index_model_1.Store.find(filterArgs)
            .select('-e_wallet')
            .sort({
            [sortBy]: order,
            [sortMoreBy]: order,
            _id: 1
        })
            .skip(skip)
            .limit(limit)
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec()
            .then((stores) => {
            stores.forEach((store) => {
                store.ownerId = safeCleanUser(store.ownerId);
                store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff));
            });
            return res.status(200).json({
                success: 'Load list stores successfully',
                filter,
                size,
                stores
            });
        })
            .catch(() => {
            return res.status(500).json({
                error: 'Load list stores failed'
            });
        });
    });
};
exports.getStores = getStores;
// GET STORES BY USER
const getStoresByUser = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    let isActive = [true, false];
    if (req.query.isActive == 'true')
        isActive = [true];
    if (req.query.isActive == 'false')
        isActive = [false];
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id';
    const order = req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && Number(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);
    const commissionId = req.query.commissionId
        ? [req.query.commissionId]
        : req.loadedCommissions;
    const filter = {
        search: search,
        sortBy: sortBy,
        sortMoreBy: sortMoreBy,
        order: order,
        isActive,
        commissionId: commissionId,
        limit,
        pageCurrent: page
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                },
                ownerId: req.user._id
            },
            {
                name: {
                    $regex: search,
                    $options: 'i'
                },
                staffIds: req.user._id
            },
            {
                bio: {
                    $regex: search,
                    $options: 'i'
                },
                ownerId: req.user._id
            },
            {
                bio: {
                    $regex: search,
                    $options: 'i'
                },
                staffIds: req.user._id
            }
        ],
        isActive: { $in: isActive },
        commissionId: { $in: commissionId }
    };
    index_model_1.Store.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Stores not found'
            });
        }
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            return res.status(200).json({
                success: 'Load list stores successfully',
                filter,
                size,
                stores: []
            });
        }
        index_model_1.Store.find(filterArgs)
            .select('-e_wallet')
            .sort({
            [sortBy]: order,
            [sortMoreBy]: order,
            _id: 1
        })
            .skip(skip)
            .limit(limit)
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec()
            .then((stores) => {
            stores.forEach((store) => {
                store.ownerId = safeCleanUser(store.ownerId);
                store.staffIds = store.staffIds.map((staff) => safeCleanUser(staff));
            });
            return res.status(200).json({
                success: 'Load list stores by user successfully',
                filter,
                size,
                stores
            });
        })
            .catch(() => {
            return res.status(500).json({
                error: 'Load list stores failed'
            });
        });
    });
};
exports.getStoresByUser = getStoresByUser;
// GET STORES FOR ADMIN
const getStoresForAdmin = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    let isActive = [true, false];
    if (req.query.isActive == 'true')
        isActive = [true];
    if (req.query.isActive == 'false')
        isActive = [false];
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id';
    const order = req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'asc';
    const limit = req.query.limit && Number(req.query.limit) > 0
        ? parseInt(req.query.limit)
        : 6;
    const page = req.query.page && Number(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);
    const commissionId = req.query.commissionId
        ? [req.query.commissionId]
        : req.loadedCommissions;
    const filter = {
        search: search,
        sortBy: sortBy,
        sortMoreBy: sortMoreBy,
        order: order,
        isActive,
        commissionId: commissionId,
        limit,
        pageCurrent: page
    };
    const filterArgs = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            },
            {
                bio: { $regex: search, $options: 'i' }
            }
        ],
        isActive: { $in: isActive },
        commissionId: { $in: commissionId }
    };
    index_model_1.Store.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Stores not found'
            });
        }
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            return res.status(200).json({
                success: 'Load list stores successfully',
                filter,
                size,
                stores: []
            });
        }
        index_model_1.Store.find(filterArgs)
            .select('-e_wallet')
            .sort({
            [sortBy]: order,
            [sortMoreBy]: order,
            _id: 1
        })
            .skip(skip)
            .limit(limit)
            .populate('ownerId')
            .populate('staffIds')
            .populate('commissionId', '_id name fee')
            .exec()
            .then((stores) => {
            stores.forEach((store) => {
                store.ownerId = safeCleanUserLess(store.ownerId);
                store.staffIds = store.staffIds.map((staff) => safeCleanUserLess(staff));
            });
            return res.status(200).json({
                success: 'Load list stores successfully',
                filter,
                size,
                stores
            });
        })
            .catch(() => {
            return res.status(500).json({
                error: 'Load list stores failed'
            });
        });
    });
};
exports.getStoresForAdmin = getStoresForAdmin;
