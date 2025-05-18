import mongoose, { Schema, Document } from 'mongoose'

interface IRefreshToken extends Document {
  jwt: string
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    jwt: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema)
export type { IRefreshToken }
