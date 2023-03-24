const { DataTypes, Model } = require('sequelize');

class InventoryModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },                 
                shelflevel: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }, 
                quantity: {
                    type: DataTypes.FLOAT,
                    allowNull: false
                },                                         
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'Inventory',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = InventoryModel;