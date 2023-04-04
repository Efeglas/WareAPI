const express = require('express');
const router = express.Router();
const {
    autenticated,
    hasAccess,
    accessRightLayout,
    accessRightOrder
} = require("../middleware/middleware.js");

const Validator = require('../Validator/Validator.js');
const LayoutController = require('../controllers/LayoutController.js');
const { validatePositiveNumber, validateNotEmpty, validatePositiveNumberWithZero } = require('../utility/validate.js');

router.post('/get', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.getLayouts();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/add', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        name:validateNotEmpty,
        width:validatePositiveNumber,
        height:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.addLayout(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/shelves', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        layout:validatePositiveNumberWithZero,       
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.getShelves(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/shelves/all', autenticated, accessRightLayout, accessRightOrder, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.getAllShelves();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/shelves/add', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        name:validateNotEmpty,
        levels:validatePositiveNumber,
        x1:validatePositiveNumber,
        y1:validatePositiveNumber,
        x2:validatePositiveNumber,
        y2:validatePositiveNumber,
        LayoutId:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.addShelf(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.delete('/shelves', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {      
        id:validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.deleteShelf(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.patch('/shelves', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {      
        id:validatePositiveNumber,
        name:validateNotEmpty
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.renameShelf(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})
    
router.delete('/delete', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {      
        id:validatePositiveNumber,
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await LayoutController.deleteLayout(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

module.exports = router;