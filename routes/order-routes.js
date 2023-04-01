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
        {model: Database.models.DirectionModel, attributes: ['id', 'name']},
        {model: Database.models.UserModel, attributes: ['id', 'firstName', 'lastName']}
      ],
    });
    
    res.json({ message: "Orders accessed", data: order});
    return   
})

router.delete('/delete', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  const data = req.body;
 
  const order = await Database.models.OrderModel.update({visible: 0}, {where: {id: data.order}});
  
  res.json({ message: "Orders deleted"});
  return   
})

router.post('/close', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  const data = req.body;

  const order = await Database.models.OrderModel.findOne({where: {id: data.order }, attributes: ['DirectionId']});
  const palinOrder = order.get({ plain: true });
  
  const orderItems = await Database.models.OrderItemModel.findAll({
    where: { OrderId: data.order },
    attributes: ["id", "quantity", "shelflevel"],
    include: [
      { model: Database.models.ShelfModel, attributes: ["id", "name"] },
      {
        model: Database.models.ItemModel,
        attributes: ["id", "name", "barcode"],
        include: [
          { model: Database.models.MeasureModel, attributes: ["id", "name"] },
        ],
      },
    ],
  });

  if (palinOrder.DirectionId == 1) {
    
    orderItems.forEach(async (item) => {
      const palinItem = item.get({ plain: true });
      const inventory = await Database.models.InventoryModel.findOne({where: {shelflevel: palinItem.shelflevel, ShelfId: palinItem.Shelf.id, ItemId: palinItem.Item.id}});
      
      if (inventory !== null) {
        const plainInventory = inventory.get({ plain: true });
  
        const newQuantity = plainInventory.quantity + palinItem.quantity;
        await Database.models.InventoryModel.update({quantity: newQuantity}, {where: {id: plainInventory.id}});
      } else {
        await Database.models.InventoryModel.create({shelflevel: palinItem.shelflevel, quantity: palinItem.quantity, ItemId: palinItem.Item.id, ShelfId: palinItem.Shelf.id});
      }
    });

    await Database.models.OrderModel.update({closed: new Date()}, {where: {id: data.order}});
    res.json({ message: "Order closed in" });
    return;

  } else {
    
    const errorArray = [];
    const actionArray = [];

    for (const item of orderItems) {
      
      const palinItem = item.get({ plain: true });
      const inventory = await Database.models.InventoryModel.findOne({where: {shelflevel: palinItem.shelflevel, ShelfId: palinItem.Shelf.id, ItemId: palinItem.Item.id}});
  
      if (inventory !== null) {
  
        const plainInventory = inventory.get({ plain: true });
  
        if (plainInventory.quantity >= palinItem.quantity) {
  
          if (plainInventory.quantity == palinItem.quantity) {            
             actionArray.push({action: "destroy", id: plainInventory.id});
          } else {
            const newQuantity = plainInventory.quantity - palinItem.quantity;
            actionArray.push({action: "update", id: plainInventory.id, qty: newQuantity});           
          }
          
        } else {
  
          errorArray.push(`Not enough quantity! (Item: ${palinItem.Item.name}, Inventory qty.: ${plainInventory.quantity}, OrderItem qty.: ${palinItem.quantity})`);
        } 
      } else {
  
        errorArray.push(`No inventory found! (Item: ${palinItem.Item.name}, Shelf: ${palinItem.Shelf.name}(lvl ${palinItem.shelflevel})`);
      }
      
    }  

    if (errorArray.length > 0) {
      res.json({ message: "Can not close order", error: errorArray });
      return;
    } else {
          
      for (const action of actionArray) {
        if (action.action === "destroy") {       
          await Database.models.InventoryModel.destroy({where: {id: action.id}});
        } else {        
          await Database.models.InventoryModel.update({quantity: action.qty}, {where: {id: action.id}});
        }
      }

      await Database.models.OrderModel.update({closed: new Date()}, {where: {id: data.order}});
      res.json({ message: "Order closed out" });
      return;
    }
  }
 

 
  
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

router.post('/orderitem/add', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;

  const orderitem = await Database.models.OrderItemModel.create({quantity: data.quantity, shelflevel: data.shelflevel, OrderId: data.order, ShelfId: data.shelf, ItemId: data.item});
  
  res.json({ message: "Order item created" });
  return   
})

router.delete('/orderitem/delete', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;
  
  const orderitem = await Database.models.OrderItemModel.destroy({where: {id: data.orderitem}});
  
  res.json({ message: "Order item deleted" });
  return   
})

router.patch('/orderitem/edit', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
 
  const data = req.body;
  
  const orderitem = await Database.models.OrderItemModel.update({quantity: data.quantity, shelflevel: data.shelflevel, ShelfId: data.shelf, ItemId: data.item}, {where: {OrderId: data.order}});
  
  res.json({ message: "Order item edited" });
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
        attributes: ['id', 'quantity', 'shelflevel'], 
        include: [
          {model: Database.models.ShelfModel, attributes: ['id', 'name']}, 
          {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]}
        ]},
    ],
  });

  res.json({ message: "Order accesses", data: order});
  return   
})

router.post('/:id/orderitems', autenticated, accessRightOrder, hasAccess, async (req, res, next) => {
  
  const orderitems = await Database.models.OrderItemModel.findAll({
    where: {OrderId: req.params.id},
    attributes: ['id', 'quantity', 'shelflevel'], 
    include: [
      {model: Database.models.ShelfModel, attributes: ['id', 'name']}, 
      {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]}
    ]
  });

  res.json({ message: "Order Items accesses", data: orderitems});
  return   
});

module.exports = router;