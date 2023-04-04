const Database = require('../database/database.js');
const express = require('express');
const router = express.Router();
const {
    autenticated,
    hasAccess,
    accessRightRole,
    accessRightUser,
    accessRightOrder
} = require("../middleware/middleware.js");

const Validator = require('../Validator/Validator.js');
const OrderController = require('../controllers/OrderController.js');
const { validatePositiveNumber, validateNotEmpty, validatePositiveNumberWithZero, validatePositiveFloat } = require('../utility/validate.js');

router.post('/', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
    const data = req.body;
   
    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await OrderController.getOrders();

    res.status(status).json({ message: message, data: contrData});
    return;  
})

router.delete('/delete', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  const data = req.body;
 
  const {valid, errors} = Validator.validate(data, {
    order:validatePositiveNumber
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.deleteOrder(data);

  res.status(status).json({ message: message, data: contrData});
  return; 
})

router.post('/close', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    order:validatePositiveNumber
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.closeOrder(data);

  res.status(status).json({ message: message, data: contrData});
  return; 
})

router.post('/in', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {});
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.createOrderIn(req);

  res.status(status).json({ message: message, data: contrData});
  return; 
})

router.post('/out', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {});
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.createOrderOut(req);

  res.status(status).json({ message: message, data: contrData});
  return; 
})

router.post('/orderitem/add', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    item:validatePositiveNumber,
    quantity:validatePositiveFloat,
    shelflevel:validatePositiveNumber,
    order:validatePositiveNumber,
    shelf:validatePositiveNumber,
    item:validatePositiveNumber,
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.addOrderItem(data);

  res.status(status).json({ message: message, data: contrData});
  return; 
})

router.delete('/orderitem', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;
  
  const {valid, errors} = Validator.validate(data, {
    orderitem:validatePositiveNumber,   
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.deleteOrderItem(data);

  res.status(status).json({ message: message, data: contrData});
  return; 

})

router.patch('/orderitem', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;
  
  const {valid, errors} = Validator.validate(data, {
    orderitem:validatePositiveNumber,
    item:validatePositiveNumber,
    quantity:validatePositiveFloat,
    shelflevel:validatePositiveNumber,
    shelf:validatePositiveNumber,
    item:validatePositiveNumber,
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.editOrderItem(data);

  res.status(status).json({ message: message, data: contrData});
  return;
})

router.post('/:id', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const {valid, errors} = Validator.validate(req.params, {
    id:validatePositiveNumber
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.specificOrderData(req);

  res.status(status).json({ message: message, data: contrData});
  return;
})

router.post('/:id/orderitems', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const {valid, errors} = Validator.validate(req.params, {
    id:validatePositiveNumber
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await OrderController.specificOrderItems(req);

  res.status(status).json({ message: message, data: contrData});
  return;
});

module.exports = router;