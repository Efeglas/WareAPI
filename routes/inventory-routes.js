const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');
const {
    autenticated,
    hasAccess,   
    accessRightInventory
} = require("../middleware/middleware.js");

router.post('/home', autenticated, async (req, res, next) => {

    const inventory = await Database.models.InventoryModel.findAll({
        include: [
            {model: Database.models.ItemModel, attributes: ['MeasureId']}
        ]
    });

    const counts = {l:0,kg:0,m:0,pcs:0};

    inventory.forEach((inv) => {
        if (inv.Item.MeasureId === 1) {
            counts.kg =  counts.kg + inv.quantity;
        }
        if (inv.Item.MeasureId === 2) {
            counts.m =  counts.m + inv.quantity;
        }
        if (inv.Item.MeasureId === 3) {
            counts.l =  counts.l + inv.quantity;
        }
        if (inv.Item.MeasureId === 4) {
            counts.pcs =  counts.pcs + inv.quantity;
        }
    });
    
    const user = await Database.models.UserModel.findAndCountAll({ where: {visible: 1} });

    const orderin = await Database.models.OrderModel.findAndCountAll({ where: {visible: 1, closed: {[Op.not]: null}, DirectionId: 1} });
    const orderout = await Database.models.OrderModel.findAndCountAll({ where: {visible: 1, closed: {[Op.not]: null}, DirectionId: 2} });
    
    res.json({ message: "Home screen", l:counts.l, m:counts.m, kg:counts.kg, pcs:counts.pcs, user:user.count, orderout:orderout.count, orderin:orderin.count});
    return 
})

router.post('/get', autenticated, accessRightInventory, hasAccess, async (req, res, next) => {
    
    const resultInventory = await Database.models.InventoryModel.findAll({
        attributes: ['id', 'shelflevel', 'quantity'], 
        include: [
            {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]},
            {model: Database.models.ShelfModel, attributes: ['id', 'name', 'levels', 'x1', 'y1', 'x2', 'y2', 'LayoutId']}
        ]});

    res.json({ message: "Inventory accessed", inventory: resultInventory});
    return 
})

router.post('/layout', autenticated, accessRightInventory, hasAccess, async (req, res, next) => {
    
    const data = req.body;

    const resultLayout = await Database.models.LayoutModel.findOne({
        where: {id: data.layout, visible: 1},
        attributes: ['id', 'name', 'width', 'height'],
        include: [
            {model: Database.models.ShelfModel, attributes: ['id', 'name', 'x1', 'y1', 'x2', 'y2'], where: {visible: 1}}
        ]
    });

    res.json({ message: "Layout accessed", layout: resultLayout});
    return 
})

module.exports = router;