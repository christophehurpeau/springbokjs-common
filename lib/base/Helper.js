"use strict";

var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Y = require("yielded");

var Helper = (function () {
  var Helper = function Helper(request, response) {
    this.request = request;
    this.response = request.response;
    this.app = request.app;
    this.di = this.app.di;
    this.router = request.router;
    this.basepath = this.app.config.basepath;
  };

  Helper.prototype.callAction = function (controllerName, actionName) {
    var _this = this;
    var route = this.request.route;
    if (!actionName) {
      actionName = controllerName;
      controllerName = route.controller;
    }
    var Controller = this.app.controllers.main[route.controller];
    if (!Controller) {
      return this.response.notFound(undefined, "Controller not found: " + controllerName);
    }
    return this.di.createInstanceOf(Controller).then(function (controller) {
      var action = controller[actionName];
      if (!action /* || !action.isAction*/) {
        return _this.response.notFound(undefined, "Action Not Found: " + route.controller + "." + route.action);
      }
      controller.helper = _this;
      return Y.promise(controller[actionName](_this.request, _this.response));
    });
  };

  Helper.prototype.url = function (to, entry) {
    if (S.isString(to)) {
      return to;
    }
    //TODO put this in springbokjs-router
    var args = to.slice(1), options = {};
    if (args && typeof args[args.length - 1] === "object") {
      options = args[args.length - 1];
      args = args.slice(0, -1);
    }
    var route = this.app.router.get(to[0]).get(this.request.lang);
    var result = S.string.vformat(route.strf, args);
    if (options.extension) {
      result += "." + options.extension;
    }
    return result;
  };

  Helper.prototype.checkAuthenticated = function (param) {
    var connected = this.connected;
    if (!connected) {
      this.redirect(["login"]);
      throw S.STOP;
    }
    if (param && !this.di.userService.isAllowed(this.user, param)) {
      throw S.HttpError.forbidden();
    }
  };

  Helper.prototype.checkHttps = function () {
    if (this.app.config.allowHttps) {
      if (this.request.isHttps) {
        return true;
      }
      this.redirect("https://" + this.request.headers.host + this.request.url);
      throw S.STOP;
    }
  };

  Helper.prototype.redirect = function (to, status, entry) {
    if (typeof status === "string") {
      entry = status;
      status = S.HttpStatus.FOUND;
    }
    status = status || S.HttpStatus.FOUND;
    var url = this.url(to, entry);
    return this.response.redirect(url, status);
  };

  Helper.prototype.t = function (string, args) {
    string = this.locale().appTranslations[string] || string;
    return args ? S.string.vformat(string, args) : string;
  };

  Helper.prototype.tC = function (string, args) {
    string = this.locale().coreTranslations[string] || string;
    return args ? S.string.vformat(string, args) : string;
  };

  Helper.prototype.tF = function (modelName, string) {
    return string;
  };

  Helper.prototype.render = function () {
    throw new Error("Abstract method");
  };

  _classProps(Helper, null, {
    isConnected: {
      get: function () {
        return !!this.request.connected;
      }
    },
    connected: {
      get: function () {
        return this.request.connected;
      }
    },
    user: {
      get: function () {
        return this.request.user;
      }
    }
  });

  return Helper;
})();

exports.Helper = Helper;
//# sourceMappingURL=../base/Helper.js.map