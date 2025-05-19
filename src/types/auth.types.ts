import { Request } from 'express'
import { IUser } from '../models/user.model'

declare module 'express' {
  interface Request {
    auth?: IUser
  }
}
export interface AuthRequest extends Request {
  auth: IUser
}

export interface AuthenticatedRequest extends Request {
  user?: any
  headers: {
    authorization?: string
    [key: string]: any
  }
}

export interface AuthUpdateRequest extends Request {
  auth?: any
  body: {
    firstName: string
    lastName: string
    email: string
    googleId: string
    avatar?: string
  }
}

export interface SignoutRequest extends Request {
  body: {
    refreshToken: string
  }
}

export interface ForgotPasswordRequest extends Request {
  body: {
    email?: string
    phone?: string
  }
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string
  }
}

export interface ChangePasswordRequest extends Request {
  params: {
    forgotPasswordCode: string
  }
  body: {
    password: string
  }
}

export interface SocialAuthRequest extends Request {
  body: {
    googleId: string
  }
}
