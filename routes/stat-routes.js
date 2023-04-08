const express = require('express');
const router = express.Router();
const {
    autenticated,
    hasAccess,
    accessRightStat,
} = require("../middleware/middleware.js");

const Validator = require('../Validator/Validator.js');
const StatController = require('../controllers/StatController.js');
const { validateNotEmpty, validatePositiveNumber, validateDefaultSelect } = require('../utility/validate.js');

router.get('/orders', autenticated, accessRightStat, hasAccess, async (req, res, next) => {
    
    const params = req.params;

    const {status, message, data: contrData} = await StatController.getOrder(req);

    res.status(status).json({ message: message, data: contrData});
    return;  
})

router.get('/prices', autenticated, accessRightStat, hasAccess, async (req, res, next) => {
    
    const params = req.params;

    const {status, message, data: contrData} = await StatController.getPrices(req);

    res.status(status).json({ message: message, data: contrData});
    return;  
})

module.exports = router;