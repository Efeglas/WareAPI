const { Sequelize } = require('sequelize');
const { config } = require('../config/config.js');
const mysql = require('mysql2/promise');

const UserModel = require('./models/user-model.js');
const PasswordModel = require('./models/password-model.js');
const RoleModel = require('./models/role-model.js');
const PermissionModel = require('./models/permission-model.js');
const RolePermissionModel = require('./models/role-permission-model.js');
const RefreshTokenModel = require('./models/reftoken-model.js');

const InventoryModel = require("./models/inventory-model.js");
const ItemModel = require("./models/item-model.js");
const MeasureModel = require("./models/measure-model.js");
const ShelfModel = require("./models/shelf-model.js");
const LayoutModel = require("./models/layout-model.js");
const OrderModel = require("./models/order-model.js");
const DirectionModel = require("./models/direction-model.js");
const OrderItemModel = require("./models/order-item-model.js");

class Database {
    constructor() {
        this.init();
    }

    async init () {

        console.log("Database init!");
        const {database, user, password, port, host, dialect} = config.mysql; 
        
        try {  

            const connection = await mysql.createConnection({ host, port, user, password });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`); 
            connection.close();

            console.log("Database created if not existed!");  

        } catch (error) {
            console.error("Cannot create database:", error.code);
        }
               
        this.sequelize = new Sequelize(database, user, password, {
            host: host,
            dialect: dialect,
            timezone:"+0:00"
        });
            
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        
            //? force <-> alter
            //!await UserModel.sync({ alter: true });  
            //? USER AND ROLE HANDLING
            UserModel.init(this.sequelize);
            PasswordModel.init(this.sequelize);  
            RoleModel.init(this.sequelize);
            PermissionModel.init(this.sequelize);         
            RolePermissionModel.init(this.sequelize);
            RefreshTokenModel.init(this.sequelize);

            //? INVENTORI, ITEM, LAYOUT AND SHELF HANDLING
            InventoryModel.init(this.sequelize);
            ItemModel.init(this.sequelize);
            MeasureModel.init(this.sequelize);
            ShelfModel.init(this.sequelize);
            LayoutModel.init(this.sequelize);
            OrderModel.init(this.sequelize);
            DirectionModel.init(this.sequelize);
            OrderItemModel.init(this.sequelize);
    
            //? USER AND ROLE HANDLING RELATIONS
            UserModel.belongsTo(RoleModel);
            RoleModel.hasMany(UserModel);
    
            PasswordModel.belongsTo(UserModel); //? pass -> userid
            UserModel.hasMany(PasswordModel);  

            RefreshTokenModel.belongsTo(UserModel);
            UserModel.hasMany(RefreshTokenModel);
    
            RoleModel.belongsToMany(PermissionModel, { through: RolePermissionModel });
            PermissionModel.belongsToMany(RoleModel, { through: RolePermissionModel });
    
            //!this.sequelize.sync({ alter: true });

            //? INVENTORI, ITEM, LAYOUT AND SHELF HANDLING RELATIONS          
            InventoryModel.belongsTo(ItemModel);
            ItemModel.hasMany(InventoryModel);

            ItemModel.belongsTo(MeasureModel);
            MeasureModel.hasMany(ItemModel);

            InventoryModel.belongsTo(ShelfModel);
            ShelfModel.hasMany(InventoryModel);

            ShelfModel.belongsTo(LayoutModel);
            LayoutModel.hasMany(ShelfModel);

            OrderModel.belongsTo(UserModel);
            UserModel.hasMany(OrderModel); 
            OrderModel.belongsTo(DirectionModel);
            DirectionModel.hasMany(OrderModel); 

            //? OREDER ITEM
            OrderItemModel.belongsTo(OrderModel);
            OrderModel.hasMany(OrderItemModel);

            OrderItemModel.belongsTo(ShelfModel);
            ShelfModel.hasMany(OrderItemModel);

            OrderItemModel.belongsTo(ItemModel);
            ItemModel.hasMany(OrderItemModel);
                
            this.models = {UserModel, PasswordModel, RoleModel, PermissionModel, RolePermissionModel, RefreshTokenModel,
                 InventoryModel, ItemModel, MeasureModel, ShelfModel, LayoutModel, OrderModel, DirectionModel, OrderItemModel};

        } catch (error) {
            console.error('Unable to connect to the database:', error.parent.sqlMessage);
        }
    }
}

module.exports = new Database;