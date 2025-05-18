"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVALID_NAME_PATTERNS = exports.PHONE_REGEX = exports.EMAIL_REGEX = exports.NAME_REGEX = void 0;
exports.NAME_REGEX = /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/;
exports.EMAIL_REGEX = /^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
exports.PHONE_REGEX = /^(0|\+?84)([35789])[0-9]{8}$/;
exports.INVALID_NAME_PATTERNS = [/buy[^a-z0-9]*now/i];
