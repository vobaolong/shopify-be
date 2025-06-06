import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

export const validateHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error: any) => error.msg)[0]
    res.status(400).json({ error: firstError })
    return
  }
  next()
}
