import mongoose, { Schema, Document } from 'mongoose'

interface INotification extends Document {
  message: string
  userId: string
  objectId?: string
  isRead: boolean
  createdAt?: Date
  updatedAt?: Date
}
const notificationSchema: Schema<INotification> = new Schema(
  {
    message: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    objectId: {
      type: String
      // required: true
    },
    isRead: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
)

const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
)
export default Notification
export type { INotification }
