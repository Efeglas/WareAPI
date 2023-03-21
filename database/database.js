const { Sequelize } = require('sequelize');
const { config } = require('../config/config.js');
const mysql = require('mysql2/promise');

const UserModel = require('./models/user-model.js');
const PasswordModel = require('./models/password-model.js');
const RoleModel = require('./models/role-model.js');
const PermissionModel = require('./models/permission-model.js');
const RolePermissionModel = require('./models/role-permission-model.js');
const RefreshTokenModel = require('./models/reftoken-model.js');

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
            timezone:"+01:00"
        });
            
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        
            //? force <-> alter
            UserModel.init(this.sequelize);
            //!await UserModel.sync({ alter: true });
    
            PasswordModel.init(this.sequelize);
            //!await PasswordModel.sync({ alter: true });
    
            RoleModel.init(this.sequelize);
            //!await RoleModel.sync({ alter: true });
    
            PermissionModel.init(this.sequelize);
            //!await PermissionModel.sync({ alter: true });
           
            RolePermissionModel.init(this.sequelize);
            //!await RolePermissionModel.sync({ alter: true });

            RefreshTokenModel.init(this.sequelize);
    
            UserModel.belongsTo(RoleModel);
            RoleModel.hasMany(UserModel);
    
            PasswordModel.belongsTo(UserModel);
            UserModel.hasMany(PasswordModel);

            RefreshTokenModel.belongsTo(UserModel);
            UserModel.hasMany(RefreshTokenModel);
    
            RoleModel.belongsToMany(PermissionModel, { through: RolePermissionModel });
            PermissionModel.belongsToMany(RoleModel, { through: RolePermissionModel });
    
            //!this.sequelize.sync({ alter: true });
                
            this.models = {UserModel, PasswordModel, RoleModel, PermissionModel, RolePermissionModel, RefreshTokenModel};

        } catch (error) {
            console.error('Unable to connect to the database:', error.parent.sqlMessage);
        }
    }
}

module.exports = new Database;