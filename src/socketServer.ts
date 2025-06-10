import { Server } from 'socket.io'
import {
  createNotificationOrder,
  createNotificationCancelled,
  createNotificationDelivered,
  createNotificationReturn
} from './controllers/notification'

let io: Server
let activeUsers: { userId: string; socketId: string }[] = []

export const initSocketServer = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)

    // Xử lý user connect
    socket.on('addNewUser', (userId) => {
      !activeUsers.some((user) => user.userId === userId) &&
        activeUsers.push({
          userId,
          socketId: socket.id
        })
      console.log('Connected users: ', activeUsers)
      io.emit('getUsers', activeUsers)
    })

    // Xử lý trường hợp gửi và nhận thông báo
    socket.on('sendNotification', (data) => {
      const user = activeUsers.find((user) => user.userId === data.receiverId)
      if (user) {
        io.to(user.socketId).emit('getNotification', data)
      }
    })

    // Xử lý private notification
    socket.on('sendPrivateNotification', (data) => {
      const users = activeUsers.filter((user) =>
        data.receiverIds.includes(user.userId)
      )

      if (users.length > 0) {
        users.forEach((user) => {
          io.to(user.socketId).emit('getPrivateNotification', data)
        })
      }
    })

    // Xử lý user disconnect
    socket.on('disconnect', () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
      console.log('User disconnected', activeUsers)
      io.emit('getUsers', activeUsers)
    })

    socket.on('createNotificationOrder', async ({ objectId, from, to }) => {
      const result = (await createNotificationOrder(objectId, from, to)) as [
        boolean,
        string
      ]
      const [success, storeId] = result
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationCancel', async ({ objectId, from, to }) => {
      const result = (await createNotificationCancelled(
        objectId,
        from,
        to
      )) as [boolean, string]
      const [success, storeId] = result
      if (success) {
        io.to(from).emit('notification', from)
        io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('createNotificationDelivered', async ({ objectId, from, to }) => {
      const result = (await createNotificationDelivered(
        objectId,
        from,
        to
      )) as [boolean, string]
      const [success, storeId] = result
      if (success) {
        io.to(to).emit('notification', to)
        if (storeId) io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('createNotificationReturn', async ({ objectId, from, to }) => {
      const result = (await createNotificationReturn(objectId, from, to)) as [
        boolean,
        string
      ]
      const [success, storeId] = result
      if (success) {
        io.to(from).emit('notification', from)
        if (storeId) io.to(storeId).emit('notification', storeId)
      }
    })

    socket.on('notificationReport', async () => {
      const adminId = process.env.ADMIN_ID
      if (typeof adminId === 'string')
        io.to(adminId).emit('notification', adminId)
    })
    socket.on('notificationShopNew', async () => {
      const adminId = process.env.ADMIN_ID
      if (typeof adminId === 'string') {
        io.to(adminId).emit('notification', adminId)
      }
    })
    socket.on('join', (userId) => {
      socket.join(userId)
    })
  })
}
