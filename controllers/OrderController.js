const Database = require('../database/database.js');
const {controllerUnexpectedError} = require('../utility/utility.js');

class OrderController {

    static async getOrders () {

        try {
            const order = await Database.models.OrderModel.findAll({
                where: {visible: 1},
                include: [
                  {model: Database.models.DirectionModel, attributes: ['id', 'name']},
                  {model: Database.models.UserModel, attributes: ['id', 'firstName', 'lastName']}
                ],
            });
                           
            return {status: 200, message: `Orders accessed`, data: order};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async deleteOrder (data) {

        try {
            const order = await Database.models.OrderModel.update({visible: 0}, {where: {id: data.order}});
            return {status: 200, message: `Order deleted`, data: []}; 
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async closeOrder (data) {

        try {
            
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
              return {status: 200, message: `Order closed in`, data: []};
          
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
                return {status: 200, message: `Can not close order`, data: []};
              } else {
                    
                for (const action of actionArray) {
                  if (action.action === "destroy") {       
                    await Database.models.InventoryModel.destroy({where: {id: action.id}});
                  } else {        
                    await Database.models.InventoryModel.update({quantity: action.qty}, {where: {id: action.id}});
                  }
                }
          
                await Database.models.OrderModel.update({closed: new Date()}, {where: {id: data.order}});             
                return {status: 200, message: `Order closed out`, data: []};
              }
            }
                  
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async createOrderIn (req) {
        try {
            const order = await Database.models.OrderModel.create({DirectionId: 1, UserId: req.midw.decodedToken.id});        
            return {status: 200, message: `Order created (IN)`, data: {id: order.dataValues.id}}; 
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async createOrderOut (req) {
        try {
            const order = await Database.models.OrderModel.create({DirectionId: 2, UserId: req.midw.decodedToken.id});        
            return {status: 200, message: `Order created (OUT)`, data: {id: order.dataValues.id}}; 
        } catch (error) {
            console.error(error.message);
            return {status: 500, message: `Unexpected error`, data: []};
        }
    }

    static async addOrderItem (data) {
        try {
            const price = await Database.models.PriceModel.findOne({where: {visible: 1, ItemId: data.item}});
            const orderitem = await Database.models.OrderItemModel.create({quantity: data.quantity, shelflevel: data.shelflevel, OrderId: data.order, ShelfId: data.shelf, ItemId: data.item, PriceId: price.id});           
            return {status: 200, message: `Order item created`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async deleteOrderItem (data) {
        try {
            const orderitem = await Database.models.OrderItemModel.destroy({where: {id: data.orderitem}});
            return {status: 200, message: `Order item deleted`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async editOrderItem (data) {
        try {
            const price = await Database.models.PriceModel.findOne({where: {visible: 1, ItemId: data.item}});
            const orderitem = await Database.models.OrderItemModel.update({quantity: data.quantity, shelflevel: data.shelflevel, ShelfId: data.shelf, ItemId: data.item, PriceId: price.id}, {where: {id: data.orderitem}});
            return {status: 200, message: `Order item edited`, data: []};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async specificOrderData (req) {
        try {
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
                      {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]},
                      {model: Database.models.PriceModel, attributes: ['id', 'price', 'visible']}
                    ]},
                ],
              });
            
              return {status: 200, message: `Order accesses`, data: order};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }

    static async specificOrderItems (req) {
        try {
            const orderitems = await Database.models.OrderItemModel.findAll({
                where: {OrderId: req.params.id},
                attributes: ['id', 'quantity', 'shelflevel'], 
                include: [
                  {model: Database.models.ShelfModel, attributes: ['id', 'name']}, 
                  {model: Database.models.ItemModel, attributes: ['id', 'name', 'barcode'], include: [{model: Database.models.MeasureModel, attributes: ['id', 'name']}]},
                  {model: Database.models.PriceModel, attributes: ['id', 'price', 'visible']}
                ]
              });
            
              return {status: 200, message: `Order Items accesses`, data: orderitems};
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }
}

module.exports = OrderController;