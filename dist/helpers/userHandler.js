"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUserLess = exports.cleanUser = void 0;
/**
 * Làm sạch dữ liệu người dùng trước khi gửi về client
 * Ẩn thông tin nhạy cảm và thông tin bảo mật
 * @param user - Đối tượng người dùng cần làm sạch
 * @returns Người dùng đã được làm sạch
 */
const cleanUser = (user) => {
    const cleanedUser = { ...user }; // Tạo bản sao để tránh thay đổi đối tượng gốc
    if (cleanedUser.email_code)
        cleanedUser.email_code = undefined;
    if (cleanedUser.phone_code)
        cleanedUser.phone_code = undefined;
    if (cleanedUser.forgot_password_code)
        cleanedUser.forgot_password_code = undefined;
    cleanedUser.salt = undefined;
    cleanedUser.hashed_password = undefined;
    cleanedUser.isEmailActive = undefined;
    cleanedUser.isPhoneActive = undefined;
    cleanedUser.addresses = undefined;
    cleanedUser.e_wallet = undefined;
    if (cleanedUser.email)
        cleanedUser.email = cleanedUser.email.slice(0, 6) + '******';
    if (cleanedUser.phone)
        cleanedUser.phone = '*******' + cleanedUser.phone.slice(-3);
    if (cleanedUser.id_card)
        cleanedUser.id_card = cleanedUser.id_card.slice(0, 3) + '******';
    return cleanedUser;
};
exports.cleanUser = cleanUser;
/**
 * Làm sạch dữ liệu người dùng nhưng giữ lại nhiều thông tin hơn
 * @param user - Đối tượng người dùng cần làm sạch
 * @returns Người dùng đã được làm sạch một phần
 */
const cleanUserLess = (user) => {
    const cleanedUser = { ...user }; // Tạo bản sao để tránh thay đổi đối tượng gốc
    if (cleanedUser.email_code)
        cleanedUser.email_code = undefined;
    if (cleanedUser.phone_code)
        cleanedUser.phone_code = undefined;
    if (cleanedUser.forgot_password_code)
        cleanedUser.forgot_password_code = undefined;
    cleanedUser.salt = undefined;
    cleanedUser.hashed_password = undefined;
    return cleanedUser;
};
exports.cleanUserLess = cleanUserLess;
