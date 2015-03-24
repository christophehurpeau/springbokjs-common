var Y = require('yielded');

export class Helper {
    constructor(request, response) {
        this.request = request;
        this.response = request.response;
        this.app = request.app;
        this.di = this.app.di;
        this.router = request.router;
        this.basepath = this.app.config.basepath;
    }

    /**
     * This should not be here !
     */
    callAction(controllerName, actionName) {
        var route = this.request.route;
        if (!actionName) {
            actionName = controllerName;
            controllerName = route.controller;
        }
        var Controller = this.app.controllers.main[route.controller];
        if (!Controller) {
            return this.response.notFound(undefined, 'Controller not found: ' + controllerName);
        }
        return this.di.createInstanceOf(Controller).then((controller) => {
            var action = controller[actionName];
            if (!action/* || !action.isAction*/) {
                return this.response.notFound(undefined, 'Action Not Found: ' +
                             route.controller + '.' + route.action);
            }
            controller.helper = this;
            return Y.promise(controller[actionName](this.request, this.response));
        });
    }


    url(to, entry) {
        if (S.isString(to)) {
            return to;
        }
        // TODO put this in springbokjs-router
        var args = to.slice(1), options = {};
        if (args && typeof args[args.length - 1] === 'object') {
            options = args[args.length - 1];
            args = args.slice(0, -1);
        }
        var route = this.app.router.get(to[0]).get(this.request.lang);
        var result = S.string.vformat(route.strf, args);
        if (options.extension) {
            result += '.' + options.extension;
        }
        return result;
    }

    /**
     * This should not be here !
     */
    checkAuthenticated(param) {
        var connected = this.connected;
        if (!connected) {
            this.redirect(['login']);
            throw S.STOP;
        }
        if (param && !this.di.userService.isAllowed(this.user, param)) {
            throw S.HttpError.forbidden();
        }
    }

    /**
     * This should not be here !
     */
    checkHttps() {
        if (this.app.config.allowHttps) {
            if (this.request.isHttps) {
                return true;
            }
            this.redirect('https://' + this.request.headers.host + this.request.url);
            throw S.STOP;
        }
    }

    redirect(to, status, entry) {
        if (typeof status === 'string') {
            entry = status;
            status = S.HttpStatus.FOUND;
        }
        status = status || S.HttpStatus.FOUND;
        var url = this.url(to, entry);
        return this.response.redirect(url, status);
    }

    get isConnected() {
        return !!this.request.connected;
    }

    get connected() {
        return this.request.connected;
    }

    get user() {
        return this.request.user;
    }

    /* translations */
    t(string, args) {
        string = this.locale().appTranslations[string] || string;
        return args ? S.string.vformat(string, args) : string;
    }
    tC(string, args) {
        string = this.locale().coreTranslations[string] || string;
        return args ? S.string.vformat(string, args) : string;
    }
    tF(modelName, string) {
        return string;
    }


    /* render views */

    render() {
        throw new Error('Abstract method');
    }
}
