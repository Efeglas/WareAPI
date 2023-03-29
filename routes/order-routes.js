const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op, Sequelize } = require('sequelize');
const {
    autenticated,
    hasAccess,
    accessRightRole,
    accessRightUser,
    accessRightOrder
} = require("../middleware/middleware.js");

router.post('/', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
    const data = req.body;
   
    const order = await Database.models.OrderModel.findAll({
      where: {visible: 1},
      include: [
        /* {model: Database.models.OrderItemModel}, */
        {model: Database.models.DirectionModel, attributes: ['id', 'name']},
        {model: Database.models.UserModel, attributes: ['id', 'firstName', 'lastName']}
      ],
    });
    
    res.json({ message: "Orders accessed", data: order});
    return   
})

router.post('/in', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const order = await Database.models.OrderModel.create({DirectionId: 1, UserId: req.midw.decodedToken.id});
  
  res.json({ message: "Order created (IN)", id: order.dataValues.id });
  return   
})

router.post('/out', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const order = await Database.models.OrderModel.create({DirectionId: 2, UserId: req.midw.decodedToken.id});

  res.json({ message: "Order created (OUT)", id: order.dataValues.id});
  return   
})

router.post('/:id', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const order = await Database.models.OrderModel.findOne({
    where: {id: req.params.id},
    attributes: ['id', 'closed', 'createdAt', 'DirectionId'],
    include: [
      {model: Database.models.UserModel, attributes: ['id', 'firstName', 'lastName']},
      {model: Database.models.DirectionModel, attributes: ['id', 'name']},
      {
        model: Database.models.OrderItemModel, 
        attributes: ['id', 'quantity'], 
        include: [
          {model: Database.models.ShelfModel, attributes: ['id', 'name']}, 
          {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]}
        ]},
    ],
  });

  res.json({ message: "Order accesses", data: order});
  return   
})

module.exports = router;