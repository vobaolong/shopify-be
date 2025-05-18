"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantValues = exports.getActiveVariantValues = exports.restoreAllValues = exports.removeAllValues = exports.restoreValue = exports.removeValue = exports.updateValue = exports.createValue = exports.getValueById = void 0;
const index_model_1 = require("../models/index.model");
const errorHandler_1 = require("../helpers/errorHandler");
const getValueById = async (req, res, next) => {
    try {
        const variantValue = await index_model_1.VariantValue.findById(req.params.id);
        if (!variantValue) {
            res.status(404).json({ error: 'Variant value not found' });
            return;
        }
        req.variantValue = variantValue;
        next();
    }
    catch (error) {
        res.status(404).json({ error: 'Variant value not found' });
    }
};
exports.getValueById = getValueById;
const createValue = async (req, res) => {
    try {
        const { name, variantId } = req.body;
        if (!name || !variantId) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const variantValue = new index_model_1.VariantValue({ name, variantId });
        const savedVariantValue = await variantValue.save();
        res.status(200).json({ success: 'Create variant value successfully', variantValue: savedVariantValue });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.createValue = createValue;
const updateValue = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const variantValue = await index_model_1.VariantValue.findOneAndUpdate({ _id: req.variantValue._id }, { $set: { name } }, { new: true });
        if (!variantValue) {
            res.status(500).json({ error: 'Variant value not found' });
            return;
        }
        res.status(200).json({ success: 'Update variantValue successfully', variantValue });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.updateValue = updateValue;
const removeValue = async (req, res) => {
    try {
        const variantValue = await index_model_1.VariantValue.findOneAndUpdate({ _id: req.variantValue._id }, { $set: { isDeleted: true } }, { new: true });
        if (!variantValue) {
            res.status(500).json({ error: 'Variant value not found' });
            return;
        }
        res.status(200).json({ success: 'Remove variantValue successfully', variantValue });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.removeValue = removeValue;
const restoreValue = async (req, res) => {
    try {
        const variantValue = await index_model_1.VariantValue.findOneAndUpdate({ _id: req.variantValue._id }, { $set: { isDeleted: false } }, { new: true });
        if (!variantValue) {
            res.status(500).json({ error: 'Variant value not found' });
            return;
        }
        res.status(200).json({ success: 'Restore variant Value successfully', variantValue });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.restoreValue = restoreValue;
const removeAllValues = async (req, res) => {
    try {
        await index_model_1.VariantValue.updateMany({ variantId: req.variant._id }, { $set: { isDeleted: true } });
        res.status(200).json({ success: 'Remove variant & values successfully', variant: req.variant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.removeAllValues = removeAllValues;
const restoreAllValues = async (req, res) => {
    try {
        await index_model_1.VariantValue.updateMany({ variantId: req.variant._id }, { $set: { isDeleted: false } });
        res.status(200).json({ success: 'Restore variant & values successfully', variant: req.variant });
    }
    catch (error) {
        res.status(400).json({ error: (0, errorHandler_1.errorHandler)(error) });
    }
};
exports.restoreAllValues = restoreAllValues;
const getActiveVariantValues = async (req, res) => {
    try {
        const values = await index_model_1.VariantValue.find({
            variantId: req.variant._id,
            isDeleted: false
        })
            .populate('variantId')
            .sort({ name: 1, _id: 1 });
        res.status(200).json({
            success: 'Load list values of variant successfully',
            variantValues: values,
            variant: req.variant
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Load list values of variant failed' });
    }
};
exports.getActiveVariantValues = getActiveVariantValues;
const getVariantValues = async (req, res) => {
    try {
        const values = await index_model_1.VariantValue.find({ variantId: req.variant._id })
            .populate('variantId')
            .sort({ name: 1, _id: 1 });
        res.status(200).json({
            success: 'Load list values of variant successfully',
            variantValues: values,
            variant: req.variant
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Load list values of variant failed' });
    }
};
exports.getVariantValues = getVariantValues;
