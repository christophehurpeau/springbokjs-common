"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Y = require("yielded");

var Helper = exports.Helper = (function () {
    function Helper(request, response) {
        _classCallCheck(this, Helper);

        this.request = request;
        this.response = request.response;
        this.app = request.app;
        this.di = this.app.di;
        this.router = request.router;
        this.basepath = this.app.config.basepath;
    }

    _createClass(Helper, {
        callAction: {

            /**
             * This should not be here !
             */

            value: function callAction(controllerName, actionName) {
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
            }
        },
        url: {
            value: function url(to, entry) {
                if (S.isString(to)) {
                    return to;
                }
                // TODO put this in springbokjs-router
                var args = to.slice(1),
                    options = {};
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
            }
        },
        checkAuthenticated: {

            /**
             * This should not be here !
             */

            value: function checkAuthenticated(param) {
                var connected = this.connected;
                if (!connected) {
                    this.redirect(["login"]);
                    throw S.STOP;
                }
                if (param && !this.di.userService.isAllowed(this.user, param)) {
                    throw S.HttpError.forbidden();
                }
            }
        },
        checkHttps: {

            /**
             * This should not be here !
             */

            value: function checkHttps() {
                if (this.app.config.allowHttps) {
                    if (this.request.isHttps) {
                        return true;
                    }
                    this.redirect("https://" + this.request.headers.host + this.request.url);
                    throw S.STOP;
                }
            }
        },
        redirect: {
            value: function redirect(to, status, entry) {
                if (typeof status === "string") {
                    entry = status;
                    status = S.HttpStatus.FOUND;
                }
                status = status || S.HttpStatus.FOUND;
                var url = this.url(to, entry);
                return this.response.redirect(url, status);
            }
        },
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
        },
        t: {

            /* translations */

            value: function t(string, args) {
                string = this.locale().appTranslations[string] || string;
                return args ? S.string.vformat(string, args) : string;
            }
        },
        tC: {
            value: function tC(string, args) {
                string = this.locale().coreTranslations[string] || string;
                return args ? S.string.vformat(string, args) : string;
            }
        },
        tF: {
            value: function tF(modelName, string) {
                return string;
            }
        },
        render: {

            /* render views */

            value: function render() {
                throw new Error("Abstract method");
            }
        }
    });

    return Helper;
})();
//# sourceMappingURL=Helper.js.map