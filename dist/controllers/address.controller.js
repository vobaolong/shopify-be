"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvinces = exports.getAddress = void 0;
const address_model_1 = __importDefault(require("../models/address.model"));
const errorHandler_1 = require("../helpers/errorHandler");
// Hàm lấy thông tin địa chỉ từ địa chỉ string
const getAddress = async (req, res) => {
    try {
        const { address } = req.params;
        const addressInfo = await address_model_1.default.findOne({ address });
        if (!addressInfo) {
            res.status(404).json({
                error: 'Address not found'
            });
        }
        res.status(200).json({
            success: 'Get address successfully',
            address: addressInfo
        });
    }
    catch (error) {
        res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.getAddress = getAddress;
// Hàm lấy danh sách tỉnh thành
const getProvinces = async (req, res) => {
    try {
        const addresses = await address_model_1.default.find({}, 'provinceName');
        const provinces = [
            ...new Set(addresses
                .map((a) => a.provinceName)
                .filter((name) => name && name.trim() !== ''))
        ];
        res.status(200).json({
            success: 'Get provinces successfully',
            provinces
        });
    }
    catch (error) {
        res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    }
};
exports.getProvinces = getProvinces;
