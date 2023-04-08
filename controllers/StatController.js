const Database = require('../database/database.js');
const {controllerUnexpectedError} = require('../utility/utility.js');
const { sequelize, Op } = require('sequelize');
const {getMonthsBetween} = require('../utility/utility.js');

class StatController {

    static async getOrder (req) {

        const ordersByMonthIn = await Database.models.OrderModel.findAll({
            attributes: [
                [Database.sequelize.fn('MONTH', Database.sequelize.col('closed')), 'mValue'],
              [Database.sequelize.literal('DATE_FORMAT(closed, "%Y-%m")'), 'month'],
              [Database.sequelize.fn('COUNT', Database.sequelize.col('id')), 'count']
            ],
            where: {
              closed: {
                [Op.between]: [req.query.from, req.query.to]
              },
              DirectionId: 1,
              visible: 1
            },
            group: 'month',
            raw: true
        });

        const ordersByMonthOut = await Database.models.OrderModel.findAll({
            attributes: [
                [Database.sequelize.fn('MONTH', Database.sequelize.col('closed')), 'mValue'],
              [Database.sequelize.literal('DATE_FORMAT(closed, "%Y-%m")'), 'month'],
              [Database.sequelize.fn('COUNT', Database.sequelize.col('id')), 'count']
            ],
            where: {
              closed: {
                [Op.between]: [req.query.from, req.query.to]
              },
              DirectionId: 2,
              visible: 1
            },
            group: 'month',
            raw: true
        });

        const {months, codes} = getMonthsBetween(req.query.from, req.query.to);

        const ordersIn = [];
        const ordersOut = [];

        for (const code of codes) {
            if (ordersByMonthIn.length > 0) {
                const found = ordersByMonthIn.find((item) => {
                    return item.month === code;
                });
                if (found !== undefined) {                  
                    ordersIn.push(found.count);
                } else {
                    ordersIn.push(0);
                }
            } else {
                ordersIn.push(0);
            }

            if (ordersByMonthOut.length > 0) {
                const found = ordersByMonthOut.find((item) => {
                    return item.month === code;
                });
                if (found !== undefined) {                  
                    ordersOut.push(found.count);
                } else {
                    ordersOut.push(0);
                }
            } else {
                ordersOut.push(0);
            }
        }

        return {status: 200, message: `Order stats accessed`, data: {from: req.query.from, to: req.query.to, labels: months, dataIn: ordersIn, dataOut: ordersOut}};
    }

    static async getPrices (req) {

        const prices = await Database.models.PriceModel.findAll({
            where: {
              ItemId: req.query.id
            },
            attributes: ["id", "price", "updatedAt",
            [Database.sequelize.literal("DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s')"), 'updatedAt']
        ],
            order: [
              ['updatedAt', 'ASC']
            ]
        });

        const returnPrices = [];
        const labels = [];

        prices.forEach((price, index) => {
            returnPrices.push(price.price);
            labels.push(price.updatedAt);
        });

        return {status: 200, message: `Price stats accessed`, data: {prices: returnPrices, labels: labels}};
    } 
}

module.exports = StatController;