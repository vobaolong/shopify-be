import { check, ValidationChain } from 'express-validator'
import {
  EMAIL_REGEX,
  INVALID_NAME_PATTERNS,
  NAME_REGEX,
  PHONE_REGEX
} from '../constants/regex.constant'

// --- Validators ---
const checkNameValidity = (val: string): boolean | Promise<never> => {
  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(val)) {
      return Promise.reject('Name contains marketing or promotional terms')
    }
  }
  return true
}

const nameValidator = (field: string): ValidationChain =>
  check(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ max: 32 })
    .withMessage(`${field} can contain up to 32 characters`)
    .matches(NAME_REGEX)
    .withMessage(`${field} contains invalid characters`)
    .custom(checkNameValidity)

const emailValidator = () =>
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .matches(EMAIL_REGEX)
    .withMessage('Must provide a valid email address')

const identifierValidator = (): ValidationChain[] => [
  check('email')
    .optional()
    .matches(EMAIL_REGEX)
    .withMessage('Invalid email format'),
  check('phone')
    .optional()
    .matches(PHONE_REGEX)
    .withMessage('Invalid phone format'),
  check('userName')
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage('Username must be 3-32 characters'),
  check().custom((_, { req }) => {
    const { email, phone, userName } = req.body
    if ([email, phone, userName].filter(Boolean).length !== 1)
      throw new Error(
        'Chỉ được nhập một trong các trường: email, phone hoặc userName'
      )
    return true
  })
]

// For signup - user must provide userName, name, email, phone, and password
const signupValidator = (): ValidationChain[] => [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .matches(EMAIL_REGEX)
    .withMessage('Must provide a valid email address'),
  check('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(PHONE_REGEX)
    .withMessage('Must be a valid Vietnamese phone number')
]

const strongPasswordValidator = (): ValidationChain =>
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Must contain at least one special character')

const loginPasswordValidator = (): ValidationChain =>
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(/^[A-Za-z\d@$!%*?&]*$/)
    .withMessage('Password contains invalid characters')

// --- Exported Validators ---
export const signup = (): ValidationChain[] => [
  nameValidator('userName'),
  nameValidator('name'),
  // nameValidator('gender'),
  // nameValidator('dateOfBirth'),
  ...signupValidator(),
  strongPasswordValidator()
]

const signin = (): ValidationChain[] => [
  ...identifierValidator(),
  loginPasswordValidator()
]

const forgotPassword = (): ValidationChain[] => [...identifierValidator()]

const changePassword = (): ValidationChain[] => [strongPasswordValidator()]

const authSocial = (): ValidationChain[] => [
  nameValidator('userName'),
  nameValidator('name'),
  nameValidator('gender'),
  nameValidator('dateOfBirth'),
  emailValidator()
]

export default {
  signup,
  signin,
  forgotPassword,
  changePassword,
  authSocial
}
