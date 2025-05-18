"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleImagesController = exports.deleteImageController = exports.uploadBase64Image = exports.uploadMultipleImagesController = exports.uploadSingleImage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("../helpers/cloudinary");
const __dirname = process.cwd();
const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file provided' });
            return;
        }
        const { path: filePath } = req.file;
        const folder = req.body.folder || 'shopify';
        const result = await (0, cloudinary_1.uploadImage)(filePath, folder);
        res.status(200).json({
            success: true,
            data: result
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: 'Error uploading image',
            message: error.message
        });
        return;
    }
};
exports.uploadSingleImage = uploadSingleImage;
const uploadMultipleImagesController = async (req, res) => {
    try {
        if (!req.files ||
            (Array.isArray(req.files) && req.files.length === 0) ||
            (!Array.isArray(req.files) && Object.keys(req.files).length === 0)) {
            res.status(400).json({ error: 'No image files provided' });
            return;
        }
        let filePaths = [];
        if (Array.isArray(req.files)) {
            filePaths = req.files.map((file) => file.path);
        }
        else {
            Object.keys(req.files).forEach((key) => {
                const fileArr = req.files[key];
                if (Array.isArray(fileArr)) {
                    filePaths = [...filePaths, ...fileArr.map((file) => file.path)];
                }
            });
        }
        const folder = req.body.folder || 'shopify';
        const results = await (0, cloudinary_1.uploadMultipleImages)(filePaths, folder);
        res.status(200).json({
            success: true,
            data: results
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: 'Error uploading images',
            message: error.message
        });
        return;
    }
};
exports.uploadMultipleImagesController = uploadMultipleImagesController;
const uploadBase64Image = async (req, res) => {
    try {
        if (!req.body.image) {
            res.status(400).json({ error: 'No image data provided' });
            return;
        }
        const base64String = req.body.image;
        const folder = req.body.folder || 'shopify';
        const filename = `${(0, uuid_1.v4)()}.png`;
        const tempDir = await (0, cloudinary_1.createTempDirectory)();
        const filePath = path_1.default.join(tempDir, filename);
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs_1.promises.writeFile(filePath, buffer);
        const result = await (0, cloudinary_1.uploadImage)(filePath, folder);
        res.status(200).json({
            success: true,
            data: result
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: 'Error uploading base64 image',
            message: error.message
        });
        return;
    }
};
exports.uploadBase64Image = uploadBase64Image;
const deleteImageController = async (req, res) => {
    try {
        const { publicId } = req.params;
        if (!publicId) {
            res.status(400).json({ error: 'Public ID is required' });
            return;
        }
        const result = await (0, cloudinary_1.deleteImage)(publicId);
        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
            return;
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Failed to delete image',
                result
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Error deleting image',
            message: error.message
        });
        return;
    }
};
exports.deleteImageController = deleteImageController;
const deleteMultipleImagesController = async (req, res) => {
    try {
        const { publicIds } = req.body;
        if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
            res.status(400).json({ error: 'Valid array of public IDs is required' });
            return;
        }
        const result = await (0, cloudinary_1.deleteMultipleImages)(publicIds);
        res.status(200).json({
            success: true,
            message: 'Images deleted successfully',
            result
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: 'Error deleting images',
            message: error.message
        });
        return;
    }
};
exports.deleteMultipleImagesController = deleteMultipleImagesController;
