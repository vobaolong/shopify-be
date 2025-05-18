import { check, ValidationChain } from 'express-validator'
import Commission from '../models/commission.model'
import { INVALID_NAME_PATTERNS, NAME_REGEX } from '../constants/regex.constant'

// --- Custom Validators ---
const checkStoreName = (val: string): boolean | Promise<never> => {
  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(val)) {
      return Promise.reject('Store name contains invalid marketing terms')
    }
  }
  return true
}

const checkCommission = async (val: string): Promise<void> => {
  const commission = await Commission.findOne({ _id: val, isDeleted: false })
  if (!commission) {
    return Promise.reject('Commission not found')
  }
}

// --- Reusable Field Validators ---
const storeNameValidator = (): ValidationChain =>
  check('name')
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name can contain up to 100 characters')
    .matches(NAME_REGEX)
    .withMessage(
      "Store name must contain at least one letter (letters, numbers, spaces, _, ', - allowed)"
    )
    .custom(checkStoreName)

const bioValidator = (): ValidationChain =>
  check('bio')
    .notEmpty()
    .withMessage('Store bio is required')
    .isLength({ max: 3000 })
    .withMessage('Store bio can contain up to 3000 characters')

const commissionValidator = (): ValidationChain =>
  check('commissionId')
    .notEmpty()
    .withMessage('CommissionId is required')
    .custom(checkCommission)

const booleanFieldValidator = (field: string): ValidationChain =>
  check(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isBoolean()
    .withMessage(`${field} must be boolean`)

// --- Main Validators ---

const createStore = (): ValidationChain[] => [
  storeNameValidator(),
  bioValidator(),
  commissionValidator()
]

const updateStore = (): ValidationChain[] => [
  storeNameValidator(),
  bioValidator()
]

const activeStore = (): ValidationChain[] => [booleanFieldValidator('isActive')]

const openStore = (): ValidationChain[] => [booleanFieldValidator('isOpen')]

const updateCommission = (): ValidationChain[] => [commissionValidator()]

export default {
  createStore,
  updateStore,
  activeStore,
  openStore,
  updateCommission
}
