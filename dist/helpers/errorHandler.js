"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.uniqueMessage = void 0;
const uniqueMessage = (error) => {
    let output;
    try {
        let fieldName = error.message.substring(error.message.lastIndexOf('{') + 2, error.message.lastIndexOf(':'));
        output =
            fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
    }
    catch (ex) {
        output = 'Unique field already exists';
    }
    return output;
};
exports.uniqueMessage = uniqueMessage;
const errorHandler = (error) => {
    let message = '';
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = (0, exports.uniqueMessage)(error);
                break;
            default:
                message = 'Some thing went wrong';
        }
    }
    else {
        message = error.message;
    }
    return message;
};
exports.errorHandler = errorHandler;
