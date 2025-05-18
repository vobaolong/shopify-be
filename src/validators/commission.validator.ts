import { check } from 'express-validator'

const commission = () => [
  check('name')
    .not()
    .isEmpty()
    .withMessage('name is required')
    .isLength({ max: 32 })
    .withMessage('name can contain up to 32 characters')
    .matches(
      /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]+$/
    )
    .withMessage(
      "name must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)"
    ),

  check('fee')
    .not()
    .isEmpty()
    .withMessage('Commission fee is required')
    .isFloat({ min: 0 })
    .withMessage('Commission fee must be decimal and greater than zero')
]

export default {
  commission
}
