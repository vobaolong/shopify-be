import { Notification, Store } from '../models/index.model'
import { Request, Response } from 'express'

interface NotificationResult {
  0: boolean
  1: string
}

export const createNotificationOrder = async (
  objectId: string,
  from: string,
  to: string
): Promise<NotificationResult> => {
  try {
    const store = await Store.findById(to)

    if (!store || !store.ownerId) {
      console.error('Store not found or missing ownerId')
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
    console.log('Send notification create successfully order')
    return [true, store.ownerId.toString()]
  } catch (error) {
    console.error('Error in createNotificationOrder:', error)
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
      console.error('Store not found or missing ownerId')
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
    console.error('Error in createNotificationCancelled:', error)
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
    console.log('Send notification successfully')
    return [true, '']
  } catch (error) {
    console.error('Error in createNotificationDelivered:', error)
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
      console.error('Store not found or missing ownerId')
      return [false, '']
    }

    const sellerNotification = new Notification({
      message: `Có yêu cầu hoàn trả`,
      userId: store.ownerId.toString(),
      isRead: false,
      objectId: objectId
    })

    await sellerNotification.save()
    console.log('Send notification successfully')
    return [true, '']
  } catch (error) {
    console.error('Error in createNotificationReturn:', error)
    return [false, '']
  }
}

export const deleteNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params

  try {
    await Notification.deleteMany({ userId })
    res.status(200).json('delete successfully')
  } catch (error) {
    console.error('Error in deleteNotifications:', error)
    res.status(500).json('delete error')
  }
}

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params

  try {
    const notifications = await Notification.find({ userId })

    if (notifications) {
      let notificationCount = 0

      notifications.forEach((n) => {
        if (!n.isRead) notificationCount++
      })

      res.status(200).json({
        notifications: notifications,
        numberHidden: notificationCount
      })
      return
    }

    res.status(404).json({ error: 'not found' })
  } catch (error) {
    console.error('Error in getNotifications:', error)
    res.status(500).json('get error')
  }
}

export const updateRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params

  try {
    await Notification.updateMany(
      { userId },
      { $set: { isRead: true } },
      { new: true }
    )

    res.status(200).json('update successfully')
  } catch (error) {
    console.error('Error in updateRead:', error)
    res.status(500).json('update error')
  }
}
