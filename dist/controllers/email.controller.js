"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.sendReportProductEmail = exports.sendReportStoreEmail = exports.sendBanProductEmail = exports.sendActiveProductEmail = exports.sendCreateStoreEmail = exports.sendBanStoreEmail = exports.sendDeliveryEmailEmail = exports.sendActiveStoreEmail = exports.sendConfirmationEmail = exports.sendChangePasswordEmail = void 0;
const index_model_1 = require("../models/index.model");
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../helpers/errorHandler");
const formatDate_1 = require("../helpers/formatDate");
const transport = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
    }
});
const createEmailTemplate = (title, name, content, buttonText = null, buttonUrl = null) => {
    const buttonHtml = buttonText && buttonUrl
        ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
        <a style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
           href='${buttonUrl}'>
          ${buttonText}
        </a>
      </button>`
        : '';
    return `<div style="line-height: 2.5">
    <h1 style="color: #2266cc"><img src="https://i.imgur.com/uw3oLis.png" alt="Store Image" style="max-width: 4%; height: auto; margin-right: 10px" />${title}</h1>
    <hr/>
    <b>Xin chào ${name},</b>
    <p>Cảm ơn bạn đã lựa chọn Zenpii.</p>
    ${content}
    ${buttonHtml}
    ${!buttonHtml
        ? `
    <p>Trân trọng,</p>
    <i>Đội ngũ hỗ trợ khách hàng</i>
    <p>Email: <a href="mailto:baolong01.dev@gmail.com">baolong01.dev@gmail.com</a></p>`
        : ''}
  </div>`;
};
const sendEmail = (to, subject, html) => {
    const message = {
        from: process.env.ADMIN_EMAIL,
        to,
        subject: `Zenpii E-commerce - ${subject}`,
        html
    };
    return transport.sendMail(message);
};
const handleEmailResponse = (res, next) => {
    return {
        success: () => {
            console.log('Send email successfully');
            if (next) {
                next();
            }
            else if (res) {
                res.status(200).json({ success: 'Send email successfully' });
            }
        },
        error: (error) => {
            console.log('Send email failed', error);
            if (res) {
                res.status(500).json({ error: 'Send email failed' });
            }
        }
    };
};
const sendChangePasswordEmail = (req, res, next) => {
    console.log('Send email to change password');
    const authReq = req;
    const { email, phone, name, title, text, code } = authReq.msg || {};
    if (!email && phone) {
        if (next)
            next();
        return;
    }
    else if (!email && !phone) {
        console.log('No email provided');
        return;
    }
    const clientUrl = `http://localhost:${process.env.CLIENT_PORT_1 || 5173}`;
    const buttonUrl = code ? `${clientUrl}/change/password/${code}` : null;
    const html = createEmailTemplate(title || '', name || '', `<p>${text || ''}</p>`, code ? 'Thay đổi mật khẩu!' : null, buttonUrl);
    sendEmail(email || '', title || '', html)
        .then(() => console.log('Send email successfully'))
        .catch((error) => console.log('Send email failed', error));
};
exports.sendChangePasswordEmail = sendChangePasswordEmail;
const sendConfirmationEmail = (req, res) => {
    var _a, _b;
    const authReq = req;
    if (!((_a = authReq.user) === null || _a === void 0 ? void 0 : _a.email)) {
        res.status(400).json({ error: 'No email provided' });
    }
    if (authReq.user.isEmailActive) {
        res.status(400).json({ error: 'Email Verified' });
    }
    const email_code = jsonwebtoken_1.default.sign({ email: req.body.email }, process.env.JWT_EMAIL_CONFIRM_SECRET || '');
    index_model_1.User.findOneAndUpdate({ _id: (_b = authReq.user) === null || _b === void 0 ? void 0 : _b._id }, { $set: { email_code } }, { new: true })
        .exec()
        .then((user) => {
        var _a;
        if (!user) {
            res.status(500).json({ error: 'User not found' });
            return;
        }
        const title = 'Xác minh địa chỉ email của bạn';
        const text = 'Để có quyền truy cập vào tài khoản của bạn, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết bên dưới.';
        const name = `${user.firstName} ${user.lastName}`;
        const clientUrl = `http://localhost:${process.env.CLIENT_PORT_1 || 5173}`;
        const buttonUrl = `${clientUrl}/verify/email/${email_code}`;
        const html = createEmailTemplate(title, name, `<p>${text}</p>`, 'Xác thực ngay!', buttonUrl);
        const response = handleEmailResponse(res);
        ((_a = authReq.user) === null || _a === void 0 ? void 0 : _a.email) &&
            sendEmail(authReq.user.email, title, html)
                .then(response.success)
                .catch(response.error);
    })
        .catch((error) => {
        res.status(500).json({ error: 'Send email failed' });
    });
};
exports.sendConfirmationEmail = sendConfirmationEmail;
const sendActiveStoreEmail = async (req, res) => {
    try {
        const paramReq = req;
        const user = await index_model_1.User.findById({ _id: paramReq.params.userId });
        const store = await index_model_1.Store.findById({ _id: paramReq.params.storeId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'THÔNG BÁO MỞ KHOÁ TÀI KHOẢN GIAN HÀNG';
        const name = `${user.firstName} ${user.lastName}`;
        const content = `<p style="fontSize:30px">Chúng tôi xin trân trọng thông báo rằng tài khoản shop <strong style="color: #2266cc">${store === null || store === void 0 ? void 0 : store.name}</strong> của quý khách sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc đóng cửa đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        user.email &&
            (await sendEmail(user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendActiveStoreEmail = sendActiveStoreEmail;
const sendDeliveryEmailEmail = async (req, res) => {
    console.log('Send delivery email');
    try {
        const paramReq = req;
        const user = await index_model_1.User.findById({ _id: paramReq.params.userId });
        const order = await index_model_1.Order.findById({ _id: paramReq.params.storeId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'THÔNG BÁO GIAO HÀNG THÀNH CÔNG';
        const name = `${user.firstName} ${user.lastName}`;
        const content = `<p style="fontSize:30px">Chúng tôi xin trân trọng thông báo rằng đơn hàng <strong style="color: #2266cc">${order === null || order === void 0 ? void 0 : order._id}</strong> của quý khách đã được giao thành công vào lúc: <strong>${time}</strong>.<br/></p>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        user.email &&
            (await sendEmail(user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        console.log('Send email failed', error);
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendDeliveryEmailEmail = sendDeliveryEmailEmail;
const sendBanStoreEmail = async (req, res) => {
    try {
        const paramReq = req;
        const user = await index_model_1.User.findById({ _id: paramReq.params.userId });
        const store = await index_model_1.Store.findById({ _id: paramReq.params.storeId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'THÔNG BÁO KHOÁ TÀI KHOẢN GIAN HÀNG';
        const name = `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`;
        const content = `<span>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store === null || store === void 0 ? void 0 : store.name}</strong> của bạn đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</span>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        (user === null || user === void 0 ? void 0 : user.email) &&
            (await sendEmail(user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendBanStoreEmail = sendBanStoreEmail;
const sendCreateStoreEmail = async (req, res) => {
    console.log('Send create store email');
    try {
        const user = await index_model_1.User.findById({ _id: req.params.userId });
        const store = await index_model_1.Store.findById({ _id: req.params.storeId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
        }
        const title = 'THÔNG BÁO MỞ GIAN HÀNG THÀNH CÔNG';
        const name = `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`;
        const content = `<span>Chúng tôi xin trân trọng thông báo rằng gian hàng <strong style="color: #2266cc">${store === null || store === void 0 ? void 0 : store.name}</strong> của Quý khách đã được mở thành công trên hệ thống của chúng tôi.<br/>Đội ngũ hỗ trợ của chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất để hướng dẫn và hỗ trợ trong quá trình vận hành gian hàng.<br/>
    <br/>
    Chúng tôi rất mong gian hàng của Quý khách sẽ đem lại nhiều cơ hội kinh doanh thành công trên nền tảng của chúng tôi.</span>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        (user === null || user === void 0 ? void 0 : user.email) &&
            (await sendEmail(user === null || user === void 0 ? void 0 : user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendCreateStoreEmail = sendCreateStoreEmail;
const sendActiveProductEmail = async (req, res) => {
    try {
        const user = await index_model_1.User.findById({ _id: req.params.userId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'THÔNG BÁO MỞ KHOÁ SẢN PHẨM';
        const name = `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`;
        const content = `<p>Chúng tôi xin trân trọng thông báo rằng sản phẩm của cửa hàng sẽ mở khóa trở lại vào lúc: <strong>${time}</strong>.<br/>Chúng tôi rất xin lỗi vì sự bất tiện mà việc khoá sản phẩm đã gây ra và chân thành cảm ơn sự kiên nhẫn và sự ủng hộ của quý khách hàng trong thời gian qua.<br/>Mong rằng sau quá trình mở khóa, chúng tôi sẽ tiếp tục nhận được sự ủng hộ và hợp tác từ phía quý khách hàng. <br/>Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ với chúng tôi qua email bên dưới.</p>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        (user === null || user === void 0 ? void 0 : user.email) &&
            (await sendEmail(user === null || user === void 0 ? void 0 : user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendActiveProductEmail = sendActiveProductEmail;
const sendBanProductEmail = async (req, res) => {
    try {
        const user = await index_model_1.User.findById({ _id: req.params.userId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'THÔNG BÁO KHOÁ SẢN PHẨM';
        const name = `${user.firstName} ${user.lastName}`;
        const content = `<p>Chúng tôi xin thông báo rằng sản phẩm của shop đã bị khoá vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết và hướng dẫn để khôi phục tài khoản của bạn.</p>`;
        const html = createEmailTemplate(title, name, content);
        const response = handleEmailResponse(res);
        user.email &&
            (await sendEmail(user.email, title, html)
                .then(response.success)
                .catch(response.error));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendBanProductEmail = sendBanProductEmail;
const sendReportStoreEmail = async (req, res) => {
    try {
        const user = await index_model_1.User.findById({ _id: req.params.userId });
        const store = await index_model_1.Store.findById({ _id: req.params.storeId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'BÁO CÁO GIAN HÀNG';
        const name = `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`;
        const content = `<p>Chúng tôi xin thông báo rằng tài khoản shop <strong style="color: #2266cc">${store === null || store === void 0 ? void 0 : store.name}</strong> của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`;
        const html = createEmailTemplate(title, name, content);
        (user === null || user === void 0 ? void 0 : user.email) &&
            (await sendEmail(user === null || user === void 0 ? void 0 : user.email, title, html)
                .then(() => console.log('Send email successfully'))
                .catch((error) => console.log('Send email failed', error)));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendReportStoreEmail = sendReportStoreEmail;
const sendReportProductEmail = async (req, res) => {
    console.log('Send report product email');
    try {
        const user = await index_model_1.User.findById({ _id: req.params.userId });
        if (!user) {
            res.status(400).json({ error: 'User information is missing' });
            return;
        }
        const time = (0, formatDate_1.formatDate)(Date.now());
        const title = 'BÁO CÁO SẢN PHẨM';
        const name = `${user.firstName} ${user.lastName}`;
        const content = `<p>Chúng tôi xin thông báo rằng sản phẩm shop của bạn đã bị báo cáo vào lúc: <strong>${time}</strong> do vi phạm các quy định và điều khoản sử dụng của chúng tôi. <br/> Vui lòng liên hệ với chúng tôi để biết thêm thông tin chi tiết</p>`;
        const html = createEmailTemplate(title, name, content);
        user.email &&
            (await sendEmail(user.email, title, html)
                .then(() => console.log('Send email successfully'))
                .catch((error) => console.log('Send email failed', error)));
    }
    catch (error) {
        res.status(500).json({ error: 'Send email failed' });
    }
};
exports.sendReportProductEmail = sendReportProductEmail;
const verifyEmail = (req, res) => {
    index_model_1.User.findOneAndUpdate({ email_code: req.params.emailCode }, { $set: { isEmailActive: true }, $unset: { email_code: '' } })
        .exec()
        .then((user) => {
        if (!user) {
            res.status(500).json({
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: 'Confirm email successfully'
        });
    })
        .catch((error) => {
        res.status(500).json({
            error: (0, errorHandler_1.errorHandler)(error)
        });
    });
};
exports.verifyEmail = verifyEmail;
