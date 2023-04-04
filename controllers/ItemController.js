const Database = require('../database/database.js');
const {controllerUnexpectedError} = require('../utility/utility.js');

class ItemController {

    static async getItems () {
        try {
            
            const result = await Database.models.ItemModel.findAll({
                attributes: ['id', 'name', 'barcode'], 
                where: {visible: 1}, 
                include: [
                    {model: Database.models.MeasureModel, attributes: ['id', 'name']},
                    {model: Database.models.PriceModel, attributes: ['id', 'price'], where: {visible: 1}},
                ]
            });
           
            return {status: 200, message: `Items accessed`, data: result};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async getMeasures () {

        try {

            const result = await Database.models.MeasureModel.findAll({where: {visible: 1}, attributes: ['id', 'name']});         
            return {status: 200, message: `Measures accessed`, data: result}; 
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async addItem (data) {

        try {
            
            const item = await Database.models.ItemModel.create({name: data.name, barcode: data.barcode, MeasureId: data.measure});    
            const price = await Database.models.PriceModel.create({price: data.price, ItemId: item.id});          
            return {status: 200, message: `Item added`, data: []}; 
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async editItem (data) {

        try {
            const item = await Database.models.ItemModel.update({name: data.name, barcode: data.barcode, MeasureId: data.measure}, {where: {id: data.id}});
            const updateOldPrice = await Database.models.PriceModel.update({visible: 0}, {where: {ItemId: data.id, visible: 1}});
            const price = await Database.models.PriceModel.create({price: data.price, ItemId: data.id});        
            return {status: 200, message: `Item edited`, data: []}; 
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async deleteItem (data) {

        try {
            const item = await Database.models.ItemModel.update({visible: 0}, {where: {id: data.id}});
            return {status: 200, message: `Item deleted`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }
}

module.exports = ItemController;