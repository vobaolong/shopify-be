import { RequestHandler } from 'express'
import { Notification } from '../../models/index.model'
import { NotificationRequest } from './notification.types'

export const deleteNotifications: RequestHandler = async (req, res) => {
  const { userId } = req.params
  try {
    await Notification.deleteMany({ userId })
    res.status(200).json('delete successfully')
  } catch (error) {
    res.status(500).json('delete error')
  }
}

export const getNotifications: RequestHandler = async (req, res) => {
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
    res.status(500).json('get error')
  }
}

export const updateRead: RequestHandler = async (req, res) => {
  const { userId } = req.params
  try {
    await Notification.updateMany(
      { userId },
      { $set: { isRead: true } },
      { new: true }
    )
    res.status(200).json('update successfully')
  } catch (error) {
    res.status(500).json('update error')
  }
}
