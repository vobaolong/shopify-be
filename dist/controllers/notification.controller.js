"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRead = exports.getNotifications = exports.deleteNotifications = exports.createNotificationReturn = exports.createNotificationDelivered = exports.createNotificationCancelled = exports.createNotificationOrder = void 0;
const index_model_1 = require("../models/index.model");
const createNotificationOrder = async (objectId, from, to) => {
    try {
        const store = await index_model_1.Store.findById(to);
        if (!store || !store.ownerId) {
            console.error('Store not found or missing ownerId');
            return [false, ''];
        }
        const buyerNotification = new index_model_1.Notification({
            message: `Đặt hàng thành công`,
            userId: from,
            isRead: false,
            objectId: objectId
        });
        const sellerNotification = new index_model_1.Notification({
            message: `Có đơn hàng mới`,
            userId: store.ownerId.toString(),
            isRead: false,
            objectId: objectId
        });
        await Promise.all([buyerNotification.save(), sellerNotification.save()]);
        console.log('Send notification create successfully order');
        return [true, store.ownerId.toString()];
    }
    catch (error) {
        console.error('Error in createNotificationOrder:', error);
        return [false, ''];
    }
};
exports.createNotificationOrder = createNotificationOrder;
const createNotificationCancelled = async (objectId, from, to) => {
    try {
        const store = await index_model_1.Store.findById(to);
        if (!store || !store.ownerId) {
            console.error('Store not found or missing ownerId');
            return [false, ''];
        }
        const buyerNotification = new index_model_1.Notification({
            message: `Huỷ đơn hàng thành công`,
            userId: from,
            isRead: false,
            objectId: objectId
        });
        const sellerNotification = new index_model_1.Notification({
            message: `Có đơn hàng bị huỷ`,
            userId: store.ownerId.toString(),
            isRead: false,
            objectId: objectId
        });
        await Promise.all([buyerNotification.save(), sellerNotification.save()]);
        return [true, store.ownerId.toString()];
    }
    catch (error) {
        console.error('Error in createNotificationCancelled:', error);
        return [false, ''];
    }
};
exports.createNotificationCancelled = createNotificationCancelled;
const createNotificationDelivered = async (objectId, from, to) => {
    try {
        const buyerNotification = new index_model_1.Notification({
            message: `Đơn hàng đã được giao`,
            userId: to,
            isRead: false,
            objectId: objectId
        });
        await buyerNotification.save();
        console.log('Send notification successfully');
        return [true, ''];
    }
    catch (error) {
        console.error('Error in createNotificationDelivered:', error);
        return [false, ''];
    }
};
exports.createNotificationDelivered = createNotificationDelivered;
const createNotificationReturn = async (objectId, from, to) => {
    try {
        const store = await index_model_1.Store.findById(to);
        if (!store || !store.ownerId) {
            console.error('Store not found or missing ownerId');
            return [false, ''];
        }
        const sellerNotification = new index_model_1.Notification({
            message: `Có yêu cầu hoàn trả`,
            userId: store.ownerId.toString(),
            isRead: false,
            objectId: objectId
        });
        await sellerNotification.save();
        console.log('Send notification successfully');
        return [true, ''];
    }
    catch (error) {
        console.error('Error in createNotificationReturn:', error);
        return [false, ''];
    }
};
exports.createNotificationReturn = createNotificationReturn;
const deleteNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        await index_model_1.Notification.deleteMany({ userId });
        res.status(200).json('delete successfully');
    }
    catch (error) {
        console.error('Error in deleteNotifications:', error);
        res.status(500).json('delete error');
    }
};
exports.deleteNotifications = deleteNotifications;
const getNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        const notifications = await index_model_1.Notification.find({ userId });
        if (notifications) {
            let notificationCount = 0;
            notifications.forEach((n) => {
                if (!n.isRead)
                    notificationCount++;
            });
            res.status(200).json({
                notifications: notifications,
                numberHidden: notificationCount
            });
            return;
        }
        res.status(404).json({ error: 'not found' });
    }
    catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json('get error');
    }
};
exports.getNotifications = getNotifications;
const updateRead = async (req, res) => {
    const { userId } = req.params;
    try {
        await index_model_1.Notification.updateMany({ userId }, { $set: { isRead: true } }, { new: true });
        res.status(200).json('update successfully');
    }
    catch (error) {
        console.error('Error in updateRead:', error);
        res.status(500).json('update error');
    }
};
exports.updateRead = updateRead;
