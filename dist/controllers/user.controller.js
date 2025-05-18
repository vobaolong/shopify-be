"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserForAdmin = exports.listUser = exports.updateCover = exports.updateAvatar = exports.removeAddress = exports.updateAddress = exports.addAddress = exports.updatePassword = exports.updateProfile = exports.getUserProfile = exports.getUser = exports.userById = void 0;
const index_model_1 = require("../models/index.model");
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../helpers/errorHandler");
const userHandler_1 = require("../helpers/userHandler");
const userById = (req, res, next, id) => {
    try {
        index_model_1.User.findById(id)
            .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
            }
            req.user = user;
            next();
        })
            .catch(() => {
            res.status(404).json({
                error: 'User not found'
            });
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'User not found'
        });
    }
};
exports.userById = userById;
const getUser = (req, res) => {
    if (!req.user) {
        res.status(404).json({
            error: 'User not found'
        });
    }
    res.status(200).json({
        success: 'Get user successfully',
        user: (0, userHandler_1.cleanUser)(req.user)
    });
};
exports.getUser = getUser;
const getUserProfile = (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(404).json({
                error: 'User not found'
            });
        }
        index_model_1.User.findOne({ _id: req.user._id })
            .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }
            res.status(200).json({
                success: 'Get user profile successfully',
                user: (0, userHandler_1.cleanUserLess)(user)
            });
        })
            .catch(() => {
            res.status(404).json({
                error: 'User not found'
            });
        });
    }
    catch (error) {
        res.status(404).json({
            error: 'User not found'
        });
    }
};
exports.getUserProfile = getUserProfile;
const updateProfile = (req, res) => {
    try {
        const { firstName, lastName, id_card, email, phone } = req.body;
        if (!req.user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        if (email && req.user.googleId) {
            res.status(400).json({
                error: 'Can not update Google email address'
            });
        }
        const isEmailActive = email && req.user.email !== email ? false : req.user.isEmailActive;
        const isPhoneActive = phone && req.user.phone !== phone ? false : req.user.isPhoneActive;
        index_model_1.User.findOneAndUpdate({ _id: req.user._id }, {
            $set: {
                firstName,
                lastName,
                id_card,
                email,
                phone,
                isEmailActive,
                isPhoneActive
            }
        }, { new: true })
            .then((user) => {
            if (!user) {
                res.status(500).json({
                    error: 'User not found'
                });
                return;
            }
            res.status(200).json({
                success: 'Update user successfully.',
                user: (0, userHandler_1.cleanUserLess)(user)
            });
        })
            .catch((error) => {
            res.status(400).json({
                error: (0, errorHandler_1.errorHandler)(error)
            });
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateProfile = updateProfile;
const updatePassword = (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!req.user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        const user = req.user;
        const encryptedPassword = user.encryptPassword(newPassword, user.salt);
        index_model_1.User.findOneAndUpdate({ _id: req.user._id }, { $set: { hashed_password: encryptedPassword } })
            .then((updatedUser) => {
            if (!updatedUser) {
                res.status(500).json({
                    error: 'User not found'
                });
            }
            res.status(200).json({
                success: 'Update new password successfully'
            });
        })
            .catch((error) => {
            res.status(400).json({
                error: (0, errorHandler_1.errorHandler)(error)
            });
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updatePassword = updatePassword;
const addAddress = (req, res) => {
    try {
        if (!req.user) {
            res.status(404).json({
                error: 'User not found'
            });
        }
        let addresses = req.user.addresses;
        if (addresses.length >= 10) {
            res.status(400).json({
                error: 'The limit is 10 addresses'
            });
        }
        const addressData = req.body.address;
        if (!addressData) {
            res.status(400).json({
                error: 'Address is required'
            });
        }
        addresses.push(addressData.trim());
        addresses = [...new Set(addresses)];
        const address = new index_model_1.Address({
            ...req.body
        });
        address
            .save()
            .then(() => {
            var _a;
            index_model_1.User.findOneAndUpdate({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, { $set: { addresses } }, { new: true })
                .then((user) => {
                if (!user) {
                    res.status(500).json({
                        error: 'User not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: 'Add address successfully',
                    user: (0, userHandler_1.cleanUserLess)(user)
                });
            })
                .catch((error) => {
                res.status(400).json({
                    error: (0, errorHandler_1.errorHandler)(error)
                });
            });
        })
            .catch((error) => {
            res.status(400).json({
                error: (0, errorHandler_1.errorHandler)(error)
            });
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res) => {
    try {
        const addressIndex = req.query.index &&
            !isNaN(parseInt(req.query.index)) &&
            parseInt(req.query.index) >= 0 &&
            parseInt(req.query.index) <= 10
            ? parseInt(req.query.index)
            : -1;
        if (addressIndex == -1)
            res.status(400).json({
                error: 'index not found'
            });
        let addresses = req.user.addresses;
        if (addresses.length <= addressIndex)
            res.status(404).json({
                error: 'Address not found'
            });
        const index = addresses.indexOf(req.body.address.trim());
        if (index != -1 && index != addressIndex)
            res.status(400).json({
                error: 'Address already exists'
            });
        const addressDetail = req.body.addressDetail;
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
            await newAddress.save();
        }
        addresses.splice(addressIndex, 1, req.body.address.trim());
        const user = await index_model_1.User.findOneAndUpdate({ _id: req.user._id }, { $set: { addresses } }, { new: true });
        if (!user) {
            res.status(500).json({
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Update address successfully',
            user: (0, userHandler_1.cleanUserLess)(user)
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateAddress = updateAddress;
const removeAddress = async (req, res) => {
    try {
        const addressIndex = req.query.index &&
            !isNaN(parseInt(req.query.index)) &&
            parseInt(req.query.index) >= 0 &&
            parseInt(req.query.index) <= 10
            ? parseInt(req.query.index)
            : -1;
        if (addressIndex == -1)
            res.status(400).json({
                error: 'index not found'
            });
        let addresses = req.user.addresses;
        if (addresses.length <= addressIndex)
            res.status(404).json({
                error: 'Address not found'
            });
        addresses.splice(addressIndex, 1);
        const user = await index_model_1.User.findOneAndUpdate({ _id: req.user._id }, { $set: { addresses } }, { new: true });
        if (!user) {
            res.status(500).json({
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Remove address successfully',
            user: (0, userHandler_1.cleanUserLess)(user)
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.removeAddress = removeAddress;
const updateAvatar = async (req, res) => {
    try {
        if (!req.filepaths || !req.filepaths.length) {
            res.status(400).json({
                error: 'No file uploaded'
            });
            return;
        }
        const oldpath = req.user.avatar;
        const user = await index_model_1.User.findOneAndUpdate({ _id: req.user._id }, { $set: { avatar: req.filepaths[0] } }, { new: true });
        if (!user) {
            try {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
            catch { }
            res.status(500).json({
                error: 'User not found'
            });
            return;
        }
        if (oldpath != '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        res.status(200).json({
            success: 'Update avatar successfully',
            user: (0, userHandler_1.cleanUserLess)(user)
        });
    }
    catch (error) {
        if (req.filepaths && req.filepaths.length > 0) {
            try {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
            catch { }
        }
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateAvatar = updateAvatar;
const updateCover = async (req, res) => {
    var _a, _b;
    try {
        if (!req.filepaths || !req.filepaths.length) {
            res.status(400).json({
                error: 'No file uploaded'
            });
        }
        const oldpath = req.user.cover;
        const user = await index_model_1.User.findOneAndUpdate({ _id: req.user._id }, { $set: { cover: (_a = req.filepaths) === null || _a === void 0 ? void 0 : _a[0] } }, { new: true });
        if (!user) {
            try {
                fs_1.default.unlinkSync('public' + ((_b = req.filepaths) === null || _b === void 0 ? void 0 : _b[0]));
            }
            catch { }
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        if (oldpath != '/uploads/default.webp') {
            try {
                fs_1.default.unlinkSync('public' + oldpath);
            }
            catch { }
        }
        res.status(200).json({
            success: 'Update cover successfully',
            user: (0, userHandler_1.cleanUserLess)(user)
        });
    }
    catch (error) {
        if (req.filepaths && req.filepaths.length > 0) {
            try {
                fs_1.default.unlinkSync('public' + req.filepaths[0]);
            }
            catch { }
        }
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.updateCover = updateCover;
const listUser = async (req, res) => {
    try {
        const search = req.query.search ? req.query.search : '';
        const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
        const order = req.query.order &&
            (req.query.order === 'asc' || req.query.order === 'desc')
            ? req.query.order
            : 'asc';
        const limit = req.query.limit &&
            !isNaN(parseInt(req.query.limit)) &&
            parseInt(req.query.limit) > 0
            ? parseInt(req.query.limit)
            : 6;
        const page = req.query.page &&
            !isNaN(parseInt(req.query.page)) &&
            parseInt(req.query.page) > 0
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
            $or: [
                {
                    firstName: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    lastName: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ],
            role: { $ne: 'admin' }
        };
        const count = await index_model_1.User.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = (page - 1) * limit;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list users successfully',
                filter,
                size,
                users: []
            });
        }
        const users = await index_model_1.User.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .limit(limit)
            .skip(skip);
        const cleanedUsers = users.map((user) => (0, userHandler_1.cleanUser)(user));
        res.status(200).json({
            success: 'Load list users successfully',
            filter,
            size,
            users: cleanedUsers
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list users failed'
        });
    }
};
exports.listUser = listUser;
const listUserForAdmin = async (req, res) => {
    try {
        const search = req.query.search ? req.query.search : '';
        const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
        const order = req.query.order &&
            (req.query.order === 'asc' || req.query.order === 'desc')
            ? req.query.order
            : 'asc';
        const limit = req.query.limit &&
            !isNaN(parseInt(req.query.limit)) &&
            parseInt(req.query.limit) > 0
            ? parseInt(req.query.limit)
            : 6;
        const page = req.query.page &&
            !isNaN(parseInt(req.query.page)) &&
            parseInt(req.query.page) > 0
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
            $or: [
                {
                    firstName: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    lastName: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ],
            role: { $ne: 'admin' }
        };
        const count = await index_model_1.User.countDocuments(filterArgs);
        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        let skip = (page - 1) * limit;
        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }
        if (count <= 0) {
            res.status(200).json({
                success: 'Load list users successfully',
                filter,
                size,
                users: []
            });
        }
        const users = await index_model_1.User.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit);
        const cleanedUsers = users.map((user) => (0, userHandler_1.cleanUserLess)(user));
        res.status(200).json({
            success: 'Load list users successfully',
            filter,
            size,
            users: cleanedUsers
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Load list users failed'
        });
    }
};
exports.listUserForAdmin = listUserForAdmin;
