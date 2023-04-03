class Validator {

    errors = [];
    valid = [];

    static validate(requestBody, options) {

        this.errors = [];
        this.valid = [];

        try {           
            for (const key in requestBody) {
                if (key === "token") {
                    continue;
                }
    
                if (this.errors.length > 10) {
                    return {valid: false, errors: this.errors}
                }
    
                if (options.hasOwnProperty(key)) {
                    this.valid.push(options[key](requestBody[key]));
                } else {
                    this.errors.push(`Wrong key [${key}] in body`);
                }
            }
    
            return {valid: !this.valid.includes(false), errors: this.errors};
        } catch (error) {
            console.error(error.message);
            return {valid: false, errors: []};
        }
    }
}

module.exports = Validator;