"use strict";

var _extends = function (child, parent) {
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  child.__proto__ = parent;
};

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
  var ParamValueValidator = function ParamValueValidator(validator, name, value) {
    this.validator = validator;
    this.name = name;
    this.value = value;
  };

  ParamValueValidator.prototype._error = function (key) {
    this.validator._error(this.name, key, this.value);
  };

  return ParamValueValidator;
})();

var ParamValueStringValidator = (function (ParamValueValidator) {
  var ParamValueStringValidator = function ParamValueStringValidator() {
    ParamValueValidator.apply(this, arguments);
  };

  _extends(ParamValueStringValidator, ParamValueValidator);

  ParamValueStringValidator.prototype.notEmpty = function () {
    if (this.value == null || S.string.isEmpty(this.value)) {
      this._error("notEmpty");
    }
    return this;
  };

  return ParamValueStringValidator;
})(ParamValueValidator);

var ParamValueModelValidator = (function (ParamValueValidator) {
  var ParamValueModelValidator = function ParamValueModelValidator() {
    ParamValueValidator.apply(this, arguments);
  };

  _extends(ParamValueModelValidator, ParamValueValidator);

  ParamValueModelValidator.prototype.required = function () {
    if (this.value == null) {
      this._error("required");
    }
    return this;
  };

  ParamValueModelValidator.prototype.valid = function (fieldsRequired) {
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
  };

  return ParamValueModelValidator;
})(ParamValueValidator);

var ParamValidator = (function () {
  var ParamValidator = function ParamValidator(request) {
    this.request = request;
  };

  ParamValidator.prototype._error = function (name, key, value) {
    if (!this._errors) {
      this._errors = {};
    }
    this._errors[name] = { error: key, value: value };
  };

  ParamValidator.prototype.getErrors = function () {
    return this._errors;
  };

  ParamValidator.prototype.hasErrors = function () {
    return !!this._errors;
  };

  ParamValidator.prototype.isValid = function () {
    return !this._errors;
  };

  ParamValidator.prototype.string = function (name, position) {
    return new ParamValueStringValidator(this, name, this.request.param(name, position));
  };

  ParamValidator.prototype.int = function (name, position) {
    return new ParamValueIntValidator(this, name, this.request.param(name, position));
  };

  ParamValidator.prototype.model = function (modelName, name) {
    name = name || S.string.lcFirst(modelName);
    console.log(modelName, M[modelName]);
    var data = this.request.getOrPostParam(name);
    return new ParamValueModelValidator(this, name, !data ? null : new M[modelName](data));
  };

  return ParamValidator;
})();

var ParamValidatorValid = (function (ParamValidator) {
  var ParamValidatorValid = function ParamValidatorValid() {
    ParamValidator.apply(this, arguments);
  };

  _extends(ParamValidatorValid, ParamValidator);

  ParamValidatorValid.prototype._error = function () {
    /*#if DEV*/console.warn("Invalid params: ", arguments, "\nRoute=", this.request.route, "\nGET=", this.request.query, "\nBody=", this.request.body);
    /*#/if*/
    throw S.HttpError.notFound();
  };

  return ParamValidatorValid;
})(ParamValidator);




module.exports = {
  requestMethods: {
    param: function (name, position) {
      return this.namedParam(name) || (position && this.otherParam(position)) || this.paramGET(name);
    },
    namedParam: function (name) {
      var namedParams = this.route.namedParams;
      return namedParams && namedParams.get(name);
    },
    otherParam: function (position) {
      var otherParams = this.route.otherParams;
      return otherParams && otherParams[position - 1];
    },
    paramGET: function (name) {
      var query = this.query;
      return query && query[name];
    },
    paramGETorPOST: function (name) {
      return this.body[name] !== undefined ? this.body[name] : this.query[name];
    },
    validator: function () {
      return new ParamValidator(this);
    },
    validParams: function () {
      return new ParamValidatorValid(this);
    }
  }
};
//# sourceMappingURL=../components/Validator.js.map