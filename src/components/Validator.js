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

class ParamValueValidator {
    constructor(validator, name, value) {
        this.validator = validator;
        this.name = name;
        this.value = value;
    }
    _error(key) {
        this.validator._error(this.name, key, this.value);
    }
}

class ParamValueStringValidator extends ParamValueValidator {
    notEmpty() {
        if (this.value == null || S.string.isEmpty(this.value)) {
            this._error('notEmpty');
        }
        return this;
    }
}

class ParamValueModelValidator extends ParamValueValidator {
    required() {
        if (this.value == null) {
            this._error('required');
        }
        return this;
    }
    valid(fieldsRequired) {
        if (this.value == null) {
            return this;
        }
        if (S.isString(fieldsRequired)) {
            fieldsRequired = fieldsRequired.split(' ');
        }
        S.forEach(this.value.constructor.Fields, (name, fModel) => {
            var value = this.value[name];
            if (fieldsRequired) {
                if(S.array.has(fieldsRequired, name) && value == null) {
                    this._error('required');
                }
            } else {
                if (value == null && fModel[1] && fModel[1].required) {
                    this._error('required');
                }
            }
            //TODO ...
        });
        return this;
    }
}


class ParamValidator {
    constructor(request) {
        this.request = request;
    }
    _error(name, key, value){
        if (!this._errors) {
            this._errors = {};
        }
        this._errors[name] = {error: key, value: value};
    }
    getErrors(){
        return this._errors;
    }
    hasErrors(){
        return !!this._errors;
    }
    isValid(){
        return !this._errors;
    }

    string(name, position) {
        return new ParamValueStringValidator(this, name, this.request.param(name, position));
    }
    int(name, position){
        return new ParamValueIntValidator(this, name, this.request.param(name, position));
    }
    model(modelName, name){
        name = name || S.string.lcFirst(modelName);
        console.log('paramvalidator model', modelName, M[modelName]);
        var data = this.request.getOrPostParam(name);
        return new ParamValueModelValidator(this, name, !data ? null : new M[modelName](data));
    }
}

class ParamValidatorValid extends ParamValidator{
    _error() {
        /*#if DEV*/ console.warn('Invalid params: ', arguments,
            "\nRoute=" , this.request.route,
            "\nGET=", this.request.query,
            "\nBody=", this.request.body);
        /*#/if*/
        throw S.HttpError.notFound();
    }
}


module.exports = {
    requestMethods: {
        param(name, position) {
            return this.namedParam(name) || ( position && this.otherParam(position) ) || this.paramGET(name);
        },
        namedParam(name) {
            var namedParams = this.route.namedParams;
            return namedParams && namedParams.get(name);
        },
        otherParam(position) {
            var otherParams = this.route.otherParams;
            return otherParams && otherParams[position - 1];
        },
        paramGET(name) {
            var query = this.query;
            return query && query[name];
        },
        paramGETorPOST(name) {
            return this.body[name] !== undefined ? this.body[name] : this.query[name];
        },
        validator() {
            return new ParamValidator(this);
        },
        validParams() {
            return new ParamValidatorValid(this);
        }
    }
};
