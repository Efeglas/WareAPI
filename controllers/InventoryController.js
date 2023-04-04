const Database = require('../database/database.js');
const { Op } = require('sequelize');
const {controllerUnexpectedError} = require('../utility/utility.js');

class InventoryController {

    static async homeScreenData () {
        try {

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
                     
            return {status: 200, message: `Home screen`, data: {l:counts.l, m:counts.m, kg:counts.kg, pcs:counts.pcs, user:user.count, orderout:orderout.count, orderin:orderin.count}};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async getInventory () {

        try {

            const resultInventory = await Database.models.InventoryModel.findAll({
                attributes: ['id', 'shelflevel', 'quantity'], 
                include: [
                    {
                        model: Database.models.ItemModel, 
                        attributes: ['id', 'name', 'barcode'], 
                        include: [
                            {model: Database.models.MeasureModel, attributes: ['id', 'name']},
                            {model: Database.models.PriceModel, attributes: ['id', 'price'], where: {visible: 1}}
                        ]
                    },
                    {model: Database.models.ShelfModel, attributes: ['id', 'name', 'levels', 'x1', 'y1', 'x2', 'y2', 'LayoutId']}
                ]});
        
            return {status: 200, message: `Inventory accessed`, data: resultInventory};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async getLayout (data) {

        try {
            const resultLayout = await Database.models.LayoutModel.findOne({
                where: {id: data.layout, visible: 1},
                attributes: ['id', 'name', 'width', 'height'],
                include: [
                    {model: Database.models.ShelfModel, attributes: ['id', 'name', 'x1', 'y1', 'x2', 'y2'], where: {visible: 1}}
                ]
            });
                  
            return {status: 200, message: `Layout accessed`, data: resultLayout};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }
}

module.exports = InventoryController;