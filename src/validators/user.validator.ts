import { check, oneOf } from 'express-validator'

export const updateProfile = () => [
  check('userName')
    .notEmpty()
    .withMessage('UserName is required')
    .isLength({ max: 32 })
    .withMessage('UserName can contain up to 32 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('UserName chỉ chứa chữ, số, dấu gạch dưới'),
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 32 })
    .withMessage('Name can contain up to 32 characters'),
  check('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female'),
  check('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),

  oneOf([
    check('id_card')
      .not()
      .isEmpty()
      .matches(/(^\d{9}$|^\d{12}$)/)
      .withMessage('Id_card must contain 9 or 12 numbers'),
    check('id_card').not().exists()
  ]),

  oneOf([
    check('email')
      .not()
      .isEmpty()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      .withMessage('Email must contain @'),
    check('email').not().exists()
  ]),

  oneOf([
    check('phone')
      .not()
      .isEmpty()
      .matches(/^\d{10,11}$/)
      .withMessage('Phone must contain 10 or 11 numbers'),
    check('phone').not().exists()
  ])
]

export const updateAccount = () => [
  check('currentPassword')
    .not()
    .isEmpty()
    .withMessage('Current Password is required')
    .matches(/^[A-Za-z\d@$!%*?&]*$/)
    .withMessage('Current Password contains invalid characters'),

  check('newPassword')
    .not()
    .isEmpty()
    .withMessage('New password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      'New Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &'
    )
]

export const userAddress = () => [
  check('address')
    .not()
    .isEmpty()
    .withMessage('Address is required')
    .isLength({ max: 200 })
    .withMessage('Address can contain up to 200 characters')
]

//custom validator
export const checkStoreName = (val: string) => {
  const regex = [/buy[^a-z0-9]*now/i]

  let flag = true
  regex.forEach((regex) => {
    if (regex.test(val)) {
      flag = false
    }
  })

  if (!flag) {
    return Promise.reject('Name contains invalid characters')
  }

  return true
}
