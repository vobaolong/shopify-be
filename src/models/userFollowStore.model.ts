import mongoose, { Schema, Document } from 'mongoose'

interface IUserFollowStore extends Document {
  userId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}
const userFollowStoreSchema = new Schema<IUserFollowStore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store'
    },
    isDeleted: {
      type: Boolean
    }
  },
  { timestamps: true }
)

userFollowStoreSchema.index({ userId: 1, storeId: 1 }, { unique: true })

const userFollowStore = mongoose.model<IUserFollowStore>(
  'UserFollowStore',
  userFollowStoreSchema
)
export default userFollowStore
export type { IUserFollowStore }
