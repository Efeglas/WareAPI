const express = require('express');
const router = express.Router();
const {
    autenticated,
    hasAccess,
    accessRightItem,
    accessRightOrder,
    accessRightStat
} = require("../middleware/middleware.js");

const Validator = require('../Validator/Validator.js');
const ItemController = require('../controllers/ItemController.js');
const { validateNotEmpty, validatePositiveNumber, validateDefaultSelect } = require('../utility/validate.js');

router.post('/get', autenticated, accessRightItem, accessRightStat, accessRightOrder, hasAccess, async (req, res, next) => {

    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await ItemController.getItems();

    res.status(status).json({ message: message, data: contrData});
    return;   
})

router.post('/measure', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await ItemController.getMeasures();

    res.status(status).json({ message: message, data: contrData});
    return;    
})

router.post('/add', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const data = req.body;
 
    const {valid, errors} = Validator.validate(data, {
        name:validateNotEmpty,
        barcode:validatePositiveNumber,
        price:validatePositiveNumber,
        measure:validateDefaultSelect
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await ItemController.addItem(data);

    res.status(status).json({ message: message, data: contrData});
    return;  
})

router.patch('/', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const data = req.body;
    
    const {valid, errors} = Validator.validate(data, {
        name:validateNotEmpty,
        barcode:validatePositiveNumber,
        price:validatePositiveNumber,
        measure:validateDefaultSelect,
        id:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await ItemController.editItem(data);

    res.status(status).json({ message: message, data: contrData});
    return;  
})

router.delete('/', autenticated, accessRightItem, hasAccess, async (req, res, next) => {
    
    const data = req.body;
    
    const {valid, errors} = Validator.validate(data, {     
        id:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await ItemController.deleteItem(data);

    res.status(status).json({ message: message, data: contrData});
    return;  
})

module.exports = router;