module.exports.validateNotEmpty = (value) => {
    return value.trim() !== "";
}

module.exports.validatePositiveNumber = (value) => {
    return /^[0-9]+$/.test(value) && Number(value) > 0;
}

module.exports.validatePositiveNumberWithZero = (value) => {
    return /^[0-9]+$/.test(value) && Number(value) >= 0;
}

module.exports.validatePositiveFloat = (value) => {
    if (isNaN(value)) {
        return false;
      }
      
      const num = parseFloat(value);
      
      if (isNaN(num)) {
        return false;
      }
      
      if (num <= 0) {
        return false;
      }
      
      return true;
}

module.exports.validateEmail = (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value)
}

module.exports.validatePhone = (value) => {
    const pattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    return pattern.test(value);
}

module.exports.validateChecks = (value) => {
    
    if (typeof value === 'object') {
        
        const arrayIsOk = [];
        for (const key in value) {              
            if (value[key].hasOwnProperty("value")) {
                arrayIsOk.push(true);
            } else {
                arrayIsOk.push(false);
            }
        }

        if (arrayIsOk.includes(false)) {
            return false;
        } else {
            return true;
        }       
    } else {
        return false;
    }
}

module.exports.validateRefreshtoken = (value) => {
    const regex = /^[a-z0-9]+\.[a-z0-9]+$/i;
    return regex.test(value);
}

module.exports.validateDefaultSelect = (value) => {
    return value !== "0";
}
