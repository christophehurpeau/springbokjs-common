"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//TODO springbokjs-validator
/*
S.extendPrototype(Validator, {
    validParams() {
        this.error = function(){ throw S.HttpError.notFound();};
    },
    error(msg) {
        this._errors.push(msg);
    },
    getErrors() {
        return this._errors;
    },
    hasErrors() {
        return !!this._errors;
    },
    isValid() {
        return !this._errors;
    }
});
*/

var ParamValueValidator = (function () {
    function ParamValueValidator(validator, name, value) {
        _classCallCheck(this, ParamValueValidator);

        this.validator = validator;
        this.name = name;
        this.value = value;
    }

    _prototypeProperties(ParamValueValidator, null, {
        _error: {
            value: function _error(key) {
                this.validator._error(this.name, key, this.value);
            },
            writable: true,
            configurable: true
        }
    });

    return ParamValueValidator;
})();

var ParamValueStringValidator = (function (ParamValueValidator) {
    function ParamValueStringValidator() {
        _classCallCheck(this, ParamValueStringValidator);

        if (ParamValueValidator != null) {
            ParamValueValidator.apply(this, arguments);
        }
    }

    _inherits(ParamValueStringValidator, ParamValueValidator);

    _prototypeProperties(ParamValueStringValidator, null, {
        notEmpty: {
            value: function notEmpty() {
                if (this.value == null || S.string.isEmpty(this.value)) {
                    this._error("notEmpty");
                }
                return this;
            },
            writable: true,
            configurable: true
        }
    });

    return ParamValueStringValidator;
})(ParamValueValidator);

var ParamValueModelValidator = (function (ParamValueValidator) {
    function ParamValueModelValidator() {
        _classCallCheck(this, ParamValueModelValidator);

        if (ParamValueValidator != null) {
            ParamValueValidator.apply(this, arguments);
        }
    }

    _inherits(ParamValueModelValidator, ParamValueValidator);

    _prototypeProperties(ParamValueModelValidator, null, {
        required: {
            value: function required() {
                if (this.value == null) {
                    this._error("required");
                }
                return this;
            },
            writable: true,
            configurable: true
        },
        valid: {
            value: function valid(fieldsRequired) {
                var _this = this;
                if (this.value == null) {
                    return this;
                }
                if (S.isString(fieldsRequired)) {
                    fieldsRequired = fieldsRequired.split(" ");
                }
                S.forEach(this.value.constructor.Fields, function (name, fModel) {
                    var value = _this.value[name];
                    if (fieldsRequired) {
                        if (S.array.has(fieldsRequired, name) && value == null) {
                            _this._error("required");
                        }
                    } else {
                        if (value == null && fModel[1] && fModel[1].required) {
                            _this._error("required");
                        }
                    }
                    //TODO ...
                });
                return this;
            },
            writable: true,
            configurable: true
        }
    });

    return ParamValueModelValidator;
})(ParamValueValidator);

var ParamValidator = (function () {
    function ParamValidator(request) {
        _classCallCheck(this, ParamValidator);

        this.request = request;
    }

    _prototypeProperties(ParamValidator, null, {
        _error: {
            value: function _error(name, key, value) {
                if (!this._errors) {
                    this._errors = {};
                }
                this._errors[name] = { error: key, value: value };
            },
            writable: true,
            configurable: true
        },
        getErrors: {
            value: function getErrors() {
                return this._errors;
            },
            writable: true,
            configurable: true
        },
        hasErrors: {
            value: function hasErrors() {
                return !!this._errors;
            },
            writable: true,
            configurable: true
        },
        isValid: {
            value: function isValid() {
                return !this._errors;
            },
            writable: true,
            configurable: true
        },
        string: {
            value: function string(name, position) {
                return new ParamValueStringValidator(this, name, this.request.param(name, position));
            },
            writable: true,
            configurable: true
        },
        int: {
            value: function int(name, position) {
                return new ParamValueIntValidator(this, name, this.request.param(name, position));
            },
            writable: true,
            configurable: true
        },
        model: {
            value: function model(modelName, name) {
                name = name || S.string.lcFirst(modelName);
                console.log("paramvalidator model", modelName, M[modelName]);
                var data = this.request.getOrPostParam(name);
                return new ParamValueModelValidator(this, name, !data ? null : new M[modelName](data));
            },
            writable: true,
            configurable: true
        }
    });

    return ParamValidator;
})();

var ParamValidatorValid = (function (ParamValidator) {
    function ParamValidatorValid() {
        _classCallCheck(this, ParamValidatorValid);

        if (ParamValidator != null) {
            ParamValidator.apply(this, arguments);
        }
    }

    _inherits(ParamValidatorValid, ParamValidator);

    _prototypeProperties(ParamValidatorValid, null, {
        _error: {
            value: function _error() {
                /*#if DEV*/console.warn("Invalid params: ", arguments, "\nRoute=", this.request.route, "\nGET=", this.request.query, "\nBody=", this.request.body);
                /*#/if*/
                throw S.HttpError.notFound();
            },
            writable: true,
            configurable: true
        }
    });

    return ParamValidatorValid;
})(ParamValidator);




module.exports = {
    requestMethods: {
        param: function param(name, position) {
            return this.namedParam(name) || position && this.otherParam(position) || this.paramGET(name);
        },
        namedParam: function namedParam(name) {
            var namedParams = this.route.namedParams;
            return namedParams && namedParams.get(name);
        },
        otherParam: function otherParam(position) {
            var otherParams = this.route.otherParams;
            return otherParams && otherParams[position - 1];
        },
        paramGET: function paramGET(name) {
            var query = this.query;
            return query && query[name];
        },
        paramGETorPOST: function paramGETorPOST(name) {
            return this.body[name] !== undefined ? this.body[name] : this.query[name];
        },
        validator: function validator() {
            return new ParamValidator(this);
        },
        validParams: function validParams() {
            return new ParamValidatorValid(this);
        }
    }
};
//# sourceMappingURL=../components/Validator.js.map