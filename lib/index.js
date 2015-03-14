"use strict";

S.newClass = require("es6like-class").newClass;
require("springbokjs-utils/string/html");
require("springbokjs-utils/string/normalize");

Object.assign(S, require("springbokjs-models"));
Object.assign(S, require("springbokjs-dom-components"));
Object.assign(S, require("./base"));

"t tC url connected user".split(" ").forEach(function (key) {
    S.Component.prototype[key] = S.View.prototype[key] = function () {
        return this.helper[key].apply(this.helper, arguments);
    };
});

S.newController = function (descriptor) {
    descriptor["static"] = descriptor["static"] || {};
    descriptor["static"].singleton = false;
    descriptor["extends"] = descriptor["extends"] || S.Controller;
    return S.newClass(descriptor);
};
//# sourceMappingURL=index.js.map