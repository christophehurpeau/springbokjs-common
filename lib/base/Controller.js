"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.newAction = function () {};

var Controller = exports.Controller = function Controller() {
    _classCallCheck(this, Controller);
};

var Helper = require("./Helper").Helper;

"app router".split(" ").concat(Object.getOwnPropertyNames(Helper.prototype)).forEach(function (key) {
    var descriptor = Object.getOwnPropertyDescriptor(Helper.prototype, key);
    if (key === "constructor") {
        return;
    }
    Object.defineProperty(Controller.prototype, key, {
        enumerable: false,
        configurable: true,
        get: !descriptor || descriptor.get ? function () {
            return this.helper[key];
        } : function () {
            if (!this.helper[key]) {
                debugger;
            }
            return this.helper[key].bind(this.helper);
        }
    });
});
//# sourceMappingURL=Controller.js.map