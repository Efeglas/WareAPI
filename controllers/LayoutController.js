const Database = require('../database/database.js');
const {controllerUnexpectedError} = require('../utility/utility.js');

class LayoutController {

    static async getLayouts () {

        try {
            const resultLayouts = await Database.models.LayoutModel.findAll({where: {visible: 1}, attributes: ['id', 'name', 'width', 'height']});            
            return {status: 200, message: `Layout accessed`, data: resultLayouts};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async addLayout (data) {

        try {
            const resultLayouts = await Database.models.LayoutModel.create({name: data.name, width: data.width, height: data.height});          
            return {status: 200, message: `Layout added`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async getShelves (data) {

        try {
            const resultShelves = await Database.models.ShelfModel.findAll({where: {LayoutId: data.layout, visible: 1}});           
            return {status: 200, message: `Shelves loaded`, data: resultShelves};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async getAllShelves () {

        try {
            const resultShelves = await Database.models.ShelfModel.findAll({where: { visible: 1}});
            return {status: 200, message: `Shelves loaded`, data: resultShelves};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async addShelf (data) {

        try {
            const resultShelves = await Database.models.ShelfModel.create({name: data.name, levels: data.levels, x1: data.x1, y1: data.y1, x2: data.x2, y2: data.y2, LayoutId: data.LayoutId});
            return {status: 200, message: `Shelf added`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async deleteShelf (data) {

        try {
            const inventory = await Database.models.InventoryModel.findAll({where: {ShelfId: data.id}});

            if (inventory.length > 0) {
                           
                return {status: 406, message: `Inventory item on shelf`, data: []};
            } else {

                const resultShelves = await Database.models.ShelfModel.update({visible: 0}, {where: {id: data.id}});              
                return {status: 200, message: `Shelf deleted`, data: []};
            }
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async renameShelf (data) {

        try {
            const resultShelves = await Database.models.ShelfModel.update({name: data.name}, {where: {id: data.id}});       
            return {status: 200, message: `Shelf edited`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async deleteLayout (data) {

        try {
            const shelves = await Database.models.ShelfModel.findAll({where: {LayoutId: data.id, visible: 1}});

            if (shelves.length > 0) {
                return {status: 406, message: `Shelf attached to layout`, data: []};
            } else {

                const resultShelves = await Database.models.LayoutModel.update({visible: 0}, {where: {id: data.id}});              
                return {status: 200, message: `Layout deleted`, data: []};
            }
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }
}

module.exports = LayoutController;