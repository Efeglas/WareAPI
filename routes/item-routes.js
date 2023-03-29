const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');
const {
    autenticated,
    hasAccess,
    accessRightItem,
    accessRightOrder,
} = require("../middleware/middleware.js");

router.post('/get', autenticated, accessRightItem, accessRightOrder, hasAccess, async (req, res, next) => {

    const result = await Database.models.ItemModel.findAll({attributes: ['id', 'name', 'barcode'], where: {visible: 1}, include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]});
    res.json({ message: "Items accessed", data: result});
})

router.post('/measure', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const result = await Database.models.MeasureModel.findAll({where: {visible: 1}, attributes: ['id', 'name']});
    res.json({ message: "Measures accessed", data: result}); 
})

router.post('/add', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const data = req.body;
    const item = await Database.models.ItemModel.create({name: data.name, barcode: data.barcode, MeasureId: data.measure});
    res.json({ message: "Items added"});
})

router.post('/edit', autenticated, accessRightItem, hasAccess, async (req, res, next) => {

    const data = req.body;
    const item = await Database.models.ItemModel.update({name: data.name, barcode: data.barcode, MeasureId: data.measure}, {where: {id: data.id}});
    res.json({ message: "Items edited"});
})

router.post('/delete', autenticated, accessRightItem, hasAccess, async (req, res, next) => {
    
    const data = req.body;
    const item = await Database.models.ItemModel.update({visible: 0}, {where: {id: data.id}});
    res.json({ message: "Items deleted"});
})

module.exports = router;