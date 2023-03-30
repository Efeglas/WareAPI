const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');
const {
    autenticated,
    hasAccess,
    accessRightRole,
    accessRightUser,
    accessRightLayout,
    accessRightOrder
} = require("../middleware/middleware.js");

router.post('/get', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultLayouts = await Database.models.LayoutModel.findAll({where: {visible: 1}, attributes: ['id', 'name', 'width', 'height']});
   
    res.json({ message: "Layout accessed", data: resultLayouts});
    return 
})

router.post('/add', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultLayouts = await Database.models.LayoutModel.create({name: data.name, width: data.width, height: data.height});
   
    res.json({ message: "Layout added"});
    return 
})

router.post('/shelves', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultShelves = await Database.models.ShelfModel.findAll({where: {LayoutId: data.layout, visible: 1}});
   
    res.json({ message: "Shelves loaded", data: resultShelves});
    return 
})

router.post('/shelves/all', autenticated, accessRightLayout, accessRightOrder, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultShelves = await Database.models.ShelfModel.findAll({where: { visible: 1}});
   
    res.json({ message: "Shelves loaded", data: resultShelves});
    return 
})

router.post('/shelves/add', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultShelves = await Database.models.ShelfModel.create({name: data.name, levels: data.levels, x1: data.x1, y1: data.y1, x2: data.x2, y2: data.y2, LayoutId: data.LayoutId});
   
    res.json({ message: "Shelf added"});
    return 
})

router.post('/shelves/delete', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const inventory = await Database.models.InventoryModel.findAll({where: {ShelfId: data.id}});

    if (inventory.length > 0) {
        
        res.status(406).json({ message: "Inventory item on shelf"});
        return;
    } else {

        const resultShelves = await Database.models.ShelfModel.update({visible: 0}, {where: {id: data.id}});
        res.json({ message: "Shelf deleted"});
        return 
    }
})

router.post('/shelves/edit', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultShelves = await Database.models.ShelfModel.update({name: data.name}, {where: {id: data.id}});
    res.json({ message: "Shelf edited"});
    return 
})
    
router.post('/delete', autenticated, accessRightLayout, hasAccess, async (req, res, next) => {
    const data = req.body;

    const shelves = await Database.models.ShelfModel.findAll({where: {LayoutId: data.id}});

    if (shelves.length > 0) {
        
        res.status(406).json({ message: "Shelf attached to layout"});
        return;
    } else {

        const resultShelves = await Database.models.LayoutModel.update({visible: 0}, {where: {id: data.id}});
        res.json({ message: "Layout deleted"});
        return 
    }
})

module.exports = router;