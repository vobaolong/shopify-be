"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStoreName = exports.userAddress = exports.updateAccount = exports.updateProfile = void 0;
const express_validator_1 = require("express-validator");
const updateProfile = () => [
    (0, express_validator_1.check)('firstName')
        .not()
        .isEmpty()
        .withMessage('FirstName is required')
        .isLength({ max: 32 })
        .withMessage('FirstName can contain up to 32 characters')
        .matches(/^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\s]+$/)
        .withMessage("FirstName can contain numbers, some special characters such as _, ', - and space")
        .custom(exports.checkStoreName),
    (0, express_validator_1.check)('lastName')
        .not()
        .isEmpty()
        .withMessage('LastName is required')
        .isLength({ max: 32 })
        .withMessage('LastName can contain up to 32 characters')
        .matches(/^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\s]+$/)
        .withMessage("LastName can contain numbers, some special characters such as _, ', - and space")
        .custom(exports.checkStoreName),
    (0, express_validator_1.oneOf)([
        (0, express_validator_1.check)('id_card')
            .not()
            .isEmpty()
            .matches(/(^\d{9}$|^\d{12}$)/),
        (0, express_validator_1.check)('id_card').not().exists()
    ], 'Id_card must contain 9 or 12 numbers'),
    (0, express_validator_1.oneOf)([
        (0, express_validator_1.check)('email')
            .not()
            .isEmpty()
            .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        (0, express_validator_1.check)('email').not().exists()
    ], 'Email must contain @'),
    (0, express_validator_1.oneOf)([
        (0, express_validator_1.check)('phone')
            .not()
            .isEmpty()
            .matches(/^\d{10,11}$/),
        (0, express_validator_1.check)('phone').not().exists()
    ], 'Phone must contain 10 or 11 numbers')
];
exports.updateProfile = updateProfile;
const updateAccount = () => [
    (0, express_validator_1.check)('currentPassword')
        .not()
        .isEmpty()
        .withMessage('Current Password is required')
        .matches(/^[A-Za-z\d@$!%*?&]*$/)
        .withMessage('Current Password contains invalid characters'),
    (0, express_validator_1.check)('newPassword')
        .not()
        .isEmpty()
        .withMessage('New password is required')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('New Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &')
];
exports.updateAccount = updateAccount;
const userAddress = () => [
    (0, express_validator_1.check)('address')
        .not()
        .isEmpty()
        .withMessage('Address is required')
        .isLength({ max: 200 })
        .withMessage('Address can contain up to 200 characters')
];
exports.userAddress = userAddress;
//custom validator
const checkStoreName = (val) => {
    const regex = [/buy[^a-z0-9]*now/i];
    let flag = true;
    regex.forEach((regex) => {
        if (regex.test(val)) {
            flag = false;
        }
    });
    if (!flag) {
        return Promise.reject('Name contains invalid characters');
    }
    return true;
};
exports.checkStoreName = checkStoreName;
