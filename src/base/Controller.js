exports.newAction = function() {

};


export class Controller {
}

var Helper = require('./Helper').Helper;

'app router'.split(' ').concat(Object.getOwnPropertyNames(Helper.prototype)).forEach((key) => {
    var descriptor = Object.getOwnPropertyDescriptor(Helper.prototype, key);
    if (key === 'constructor') {
        return;
    }
    Object.defineProperty(Controller.prototype, key, {
        enumerable: false,
        configurable: true,
        get: !descriptor || descriptor.get ? function() {
            return this.helper[key];
        } : function() {
            return this.helper[key].bind(this.helper);
        }
    });
});

