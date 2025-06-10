import { Notification, Store } from '../../models/index.model'
import { NotificationResult } from './notification.types'

export const createNotificationOrder = async (
  objectId: string,
  from: string,
  to: string
): Promise<NotificationResult> => {
  try {
    const store = await Store.findById(to)
    if (!store || !store.ownerId) {
      return [false, '']
    }
    const buyerNotification = new Notification({
      message: `Đặt hàng thành công`,
      userId: from,
      isRead: false,
      objectId: objectId
    })
    const sellerNotification = new Notification({
      message: `Có đơn hàng mới`,
      userId: store.ownerId.toString(),
      isRead: false,
      objectId: objectId
    })
    await Promise.all([buyerNotification.save(), sellerNotification.save()])
    return [true, store.ownerId.toString()]
  } catch (error) {
    return [false, '']
  }
}

export const createNotificationCancelled = async (
  objectId: string,
  from: string,
  to: string
): Promise<NotificationResult> => {
  try {
    const store = await Store.findById(to)
    if (!store || !store.ownerId) {
      return [false, '']
    }
    const buyerNotification = new Notification({
      message: `Huỷ đơn hàng thành công`,
      userId: from,
      isRead: false,
      objectId: objectId
    })
    const sellerNotification = new Notification({
      message: `Có đơn hàng bị huỷ`,
      userId: store.ownerId.toString(),
      isRead: false,
      objectId: objectId
    })
    await Promise.all([buyerNotification.save(), sellerNotification.save()])
    return [true, store.ownerId.toString()]
  } catch (error) {
    return [false, '']
  }
}

export const createNotificationDelivered = async (
  objectId: string,
  from: string,
  to: string
): Promise<NotificationResult> => {
  try {
    const buyerNotification = new Notification({
      message: `Đơn hàng đã được giao`,
      userId: to,
      isRead: false,
      objectId: objectId
    })
    await buyerNotification.save()
    return [true, '']
  } catch (error) {
    return [false, '']
  }
}

export const createNotificationReturn = async (
  objectId: string,
  from: string,
  to: string
): Promise<NotificationResult> => {
  try {
    const store = await Store.findById(to)
    if (!store || !store.ownerId) {
      return [false, '']
    }
    const sellerNotification = new Notification({
      message: `Có yêu cầu hoàn trả`,
      userId: store.ownerId.toString(),
      isRead: false,
      objectId: objectId
    })
    await sellerNotification.save()
    return [true, '']
  } catch (error) {
    return [false, '']
  }
}
