"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.ModelReport = exports.ReturnStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NOT_PROCESSED"] = "Not processed";
    OrderStatus["PROCESSING"] = "Processing";
    OrderStatus["SHIPPED"] = "Shipped";
    OrderStatus["DELIVERED"] = "Delivered";
    OrderStatus["CANCELLED"] = "Cancelled";
    OrderStatus["RETURNED"] = "Returned";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["PENDING"] = "Pending";
    ReturnStatus["APPROVED"] = "Approved";
    ReturnStatus["REJECTED"] = "Rejected";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
var ModelReport;
(function (ModelReport) {
    ModelReport["STORE"] = "Store";
    ModelReport["PRODUCT"] = "Product";
    ModelReport["REVIEW"] = "Review";
})(ModelReport || (exports.ModelReport = ModelReport = {}));
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
})(Role || (exports.Role = Role = {}));
