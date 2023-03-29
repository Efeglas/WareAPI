const { DataTypes, Model } = require('sequelize');

class OrderModel extends Model {
    static init ( sequelize ) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },                             
                closed: {
                    type: DataTypes.DATE,                                 
                },                                             
                visible: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },        
            },
            {
                sequelize,
                modelName: 'Order',              
            }
        );
        sequelize.sync();
        return this;
    }
}

module.exports = OrderModel;