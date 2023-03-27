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

router.post('/get', autenticated, accessRightInventory, hasAccess, async (req, res, next) => {
    
    const resultInventory = await Database.models.InventoryModel.findAll({
        attributes: ['id', 'shelflevel', 'quantity'], 
        include: [
            {model: Database.models.ItemModel, attributes: ['id', 'name'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]},
            {model: Database.models.ShelfModel, attributes: ['id', 'name', 'levels', 'x1', 'y1', 'x2', 'y2', 'LayoutId']}
        ]});

    res.json({ message: "Inventory accessed", inventory: resultInventory});
    return 
})

module.exports = router;