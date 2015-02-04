"use strict";

exports.newAction = function () {};


var Controller = function Controller() {};

exports.Controller = Controller;


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
//# sourceMappingURL=../base/Controller.js.map