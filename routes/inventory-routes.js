const express = require('express');
const router = express.Router();
const {
    autenticated,
    hasAccess,   
    accessRightInventory
} = require("../middleware/middleware.js");

const Validator = require('../Validator/Validator.js');
const InventoryController = require('../controllers/InventoryController.js');
const { validatePositiveNumber } = require('../utility/validate.js');

router.post('/home', autenticated, async (req, res, next) => {

    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await InventoryController.homeScreenData();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/get', autenticated, accessRightInventory, hasAccess, async (req, res, next) => {
    
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await InventoryController.getInventory();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/layout', autenticated, accessRightInventory, hasAccess, async (req, res, next) => {
    
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        layout:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await InventoryController.getLayout(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

module.exports = router;