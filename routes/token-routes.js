const express = require('express');
const router = express.Router();

const Validator = require('../Validator/Validator.js');
const TokenController = require('../controllers/TokenController.js');
const { validateNotEmpty, validateRefreshtoken } = require('../utility/validate.js');

router.post('/', async (req, res, next) => {
    const data = req.body;
    
    const {valid, errors} = Validator.validate(data, {
        username:validateNotEmpty,
        refreshToken:validateRefreshtoken
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await TokenController.refreshToken(data);

    res.status(status).json({ message: message, data: contrData});
    return;
});

module.exports = router;