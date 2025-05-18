"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.createReport = exports.getReports = void 0;
const index_model_1 = require("../models/index.model");
const getReports = async (req, res) => {
    try {
        const { search = '', sortBy = 'createdAt', order = 'desc', limit = '6', page = '1', isStore = 'false', isProduct = 'false', isReview = 'false' } = req.query;
        const skip = parseInt(limit) * (parseInt(page) - 1);
        const filterCondition = {
            ...(isStore === 'true' && { isStore: true }),
            ...(isProduct === 'true' && { isProduct: true }),
            ...(isReview === 'true' && { isReview: true })
        };
        const filter = {
            search,
            isStore: isStore === 'true',
            isProduct: isProduct === 'true',
            isReview: isReview === 'true',
            sortBy,
            order,
            limit: parseInt(limit),
            pageCurrent: parseInt(page)
        };
        const size = await index_model_1.Report.countDocuments(filterCondition);
        const pageCount = Math.ceil(size / parseInt(limit));
        filter.pageCount = pageCount;
        if (size <= 0) {
            res.status(200).json({
                success: 'Load list reports successfully',
                filter,
                size,
                reports: []
            });
            return;
        }
        const reports = await index_model_1.Report.find(filterCondition)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('reportBy', '_id firstName lastName email');
        const newReports = await Promise.all(reports.map(async (report) => {
            let object = null;
            if (report.isStore) {
                object = await index_model_1.Store.findById(report.objectId);
            }
            else if (report.isProduct) {
                object = await index_model_1.Product.findById(report.objectId);
            }
            else if (report.isReview) {
                object = await index_model_1.Review.findById(report.objectId);
            }
            if (!object)
                return report;
            return { ...report.toObject(), objectId: object.toObject() };
        }));
        res.status(200).json({
            success: 'Load list reports successfully',
            filter,
            size,
            reports: newReports
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getReports = getReports;
const createReport = async (req, res) => {
    try {
        const { objectId, isStore, isProduct, isReview, reason, reportBy } = req.body;
        const onModel = isStore
            ? 'Store'
            : isProduct
                ? 'Product'
                : isReview
                    ? 'Review'
                    : null;
        if (!onModel) {
            res.status(400).json({ message: 'Invalid report type' });
            return;
        }
        const report = new index_model_1.Report({
            objectId,
            isStore,
            isProduct,
            isReview,
            reason,
            reportBy,
            onModel
        });
        await report.save();
        const adminId = process.env.ADMIN_ID;
        const reportType = isStore
            ? 'Báo cáo shop mới'
            : isProduct
                ? 'Báo cáo sản phẩm mới'
                : 'Báo cáo đánh giá mới';
        const adminNotification = new index_model_1.Notification({
            message: `${reportType}: ${reason}`,
            userId: adminId,
            isRead: false,
            objectId: `Mã đối tượng: ${objectId}`
        });
        await adminNotification.save();
        res.status(201).json({ message: 'Report submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createReport = createReport;
const deleteReport = async (req, res) => {
    try {
        await index_model_1.Report.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Delete successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteReport = deleteReport;
