const { DataTypes, Model } = require('sequelize');

class ItemInventoryModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },                                                                      
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'ItemInventory',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = ItemInventoryModel;