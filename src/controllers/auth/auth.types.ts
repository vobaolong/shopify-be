import { Request, Response } from 'express'
import { IUser } from '../../models/user.model'

export interface AuthRequest extends Request {
  user?: IUser
  body: {
    email?: string
    userName?: string
    phone?: string
    password?: string
    firstName?: string
    lastName?: string
    name?: string
    googleId?: string
    facebookId?: string
    avatar?: string
    isEmailActive?: boolean
    [key: string]: any
  }
}

export interface SignoutRequest extends Request {
  user?: IUser
}

export interface RefreshTokenRequest extends Request {
  user?: IUser
  body: {
    refreshToken: string
  }
}

export interface ForgotPasswordRequest extends Request {
  body: {
    email: string
    phone: string
  }
}

export interface SocialAuthRequest extends Request {
  user?: IUser
  body: {
    googleId?: string
    facebookId?: string
    email?: string
    firstName?: string
    lastName?: string
    avatar?: string
  }
}

export interface AuthUpdateRequest extends Request {
  user?: IUser
  body: {
    userName?: string
    firstName?: string
    lastName?: string
    phone?: string
  }
}
