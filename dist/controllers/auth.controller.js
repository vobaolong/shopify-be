"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isOwner = exports.isManager = exports.isAuth = exports.verifyPassword = exports.authUpdate = exports.authSocial = exports.changePassword = exports.forgotPassword = exports.refreshToken = exports.signout = exports.createToken = exports.signin = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../helpers/errorHandler");
const index_model_1 = require("../models/index.model");
const index_enum_1 = require("../enums/index.enum");
const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const user = new index_model_1.User({ firstName, lastName, email, phone, password });
        await user.save();
        res.status(200).json({
            success: 'Signing up successfully, you can sign in now'
        });
    }
    catch (error) {
        res.status(400).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.signup = signup;
// Hàm đăng nhập tài khoản
const signin = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;
        const query = {
            $or: [
                {
                    email: { $exists: true, $ne: null, $eq: email },
                    googleId: { $exists: false, $eq: null }
                },
                {
                    phone: { $exists: true, $ne: null, $eq: phone },
                    googleId: { $exists: false, $eq: null }
                }
            ]
        };
        const user = await index_model_1.User.findOne(query).exec();
        if (!user) {
            res.status(404).json({
                error: 'User not found! Please try again'
            });
            return;
        }
        if (!user.authenticate(password)) {
            res.status(401).json({
                error: 'Password does not match! Please try again'
            });
            return;
        }
        req.auth = user;
        next();
    }
    catch (error) {
        res.status(404).json({
            error: 'User not found'
        });
    }
};
exports.signin = signin;
const createToken = async (req, res, next) => {
    const authReq = req;
    try {
        const user = authReq.auth;
        const { _id, role } = user;
        const accessToken = jsonwebtoken_1.default.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '48h'
        });
        const refreshToken = jsonwebtoken_1.default.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '9999 days'
        });
        const token = new index_model_1.RefreshToken({ jwt: refreshToken });
        await token.save();
        res.status(200).json({
            success: 'Sign in successfully',
            accessToken,
            refreshToken,
            _id,
            role
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Create JWT failed, please try sign in again'
        });
    }
};
exports.createToken = createToken;
// Hàm đăng xuất
const signout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'refreshToken is required' });
            return;
        }
        await index_model_1.RefreshToken.deleteOne({ jwt: refreshToken }).exec();
        res.status(200).json({
            success: 'Sign out successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Sign out and remove refresh token failed'
        });
    }
};
exports.signout = signout;
// Hàm làm mới token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'refreshToken is required' });
            return;
        }
        const token = await index_model_1.RefreshToken.findOne({ jwt: refreshToken }).exec();
        if (!token) {
            res.status(404).json({
                error: 'refreshToken is invalid'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token.jwt);
        const { _id } = decoded;
        const accessToken = jsonwebtoken_1.default.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '48h'
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '9999 days' });
        const updatedToken = await index_model_1.RefreshToken.findOneAndUpdate({ jwt: refreshToken }, { $set: { jwt: newRefreshToken } }, { new: true }).exec();
        if (!updatedToken) {
            res.status(500).json({
                error: 'Create JWT failed, try again later'
            });
            return;
        }
        res.status(200).json({
            success: 'Refresh token successfully',
            accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        res.status(401).json({
            error: 'refreshToken is invalid'
        });
    }
};
exports.refreshToken = refreshToken;
// Hàm quên mật khẩu
const forgotPassword = async (req, res, next) => {
    try {
        const { email, phone } = req.body;
        const forgot_password_code = jsonwebtoken_1.default.sign({ email, phone }, process.env.JWT_FORGOT_PASSWORD_SECRET);
        const query = {
            $or: [
                { email: { $exists: true, $ne: null, $eq: email } },
                { phone: { $exists: true, $ne: null, $eq: phone } }
            ]
        };
        const user = await index_model_1.User.findOneAndUpdate(query, { $set: { forgot_password_code } }, { new: true }).exec();
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        req.msg = {
            email: email || '',
            phone: phone || '',
            name: `${user.firstName} ${user.lastName}`,
            title: 'Request to reset password',
            text: 'Please click the link below to change your password.',
            code: forgot_password_code
        };
        next();
        res.status(200).json({
            success: 'Request successfully, please wait for email'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'User not found'
        });
    }
};
exports.forgotPassword = forgotPassword;
// Hàm đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const forgot_password_code = req.params.forgotPasswordCode;
        const { password } = req.body;
        const user = await index_model_1.User.findOneAndUpdate({ forgot_password_code }, { $unset: { forgot_password_code: '' } });
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        user.hashed_password = user.encryptPassword(password, user.salt);
        await user.save();
        res.status(200).json({
            success: 'Update password successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Update password failed, please request to send email again'
        });
    }
};
exports.changePassword = changePassword;
// Hàm đăng nhập bằng Google
const authSocial = async (req, res, next) => {
    try {
        const { googleId } = req.body;
        if (!googleId) {
            res.status(400).json({
                error: 'googleId is required'
            });
            return;
        }
        const user = await index_model_1.User.findOne({
            googleId: { $exists: true, $ne: null, $eq: googleId }
        }).exec();
        if (user) {
            req.auth = user;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Signing in with Google failed'
        });
    }
};
exports.authSocial = authSocial;
// Hàm cập nhật thông tin tài khoản
const authUpdate = async (req, res, next) => {
    if (req.auth) {
        next();
        return;
    }
    try {
        const { firstName, lastName, email, googleId } = req.body;
        if (googleId) {
            const user = await index_model_1.User.findOneAndUpdate({ email: { $exists: true, $ne: null, $eq: email } }, { $set: { googleId } }, { new: true }).exec();
            if (!user) {
                const newUser = new index_model_1.User({
                    firstName,
                    lastName,
                    email,
                    googleId,
                    isEmailActive: true
                });
                const savedUser = await newUser.save();
                req.auth = savedUser;
            }
            else {
                req.auth = user;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.authUpdate = authUpdate;
// Hàm kiểm tra mật khẩu
const verifyPassword = async (req, res, next) => {
    var _a;
    try {
        const { currentPassword } = req.body;
        const user = await index_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        if (user.googleId) {
            next();
            return;
        }
        if (!user.authenticate(currentPassword)) {
            res.status(401).json({
                error: "Current password doesn't match"
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            error: 'Verification failed'
        });
    }
};
exports.verifyPassword = verifyPassword;
// Hàm kiểm tra quyền đăng nhập
const isAuth = (req, res, next) => {
    const authHeader = req.headers && req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: 'No token provided! Please sign in again'
        });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            res.status(401).json({
                error: 'Unauthorized! Please sign in again'
            });
            return;
        }
        if (req.user && req.user._id == decoded._id) {
            next();
        }
        else {
            res.status(403).json({
                error: 'Access denied'
            });
        }
    });
};
exports.isAuth = isAuth;
// Hàm kiểm tra quyền quản lý cửa hàng
const isManager = (req, res, next) => {
    const user = req.user;
    const store = req.store;
    if (!store || !user) {
        res.status(403).json({
            error: 'Store or user not found',
            isManager: false
        });
        return;
    }
    const isUserManager = user._id.equals(store.ownerId) || store.staffIds.includes(user._id);
    if (!isUserManager) {
        res.status(403).json({
            error: 'Store Manager resource! Access denied',
            isManager: false
        });
        return;
    }
    next();
};
exports.isManager = isManager;
// Hàm kiểm tra quyền chủ cửa hàng
const isOwner = (req, res, next) => {
    const user = req.user;
    const store = req.store;
    if (!store || !user) {
        res.status(403).json({
            error: 'Store or user not found',
            isOwner: false
        });
        return;
    }
    if (!user._id.equals(store.ownerId)) {
        res.status(403).json({
            error: 'Store Owner resource! Access denied',
            isOwner: false
        });
        return;
    }
    next();
};
exports.isOwner = isOwner;
// Hàm kiểm tra quyền quản trị viên
const isAdmin = (req, res, next) => {
    if (req.user.role !== index_enum_1.Role.ADMIN) {
        res.status(403).json({
            error: 'Admin resource! Access denied'
        });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
