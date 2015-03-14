"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

    _createClass(ParamValueValidator, {
        _error: {
            value: function _error(key) {
                this.validator._error(this.name, key, this.value);
            }
        }
    });

    return ParamValueValidator;
})();

var ParamValueStringValidator = (function (_ParamValueValidator) {
    function ParamValueStringValidator() {
        _classCallCheck(this, ParamValueStringValidator);

        if (_ParamValueValidator != null) {
            _ParamValueValidator.apply(this, arguments);
        }
    }

    _inherits(ParamValueStringValidator, _ParamValueValidator);

    _createClass(ParamValueStringValidator, {
        notEmpty: {
            value: function notEmpty() {
                if (this.value == null || S.string.isEmpty(this.value)) {
                    this._error("notEmpty");
                }
                return this;
            }
        }
    });

    return ParamValueStringValidator;
})(ParamValueValidator);

var ParamValueModelValidator = (function (_ParamValueValidator2) {
    function ParamValueModelValidator() {
        _classCallCheck(this, ParamValueModelValidator);

        if (_ParamValueValidator2 != null) {
            _ParamValueValidator2.apply(this, arguments);
        }
    }

    _inherits(ParamValueModelValidator, _ParamValueValidator2);

    _createClass(ParamValueModelValidator, {
        required: {
            value: function required() {
                if (this.value == null) {
                    this._error("required");
                }
                return this;
            }
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
            }
        }
    });

    return ParamValueModelValidator;
})(ParamValueValidator);

var ParamValidator = (function () {
    function ParamValidator(request) {
        _classCallCheck(this, ParamValidator);

        this.request = request;
    }

    _createClass(ParamValidator, {
        _error: {
            value: function _error(name, key, value) {
                if (!this._errors) {
                    this._errors = {};
                }
                this._errors[name] = { error: key, value: value };
            }
        },
        getErrors: {
            value: function getErrors() {
                return this._errors;
            }
        },
        hasErrors: {
            value: function hasErrors() {
                return !!this._errors;
            }
        },
        isValid: {
            value: function isValid() {
                return !this._errors;
            }
        },
        string: {
            value: function string(name, position) {
                return new ParamValueStringValidator(this, name, this.request.param(name, position));
            }
        },
        int: {
            value: function int(name, position) {
                return new ParamValueIntValidator(this, name, this.request.param(name, position));
            }
        },
        model: {
            value: function model(modelName, name) {
                name = name || S.string.lcFirst(modelName);
                console.log("paramvalidator model", modelName, M[modelName]);
                var data = this.request.getOrPostParam(name);
                return new ParamValueModelValidator(this, name, !data ? null : new M[modelName](data));
            }
        }
    });

    return ParamValidator;
})();

var ParamValidatorValid = (function (_ParamValidator) {
    function ParamValidatorValid() {
        _classCallCheck(this, ParamValidatorValid);

        if (_ParamValidator != null) {
            _ParamValidator.apply(this, arguments);
        }
    }

    _inherits(ParamValidatorValid, _ParamValidator);

    _createClass(ParamValidatorValid, {
        _error: {
            value: function _error() {
                /*#if DEV*/console.warn("Invalid params: ", arguments, "\nRoute=", this.request.route, "\nGET=", this.request.query, "\nBody=", this.request.body);
                /*#/if*/
                throw S.HttpError.notFound();
            }
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