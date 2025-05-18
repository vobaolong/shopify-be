import { check, oneOf } from 'express-validator'

export const updateProfile = () => [
  check('firstName')
    .not()
    .isEmpty()
    .withMessage('FirstName is required')
    .isLength({ max: 32 })
    .withMessage('FirstName can contain up to 32 characters')
    .matches(
      /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\s]+$/
    )
    .withMessage(
      "FirstName can contain numbers, some special characters such as _, ', - and space"
    )
    .custom(checkStoreName),

  check('lastName')
    .not()
    .isEmpty()
    .withMessage('LastName is required')
    .isLength({ max: 32 })
    .withMessage('LastName can contain up to 32 characters')
    .matches(
      /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\s]+$/
    )
    .withMessage(
      "LastName can contain numbers, some special characters such as _, ', - and space"
    )
    .custom(checkStoreName),

  oneOf(
    [
      check('id_card')
        .not()
        .isEmpty()
        .matches(/(^\d{9}$|^\d{12}$)/),

      check('id_card').not().exists()
    ],
    'Id_card must contain 9 or 12 numbers'
  ),

  oneOf(
    [
      check('email')
        .not()
        .isEmpty()
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),

      check('email').not().exists()
    ],
    'Email must contain @'
  ),

  oneOf(
    [
      check('phone')
        .not()
        .isEmpty()
        .matches(/^\d{10,11}$/),

      check('phone').not().exists()
    ],
    'Phone must contain 10 or 11 numbers'
  )
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
export const checkStoreName = (val) => {
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
